use crate::api::{PackageDetail, api_url, parse_full_name};
use crate::error::{CliError, Result};
use crate::lockfile::{InstalledEntry, now_unix, record_install};
use crate::manifest::Manifest;
use crate::tool::{Tool, destination_path};
use futures_util::StreamExt;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::fs;
use std::future::Future;
use std::io::{Cursor, Read};
use std::path::Path;
use std::pin::Pin;
use zip::ZipArchive;

// Cap response bodies before collecting them into memory. Without this a
// hostile API or compromised storage bucket could stream a multi-GB body
// and OOM the CLI — `reqwest::Response::bytes()` has no built-in ceiling.
const MAX_JSON_BYTES: u64 = 1024 * 1024; // 1 MB — package metadata / envelope
const MAX_ARTIFACT_BYTES: u64 = 16 * 1024 * 1024; // 16 MB — published packages are 5 MB max

async fn read_bounded(resp: reqwest::Response, max_bytes: u64) -> Result<Vec<u8>> {
    if let Some(len) = resp.content_length()
        && len > max_bytes
    {
        return Err(CliError::Other(format!(
            "response body too large: server advertised {len} bytes, cap is {max_bytes}"
        )));
    }
    let mut stream = resp.bytes_stream();
    let mut buf: Vec<u8> = Vec::new();
    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        if (buf.len() as u64) + (chunk.len() as u64) > max_bytes {
            return Err(CliError::Other(format!(
                "response body exceeded cap of {max_bytes} bytes mid-stream"
            )));
        }
        buf.extend_from_slice(&chunk);
    }
    Ok(buf)
}

#[derive(Clone, Copy, Debug, Default)]
pub struct InstallOptions {
    pub dry_run: bool,
    pub force: bool,
    pub verbose: bool,
    pub continue_on_error: bool,
}

#[derive(Deserialize)]
struct DownloadEnvelope {
    url: String,
    // Hex-encoded SHA-256 of the artifact. Null for versions published
    // before the registry started recording the digest; clients should
    // refuse to install when the envelope omits it for a fresh release,
    // but tolerate `None` for older versions so existing installs work.
    #[serde(default)]
    sha256: Option<String>,
}

fn strip_version_range(include: &str) -> String {
    match include.rfind('@') {
        Some(idx) if idx > 0 => include[..idx].to_string(),
        _ => include.to_string(),
    }
}

fn hex_head(bytes: &[u8], n: usize) -> String {
    bytes
        .iter()
        .take(n)
        .map(|b| format!("{b:02x}"))
        .collect::<Vec<_>>()
        .join(" ")
}

fn looks_like_zip(bytes: &[u8]) -> bool {
    // Local file header (PK\x03\x04), EOCD (PK\x05\x06), or spanned (PK\x07\x08).
    bytes.len() >= 4
        && bytes[0] == b'P'
        && bytes[1] == b'K'
        && matches!(bytes[2..4], [0x03, 0x04] | [0x05, 0x06] | [0x07, 0x08])
}

pub async fn install(
    name: &str,
    version: Option<String>,
    tool: Tool,
    output: &str,
    opts: InstallOptions,
) -> Result<()> {
    install_inner(name.to_string(), version, tool, output.to_string(), opts).await
}

