//! Cross-cutting endpoint and environment-variable constants.
//!
//! Domain-specific values (`VALID_ASSET_TYPES`, the publish ignore-list, the
//! 5 MB package cap) live with the modules that own them, not here.

pub const DEFAULT_API_URL: &str = "https://api.ruleshub.dev/v1";
pub const SCHEMA_URL: &str = "https://ruleshub.dev/schema/ruleshub.json";
pub const LOCK_PATH: &str = ".ruleshub/installed.json";

pub const ENV_API_URL: &str = "RULESHUB_API";
pub const ENV_TOKEN: &str = "RULESHUB_TOKEN";
