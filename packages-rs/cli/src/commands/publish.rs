use crate::api::api_url;
use crate::commands::validate::validate;
use crate::config::ENV_TOKEN;
use crate::error::{CliError, Result};
use std::collections::HashSet;
use std::env;
use std::fs;
use std::io::{Cursor, Write};
use std::path::Path;

fn add_dir_to_zip<W: Write + std::io::Seek>(
    writer: &mut zip::ZipWriter<W>,
    options: zip::write::SimpleFileOptions,
    root: &Path,
    dir: &Path,
    ignored: &HashSet<&str>,
) -> Result<()> {
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or_default();
        if ignored.contains(name) {
            continue;
        }
        if path.is_dir() {
            add_dir_to_zip(writer, options, root, &path, ignored)?;
        } else {
            let rel = path.strip_prefix(root).unwrap_or(&path);
            let rel_str = rel.to_string_lossy().replace('\\', "/");
            writer.start_file(rel_str, options)?;
            let bytes = fs::read(&path)?;
            writer.write_all(&bytes)?;
        }
    }
    Ok(())
}

pub async fn publish(token: Option<String>, dry_run: bool) -> Result<()> {
    let token = token.or_else(|| env::var(ENV_TOKEN).ok());

    if token.is_none() && !dry_run {
        return Err(CliError::Other(format!(
            "no auth token — pass --token <token> or set {ENV_TOKEN} env var\n  get a token at https://ruleshub.dev/dashboard"
        )));
    }

    let report = validate(".").await?;
    if !report.valid {
        let lines = report
            .issues
            .iter()
            .map(|i| format!("  - {i}"))
            .collect::<Vec<_>>()
            .join("\n");
        return Err(CliError::Other(format!("invalid ruleshub.json:\n{lines}")));
    }

    let manifest = report.manifest;
    println!("packaging {}@{}…", manifest.name, manifest.version);

    let cwd = env::current_dir()?;
    let ignored: HashSet<&str> = [
        ".git",
        "node_modules",
        ".DS_Store",
        "dist",
        ".turbo",
        ".ruleshub",
        "target",
    ]
    .iter()
    .copied()
    .collect();

    let mut buffer = Vec::new();
    {
        let cursor = Cursor::new(&mut buffer);
        let mut writer = zip::ZipWriter::new(cursor);
        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Stored);
        add_dir_to_zip(&mut writer, options, &cwd, &cwd, &ignored)?;
        writer.finish()?;
    }

    let size_kb = buffer.len() as f64 / 1024.0;
    println!("package size: {size_kb:.1} KB");

    if buffer.len() > 5 * 1024 * 1024 {
        return Err(CliError::Other(
            "package exceeds the 5 MB size limit".to_string(),
        ));
    }

    if dry_run {
        println!(
            "dry-run: would publish {}@{} ({size_kb:.1} KB)",
            manifest.name, manifest.version
        );
        return Ok(());
    }

    let manifest_raw = fs::read_to_string(cwd.join("ruleshub.json"))?;
    let token = token.expect("token presence already checked above");

    println!("publishing…");
    let url = format!("{}/packages", api_url());
    let form = reqwest::multipart::Form::new()
        .part(
            "file",
            reqwest::multipart::Part::bytes(buffer)
                .file_name("package.zip")
                .mime_str("application/zip")?,
        )
        .text("manifest", manifest_raw);

    let resp = reqwest::Client::new()
        .post(&url)
        .header("Authorization", format!("Bearer {token}"))
        .multipart(form)
        .send()
        .await?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        return Err(CliError::Other(format!("publish failed {status}: {body}")));
    }

    println!("ok: published {}@{}", manifest.name, manifest.version);
    println!("view at https://ruleshub.dev/packages/{}", manifest.name);
    Ok(())
}
