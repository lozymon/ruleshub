use clap::ValueEnum;
use jsonschema::Validator;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::collections::HashSet;
use std::env;
use std::fs;
use std::future::Future;
use std::io::{Cursor, Read, Write};
use std::path::{Path, PathBuf};
use std::pin::Pin;
use std::str::FromStr;
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;
use zip::ZipArchive;

const SCHEMA_URL: &str = "https://ruleshub.dev/schema/ruleshub.json";
const LOCK_PATH: &str = ".ruleshub/installed.json";

const VALID_ASSET_TYPES: &[&str] = &[
    "rule",
    "command",
    "skill",
    "workflow",
    "agent",
    "mcp-server",
    "pack",
];

#[derive(Debug, Error)]
pub enum CliError {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("http error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("zip error: {0}")]
    Zip(#[from] zip::result::ZipError),
    #[error("schema setup failed: {0}")]
    SchemaCompile(String),
    #[error("invalid package name '{0}' — must be 'namespace/name'")]
    InvalidName(String),
    #[error("package has no published versions")]
    NoVersion,
    #[error("version '{0}' not found for this package")]
    VersionNotFound(String),
    #[error("package does not support tool '{tool}' — available: {available}")]
    UnsupportedTool { tool: String, available: String },
    #[error("file '{0}' not found in package archive")]
    FileNotInArchive(String),
    #[error("unknown tool '{0}' — cannot map to install paths")]
    UnknownTool(String),
    #[error("{0}")]
    Other(String),
}

pub type Result<T> = std::result::Result<T, CliError>;

pub fn api_url() -> String {
    env::var("RULESHUB_API").unwrap_or_else(|_| "https://api.ruleshub.dev/v1".to_string())
}

#[derive(Clone, Copy, Debug, ValueEnum)]
pub enum Tool {
    ClaudeCode,
    Cursor,
    Copilot,
    Windsurf,
    Cline,
    Aider,
    Continue,
}

impl Tool {
    pub fn as_str(&self) -> &'static str {
        match self {
            Tool::ClaudeCode => "claude-code",
            Tool::Cursor => "cursor",
            Tool::Copilot => "copilot",
            Tool::Windsurf => "windsurf",
            Tool::Cline => "cline",
            Tool::Aider => "aider",
            Tool::Continue => "continue",
        }
    }
}

impl FromStr for Tool {
    type Err = CliError;

