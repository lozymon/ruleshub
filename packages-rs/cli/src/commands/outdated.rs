use crate::api::{PackageDetail, api_url, parse_full_name};
use crate::error::Result;
use crate::lockfile::read_lockfile;
use serde::Serialize;
use std::path::Path;

#[derive(Serialize, Debug)]
pub struct OutdatedEntry {
    pub name: String,
    pub current: String,
    pub latest: Option<String>,
    pub outdated: bool,
    pub error: Option<String>,
}

pub async fn outdated(output: &str, json: bool) -> Result<bool> {
    let output_path = Path::new(output);
    let lock = read_lockfile(output_path);

    if lock.packages.is_empty() {
        if json {
            println!("[]");
        } else {
            println!("No packages installed (no .ruleshub/installed.json found).");
        }
        return Ok(true);
    }

    let mut results = Vec::new();
    for (name, entry) in &lock.packages {
        let (namespace, pkg_name) = parse_full_name(name)?;
        let pkg_url = format!("{}/packages/{namespace}/{pkg_name}", api_url());
        let resp = reqwest::get(&pkg_url).await?;
        let (latest, error) = if resp.status().is_success() {
            let pkg: PackageDetail = resp.json().await?;
            (pkg.latest_version.map(|v| v.version), None)
        } else {
            (None, Some(format!("lookup failed ({})", resp.status())))
        };
        let is_outdated = match &latest {
            Some(v) => v != &entry.version,
            None => false,
        };
        results.push(OutdatedEntry {
            name: name.clone(),
            current: entry.version.clone(),
            latest,
            outdated: is_outdated,
            error,
        });
    }

    let outdated_count = results.iter().filter(|r| r.outdated).count();
    let error_count = results.iter().filter(|r| r.error.is_some()).count();

    if json {
        println!("{}", serde_json::to_string_pretty(&results)?);
        return Ok(outdated_count == 0 && error_count == 0);
    }

    if outdated_count > 0 {
        println!("{outdated_count} package(s) can be updated:\n");
        for r in &results {
            if r.outdated
                && let Some(latest) = &r.latest
            {
                println!("  {:<40}  {} → {}", r.name, r.current, latest);
            }
        }
        println!();
    }

    if error_count > 0 {
        println!("{error_count} package(s) could not be checked:\n");
        for r in &results {
            if let Some(err) = &r.error {
                println!("  {:<40}  {err}", r.name);
            }
        }
        println!();
    }

    if outdated_count == 0 && error_count == 0 {
        println!("All {} package(s) are up to date.", results.len());
        return Ok(true);
    }

    if outdated_count > 0 {
        println!("Run `ruleshub update` to update all, or `ruleshub update <name>` for one.");
    }

    Ok(outdated_count == 0 && error_count == 0)
}
