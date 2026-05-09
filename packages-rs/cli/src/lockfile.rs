use crate::config::LOCK_PATH;
use crate::error::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

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

pub(crate) fn now_unix() -> u64 {
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