    fn from_str(s: &str) -> Result<Self> {
        match s {
            "claude-code" => Ok(Tool::ClaudeCode),
            "cursor" => Ok(Tool::Cursor),
            "copilot" => Ok(Tool::Copilot),
            "windsurf" => Ok(Tool::Windsurf),
            "cline" => Ok(Tool::Cline),
            "aider" => Ok(Tool::Aider),
            "continue" => Ok(Tool::Continue),
            other => Err(CliError::UnknownTool(other.to_string())),
        }
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Target {
    pub file: String,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Manifest {
    pub name: String,
    pub version: String,
    #[serde(rename = "type")]
    pub asset_type: String,
    pub description: String,
    pub license: String,
    pub changelog: Option<String>,
    #[serde(default)]
    pub targets: HashMap<String, Target>,
    #[serde(default)]
    pub includes: Vec<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub project_types: Vec<String>,
}

#[derive(Serialize, Debug)]
pub struct ValidateReport {
    pub manifest_path: String,
    pub valid: bool,
    pub issues: Vec<String>,
    pub manifest: Manifest,
}

#[derive(Deserialize, Serialize, Debug, Default)]
pub struct LockFile {
    #[serde(default)]
    pub packages: HashMap<String, InstalledEntry>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct InstalledEntry {
    pub version: String,
    pub tool: String,
    pub files: Vec<String>,
    pub installed_at: u64,
}

fn now_unix() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

pub fn read_lockfile(output_dir: &Path) -> LockFile {
    let path = output_dir.join(LOCK_PATH);
    if !path.exists() {
        return LockFile::default();
    }
    fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn write_lockfile(lock: &LockFile, output_dir: &Path) -> Result<()> {
    let path = output_dir.join(LOCK_PATH);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut s = serde_json::to_string_pretty(lock)?;
    s.push('\n');
    fs::write(&path, s)?;
    Ok(())
}

pub fn record_install(name: &str, entry: InstalledEntry, output_dir: &Path) -> Result<()> {
    let mut lock = read_lockfile(output_dir);
    lock.packages.insert(name.to_string(), entry);
    write_lockfile(&lock, output_dir)
}

async fn fetch_schema() -> Result<Validator> {
    let value: serde_json::Value = reqwest::get(SCHEMA_URL).await?.json().await?;
    jsonschema::validator_for(&value).map_err(|e| CliError::SchemaCompile(e.to_string()))
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

    match fetch_schema().await {
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
}

pub fn print_report_json(report: &ValidateReport) -> Result<()> {
    println!("{}", serde_json::to_string_pretty(report)?);
    Ok(())
}

#[derive(Deserialize, Debug)]
struct PackageList {
    data: Vec<PackageEntry>,
    total: u32,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PackageEntry {
    full_name: String,
    description: String,
    #[serde(rename = "type")]
    asset_type: String,
    total_downloads: u64,
    latest_version: Option<VersionEntry>,
}

#[derive(Deserialize, Debug)]
struct VersionEntry {
    version: String,
}

pub async fn search(query: Option<String>, limit: u32) -> Result<()> {
    let mut url = format!("{}/packages?limit={limit}", api_url());
    if let Some(q) = query {
        url.push_str(&format!("&q={q}"));
    }

    let resp: PackageList = reqwest::get(&url).await?.json().await?;

    println!(
        "found {} packages (showing {})",
        resp.total,
        resp.data.len()
    );
    for pkg in resp.data {
        let version = pkg
            .latest_version
            .map(|v| v.version)
            .unwrap_or_else(|| "—".to_string());
        println!(
            "  {:<40} {:<10} {:<8} ↓{}",
            pkg.full_name, version, pkg.asset_type, pkg.total_downloads
        );
        println!("    {}", pkg.description);
    }
    Ok(())
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PackageDetail {
    latest_version: Option<PackageVersionFull>,
    versions: Vec<PackageVersionFull>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct PackageVersionFull {
    version: String,
    manifest_json: serde_json::Value,
}

fn parse_full_name(name: &str) -> Result<(&str, &str)> {
    let (namespace, pkg) = name
        .split_once('/')
        .ok_or_else(|| CliError::InvalidName(name.to_string()))?;
    if namespace.is_empty() || pkg.is_empty() {
        return Err(CliError::InvalidName(name.to_string()));
    }
    Ok((namespace, pkg))
}

fn destination_path(tool: Tool, asset_type: &str, source_file: &str) -> PathBuf {
    let base_name = Path::new(source_file)
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or(source_file);

    match tool {
        Tool::ClaudeCode => match asset_type {
            "rule" => PathBuf::from("CLAUDE.md"),
            "command" | "workflow" | "agent" => PathBuf::from(".claude/commands").join(base_name),
            _ => PathBuf::from(base_name),
        },
        Tool::Cursor => match asset_type {
            "rule" => PathBuf::from(".cursorrules"),
            _ => PathBuf::from(".cursor/rules").join(base_name),
        },
        Tool::Copilot => PathBuf::from(".github/copilot-instructions.md"),
        Tool::Windsurf => PathBuf::from(".windsurfrules"),
        Tool::Cline => PathBuf::from(".clinerules"),
        Tool::Aider => {
            if base_name == "CONVENTIONS.md" {
                PathBuf::from("CONVENTIONS.md")
            } else {
                PathBuf::from(".aider.conf.yml")
            }
        }
        Tool::Continue => PathBuf::from(".continue").join(base_name),
    }
}

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

fn install_inner(
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
    let token = token.or_else(|| env::var("RULESHUB_TOKEN").ok());

    if token.is_none() && !dry_run {
        return Err(CliError::Other(
            "no auth token — pass --token <token> or set RULESHUB_TOKEN env var\n  get a token at https://ruleshub.dev/dashboard"
                .to_string(),
        ));
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

pub async fn update(name: Option<String>, output: &str, dry_run: bool) -> Result<()> {
    let output_path = Path::new(output);
    let lock = read_lockfile(output_path);

    let entries: Vec<(String, InstalledEntry)> = match name {
        Some(n) => match lock.packages.get(&n) {
            Some(e) => vec![(n.clone(), e.clone())],
            None => {
                println!("{n} is not installed.");
                return Ok(());
            }
        },
        None => lock
            .packages
            .iter()
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect(),
    };

    if entries.is_empty() {
        println!("No packages installed.");
        return Ok(());
    }

    for (pkg_name, entry) in entries {
        let tool: Tool = entry.tool.parse()?;
        println!("checking {pkg_name}…");
        install_inner(pkg_name, None, tool, output.to_string(), dry_run, true).await?;
    }

    Ok(())
}
