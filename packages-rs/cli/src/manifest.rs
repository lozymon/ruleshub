use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub(crate) const VALID_ASSET_TYPES: &[&str] = &[
    "rule",
    "command",
    "skill",
    "workflow",
    "agent",
    "mcp-server",
    "pack",
];

#[derive(Deserialize, Serialize, Debug)]
pub struct Target {
    pub file: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Repository {
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub directory: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub branch: Option<String>,
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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub repository: Option<Repository>,
}

#[derive(Serialize, Debug)]
pub struct ValidateReport {
    pub manifest_path: String,
    pub valid: bool,
    pub issues: Vec<String>,
    pub manifest: Manifest,
}
