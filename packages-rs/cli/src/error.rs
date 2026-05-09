use thiserror::Error;

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
