use crate::api::{PackageDetail, api_url, parse_full_name};
use crate::error::{CliError, Result};
use crate::lockfile::{InstalledEntry, now_unix, record_install};
use crate::manifest::Manifest;
use crate::tool::{Tool, destination_path};
use std::fs;
use std::future::Future;
use std::io::{Cursor, Read};
use std::path::Path;
use std::pin::Pin;
use zip::ZipArchive;

fn strip_version_range(include: &str) -> String {
    match include.rfind('@') {
        Some(idx) if idx > 0 => include[..idx].to_string(),
        _ => include.to_string(),
    }
}

pub async fn install(
    name: &str,
    version: Option<String>,
    tool: Tool,
    output: &str,
    dry_run: bool,
    force: bool,
) -> Result<()> {
    install_inner(
        name.to_string(),
        version,
        tool,
        output.to_string(),
        dry_run,
        force,
    )
    .await
}

pub(crate) fn install_inner(
    name: String,
    version: Option<String>,
    tool: Tool,
    output: String,
    dry_run: bool,
    force: bool,
) -> Pin<Box<dyn Future<Output = Result<()>> + Send>> {
    Box::pin(async move {
        let pkg: PackageDetail = {
            let (namespace, pkg_name) = parse_full_name(&name)?;
            let pkg_url = format!("{}/packages/{namespace}/{pkg_name}", api_url());
            let resp = reqwest::get(&pkg_url).await?;
            if !resp.status().is_success() {
                let status = resp.status();
                let body = resp.text().await.unwrap_or_default();
                return Err(CliError::Other(format!("API returned {status}: {body}")));
            }
            resp.json().await?
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
            for include in manifest.includes {
                let dep_name = strip_version_range(&include);
                println!("  → {dep_name}");
                install_inner(dep_name, None, tool, output.clone(), dry_run, force).await?;
            }
            if !dry_run {
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
            let zip_url = format!(
                "{}/packages/{namespace}/{pkg_name}/{}/download",
                api_url(),
                version_data.version
            );
            let zip_resp = reqwest::get(&zip_url).await?;
            if !zip_resp.status().is_success() {
                let status = zip_resp.status();
                let body = zip_resp.text().await.unwrap_or_default();
                return Err(CliError::Other(format!("download failed {status}: {body}")));
            }
            zip_resp.bytes().await?
        };

        let cursor = Cursor::new(bytes);
        let mut archive = ZipArchive::new(cursor)?;
        let mut entry = archive
            .by_name(&target.file)
            .map_err(|_| CliError::FileNotInArchive(target.file.clone()))?;
        let mut content = Vec::new();
        entry.read_to_end(&mut content)?;

        let dest_rel = destination_path(tool, &manifest.asset_type, &target.file);
        let output_path = Path::new(&output);
        let dest_abs = output_path.join(&dest_rel);

        if dry_run {
            println!(
                "dry-run: would write {} ({} bytes)",
                dest_rel.display(),
                content.len()
            );
            return Ok(());
        }

        if dest_abs.exists() && !force {
            println!(
                "warn: {} already exists — use --force to overwrite",
                dest_rel.display()
            );
            return Ok(());
        }

        if let Some(parent) = dest_abs.parent() {
            fs::create_dir_all(parent)?;
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
