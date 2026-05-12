use crate::config::SCHEMA_URL;
use crate::error::{CliError, Result};
use crate::manifest::{Manifest, VALID_ASSET_TYPES, ValidateReport};
use jsonschema::Validator;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

// Snapshot of the live schema, baked into the binary. Generated from
// `packages/types/src/manifest.ts` via the Next.js route at
// `/schema/ruleshub.json`. Pulling the schema over the network on every
// invocation (the previous behaviour) made every `validate` and `publish`
// rely on `ruleshub.dev` being reachable — slow, flaky offline, and a
// silent downgrade to no-schema-check on any fetch failure. To intentionally
// re-fetch, set `RULESHUB_REFRESH_SCHEMA=1`.
const EMBEDDED_SCHEMA: &str = include_str!("../../schema/ruleshub.schema.json");

const ENV_REFRESH_SCHEMA: &str = "RULESHUB_REFRESH_SCHEMA";

fn embedded_schema() -> Result<Validator> {
    let value: serde_json::Value = serde_json::from_str(EMBEDDED_SCHEMA)?;
    jsonschema::validator_for(&value).map_err(|e| CliError::SchemaCompile(e.to_string()))
}

async fn fetch_schema_remote() -> Result<Validator> {
    let value: serde_json::Value = reqwest::get(SCHEMA_URL).await?.json().await?;
    jsonschema::validator_for(&value).map_err(|e| CliError::SchemaCompile(e.to_string()))
}

async fn load_schema() -> Result<Validator> {
    if env::var(ENV_REFRESH_SCHEMA).ok().as_deref() == Some("1") {
        return fetch_schema_remote().await;
    }
    embedded_schema()
}

pub async fn validate(path: &str) -> Result<ValidateReport> {
    let mut manifest_path = PathBuf::from(path);
    if manifest_path.is_dir() {
        manifest_path.push("ruleshub.json");
    }

    let content = fs::read_to_string(&manifest_path)?;
    let mut raw: serde_json::Value = serde_json::from_str(&content)?;
    let manifest: Manifest = serde_json::from_value(raw.clone())?;

    let mut issues = Vec::new();
    let pkg_dir = manifest_path.parent().unwrap_or(Path::new("."));

    if let Some(obj) = raw.as_object_mut() {
        obj.remove("$schema");
    }

    match load_schema().await {
        Ok(validator) => {
            for err in validator.iter_errors(&raw) {
                issues.push(format!("schema: {err}"));
            }
        }
        Err(e) => {
            eprintln!("warn: skipping schema check ({e})");
        }
    }

    if !VALID_ASSET_TYPES.contains(&manifest.asset_type.as_str()) {
        issues.push(format!(
            "type '{}' is not one of: {}",
            manifest.asset_type,
            VALID_ASSET_TYPES.join(", ")
        ));
    }

    if let Err(e) = semver::Version::parse(&manifest.version) {
        issues.push(format!(
            "version '{}' is not valid semver: {e}",
            manifest.version
        ));
    }

    if manifest.asset_type == "pack" {
        if manifest.includes.is_empty() {
            issues.push("packs must declare at least one entry in `includes`".to_string());
        }
        if !manifest.targets.is_empty() {
            issues.push(
                "packs must not declare `targets` — they delegate to included assets".to_string(),
            );
        }
    } else {
        if manifest.targets.is_empty() {
            issues.push(format!(
                "asset type '{}' must declare at least one target",
                manifest.asset_type
            ));
        }
        for (tool, target) in &manifest.targets {
            let target_path = pkg_dir.join(&target.file);
            if !target_path.exists() {
                issues.push(format!(
                    "target '{tool}' references missing file: {}",
                    target.file
                ));
            }
        }
    }

    Ok(ValidateReport {
        manifest_path: manifest_path.display().to_string(),
        valid: issues.is_empty(),
        issues,
        manifest,
    })
}

pub fn print_report_human(report: &ValidateReport) {
    if report.valid {
        println!("ok: valid manifest at {}", report.manifest_path);
    } else {
        println!(
            "FAIL: {} issue(s) at {}",
            report.issues.len(),
            report.manifest_path
        );
        for issue in &report.issues {
            println!("  - {issue}");
        }
    }
    println!("  name:        {}", report.manifest.name);
    println!("  version:     {}", report.manifest.version);
    println!("  type:        {}", report.manifest.asset_type);
    println!("  license:     {}", report.manifest.license);
    if !report.manifest.targets.is_empty() {
        let tools: Vec<&str> = report.manifest.targets.keys().map(|k| k.as_str()).collect();
        println!("  targets:     {}", tools.join(", "));
    }
    if !report.manifest.includes.is_empty() {
        println!(
            "  includes:    {} package(s)",
            report.manifest.includes.len()
        );
    }
    if let Some(repo) = &report.manifest.repository {
        match (&repo.directory, &repo.branch) {
            (Some(dir), Some(branch)) => {
                println!("  repository:  {} ({}, {})", repo.url, dir, branch)
            }
            (Some(dir), None) => println!("  repository:  {} ({})", repo.url, dir),
            (None, _) => println!("  repository:  {}", repo.url),
        }
    }
}

pub fn print_report_json(report: &ValidateReport) -> Result<()> {
    println!("{}", serde_json::to_string_pretty(report)?);
    Ok(())
}
