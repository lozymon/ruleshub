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

/// Compute the install path for an asset.
///
/// Every tool installs to `{tool_root}/{type_dir}/{pkg_name}.{ext}` so
/// packages don't collide and every asset is grouped by type. The file is
/// named after the package (`typescript-strict.md`), not the source filename.
///
///   .claude/rules/typescript-strict.md
///   .cursor/rules/typescript-strict.mdc
///   .continue/skills/no-secrets.md
///   .github/copilot/commands/cleanup.md
///   .windsurf/agents/reviewer.md
///   .clinerules/workflows/ship.md
///   .aider/rules/typescript-strict.md
///
/// Cursor rules use the `.mdc` extension because that's Cursor's convention;
/// every other path preserves the source file's extension.
pub(crate) fn destination_path(
    tool: Tool,
    asset_type: &str,
    source_file: &str,
    pkg_name: &str,
) -> PathBuf {
    let ext = Path::new(source_file)
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("md");

    let tool_root = match tool {
        Tool::ClaudeCode => ".claude",
        Tool::Cursor => ".cursor",
        Tool::Copilot => ".github/copilot",
        Tool::Windsurf => ".windsurf",
        Tool::Cline => ".clinerules",
        Tool::Aider => ".aider",
        Tool::Continue => ".continue",
    };

    let type_dir = match asset_type {
        "rule" => "rules",
        "skill" => "skills",
        "command" => "commands",
        "agent" => "agents",
        "workflow" => "workflows",
        "mcp-server" => "mcp-servers",
        // Publisher-controlled string — constrain it before using as a
        // path segment so `../escape` or `foo/bar` can't be smuggled in
        // via a malicious manifest. Anything weird falls back to "misc".
        other if is_safe_segment(other) => other,
        _ => "misc",
    };

    let filename = if matches!(tool, Tool::Cursor) && asset_type == "rule" {
        format!("{pkg_name}.mdc")
    } else {
        format!("{pkg_name}.{ext}")
    };

    PathBuf::from(tool_root).join(type_dir).join(filename)
}

fn is_safe_segment(s: &str) -> bool {
    if s.is_empty() || s.len() > 64 {
        return false;
    }
    s.chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn claude_code_rule_lands_in_rules_dir_named_after_package() {
        let p = destination_path(Tool::ClaudeCode, "rule", "RULE.md", "typescript-strict");
        assert_eq!(p, PathBuf::from(".claude/rules/typescript-strict.md"));
    }

    #[test]
    fn claude_code_each_asset_type_gets_its_own_dir() {
        assert_eq!(
            destination_path(Tool::ClaudeCode, "skill", "x.md", "no-secrets-in-code"),
            PathBuf::from(".claude/skills/no-secrets-in-code.md")
        );
        assert_eq!(
            destination_path(Tool::ClaudeCode, "command", "x.md", "cleanup"),
            PathBuf::from(".claude/commands/cleanup.md")
        );
        assert_eq!(
            destination_path(Tool::ClaudeCode, "agent", "x.md", "reviewer"),
            PathBuf::from(".claude/agents/reviewer.md")
        );
        assert_eq!(
            destination_path(Tool::ClaudeCode, "workflow", "x.md", "ship"),
            PathBuf::from(".claude/workflows/ship.md")
        );
    }

    #[test]
    fn extension_is_taken_from_source_file() {
        let p = destination_path(Tool::ClaudeCode, "mcp-server", "server.json", "fs-mcp");
        assert_eq!(p, PathBuf::from(".claude/mcp-servers/fs-mcp.json"));
    }

    #[test]
    fn cursor_rule_uses_mdc_extension() {
        let p = destination_path(Tool::Cursor, "rule", "RULE.md", "typescript-strict");
        assert_eq!(p, PathBuf::from(".cursor/rules/typescript-strict.mdc"));
    }

    #[test]
    fn cursor_non_rule_keeps_source_extension_and_type_dir() {
        let p = destination_path(Tool::Cursor, "skill", "SKILL.md", "no-secrets");
        assert_eq!(p, PathBuf::from(".cursor/skills/no-secrets.md"));
    }

    #[test]
    fn malicious_asset_type_falls_back_to_misc() {
        for bad in ["../etc", "foo/bar", "..", ".hidden", "with space"] {
            let p = destination_path(Tool::ClaudeCode, bad, "x.md", "pkg");
            assert_eq!(
                p,
                PathBuf::from(".claude/misc/pkg.md"),
                "expected misc fallback for asset_type {bad:?}",
            );
        }
    }

    #[test]
    fn unknown_but_safe_asset_type_passes_through() {
        let p = destination_path(Tool::ClaudeCode, "snippet", "x.md", "pkg");
        assert_eq!(p, PathBuf::from(".claude/snippet/pkg.md"));
    }

    #[test]
    fn every_tool_groups_by_type_under_its_own_root() {
        assert_eq!(
            destination_path(Tool::Continue, "rule", "x.md", "ts-strict"),
            PathBuf::from(".continue/rules/ts-strict.md")
        );
        assert_eq!(
            destination_path(Tool::Copilot, "command", "x.md", "cleanup"),
            PathBuf::from(".github/copilot/commands/cleanup.md")
        );
        assert_eq!(
            destination_path(Tool::Windsurf, "agent", "x.md", "reviewer"),
            PathBuf::from(".windsurf/agents/reviewer.md")
        );
        assert_eq!(
            destination_path(Tool::Cline, "workflow", "x.md", "ship"),
            PathBuf::from(".clinerules/workflows/ship.md")
        );
        assert_eq!(
            destination_path(Tool::Aider, "rule", "x.md", "ts-strict"),
            PathBuf::from(".aider/rules/ts-strict.md")
        );
    }
}
