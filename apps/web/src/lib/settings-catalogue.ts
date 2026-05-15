// Catalogue of Claude Code `.claude/settings.json` keys.
// Source: https://code.claude.com/docs/en/settings.md (snapshot 2026-05-13).
// Each entry is purely descriptive — the page renders controls from this data.

// `type` stays a plain string: the catalogue is hand-authored from docs
// and upstream sometimes uses unions like `"string|array"` or custom
// shapes. The renderer treats anything it doesn't recognise as a text
// input fallback.
export type SettingType = string;

// `user-only` keys only have effect in `~/.claude/settings.json`;
// `managed-only` keys come from enterprise-managed config and are
// surfaced for completeness — the UI shows both with a scope badge.
export type SettingScope = "user-only" | "managed-only";

export type SettingEntry = {
  key: string;
  type: SettingType;
  default: unknown;
  description: string;
  docsUrl: string;
  example: string | null;
  nested: SettingEntry[] | null;
  scope?: SettingScope;
  // Optional curated values rendered as one-click chips next to the
  // input. Used for keys with a small, well-known set of canonical
  // values (e.g. Claude model aliases) while still allowing free-text
  // entries the chips can't enumerate (Bedrock ARNs, future models).
  suggestions?: string[];
};

export type SettingCategory = { name: string; settings: SettingEntry[] };