pub(crate) fn install_inner(
    name: String,
    version: Option<String>,
    tool: Tool,
    output: String,
    opts: InstallOptions,
) -> Pin<Box<dyn Future<Output = Result<()>> + Send>> {
    Box::pin(async move {
        let pkg: PackageDetail = {
            let (namespace, pkg_name) = parse_full_name(&name)?;
            let pkg_url = format!("{}/packages/{namespace}/{pkg_name}", api_url());
            if opts.verbose {
                eprintln!("verbose: GET {pkg_url}");
            }
            let resp = reqwest::get(&pkg_url).await?;
            if opts.verbose {
                eprintln!("verbose:   → {}", resp.status());
            }
            if !resp.status().is_success() {
                let status = resp.status();
                let body = resp.text().await.unwrap_or_default();
                return Err(CliError::Other(format!("API returned {status}: {body}")));
            }
            let bytes = read_bounded(resp, MAX_JSON_BYTES).await?;
            serde_json::from_slice(&bytes)?
        };

        let version_data = match version {
            Some(v) => pkg
                .versions
                .iter()
                .find(|x| x.version == v)
                .cloned()
                .ok_or(CliError::VersionNotFound(v))?,
            None => pkg.latest_version.ok_or(CliError::NoVersion)?,
        };

        let manifest: Manifest = serde_json::from_value(version_data.manifest_json.clone())?;

        if manifest.asset_type == "pack" {
            if manifest.includes.is_empty() {
                return Err(CliError::Other(format!(
                    "pack {name} has no included assets"
                )));
            }
            println!(
                "installing {} package(s) from {name}@{}…",
                manifest.includes.len(),
                version_data.version
            );
            let mut failures: Vec<(String, String)> = Vec::new();
            for include in manifest.includes {
                let dep_name = strip_version_range(&include);
                println!("  → {dep_name}");
                let result =
                    install_inner(dep_name.clone(), None, tool, output.clone(), opts).await;
                if let Err(err) = result {
                    if opts.continue_on_error {
                        eprintln!("  ✗ {dep_name}: {err}");
                        failures.push((dep_name, err.to_string()));
                    } else {
                        return Err(err);
                    }
                }
            }
            if !failures.is_empty() {
                eprintln!(
                    "warn: {} of pack {name}@{} asset(s) failed:",
                    failures.len(),
                    version_data.version
                );
                for (dep, msg) in &failures {
                    eprintln!("  - {dep}: {msg}");
                }
                return Err(CliError::Other(format!(
                    "{} asset(s) failed during pack install",
                    failures.len()
                )));
            }
            if !opts.dry_run {
                println!("ok: installed pack {name}@{}", version_data.version);
            }
            return Ok(());
        }

        let target = manifest.targets.get(tool.as_str()).ok_or_else(|| {
            let available = manifest
                .targets
                .keys()
                .cloned()
                .collect::<Vec<_>>()
                .join(", ");
            CliError::UnsupportedTool {
                tool: tool.as_str().to_string(),
                available,
            }
        })?;

        let bytes = {
            let (namespace, pkg_name) = parse_full_name(&name)?;
            let download_url = format!(
                "{}/packages/{namespace}/{pkg_name}/{}/download",
                api_url(),
                version_data.version
            );
            if opts.verbose {
                eprintln!("verbose: GET {download_url}");
            }
            let dl_resp = reqwest::get(&download_url).await?;
            if opts.verbose {
                eprintln!("verbose:   → {}", dl_resp.status());
            }
            if !dl_resp.status().is_success() {
                let status = dl_resp.status();
                let body = dl_resp.text().await.unwrap_or_default();
                return Err(CliError::Other(format!("download failed {status}: {body}")));
            }
            let envelope_bytes = read_bounded(dl_resp, MAX_JSON_BYTES).await?;
            let envelope: DownloadEnvelope =
                serde_json::from_slice(&envelope_bytes).map_err(|e| {
                    CliError::Other(format!(
                        "download endpoint did not return JSON {{ url }}: {e}"
                    ))
                })?;
            if opts.verbose {
                eprintln!("verbose: GET {} (signed)", envelope.url);
            }

            let zip_resp = reqwest::get(&envelope.url).await?;
            let status = zip_resp.status();
            let content_type = zip_resp
                .headers()
                .get(reqwest::header::CONTENT_TYPE)
                .and_then(|v| v.to_str().ok())
                .unwrap_or("")
                .to_string();
            if opts.verbose {
                eprintln!("verbose:   → {status} ({content_type})");
            }
            if !status.is_success() {
                let body = zip_resp.text().await.unwrap_or_default();
                let preview: String = body.chars().take(512).collect();
                return Err(CliError::Other(format!(
                    "artifact fetch failed {status}: {preview}"
                )));
            }
            let body = read_bounded(zip_resp, MAX_ARTIFACT_BYTES).await?;
            if opts.verbose {
                eprintln!("verbose:   ↳ {} bytes", body.len());
            }
            if !looks_like_zip(&body) {
                return Err(CliError::DownloadNotZip {
                    status: status.to_string(),
                    content_type,
                    length: body.len(),
                    head_hex: hex_head(&body, 64),
                });
            }
            if let Some(expected) = &envelope.sha256 {
                let mut hasher = Sha256::new();
                hasher.update(&body);
                let actual = format!("{:x}", hasher.finalize());
                if !actual.eq_ignore_ascii_case(expected) {
                    return Err(CliError::Other(format!(
                        "artifact checksum mismatch — registry said {expected} but download hashed to {actual}"
                    )));
                }
                if opts.verbose {
                    eprintln!(
                        "verbose:   sha256 ok: {}…",
                        &expected[..16.min(expected.len())]
                    );
                }
            } else if opts.verbose {
                eprintln!(
                    "verbose:   no sha256 in envelope (version published before checksums were recorded)"
                );
            }
            body
        };

        let cursor = Cursor::new(bytes);
        let mut archive = ZipArchive::new(cursor)?;
        let mut entry = archive
            .by_name(&target.file)
            .map_err(|_| CliError::FileNotInArchive(target.file.clone()))?;
        let mut content = Vec::new();
        entry.read_to_end(&mut content)?;

        let (_, pkg_name) = parse_full_name(&name)?;
        let dest_rel = destination_path(tool, &manifest.asset_type, &target.file, pkg_name);
        let output_path = Path::new(&output);
        let dest_abs = output_path.join(&dest_rel);

        if opts.dry_run {
            println!(
                "dry-run: would write {} ({} bytes)",
                dest_rel.display(),
                content.len()
            );
            return Ok(());
        }

        if dest_abs.exists() && !opts.force {
            println!(
                "warn: {} already exists — use --force to overwrite",
                dest_rel.display()
            );
            return Ok(());
        }

        if let Some(parent) = dest_abs.parent() {
            fs::create_dir_all(parent)?;
        }

        // Defense in depth: even though parse_full_name and the
        // destination_path table both refuse `..`/`/` segments, canonicalize
        // the resolved destination and refuse to write anywhere that isn't
        // beneath the requested output directory. Catches mistakes like
        // future destination_path callers forgetting the input validation,
        // and symlinks pointing out of `output_path`.
        fs::create_dir_all(output_path)?;
        let output_canon = output_path.canonicalize()?;
        let parent_canon = dest_abs
            .parent()
            .ok_or_else(|| CliError::Other("destination has no parent".into()))?
            .canonicalize()?;
        if !parent_canon.starts_with(&output_canon) {
            return Err(CliError::Other(format!(
                "refusing to write outside output directory: {} is not under {}",
                parent_canon.display(),
                output_canon.display(),
            )));
        }

        fs::write(&dest_abs, &content)?;
        println!(
            "ok: wrote {} ({}@{})",
            dest_rel.display(),
            name,
            version_data.version
        );

        record_install(
            &name,
            InstalledEntry {
                version: version_data.version.clone(),
                tool: tool.as_str().to_string(),
                files: vec![dest_rel.display().to_string()],
                installed_at: now_unix(),
            },
            output_path,
        )?;

        Ok(())
    })
}
