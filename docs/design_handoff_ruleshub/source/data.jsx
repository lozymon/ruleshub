// Mock data + icon components + shared constants
const TOOLS = [
  { id: 'claude-code', name: 'Claude Code', color: '#d97757', short: 'Claude' },
  { id: 'cursor', name: 'Cursor', color: '#4a9eff', short: 'Cursor' },
  { id: 'copilot', name: 'GitHub Copilot', color: '#3fb950', short: 'Copilot' },
  { id: 'windsurf', name: 'Windsurf', color: '#22d3ee', short: 'Windsurf' },
  { id: 'cline', name: 'Cline', color: '#a78bfa', short: 'Cline' },
  { id: 'aider', name: 'Aider', color: '#eab308', short: 'Aider' },
  { id: 'continue', name: 'Continue', color: '#8b8cf8', short: 'Continue' },
];

const TYPES = [
  { id: 'rule', name: 'Rule', plural: 'Rules' },
  { id: 'skill', name: 'Skill', plural: 'Skills' },
  { id: 'command', name: 'Command', plural: 'Commands' },
  { id: 'workflow', name: 'Workflow', plural: 'Workflows' },
  { id: 'agent', name: 'Agent', plural: 'Agents' },
  { id: 'mcp', name: 'MCP Server', plural: 'MCP Servers' },
  { id: 'pack', name: 'Pack', plural: 'Packs' },
];

const toolById = id => TOOLS.find(t => t.id === id);
const typeById = id => TYPES.find(t => t.id === id);

// --- Icons (lucide-inspired, original paths, all 16px unless noted) ---
const Icon = ({ name, size = 16, className = '', ...rest }) => {
  const s = size;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', className, ...rest };
  const paths = {
    // Asset types
    rule: <><path d="M8 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8" /><path d="M4 3h4v18H4z" /><path d="M12 8h5M12 12h5M12 16h3" /></>,
    command: <><polyline points="6 8 10 12 6 16" /><line x1="12" y1="16" x2="18" y2="16" /><rect x="3" y="4" width="18" height="16" rx="2" /></>,
    workflow: <><circle cx="5" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="12" r="2" /><path d="M5 8v8M7 6h6a4 4 0 0 1 4 4v0M7 18h6a4 4 0 0 0 4-4v0" /></>,
    agent: <><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 4v4" /><circle cx="12" cy="3" r="1" /><circle cx="9" cy="14" r="1" /><circle cx="15" cy="14" r="1" /><path d="M10 18h4" /></>,
    mcp: <><path d="M9 3v4M15 3v4" /><rect x="7" y="7" width="10" height="6" rx="1" /><path d="M12 13v4a3 3 0 0 1-3 3H5" /></>,
    skill: <><path d="M12 3l2.5 5.5L20 9.5l-4 4 1 5.5-5-2.7-5 2.7 1-5.5-4-4 5.5-1z" /></>,
    pack: <><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
    // UI
    search: <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></>,
    star: <polygon points="12 2 15.1 8.6 22 9.3 17 14.1 18.3 21 12 17.6 5.7 21 7 14.1 2 9.3 8.9 8.6" />,
    download: <><path d="M12 4v12" /><polyline points="7 11 12 16 17 11" /><path d="M4 20h16" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /></>,
    check: <polyline points="4 12 10 18 20 6" />,
    chevronDown: <polyline points="6 9 12 15 18 9" />,
    chevronRight: <polyline points="9 6 15 12 9 18" />,
    arrowRight: <><line x1="4" y1="12" x2="20" y2="12" /><polyline points="14 6 20 12 14 18" /></>,
    plus: <><line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" /></>,
    github: <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
    flame: <path d="M12 22c-4 0-7-2.5-7-6.5 0-3 2-5 3-6.5 0 2 1 3 2 3 0-3 1-6 4-9 0 4 5 6 5 11 0 4-3 8-7 8z" />,
    clock: <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></>,
    trending: <><polyline points="2 18 9 11 13 15 22 6" /><polyline points="16 6 22 6 22 12" /></>,
    trophy: <><path d="M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M7 6H4a2 2 0 0 0 2 4M17 6h3a2 2 0 0 1-2 4" /><path d="M10 14h4v4h-4zM8 18h8" /></>,
    upload: <><path d="M12 20V8" /><polyline points="7 13 12 8 17 13" /><path d="M4 20h16" /></>,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="14 3 14 9 20 9" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    alert: <><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
    x: <><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></>,
    menu: <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>,
    mapPin: <><path d="M12 22s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.1a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.1a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.1a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.1a1.65 1.65 0 0 0-1.51 1z" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></>,
    eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></>,
    comment: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><polyline points="3 3 3 8 8 8" /><polyline points="12 8 12 12 15 14" /></>,
    shield: <path d="M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z" />,
    terminal: <><polyline points="4 7 8 11 4 15" /><line x1="10" y1="15" x2="16" y2="15" /></>,
    book: <><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" /><path d="M4 16a4 4 0 0 1 4-4h12" /></>,
  };
  return <svg {...common}>{paths[name] || null}</svg>;
};