export const SETTINGS_CATEGORIES: SettingCategory[] = [
  {
    name: "MODEL & PERFORMANCE",
    settings: [
      {
        key: "model",
        type: "string",
        default: undefined,
        description: "Override default model (e.g., 'claude-sonnet-4-6').",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#model--performance",
        example: '{"model": "claude-sonnet-4-6"}',
        suggestions: [
          "claude-opus-4-7",
          "claude-sonnet-4-6",
          "claude-haiku-4-5-20251001",
        ],
        nested: null,
      },
      {
        key: "modelOverrides",
        type: "object",
        default: undefined,
        description:
          "Map Anthropic model IDs to provider-specific IDs (Bedrock ARNs, etc.).",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#model--performance",
        example:
          '{"modelOverrides": {"claude-opus": "arn:aws:bedrock:us-east-1:...claude-3-opus..."}}',
        nested: [
          {
            key: "[model-id]",
            type: "string",
            default: undefined,
            description: "Mapped provider-specific model ID.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#model--performance",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "availableModels",
        type: "array",
        default: undefined,
        description:
          "Restrict model selection to specific models via /model command.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#model--performance",
        example:
          '{"availableModels": ["claude-sonnet-4-6", "claude-haiku-4-5-20251001"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Model ID string.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#model--performance",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "effortLevel",
        type: "enum:low|medium|high|xhigh",
        default: undefined,
        description: "Persist effort level across sessions.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#model--performance",
        example: '{"effortLevel": "high"}',
        nested: null,
      },
      {
        key: "alwaysThinkingEnabled",
        type: "boolean",
        default: false,
        description: "Enable extended thinking by default for all sessions.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#model--performance",
        example: '{"alwaysThinkingEnabled": true}',
        nested: null,
      },
    ],
  },
  {
    name: "UI & DISPLAY",
    settings: [
      {
        key: "tui",
        type: "enum:default|fullscreen",
        default: "default",
        description: "Terminal UI renderer mode.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"tui": "fullscreen"}',
        nested: null,
      },
      {
        key: "outputStyle",
        type: "string",
        default: undefined,
        description: "Adjust system prompt output style.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"outputStyle": "concise"}',
        nested: null,
      },
      {
        key: "language",
        type: "string",
        default: undefined,
        description:
          "Response language (e.g., 'japanese', 'spanish', 'english').",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"language": "japanese"}',
        suggestions: [
          "english",
          "japanese",
          "spanish",
          "french",
          "german",
          "chinese",
        ],
        nested: null,
      },
      {
        key: "editorMode",
        type: "enum:normal|vim",
        default: "normal",
        description: "Keyboard binding mode for editor interactions.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"editorMode": "vim"}',
        nested: null,
      },
      {
        key: "spinnerTipsEnabled",
        type: "boolean",
        default: true,
        description: "Show tips while Claude works on a task.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"spinnerTipsEnabled": false}',
        nested: null,
      },
      {
        key: "spinnerTipsOverride",
        type: "object",
        default: undefined,
        description:
          "Customize spinner tips with custom list and exclusion flag.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example:
          '{"spinnerTipsOverride": {"tips": ["Thinking...", "Working..."], "excludeDefault": false}}',
        nested: [
          {
            key: "tips",
            type: "array",
            default: undefined,
            description: "Array of custom tip strings.",
            docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Custom tip text.",
                docsUrl:
                  "https://code.claude.com/docs/en/settings.md#ui--display",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "excludeDefault",
            type: "boolean",
            default: false,
            description:
              "If true, only custom tips are shown; default tips are excluded.",
            docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "spinnerVerbs",
        type: "object",
        default: undefined,
        description: "Customize action verbs in spinner messages.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example:
          '{"spinnerVerbs": {"mode": "append", "verbs": ["coding", "building"]}}',
        nested: [
          {
            key: "mode",
            type: "enum:append|replace",
            default: "append",
            description: "Whether to append to or replace default verbs.",
            docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
            example: null,
            nested: null,
          },
          {
            key: "verbs",
            type: "array",
            default: undefined,
            description: "Array of custom verb strings.",
            docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Custom verb text.",
                docsUrl:
                  "https://code.claude.com/docs/en/settings.md#ui--display",
                example: null,
                nested: null,
              },
            ],
          },
        ],
      },
      {
        key: "showTurnDuration",
        type: "boolean",
        default: true,
        description: "Show turn duration messages after each turn.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"showTurnDuration": false}',
        nested: null,
      },
      {
        key: "showThinkingSummaries",
        type: "boolean",
        default: false,
        description: "Show extended thinking summaries in the UI.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"showThinkingSummaries": true}',
        nested: null,
      },
      {
        key: "autoScrollEnabled",
        type: "boolean",
        default: true,
        description: "Auto-scroll to bottom of transcript in fullscreen mode.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"autoScrollEnabled": false}',
        nested: null,
      },
      {
        key: "prefersReducedMotion",
        type: "boolean",
        default: false,
        description: "Reduce UI animations for accessibility.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"prefersReducedMotion": true}',
        nested: null,
      },
      {
        key: "syntaxHighlightingDisabled",
        type: "boolean",
        default: false,
        description: "Disable syntax highlighting in diffs and code blocks.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"syntaxHighlightingDisabled": true}',
        nested: null,
      },
      {
        key: "terminalProgressBarEnabled",
        type: "boolean",
        default: true,
        description: "Show terminal progress bar during execution.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"terminalProgressBarEnabled": false}',
        nested: null,
      },
      {
        key: "viewMode",
        type: "enum:default|verbose|focus",
        default: "default",
        description: "Default transcript view mode.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#ui--display",
        example: '{"viewMode": "verbose"}',
        nested: null,
      },
    ],
  },
  {
    name: "PERMISSIONS & SECURITY",
    settings: [
      {
        key: "permissions",
        type: "object",
        default: undefined,
        description: "Fine-grained permission rules for tool access control.",
        docsUrl: "https://code.claude.com/docs/en/permissions.md",
        example:
          '{"permissions": {"allow": ["Bash(npm run *)"], "deny": ["Bash(curl *)"]}}',
        nested: [
          {
            key: "allow",
            type: "array",
            default: undefined,
            description: "Rules allowing tool use without manual approval.",
            docsUrl:
              "https://code.claude.com/docs/en/permissions.md#manage-permissions",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description:
                  "Permission rule (e.g., 'Bash(npm run *)', 'Read(.env)', 'WebFetch(domain:github.com)').",
                docsUrl:
                  "https://code.claude.com/docs/en/permissions.md#permission-rule-syntax",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "ask",
            type: "array",
            default: undefined,
            description: "Rules requiring confirmation before tool use.",
            docsUrl:
              "https://code.claude.com/docs/en/permissions.md#manage-permissions",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Permission rule requiring confirmation.",
                docsUrl:
                  "https://code.claude.com/docs/en/permissions.md#permission-rule-syntax",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "deny",
            type: "array",
            default: undefined,
            description: "Rules blocking tool use completely.",
            docsUrl:
              "https://code.claude.com/docs/en/permissions.md#manage-permissions",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description:
                  "Permission rule to deny (takes precedence over allow/ask).",
                docsUrl:
                  "https://code.claude.com/docs/en/permissions.md#permission-rule-syntax",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "defaultMode",
            type: "enum:default|acceptEdits|plan|auto|dontAsk|bypassPermissions",
            default: "default",
            description:
              "Default permission mode controlling how tools are approved.",
            docsUrl:
              "https://code.claude.com/docs/en/permissions.md#permission-modes",
            example: null,
            nested: null,
          },
          {
            key: "additionalDirectories",
            type: "array",
            default: undefined,
            description:
              "Additional working directories where Claude can read and edit files.",
            docsUrl:
              "https://code.claude.com/docs/en/permissions.md#working-directories",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Directory path (absolute or tilde-prefixed).",
                docsUrl:
                  "https://code.claude.com/docs/en/permissions.md#working-directories",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "disableBypassPermissionsMode",
            type: "enum:disable",
            default: undefined,
            description:
              "Set to 'disable' to prevent bypassPermissions mode from being used.",
            docsUrl:
              "https://code.claude.com/docs/en/permissions.md#permission-modes",
            example: null,
            nested: null,
          },
          {
            key: "skipDangerousModePermissionPrompt",
            type: "boolean",
            default: false,
            description:
              "Skip confirmation prompt before entering bypassPermissions mode.",
            docsUrl:
              "https://code.claude.com/docs/en/permissions.md#permission-modes",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "autoMode",
        type: "object",
        default: undefined,
        description:
          "Customize auto mode rules with environment, allow, soft_deny, and hard_deny arrays.",
        docsUrl: "https://code.claude.com/docs/en/auto-mode-config.md",
        example:
          '{"autoMode": {"environment": ["prod"], "allow": ["trusted-*"], "soft_deny": ["untrusted-*"], "hard_deny": ["dangerous-*"]}}',
        nested: [
          {
            key: "environment",
            type: "array",
            default: undefined,
            description:
              "Environment tags to enable auto mode for (e.g., 'prod', 'dev').",
            docsUrl: "https://code.claude.com/docs/en/auto-mode-config.md",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Environment identifier.",
                docsUrl: "https://code.claude.com/docs/en/auto-mode-config.md",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "allow",
            type: "array",
            default: undefined,
            description:
              "Patterns for infrastructure to auto-approve in auto mode.",
            docsUrl: "https://code.claude.com/docs/en/auto-mode-config.md",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Pattern to allow (supports wildcards).",
                docsUrl: "https://code.claude.com/docs/en/auto-mode-config.md",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "soft_deny",
            type: "array",
            default: undefined,
            description:
              "Patterns for infrastructure to prompt on in auto mode.",
            docsUrl: "https://code.claude.com/docs/en/auto-mode-config.md",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Pattern to soft-deny (supports wildcards).",
                docsUrl: "https://code.claude.com/docs/en/auto-mode-config.md",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "hard_deny",
            type: "array",
            default: undefined,
            description: "Patterns for infrastructure to block in auto mode.",
            docsUrl: "https://code.claude.com/docs/en/auto-mode-config.md",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Pattern to hard-deny (supports wildcards).",
                docsUrl: "https://code.claude.com/docs/en/auto-mode-config.md",
                example: null,
                nested: null,
              },
            ],
          },
        ],
        scope: "user-only",
      },
      {
        key: "disableAutoMode",
        type: "enum:disable",
        default: undefined,
        description: "Set to 'disable' to prevent auto mode from being used.",
        docsUrl:
          "https://code.claude.com/docs/en/permissions.md#permission-modes",
        example: '{"disableAutoMode": "disable"}',
        nested: null,
      },
    ],
  },
  {
    name: "SANDBOX CONFIGURATION",
    settings: [
      {
        key: "sandbox",
        type: "object",
        default: undefined,
        description:
          "OS-level filesystem and network isolation for Bash commands.",
        docsUrl: "https://code.claude.com/docs/en/sandboxing.md",
        example:
          '{"sandbox": {"enabled": true, "filesystem": {"allowWrite": ["/tmp/build"]}}}',
        nested: [
          {
            key: "enabled",
            type: "boolean",
            default: false,
            description: "Enable bash sandboxing (macOS, Linux, WSL2).",
            docsUrl:
              "https://code.claude.com/docs/en/sandboxing.md#getting-started",
            example: null,
            nested: null,
          },
          {
            key: "failIfUnavailable",
            type: "boolean",
            default: false,
            description: "Exit if sandbox unavailable when enabled.",
            docsUrl:
              "https://code.claude.com/docs/en/sandboxing.md#getting-started",
            example: null,
            nested: null,
          },
          {
            key: "autoAllowBashIfSandboxed",
            type: "boolean",
            default: true,
            description: "Auto-approve bash commands when sandboxed.",
            docsUrl:
              "https://code.claude.com/docs/en/sandboxing.md#sandbox-modes",
            example: null,
            nested: null,
          },
          {
            key: "excludedCommands",
            type: "array",
            default: undefined,
            description: "Commands to run outside sandbox.",
            docsUrl:
              "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Command name or pattern.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "allowUnsandboxedCommands",
            type: "boolean",
            default: true,
            description:
              "Allow dangerouslyDisableSandbox parameter for commands.",
            docsUrl: "https://code.claude.com/docs/en/sandboxing.md",
            example: null,
            nested: null,
          },
          {
            key: "filesystem",
            type: "object",
            default: undefined,
            description:
              "Filesystem access restrictions for sandboxed commands.",
            docsUrl:
              "https://code.claude.com/docs/en/sandboxing.md#filesystem-isolation",
            example: null,
            nested: [
              {
                key: "allowWrite",
                type: "array",
                default: undefined,
                description: "Paths where sandboxed commands can write.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: [
                  {
                    key: "[index]",
                    type: "string",
                    default: undefined,
                    description: "Path (supports ~/ and ./ prefixes).",
                    docsUrl:
                      "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                    example: null,
                    nested: null,
                  },
                ],
              },
              {
                key: "denyWrite",
                type: "array",
                default: undefined,
                description: "Paths where sandboxed commands cannot write.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: [
                  {
                    key: "[index]",
                    type: "string",
                    default: undefined,
                    description: "Path to deny.",
                    docsUrl:
                      "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                    example: null,
                    nested: null,
                  },
                ],
              },
              {
                key: "denyRead",
                type: "array",
                default: undefined,
                description: "Paths where sandboxed commands cannot read.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: [
                  {
                    key: "[index]",
                    type: "string",
                    default: undefined,
                    description: "Path to deny.",
                    docsUrl:
                      "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                    example: null,
                    nested: null,
                  },
                ],
              },
              {
                key: "allowRead",
                type: "array",
                default: undefined,
                description: "Paths to re-allow within denyRead regions.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: [
                  {
                    key: "[index]",
                    type: "string",
                    default: undefined,
                    description: "Path to allow.",
                    docsUrl:
                      "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                    example: null,
                    nested: null,
                  },
                ],
              },
              {
                key: "allowManagedReadPathsOnly",
                type: "boolean",
                default: false,
                description: "Only managed allowRead paths are respected.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "network",
            type: "object",
            default: undefined,
            description: "Network access restrictions for sandboxed commands.",
            docsUrl:
              "https://code.claude.com/docs/en/sandboxing.md#network-isolation",
            example: null,
            nested: [
              {
                key: "allowedDomains",
                type: "array",
                default: undefined,
                description:
                  "Domains allowed for outbound traffic (supports *.  wildcards).",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: [
                  {
                    key: "[index]",
                    type: "string",
                    default: undefined,
                    description:
                      "Domain (e.g., 'github.com', '*.example.com').",
                    docsUrl:
                      "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                    example: null,
                    nested: null,
                  },
                ],
              },
              {
                key: "deniedDomains",
                type: "array",
                default: undefined,
                description: "Domains blocked for outbound traffic.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: [
                  {
                    key: "[index]",
                    type: "string",
                    default: undefined,
                    description: "Domain to block.",
                    docsUrl:
                      "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                    example: null,
                    nested: null,
                  },
                ],
              },
              {
                key: "allowManagedDomainsOnly",
                type: "boolean",
                default: false,
                description:
                  "Only managed domains are respected; others are blocked.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: null,
              },
              {
                key: "allowUnixSockets",
                type: "array",
                default: undefined,
                description: "Unix socket paths to allow (macOS only).",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: [
                  {
                    key: "[index]",
                    type: "string",
                    default: undefined,
                    description: "Socket path.",
                    docsUrl:
                      "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                    example: null,
                    nested: null,
                  },
                ],
              },
              {
                key: "allowAllUnixSockets",
                type: "boolean",
                default: false,
                description: "Allow all Unix sockets (Linux/WSL2 only).",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: null,
              },
              {
                key: "allowLocalBinding",
                type: "boolean",
                default: false,
                description: "Allow binding to localhost ports (macOS).",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: null,
              },
              {
                key: "allowMachLookup",
                type: "array",
                default: undefined,
                description:
                  "XPC/Mach service names (macOS, supports * suffix).",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                example: null,
                nested: [
                  {
                    key: "[index]",
                    type: "string",
                    default: undefined,
                    description: "Mach service name.",
                    docsUrl:
                      "https://code.claude.com/docs/en/sandboxing.md#configure-sandboxing",
                    example: null,
                    nested: null,
                  },
                ],
              },
              {
                key: "httpProxyPort",
                type: "number",
                default: undefined,
                description: "HTTP proxy port for custom proxy.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#custom-proxy-configuration",
                example: null,
                nested: null,
              },
              {
                key: "socksProxyPort",
                type: "number",
                default: undefined,
                description: "SOCKS5 proxy port for custom proxy.",
                docsUrl:
                  "https://code.claude.com/docs/en/sandboxing.md#custom-proxy-configuration",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "enableWeakerNestedSandbox",
            type: "boolean",
            default: false,
            description:
              "Enable weaker sandbox for unprivileged Docker (Linux/WSL2).",
            docsUrl:
              "https://code.claude.com/docs/en/sandboxing.md#security-limitations",
            example: null,
            nested: null,
          },
          {
            key: "enableWeakerNetworkIsolation",
            type: "boolean",
            default: false,
            description:
              "Allow system TLS trust service (macOS, reduces security).",
            docsUrl:
              "https://code.claude.com/docs/en/sandboxing.md#security-limitations",
            example: null,
            nested: null,
          },
          {
            key: "bwrapPath",
            type: "string",
            default: undefined,
            description: "Path to bubblewrap binary (managed settings only).",
            docsUrl: "https://code.claude.com/docs/en/sandboxing.md",
            example: null,
            nested: null,
            scope: "managed-only",
          },
          {
            key: "socatPath",
            type: "string",
            default: undefined,
            description: "Path to socat binary (managed settings only).",
            docsUrl: "https://code.claude.com/docs/en/sandboxing.md",
            example: null,
            nested: null,
            scope: "managed-only",
          },
        ],
      },
    ],
  },
  {
    name: "ENVIRONMENT & CREDENTIALS",
    settings: [
      {
        key: "env",
        type: "object",
        default: undefined,
        description: "Environment variables applied to all sessions.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#environment--credentials",
        example: '{"env": {"NODE_ENV": "development", "DEBUG": "true"}}',
        nested: [
          {
            key: "[key]",
            type: "string",
            default: undefined,
            description: "Environment variable name and value.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#environment--credentials",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "apiKeyHelper",
        type: "string",
        default: undefined,
        description: "Script to generate auth value for model requests.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#environment--credentials",
        example: '{"apiKeyHelper": "~/.claude/get-api-key.sh"}',
        nested: null,
      },
      {
        key: "awsCredentialExport",
        type: "string",
        default: undefined,
        description: "Script outputting JSON with AWS credentials.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#environment--credentials",
        example: '{"awsCredentialExport": "~/.claude/aws-creds.sh"}',
        nested: null,
      },
      {
        key: "awsAuthRefresh",
        type: "string",
        default: undefined,
        description: "Script to refresh AWS credentials.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#environment--credentials",
        example: '{"awsAuthRefresh": "~/.claude/refresh-aws.sh"}',
        nested: null,
      },
      {
        key: "gcpAuthRefresh",
        type: "string",
        default: undefined,
        description: "Script to refresh GCP credentials.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#environment--credentials",
        example: '{"gcpAuthRefresh": "~/.claude/refresh-gcp.sh"}',
        nested: null,
      },
      {
        key: "otelHeadersHelper",
        type: "string",
        default: undefined,
        description: "Script generating dynamic OpenTelemetry headers.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#environment--credentials",
        example: '{"otelHeadersHelper": "~/.claude/otel-headers.sh"}',
        nested: null,
      },
    ],
  },
  {
    name: "MEMORY & CONTEXT",
    settings: [
      {
        key: "autoMemoryEnabled",
        type: "boolean",
        default: true,
        description: "Enable auto memory read/write during sessions.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#memory--context",
        example: '{"autoMemoryEnabled": false}',
        nested: null,
      },
      {
        key: "autoMemoryDirectory",
        type: "string",
        default: undefined,
        description: "Custom directory for auto memory storage.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#memory--context",
        example: '{"autoMemoryDirectory": "~/.claude/memory"}',
        nested: null,
        scope: "user-only",
      },
      {
        key: "claudeMd",
        type: "string",
        default: undefined,
        description: "Organization-managed memory (managed settings only).",
        docsUrl: "https://code.claude.com/docs/en/settings.md#memory--context",
        example: '{"claudeMd": "Team guidelines and conventions."}',
        nested: null,
        scope: "managed-only",
      },
      {
        key: "claudeMdExcludes",
        type: "array",
        default: undefined,
        description: "Glob patterns for CLAUDE.md files to skip.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#memory--context",
        example:
          '{"claudeMdExcludes": ["**/CLAUDE.local.md", "packages/*/CLAUDE.md"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Glob pattern.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#memory--context",
            example: null,
            nested: null,
          },
        ],
      },
    ],
  },
  {
    name: "SKILLS & TOOLS",
    settings: [
      {
        key: "agent",
        type: "string",
        default: undefined,
        description: "Run main thread as named subagent.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#skills--tools",
        example: '{"agent": "my-custom-agent"}',
        nested: null,
      },
      {
        key: "skillListingBudgetFraction",
        type: "number",
        default: 0.01,
        description: "Fraction of context reserved for skill listing (0-1).",
        docsUrl: "https://code.claude.com/docs/en/settings.md#skills--tools",
        example: '{"skillListingBudgetFraction": 0.05}',
        nested: null,
      },
      {
        key: "maxSkillDescriptionChars",
        type: "number",
        default: 1536,
        description: "Per-skill character cap on descriptions.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#skills--tools",
        example: '{"maxSkillDescriptionChars": 2048}',
        nested: null,
      },
      {
        key: "skillOverrides",
        type: "object",
        default: undefined,
        description: "Per-skill visibility overrides.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#skills--tools",
        example:
          '{"skillOverrides": {"my-skill": "off", "debug": "user-invocable-only"}}',
        nested: [
          {
            key: "[skillName]",
            type: "enum:on|name-only|user-invocable-only|off",
            default: undefined,
            description: "Visibility setting for the skill.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#skills--tools",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "disableSkillShellExecution",
        type: "enum:disable",
        default: undefined,
        description: "Set to disable ! inline shell execution in skills.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#skills--tools",
        example: '{"disableSkillShellExecution": "disable"}',
        nested: null,
      },
    ],
  },
  {
    name: "FILE & PROJECT SETTINGS",
    settings: [
      {
        key: "respectGitignore",
        type: "boolean",
        default: true,
        description: "Respect .gitignore patterns in @ file picker.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#file--project-settings",
        example: '{"respectGitignore": false}',
        nested: null,
      },
      {
        key: "fileSuggestion",
        type: "object",
        default: undefined,
        description: "Custom file autocomplete command.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#file--project-settings",
        example:
          '{"fileSuggestion": {"type": "command", "command": "~/.claude/file-suggestion.sh"}}',
        nested: [
          {
            key: "type",
            type: "enum:command",
            default: undefined,
            description: "Hook type (only 'command' supported here).",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#file--project-settings",
            example: null,
            nested: null,
          },
          {
            key: "command",
            type: "string",
            default: undefined,
            description: "Executable command or script path.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#file--project-settings",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "plansDirectory",
        type: "string",
        default: "~/.claude/plans",
        description: "Custom directory for plan files.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#file--project-settings",
        example: '{"plansDirectory": "~/.claude/my-plans"}',
        nested: null,
      },
    ],
  },
  {
    name: "GIT & ATTRIBUTION",
    settings: [
      {
        key: "attribution",
        type: "object",
        default: undefined,
        description: "Git attribution for commits and PRs.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#git--attribution",
        example:
          '{"attribution": {"commit": "Claude Code", "pr": "Claude Code"}}',
        nested: [
          {
            key: "commit",
            type: "string",
            default: undefined,
            description:
              "Commit message footer (e.g., 'Claude Code' or emoji + text).",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#git--attribution",
            example: null,
            nested: null,
          },
          {
            key: "pr",
            type: "string",
            default: undefined,
            description: "PR description footer.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#git--attribution",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "includeCoAuthoredBy",
        type: "boolean",
        default: true,
        description: "Deprecated: use attribution instead.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#git--attribution",
        example: '{"includeCoAuthoredBy": false}',
        nested: null,
      },
      {
        key: "prUrlTemplate",
        type: "string",
        default: undefined,
        description:
          "URL template for PR badges (supports {owner}, {repo}, {number}).",
        docsUrl: "https://code.claude.com/docs/en/settings.md#git--attribution",
        example:
          '{"prUrlTemplate": "https://reviews.example.com/{owner}/{repo}/pull/{number}"}',
        nested: null,
      },
      {
        key: "includeGitInstructions",
        type: "boolean",
        default: true,
        description: "Include git workflow instructions in system prompt.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#git--attribution",
        example: '{"includeGitInstructions": false}',
        nested: null,
      },
    ],
  },
  {
    name: "NOTIFICATIONS & ALERTS",
    settings: [
      {
        key: "preferredNotifChannel",
        type: "enum:auto|terminal_bell|iterm2|kitty|ghostty|notifications_disabled",
        default: "auto",
        description: "Task completion notification method.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#notifications--alerts",
        example: '{"preferredNotifChannel": "terminal_bell"}',
        nested: null,
      },
      {
        key: "awaySummaryEnabled",
        type: "boolean",
        default: true,
        description: "Show session recap when returning to terminal.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#notifications--alerts",
        example: '{"awaySummaryEnabled": false}',
        nested: null,
      },
      {
        key: "companyAnnouncements",
        type: "array",
        default: undefined,
        description: "Array of startup announcements to display.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#notifications--alerts",
        example:
          '{"companyAnnouncements": ["Welcome to Claude Code!", "New features available."]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Announcement text.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#notifications--alerts",
            example: null,
            nested: null,
          },
        ],
      },
    ],
  },
  {
    name: "UPDATES & CHANNELS",
    settings: [
      {
        key: "autoUpdatesChannel",
        type: "enum:stable|latest",
        default: "latest",
        description: "Release channel for automatic updates.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#updates--channels",
        example: '{"autoUpdatesChannel": "stable"}',
        nested: null,
      },
      {
        key: "minimumVersion",
        type: "string",
        default: undefined,
        description: "Floor version preventing downgrades (semver format).",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#updates--channels",
        example: '{"minimumVersion": "1.0.0"}',
        nested: null,
      },
    ],
  },
  {
    name: "AGENT TEAMS",
    settings: [
      {
        key: "disableAgentView",
        type: "enum:disable",
        default: undefined,
        description: "Set to 'disable' to turn off background agents display.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#agent-teams",
        example: '{"disableAgentView": "disable"}',
        nested: null,
      },
      {
        key: "teammateMode",
        type: "enum:auto|in-process|tmux",
        default: "auto",
        description: "How teammate agents are displayed.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#agent-teams",
        example: '{"teammateMode": "tmux"}',
        nested: null,
      },
      {
        key: "useAutoModeDuringPlan",
        type: "boolean",
        default: true,
        description: "Use auto mode semantics during plan mode.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#agent-teams",
        example: '{"useAutoModeDuringPlan": false}',
        nested: null,
        scope: "user-only",
      },
    ],
  },
  {
    name: "PLUGINS & EXTENSIONS",
    settings: [
      {
        key: "allowedChannelPlugins",
        type: "array",
        default: undefined,
        description: "Allowlist of channel plugins (managed only).",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#plugins--extensions",
        example: '{"allowedChannelPlugins": ["plugin-id-1", "plugin-id-2"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Plugin ID.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#plugins--extensions",
            example: null,
            nested: null,
          },
        ],
        scope: "managed-only",
      },
      {
        key: "blockedMarketplaces",
        type: "array",
        default: undefined,
        description: "Blocklist of plugin marketplace sources (managed only).",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#plugins--extensions",
        example: '{"blockedMarketplaces": ["untrusted-marketplace"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Marketplace source identifier.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#plugins--extensions",
            example: null,
            nested: null,
          },
        ],
        scope: "managed-only",
      },
      {
        key: "strictKnownMarketplaces",
        type: "array",
        default: undefined,
        description: "Allowlist of plugin marketplace sources (managed only).",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#plugins--extensions",
        example: '{"strictKnownMarketplaces": ["official-marketplace"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Marketplace source identifier.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#plugins--extensions",
            example: null,
            nested: null,
          },
        ],
        scope: "managed-only",
      },
      {
        key: "pluginTrustMessage",
        type: "string",
        default: undefined,
        description: "Custom message appended to plugin trust warning.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#plugins--extensions",
        example: '{"pluginTrustMessage": "Approved by security team."}',
        nested: null,
      },
      {
        key: "channelsEnabled",
        type: "boolean",
        default: undefined,
        description: "Allow channels for organization (managed only).",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#plugins--extensions",
        example: '{"channelsEnabled": true}',
        nested: null,
        scope: "managed-only",
      },
    ],
  },
  {
    name: "WORKTREES",
    settings: [
      {
        key: "worktree",
        type: "object",
        default: undefined,
        description: "Worktree configuration for parallel agent execution.",
        docsUrl: "https://code.claude.com/docs/en/worktrees.md",
        example:
          '{"worktree": {"baseRef": "head", "symlinkDirectories": ["node_modules"]}}',
        nested: [
          {
            key: "baseRef",
            type: "enum:fresh|head",
            default: "fresh",
            description:
              "Branch to create worktree from: 'fresh' (clean) or 'head' (current).",
            docsUrl: "https://code.claude.com/docs/en/worktrees.md",
            example: null,
            nested: null,
          },
          {
            key: "symlinkDirectories",
            type: "array",
            default: undefined,
            description:
              "Directories to symlink from main repo into worktrees.",
            docsUrl: "https://code.claude.com/docs/en/worktrees.md",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Directory path.",
                docsUrl: "https://code.claude.com/docs/en/worktrees.md",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "sparsePaths",
            type: "array",
            default: undefined,
            description: "Directories to checkout via git sparse-checkout.",
            docsUrl: "https://code.claude.com/docs/en/worktrees.md",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "string",
                default: undefined,
                description: "Directory path.",
                docsUrl: "https://code.claude.com/docs/en/worktrees.md",
                example: null,
                nested: null,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "MCP SERVERS",
    settings: [
      {
        key: "allowedMcpServers",
        type: "array",
        default: undefined,
        description: "Allowlist of MCP servers users can configure.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
        example: '{"allowedMcpServers": ["puppeteer", "postgres"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "MCP server name.",
            docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "deniedMcpServers",
        type: "array",
        default: undefined,
        description: "Denylist of MCP servers.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
        example: '{"deniedMcpServers": ["dangerous-server"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "MCP server name to deny.",
            docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "allowManagedMcpServersOnly",
        type: "boolean",
        default: false,
        description: "Only managed allowlist applies for MCP servers.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
        example: '{"allowManagedMcpServersOnly": true}',
        nested: null,
      },
      {
        key: "enableAllProjectMcpServers",
        type: "boolean",
        default: false,
        description: "Auto-approve all .mcp.json servers in the project.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
        example: '{"enableAllProjectMcpServers": true}',
        nested: null,
      },
      {
        key: "enabledMcpjsonServers",
        type: "array",
        default: undefined,
        description: "Specific .mcp.json servers to approve.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
        example:
          '{"enabledMcpjsonServers": ["local-server-1", "local-server-2"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Server name from .mcp.json.",
            docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "disabledMcpjsonServers",
        type: "array",
        default: undefined,
        description: "Specific .mcp.json servers to reject.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
        example: '{"disabledMcpjsonServers": ["old-server"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Server name from .mcp.json to disable.",
            docsUrl: "https://code.claude.com/docs/en/settings.md#mcp-servers",
            example: null,
            nested: null,
          },
        ],
      },
    ],
  },
  {
    name: "HOOKS",
    settings: [
      {
        key: "hooks",
        type: "object",
        default: undefined,
        description:
          "Custom commands at lifecycle events (SessionStart, PreToolUse, PostToolUse, Stop, etc.).",
        docsUrl: "https://code.claude.com/docs/en/hooks.md",
        example:
          '{"hooks": {"Stop": [{"hooks": [{"type": "command", "command": "echo Done"}]}]}}',
        nested: [
          {
            key: "SessionStart",
            type: "array",
            default: undefined,
            description: "Run when session starts.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description:
                  "Hook entry with optional matcher and hooks array.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: [
                  {
                    key: "matcher",
                    type: "string",
                    default: undefined,
                    description: "Optional filter for specific tool/event.",
                    docsUrl: "https://code.claude.com/docs/en/hooks.md",
                    example: null,
                    nested: null,
                  },
                  {
                    key: "hooks",
                    type: "array",
                    default: undefined,
                    description:
                      "Array of hook handlers (command, http, mcp_tool, prompt, agent).",
                    docsUrl: "https://code.claude.com/docs/en/hooks.md",
                    example: null,
                    nested: null,
                  },
                ],
              },
            ],
          },
          {
            key: "Setup",
            type: "array",
            default: undefined,
            description: "Run during session setup.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "SessionEnd",
            type: "array",
            default: undefined,
            description: "Run when session ends.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "UserPromptSubmit",
            type: "array",
            default: undefined,
            description: "Run when user submits a prompt.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "UserPromptExpansion",
            type: "array",
            default: undefined,
            description: "Run during prompt expansion phase.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "Stop",
            type: "array",
            default: undefined,
            description: "Run when Claude stops executing (turn complete).",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "StopFailure",
            type: "array",
            default: undefined,
            description: "Run when Claude fails to stop gracefully.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "PreToolUse",
            type: "array",
            default: undefined,
            description:
              "Run before a tool is executed (for custom permission logic).",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "PostToolUse",
            type: "array",
            default: undefined,
            description: "Run after a tool is executed.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry with optional matcher.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "PostToolUseFailure",
            type: "array",
            default: undefined,
            description: "Run when a tool execution fails.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "PostToolBatch",
            type: "array",
            default: undefined,
            description: "Run after a batch of tools is executed.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "PermissionRequest",
            type: "array",
            default: undefined,
            description: "Run when a permission is requested.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "PermissionDenied",
            type: "array",
            default: undefined,
            description: "Run when a permission is denied.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "Notification",
            type: "array",
            default: undefined,
            description: "Run on async notification events.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "CwdChanged",
            type: "array",
            default: undefined,
            description: "Run when current working directory changes.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "FileChanged",
            type: "array",
            default: undefined,
            description: "Run when watched files change.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "ConfigChange",
            type: "array",
            default: undefined,
            description: "Run when configuration changes.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "InstructionsLoaded",
            type: "array",
            default: undefined,
            description: "Run when instructions are loaded.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "SubagentStart",
            type: "array",
            default: undefined,
            description: "Run when a subagent starts.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "SubagentStop",
            type: "array",
            default: undefined,
            description: "Run when a subagent stops.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "TeammateIdle",
            type: "array",
            default: undefined,
            description: "Run when teammate agent becomes idle.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "TaskCreated",
            type: "array",
            default: undefined,
            description: "Run when a task is created.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "TaskCompleted",
            type: "array",
            default: undefined,
            description: "Run when a task is completed.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "PreCompact",
            type: "array",
            default: undefined,
            description: "Run before context compaction.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "PostCompact",
            type: "array",
            default: undefined,
            description: "Run after context compaction.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "WorktreeCreate",
            type: "array",
            default: undefined,
            description: "Run when a worktree is created.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "WorktreeRemove",
            type: "array",
            default: undefined,
            description: "Run when a worktree is removed.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "Elicitation",
            type: "array",
            default: undefined,
            description: "Run during MCP elicitation.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
          {
            key: "ElicitationResult",
            type: "array",
            default: undefined,
            description: "Run after MCP elicitation result.",
            docsUrl:
              "https://code.claude.com/docs/en/hooks.md#all-hook-events-35-total",
            example: null,
            nested: [
              {
                key: "[index]",
                type: "object",
                default: undefined,
                description: "Hook entry.",
                docsUrl:
                  "https://code.claude.com/docs/en/hooks.md#hook-configuration-structure",
                example: null,
                nested: null,
              },
            ],
          },
        ],
      },
      {
        key: "disableAllHooks",
        type: "string",
        default: undefined,
        description:
          "Set to 'disable' to globally disable all hooks and custom status lines.",
        docsUrl: "https://code.claude.com/docs/en/hooks.md",
        example: '{"disableAllHooks": "disable"}',
        nested: null,
      },
      {
        key: "allowManagedHooksOnly",
        type: "boolean",
        default: false,
        description:
          "Only managed, SDK, and force-enabled plugin hooks are loaded (managed only).",
        docsUrl: "https://code.claude.com/docs/en/hooks.md",
        example: '{"allowManagedHooksOnly": true}',
        nested: null,
        scope: "managed-only",
      },
      {
        key: "allowedHttpHookUrls",
        type: "array",
        default: undefined,
        description: "Allowlist of URL patterns HTTP hooks may target.",
        docsUrl: "https://code.claude.com/docs/en/hooks.md",
        example: '{"allowedHttpHookUrls": ["https://hooks.example.com/*"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "URL pattern.",
            docsUrl: "https://code.claude.com/docs/en/hooks.md",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "httpHookAllowedEnvVars",
        type: "array",
        default: undefined,
        description:
          "Allowlist of environment variables HTTP hooks may interpolate.",
        docsUrl: "https://code.claude.com/docs/en/hooks.md",
        example: '{"httpHookAllowedEnvVars": ["API_KEY", "WEBHOOK_SECRET"]}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Environment variable name.",
            docsUrl: "https://code.claude.com/docs/en/hooks.md",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "statusLine",
        type: "object",
        default: undefined,
        description: "Custom status line command.",
        docsUrl: "https://code.claude.com/docs/en/hooks.md",
        example:
          '{"statusLine": {"type": "command", "command": "~/.claude/statusline.sh"}}',
        nested: [
          {
            key: "type",
            type: "enum:command",
            default: undefined,
            description: "Hook type (only 'command' supported).",
            docsUrl: "https://code.claude.com/docs/en/hooks.md",
            example: null,
            nested: null,
          },
          {
            key: "command",
            type: "string",
            default: undefined,
            description: "Executable command or script path.",
            docsUrl: "https://code.claude.com/docs/en/hooks.md",
            example: null,
            nested: null,
          },
        ],
      },
    ],
  },
  {
    name: "LOGIN & AUTHENTICATION",
    settings: [
      {
        key: "forceLoginMethod",
        type: "enum:claudeai|console",
        default: undefined,
        description: "Restrict login to specific method.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#login--authentication",
        example: '{"forceLoginMethod": "console"}',
        nested: null,
      },
      {
        key: "forceLoginOrgUUID",
        type: "string|array",
        default: undefined,
        description: "Require login to specific organization UUID(s).",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#login--authentication",
        example:
          '{"forceLoginOrgUUID": "550e8400-e29b-41d4-a716-446655440000"}',
        nested: [
          {
            key: "[index]",
            type: "string",
            default: undefined,
            description: "Organization UUID.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#login--authentication",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "disableDeepLinkRegistration",
        type: "enum:disable",
        default: undefined,
        description:
          "Set to 'disable' to prevent claude-cli:// protocol registration.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#login--authentication",
        example: '{"disableDeepLinkRegistration": "disable"}',
        nested: null,
      },
      {
        key: "disableRemoteControl",
        type: "boolean",
        default: false,
        description: "Disable remote control access.",
        docsUrl:
          "https://code.claude.com/docs/en/settings.md#login--authentication",
        example: '{"disableRemoteControl": true}',
        nested: null,
      },
    ],
  },
  {
    name: "MISCELLANEOUS",
    settings: [
      {
        key: "cleanupPeriodDays",
        type: "number",
        default: 30,
        description: "Session file retention period in days (minimum 1).",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example: '{"cleanupPeriodDays": 60}',
        nested: null,
      },
      {
        key: "fastModePerSessionOptIn",
        type: "boolean",
        default: false,
        description: "Require per-session fast mode opt-in.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example: '{"fastModePerSessionOptIn": true}',
        nested: null,
      },
      {
        key: "feedbackSurveyRate",
        type: "number",
        default: undefined,
        description: "Probability (0–1) for quality survey appearance.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example: '{"feedbackSurveyRate": 0.1}',
        nested: null,
      },
      {
        key: "skipWebFetchPreflight",
        type: "boolean",
        default: false,
        description: "Skip WebFetch domain safety check.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example: '{"skipWebFetchPreflight": true}',
        nested: null,
      },
      {
        key: "forceRemoteSettingsRefresh",
        type: "boolean",
        default: false,
        description: "Block startup until remote settings are fetched.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example: '{"forceRemoteSettingsRefresh": true}',
        nested: null,
      },
      {
        key: "defaultShell",
        type: "enum:bash|powershell",
        default: "bash",
        description: "Default shell for ! commands.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example: '{"defaultShell": "powershell"}',
        nested: null,
      },
      {
        key: "allowManagedPermissionRulesOnly",
        type: "boolean",
        default: false,
        description: "Only managed permission rules apply.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example: '{"allowManagedPermissionRulesOnly": true}',
        nested: null,
      },
      {
        key: "policyHelper",
        type: "object",
        default: undefined,
        description: "Admin-deployed executable for dynamic managed settings.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example:
          '{"policyHelper": {"type": "command", "command": "/opt/bin/policy-helper"}}',
        nested: [
          {
            key: "type",
            type: "enum:command",
            default: undefined,
            description: "Hook type (only 'command' supported).",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#miscellaneous",
            example: null,
            nested: null,
          },
          {
            key: "command",
            type: "string",
            default: undefined,
            description: "Executable path.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#miscellaneous",
            example: null,
            nested: null,
          },
        ],
      },
      {
        key: "parentSettingsBehavior",
        type: "enum:first-wins|merge",
        default: "first-wins",
        description: "How parent settings merge with admin tier.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example: '{"parentSettingsBehavior": "merge"}',
        nested: null,
      },
      {
        key: "sshConfigs",
        type: "array",
        default: undefined,
        description: "Pre-configured SSH connections for Desktop.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example:
          '{"sshConfigs": [{"name": "prod-server", "host": "prod.example.com"}]}',
        nested: [
          {
            key: "[index]",
            type: "object",
            default: undefined,
            description: "SSH configuration object.",
            docsUrl:
              "https://code.claude.com/docs/en/settings.md#miscellaneous",
            example: null,
            nested: [
              {
                key: "name",
                type: "string",
                default: undefined,
                description: "Connection name.",
                docsUrl:
                  "https://code.claude.com/docs/en/settings.md#miscellaneous",
                example: null,
                nested: null,
              },
              {
                key: "host",
                type: "string",
                default: undefined,
                description: "Hostname or IP address.",
                docsUrl:
                  "https://code.claude.com/docs/en/settings.md#miscellaneous",
                example: null,
                nested: null,
              },
            ],
          },
        ],
      },
      {
        key: "wslInheritsWindowsSettings",
        type: "boolean",
        default: false,
        description: "WSL reads Windows managed settings.",
        docsUrl: "https://code.claude.com/docs/en/settings.md#miscellaneous",
        example: '{"wslInheritsWindowsSettings": true}',
        nested: null,
      },
    ],
  },
];
