use crate::error::{CliError, Result};
use clap::ValueEnum;
use std::path::{Path, PathBuf};
use std::str::FromStr;

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

pub(crate) fn destination_path(tool: Tool, asset_type: &str, source_file: &str) -> PathBuf {
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