const typeIcon = (type) => {
  const map = { rule: 'rule', skill: 'skill', command: 'command', workflow: 'workflow', agent: 'agent', mcp: 'mcp', pack: 'pack' };
  return map[type] || 'file';
};

// --- Sample packages ---
const PACKAGES = [
  { ns: 'vercel', name: 'nextjs-app-router', type: 'rule', tools: ['claude-code', 'cursor'], desc: 'Strict conventions for Next.js App Router — server components, data fetching patterns, and cache invalidation rules.', stars: 2847, downloads: 124300, version: '2.4.1', verified: true, trending: 3, updated: '2d ago' },
  { ns: 'microsoft', name: 'typescript-strict', type: 'rule', tools: ['claude-code', 'cursor', 'copilot', 'windsurf'], desc: 'Enforces strict TypeScript patterns — no any, explicit return types, exhaustive checks, and discriminated unions.', stars: 4120, downloads: 287600, version: '3.1.0', verified: true, trending: 1, updated: '4h ago' },
  { ns: 'tanstack', name: 'query-v5-patterns', type: 'workflow', tools: ['claude-code', 'cursor'], desc: 'End-to-end workflow for TanStack Query — suspense boundaries, infinite queries, optimistic updates, and cache layering.', stars: 1893, downloads: 76400, version: '1.2.3', verified: true, updated: '1d ago' },
  { ns: 'anthropic', name: 'claude-test-runner', type: 'command', tools: ['claude-code'], desc: 'Slash command that runs your test suite and iteratively fixes failures, respecting your project\'s test conventions.', stars: 3210, downloads: 98100, version: '0.8.2', verified: true, trending: 2, updated: '6h ago' },
  { ns: 'sindresorhus', name: 'git-flow-agent', type: 'agent', tools: ['claude-code', 'continue'], desc: 'Opinionated git workflow agent — commit message conventions, branch naming, PR templates, and semantic versioning.', stars: 1540, downloads: 52300, version: '2.0.0', verified: false, updated: '3d ago' },
  { ns: 'shadcn', name: 'ui-component-rules', type: 'rule', tools: ['cursor', 'windsurf'], desc: 'Rules for building accessible shadcn/ui components — variants, slots, polymorphic refs, and Radix primitives.', stars: 2210, downloads: 142800, version: '1.8.0', verified: true, updated: '8h ago' },
  { ns: 'prisma', name: 'schema-migration-mcp', type: 'mcp', tools: ['claude-code', 'cursor'], desc: 'MCP server exposing Prisma schema introspection, migration generation, and safe rollback tools to your AI.', stars: 987, downloads: 34200, version: '0.5.1', verified: true, updated: '1w ago' },
  { ns: 'rust-lang', name: 'rust-idiomatic', type: 'rule', tools: ['cursor', 'aider', 'continue'], desc: 'Rules for idiomatic Rust — ownership, error handling with anyhow/thiserror, async patterns with tokio.', stars: 1678, downloads: 63900, version: '1.4.2', verified: false, updated: '5d ago' },
  { ns: 'vercel', name: 'full-stack-starter', type: 'pack', tools: ['claude-code', 'cursor', 'copilot'], desc: 'Curated bundle: Next.js rules, Tailwind conventions, Prisma workflow, auth patterns, and deployment checks.', stars: 3890, downloads: 189400, version: '4.0.0', verified: true, trending: 4, updated: '12h ago' },
  { ns: 'tailwindcss', name: 'design-token-rules', type: 'rule', tools: ['cursor', 'windsurf', 'copilot'], desc: 'Enforces design token usage — no arbitrary values, consistent spacing scale, and color palette adherence.', stars: 1432, downloads: 88700, version: '2.1.3', verified: true, updated: '2d ago' },
  { ns: 'drizzle-team', name: 'drizzle-orm-patterns', type: 'workflow', tools: ['claude-code', 'cursor'], desc: 'Drizzle ORM workflow — schema design, relational queries, migrations, and type-safe filter builders.', stars: 892, downloads: 41200, version: '0.9.4', verified: false, updated: '4d ago' },
  { ns: 'stripe', name: 'payments-integration-agent', type: 'agent', tools: ['claude-code'], desc: 'Agent that scaffolds Stripe integrations — checkout, subscriptions, webhooks, and idempotent handlers.', stars: 2104, downloads: 67800, version: '1.3.1', verified: true, updated: '1d ago' },
  { ns: 'supabase', name: 'supabase-rls-rules', type: 'rule', tools: ['cursor', 'claude-code'], desc: 'Row-level security rules for Supabase — tenant isolation, policy patterns, and auth claim conventions.', stars: 1189, downloads: 58300, version: '1.5.0', verified: true, updated: '3d ago' },
  { ns: 'mdx-js', name: 'mdx-content-workflow', type: 'workflow', tools: ['claude-code'], desc: 'Author MDX content with frontmatter validation, broken-link detection, and auto-generated table of contents.', stars: 534, downloads: 18700, version: '0.3.2', verified: false, updated: '6d ago' },
  { ns: 'nodejs', name: 'node-test-runner-cmd', type: 'command', tools: ['claude-code', 'copilot'], desc: 'Run Node\'s built-in test runner with watch mode, coverage thresholds, and focus-on-changed-files logic.', stars: 712, downloads: 29400, version: '1.0.8', verified: false, updated: '4d ago' },
  { ns: 'fastify', name: 'fastify-plugin-scaffold', type: 'agent', tools: ['cursor', 'continue'], desc: 'Scaffolds type-safe Fastify plugins with encapsulation, lifecycle hooks, and schema-validated routes.', stars: 423, downloads: 12800, version: '0.4.0', verified: false, updated: '1w ago' },
  { ns: 'anthropic', name: 'pdf-extraction-skill', type: 'skill', tools: ['claude-code'], desc: 'Claude skill for extracting structured data from PDFs — tables, forms, and multi-column layouts. Invocable via @pdf.', stars: 2890, downloads: 94200, version: '1.2.0', verified: true, trending: 5, updated: '1d ago' },
  { ns: 'notion', name: 'db-query-skill', type: 'skill', tools: ['claude-code'], desc: 'Skill that gives Claude safe read/write access to Notion databases with schema introspection and batch mutations.', stars: 1240, downloads: 38500, version: '0.6.2', verified: true, updated: '3d ago' },
  { ns: 'figma', name: 'design-token-sync', type: 'skill', tools: ['claude-code'], desc: 'Sync Figma variables with your codebase — extracts tokens, generates CSS/Tailwind config, and flags drift.', stars: 1687, downloads: 42100, version: '2.0.1', verified: true, updated: '6h ago' },
  { ns: 'playwright', name: 'e2e-test-patterns', type: 'workflow', tools: ['claude-code', 'cursor', 'windsurf'], desc: 'Playwright E2E workflow — page objects, fixtures, network mocking, visual regression, and flake detection.', stars: 1567, downloads: 72100, version: '2.2.0', verified: true, updated: '2d ago' },
  { ns: 'zod', name: 'zod-schema-mcp', type: 'mcp', tools: ['claude-code'], desc: 'MCP server for Zod — generate schemas from TypeScript types, inspect runtime errors, and derive OpenAPI.', stars: 689, downloads: 22400, version: '0.2.1', verified: false, updated: '5d ago' },
];

