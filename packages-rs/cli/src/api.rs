use crate::config::{DEFAULT_API_URL, ENV_API_URL};
use crate::error::{CliError, Result};
use serde::Deserialize;
use std::env;

pub fn api_url() -> String {
    env::var(ENV_API_URL).unwrap_or_else(|_| DEFAULT_API_URL.to_string())
}

/// Allowed characters for a namespace/package segment. Mirrors the API
/// manifest schema: lowercase alnum, underscore, or hyphen; must start
/// with an alnum; bounded length. Crucially excludes `.` and `/`, so a
/// segment like `..` or `foo/bar` can't be smuggled through into the
/// install path constructed in [`crate::tool::destination_path`].
fn is_valid_segment(seg: &str) -> bool {
    if seg.is_empty() || seg.len() > 64 {
        return false;
    }
    fn ok(c: char) -> bool {
        c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_' || c == '-'
    }
    let mut chars = seg.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    // Must start with [a-z0-9] to match the API's manifest schema.
    if !(first.is_ascii_lowercase() || first.is_ascii_digit()) {
        return false;
    }
    chars.all(ok)
}

pub(crate) fn parse_full_name(name: &str) -> Result<(&str, &str)> {
    // Reject extra `/` up front so `foo/../etc/passwd` can't slip through
    // as a single split. `split_once` would otherwise treat everything
    // after the first `/` as the package name (including more slashes).
    if name.matches('/').count() != 1 {
        return Err(CliError::InvalidName(name.to_string()));
    }
    let (namespace, pkg) = name
        .split_once('/')
        .ok_or_else(|| CliError::InvalidName(name.to_string()))?;
    if !is_valid_segment(namespace) || !is_valid_segment(pkg) {
        return Err(CliError::InvalidName(name.to_string()));
    }
    Ok((namespace, pkg))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_normal_names() {
        assert!(parse_full_name("foo/bar").is_ok());
        assert!(parse_full_name("acme-corp/typescript-strict").is_ok());
        assert!(parse_full_name("a/b").is_ok());
        assert!(parse_full_name("user1/pkg_name").is_ok());
    }

    #[test]
    fn rejects_path_traversal() {
        for bad in [
            "../foo/bar",
            "foo/../bar",
            "foo/..",
            "../etc/passwd",
            "foo/bar/baz",
            "foo/bar/../etc",
        ] {
            assert!(
                parse_full_name(bad).is_err(),
                "expected rejection for {bad}",
            );
        }
    }

    #[test]
    fn rejects_invalid_characters() {
        for bad in [
            "Foo/bar",      // uppercase
            "-foo/bar",     // leading hyphen
            "_foo/bar",     // leading underscore
            "foo/bar.md",   // dot in segment
            "foo bar/baz",  // space
            "foo;evil/bar", // semicolon
            "foo/bar/",     // trailing slash
            "/foo/bar",     // leading slash
            "",             // empty
            "foo",          // no slash
            "foo/",         // empty package
            "/bar",         // empty namespace
        ] {
            assert!(
                parse_full_name(bad).is_err(),
                "expected rejection for {bad:?}",
            );
        }
    }

    #[test]
    fn rejects_overlong_segments() {
        let long = "a".repeat(65);
        assert!(parse_full_name(&format!("{long}/bar")).is_err());
        assert!(parse_full_name(&format!("foo/{long}")).is_err());
    }
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
