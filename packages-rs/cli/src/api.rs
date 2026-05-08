use crate::config::{DEFAULT_API_URL, ENV_API_URL};
use crate::error::{CliError, Result};
use serde::Deserialize;
use std::env;

pub fn api_url() -> String {
    env::var(ENV_API_URL).unwrap_or_else(|_| DEFAULT_API_URL.to_string())
}

pub(crate) fn parse_full_name(name: &str) -> Result<(&str, &str)> {
    let (namespace, pkg) = name
        .split_once('/')
        .ok_or_else(|| CliError::InvalidName(name.to_string()))?;
    if namespace.is_empty() || pkg.is_empty() {
        return Err(CliError::InvalidName(name.to_string()));
    }
    Ok((namespace, pkg))
}

#[derive(Deserialize, Debug)]
pub(crate) struct PackageList {
    pub data: Vec<PackageEntry>,
    pub total: u32,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PackageEntry {
    pub full_name: String,
    pub description: String,
    #[serde(rename = "type")]
    pub asset_type: String,
    pub total_downloads: u64,
    pub latest_version: Option<VersionEntry>,
}

#[derive(Deserialize, Debug)]
pub(crate) struct VersionEntry {
    pub version: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PackageDetail {
    pub latest_version: Option<PackageVersionFull>,
    pub versions: Vec<PackageVersionFull>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PackageVersionFull {
    pub version: String,
    pub manifest_json: serde_json::Value,
}