// --- Sample users ---
const USERS = [
  { handle: 'vercel', name: 'Vercel', bio: 'Tools for the open web. Creators of Next.js, Turbo, and the Vercel platform.', location: 'San Francisco, CA', stars: 28470, verified: true },
  { handle: 'anthropic', name: 'Anthropic', bio: 'AI safety company building Claude. Shipping developer tools that respect your codebase.', location: 'San Francisco', stars: 19840, verified: true },
  { handle: 'microsoft', name: 'Microsoft', bio: 'Official Microsoft registry account.', location: 'Redmond, WA', stars: 41200, verified: true },
  { handle: 'sindresorhus', name: 'Sindre Sorhus', bio: 'Full-Time Open-Sourcerer. Obsessive perfectionist. Working on simplicity at scale.', location: 'Oslo, Norway', stars: 14530, verified: false },
  { handle: 'shadcn', name: 'shadcn', bio: 'Designer & developer. Building UI primitives you copy-paste into your apps.', location: 'Remote', stars: 22100, verified: true },
  { handle: 'tanstack', name: 'TanStack', bio: 'High-quality open-source tools for data fetching, tables, forms, and routing.', location: 'USA', stars: 18930, verified: true },
];

const userByHandle = h => USERS.find(u => u.handle === h) || { handle: h, name: h, bio: '', location: '', stars: 0, verified: false };

// Deterministic pseudo-random for sparklines
const seededRand = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

Object.assign(window, { TOOLS, TYPES, toolById, typeById, Icon, typeIcon, PACKAGES, USERS, userByHandle, seededRand });
