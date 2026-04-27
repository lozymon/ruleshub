// Page: Docs — improved layout with 8 enhancements
// 1. Right-rail On-this-page TOC
// 2. Breadcrumb / context header
// 3. Edit on GitHub + last-updated
// 4. Code block headers (filename + lang + copy)
// 5. Sidebar active state with section bolding
// 6. Callout components (Note/Warning/Tip)
// 7. Docs-scoped search
// 8. Prev/Next footer nav

const DOCS_NAV = [
{ section: 'Getting Started', items: [
  { id: 'introduction', label: 'Introduction' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'concepts', label: 'Concepts' }]
},
{ section: 'Publishing', items: [
  { id: 'first-package', label: 'Your First Package' },
  { id: 'manifest-reference', label: 'Manifest Reference' },
  { id: 'tool-targets', label: 'Tool Targets' },
  { id: 'packs', label: 'Packs' },
  { id: 'versioning', label: 'Versioning' },
  { id: 'github-import', label: 'GitHub Import' }]
},
{ section: 'CLI', items: [
  { id: 'cli-overview', label: 'Overview' },
  { id: 'cli-install', label: 'install' },
  { id: 'cli-publish', label: 'publish' },
  { id: 'cli-validate', label: 'validate' },
  { id: 'cli-outdated', label: 'outdated & update' }]
},
{ section: 'API', items: [
  { id: 'api-overview', label: 'Overview' },
  { id: 'api-packages', label: 'Packages' },
  { id: 'api-users', label: 'Users' },
  { id: 'api-recommendations', label: 'Recommendations' },
  { id: 'api-auth', label: 'Authentication' }]
},
{ section: 'Tools', items: [
  { id: 'tool-claude-code', label: 'Claude Code' },
  { id: 'tool-cursor', label: 'Cursor' },
  { id: 'tool-copilot', label: 'Copilot' },
  { id: 'tool-windsurf', label: 'Windsurf' },
  { id: 'tool-cline', label: 'Cline' },
  { id: 'tool-aider', label: 'Aider' },
  { id: 'tool-continue', label: 'Continue' }]
}];


// Flatten for prev/next
const DOCS_FLAT = DOCS_NAV.flatMap((s) => s.items.map((i) => ({ ...i, section: s.section })));

// Find which section an item lives in
const sectionOf = (id) => DOCS_NAV.find((s) => s.items.some((i) => i.id === id))?.section;

// --- Callout ---
const Callout = ({ kind = 'note', title, children }) => {
  const config = {
    note: { color: 'var(--accent)', bg: 'var(--accent-tint)', icon: 'book', label: 'Note' },
    tip: { color: 'var(--success)', bg: 'rgba(16,185,129,0.10)', icon: 'check', label: 'Tip' },
    warning: { color: 'var(--warn)', bg: 'rgba(245,158,11,0.10)', icon: 'alert', label: 'Warning' }
  };
  const c = config[kind];
  return (
    <div style={{
      borderLeft: `3px solid ${c.color}`,
      background: c.bg,
      padding: '12px 16px',
      borderRadius: '0 6px 6px 0',
      margin: '20px 0',
      fontSize: 13.5
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        color: c.color, fontWeight: 600, fontSize: 12,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 6
      }}>
        <Icon name={c.icon} size={13} />
        {title || c.label}
      </div>
      <div style={{ color: 'var(--fg)', lineHeight: 1.6 }}>{children}</div>
    </div>);

};

// --- Code block w/ header ---
const CodeBlock = ({ lang = 'bash', filename, children, copyText }) => {
  const [copied, setCopied] = React.useState(false);
  const text = copyText || (typeof children === 'string' ? children : '');
  const onCopy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="code-block">
      <div className="code-block-header">
        <div className="code-block-header-title">
          {filename ?
          <><Icon name="file" size={11} /><span>{filename}</span></> :

          <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lang}</span>
          }
        </div>
        <button onClick={onCopy} className={`code-block-copy ${copied ? 'copied' : ''}`}>
          <Icon name={copied ? 'check' : 'copy'} size={11} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="code-block-body"><code>{children}</code></pre>
    </div>);

};

// --- Highlighted bash command ---
const BashCmd = ({ cmd, args = [], flag, value }) =>
<>
    <span className="tok-prompt">$ </span>
    <span className="tok-cmd">{cmd}</span>
    {args.map((a, i) => <span key={i}> <span className="tok-arg">{a}</span></span>)}
    {flag && <span> <span className="tok-flag">{flag}</span></span>}
    {value && <span> <span className="tok-value">{value}</span></span>}
  </>;


// --- Page content map (all content lives here, keyed by id) ---
const docPage = (id, navigate) => {
  if (id.startsWith('tool-')) {
    const toolId = id.replace('tool-', '');
    return toolDocPage(toolId, navigate);
  }
  const pages = {
    'introduction': introductionPage,
    'quick-start': quickStartPage,
    'concepts': conceptsPage,
    'first-package': firstPackagePage,
    'manifest-reference': manifestReferencePage,
    'tool-targets': toolTargetsPage,
    'packs': packsPage,
    'versioning': versioningPage,
    'github-import': githubImportPage,
    'cli-overview': cliOverviewPage,
    'cli-install': cliInstallPage,
    'cli-publish': cliPublishPage,
    'cli-validate': cliValidatePage,
    'cli-outdated': cliOutdatedPage,
    'api-overview': apiOverviewPage,
    'api-packages': apiPackagesPage,
    'api-users': apiUsersPage,
    'api-recommendations': apiRecsPage,
    'api-auth': apiAuthPage
  };
  return (pages[id] || introductionPage)();
};

// --- Page bodies (each returns { title, headings, content }) ---
const introductionPage = () => ({
  title: 'Introduction',
  headings: [
  { id: 'what-is', label: 'What is RulesHub?' },
  { id: 'why', label: 'Why a registry?' },
  { id: 'next', label: 'What\'s next' }],

  content:
  <>
      <p>RulesHub is the open registry for AI coding tool configuration — rules, slash commands, workflows, agents, and MCP servers. Publish once, install everywhere.</p>
      <h2 id="what-is">What is RulesHub?</h2>
      <p>RulesHub solves a fragmentation problem: every AI coding tool — Claude Code, Cursor, Copilot, Windsurf, and friends — has its own format for configuration. RulesHub packages let you author once and target any combination of those tools through a single manifest.</p>
      <h2 id="why">Why a registry?</h2>
      <p>Before RulesHub, sharing rules meant copy-pasting from gists, blog posts, or company wikis. Versions drifted, files went stale, and there was no way to know which rules a teammate was actually using. The registry gives you:</p>
      <ul>
        <li><strong>Versioned packages</strong> — pin, upgrade, and roll back like any npm dependency</li>
        <li><strong>Tool-aware installs</strong> — one install command writes the right files for every tool you use</li>
        <li><strong>Discoverability</strong> — find what teams at Vercel, Anthropic, and Stripe are actually shipping</li>
        <li><strong>Composability</strong> — combine rules into Packs without conflicts</li>
      </ul>
      <h2 id="next">What's next</h2>
      <p>Continue to <a href="#" data-doc="quick-start">Quick Start</a> to install your first package, or jump to <a href="#" data-doc="first-package">Your First Package</a> if you want to publish.</p>
    </>

});

const quickStartPage = () => ({
  title: 'Quick Start',
  headings: [
  { id: 'install-cli', label: 'Install the CLI' },
  { id: 'find-package', label: 'Find a package' },
  { id: 'install-package', label: 'Install a package' },
  { id: 'verify', label: 'Verify it worked' }],

  content:
  <>
      <p>Get from zero to your first installed RulesHub package in under two minutes.</p>
      <h2 id="install-cli">1. Install the CLI</h2>
      <p>The CLI ships as a single binary. No global install required — use it via <code>npx</code>, <code>pnpm dlx</code>, or <code>bunx</code>.</p>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub@latest', '--version']} /></CodeBlock>
      <Callout kind="tip">Pin <code>ruleshub@&lt;version&gt;</code> in CI to avoid surprise updates.</Callout>
      <h2 id="find-package">2. Find a package</h2>
      <p>Browse the registry or search from the command line:</p>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'search', 'typescript-strict']} /></CodeBlock>
      <h2 id="install-package">3. Install a package</h2>
      <p>The CLI auto-detects which AI tools live in your repo and writes only the relevant config files:</p>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'install', 'microsoft/typescript-strict']} /></CodeBlock>
      <h2 id="verify">4. Verify it worked</h2>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'list']} /></CodeBlock>
      <p>You should see <code>microsoft/typescript-strict@3.1.0</code> listed under each detected tool.</p>
    </>

});

const conceptsPage = () => ({
  title: 'Concepts',
  headings: [
  { id: 'package', label: 'Package' },
  { id: 'asset-type', label: 'Asset type' },
  { id: 'target', label: 'Target' },
  { id: 'manifest', label: 'Manifest' }],

  content:
  <>
      <p>Four primitives power everything in RulesHub.</p>
      <h2 id="package">Package</h2>
      <p>A <strong>package</strong> is a versioned, namespaced bundle — <code>vercel/nextjs-app-router@2.4.1</code>. Packages are immutable once published; new versions are released, not edited in place.</p>
      <h2 id="asset-type">Asset type</h2>
      <p>Every package declares one of six asset types: <code>rule</code>, <code>command</code>, <code>workflow</code>, <code>agent</code>, <code>mcp</code>, or <code>pack</code>. The type determines how the asset is installed and what files get written.</p>
      <h2 id="target">Target</h2>
      <p>A <strong>target</strong> is a tool-specific output binding — for example, telling RulesHub that a rule should be written to <code>.cursor/rules/</code> for Cursor and <code>CLAUDE.md</code> for Claude Code.</p>
      <h2 id="manifest">Manifest</h2>
      <p>The <code>ruleshub.yaml</code> file at the root of every package. It declares the name, version, type, targets, and content layout.</p>
    </>

});

const firstPackagePage = () => ({
  title: 'Your First Package',
  headings: [
  { id: 'init', label: 'Initialize' },
  { id: 'edit', label: 'Edit the manifest' },
  { id: 'preview', label: 'Preview' },
  { id: 'publish', label: 'Publish' }],

  content:
  <>
      <p>End-to-end walkthrough — from empty folder to a published package.</p>
      <h2 id="init">Initialize</h2>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'init']} /></CodeBlock>
      <p>This creates a <code>ruleshub.yaml</code> manifest and a <code>rules/</code> directory.</p>
      <h2 id="edit">Edit the manifest</h2>
      <CodeBlock filename="ruleshub.yaml">{`name: yourname/react-testing-rules
version: 0.1.0
type: rule
description: Strict React Testing Library conventions.
targets:
  claude-code: { file: "CLAUDE.md" }
  cursor: { dir: ".cursor/rules/" }
content:
  - rules/core.md
  - rules/queries.md`}</CodeBlock>
      <h2 id="preview">Preview</h2>
      <p>Run a dry publish to see what will happen:</p>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'publish', '--dry-run']} /></CodeBlock>
      <Callout kind="warning" title="Names are forever">Once published, a name + version is immutable. You can deprecate but not delete published versions.</Callout>
      <h2 id="publish">Publish</h2>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'publish']} /></CodeBlock>
    </>

});

const manifestReferencePage = () => ({
  title: 'Manifest Reference',
  headings: [
  { id: 'top-level', label: 'Top-level fields' },
  { id: 'targets', label: 'targets' },
  { id: 'content', label: 'content' },
  { id: 'metadata', label: 'metadata' }],

  content:
  <>
      <p>Complete schema for <code>ruleshub.yaml</code>.</p>
      <h2 id="top-level">Top-level fields</h2>
      <div className="data-table" style={{ margin: '16px 0' }}>
        <table>
          <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td className="mono-cell">name</td><td>string</td><td>yes</td><td>Namespaced name, e.g. <code>vercel/nextjs</code></td></tr>
            <tr><td className="mono-cell">version</td><td>semver</td><td>yes</td><td>Semantic version</td></tr>
            <tr><td className="mono-cell">type</td><td>enum</td><td>yes</td><td>One of the six asset types</td></tr>
            <tr><td className="mono-cell">description</td><td>string</td><td>yes</td><td>20–160 chars</td></tr>
            <tr><td className="mono-cell">targets</td><td>map</td><td>yes</td><td>Per-tool output bindings</td></tr>
            <tr><td className="mono-cell">content</td><td>list</td><td>yes</td><td>Files to include</td></tr>
            <tr><td className="mono-cell">metadata</td><td>map</td><td>no</td><td>License, repo, keywords</td></tr>
          </tbody>
        </table>
      </div>
      <h2 id="targets">targets</h2>
      <p>The <code>targets</code> map binds your asset to one or more tools. See <a href="#" data-doc="tool-targets">Tool Targets</a> for the full path conventions.</p>
      <h2 id="content">content</h2>
      <p>An ordered list of files relative to the manifest. Globs are supported.</p>
      <h2 id="metadata">metadata</h2>
      <CodeBlock filename="ruleshub.yaml">{`metadata:
  license: MIT
  repository: https://github.com/owner/repo
  keywords: [react, testing, conventions]`}</CodeBlock>
    </>

});

const toolTargetsPage = () => ({
  title: 'Tool Targets',
  headings: [
  { id: 'paths', label: 'Default paths' },
  { id: 'overrides', label: 'Per-target overrides' }],

  content:
  <>
      <p>Every tool has a default install path. You can override per-package.</p>
      <h2 id="paths">Default paths</h2>
      <div className="data-table" style={{ margin: '16px 0' }}>
        <table>
          <thead><tr><th>Tool</th><th>Default path</th></tr></thead>
          <tbody>
            {TOOLS.map((t) =>
          <tr key={t.id}>
                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="tool-dot" style={{ background: t.color }} />{t.name}</span></td>
                <td className="mono-cell">{
              { 'claude-code': 'CLAUDE.md',
                'cursor': '.cursor/rules/',
                'copilot': '.github/copilot-instructions.md',
                'windsurf': '.windsurf/rules/',
                'cline': '.clinerules',
                'aider': '.aiderrules',
                'continue': '.continue/config.json' }[t.id]
              }</td>
              </tr>
          )}
          </tbody>
        </table>
      </div>
      <h2 id="overrides">Per-target overrides</h2>
      <CodeBlock filename="ruleshub.yaml">{`targets:
  cursor:
    dir: ".cursor/rules/strict/"
    glob: "*.mdc"`}</CodeBlock>
    </>

});

const packsPage = () => ({
  title: 'Packs',
  headings: [{ id: 'what', label: 'What is a Pack?' }, { id: 'authoring', label: 'Authoring' }],
  content:
  <>
      <h2 id="what">What is a Pack?</h2>
      <p>A pack is a curated bundle of other packages — install one thing, get a whole stack. Think <code>vercel/full-stack-starter</code>: Next.js rules, Tailwind conventions, Prisma workflow, and auth patterns in a single install.</p>
      <h2 id="authoring">Authoring</h2>
      <CodeBlock filename="ruleshub.yaml">{`type: pack
includes:
  - vercel/nextjs-app-router@^2.4.0
  - tailwindcss/design-token-rules@^2.1.0
  - prisma/schema-migration-mcp@latest`}</CodeBlock>
      <Callout kind="note">Packs respect semver ranges. Conflicts surface at install time, not publish time.</Callout>
    </>

});

const versioningPage = () => ({
  title: 'Versioning',
  headings: [{ id: 'semver', label: 'Semver' }, { id: 'deprecation', label: 'Deprecation' }],
  content:
  <>
      <h2 id="semver">Semver</h2>
      <p>RulesHub follows strict semver. Breaking changes bump major, additive changes bump minor, fixes bump patch.</p>
      <h2 id="deprecation">Deprecation</h2>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'deprecate', 'yourname/pkg@1.x']} flag="--reason" value='"superseded by 2.x"' /></CodeBlock>
    </>

});

const githubImportPage = () => ({
  title: 'GitHub Import',
  headings: [{ id: 'how', label: 'How it works' }],
  content:
  <>
      <h2 id="how">How it works</h2>
      <p>Point the publish UI at a public GitHub repo. RulesHub reads the manifest from the default branch, resolves <code>content</code> globs against the working tree, and creates a versioned snapshot.</p>
      <Callout kind="tip">Tag your release in git first — RulesHub will offer to use the tag as the package version.</Callout>
    </>

});

const cliOverviewPage = () => ({
  title: 'CLI Overview',
  headings: [{ id: 'commands', label: 'Commands' }],
  content:
  <>
      <h2 id="commands">Commands</h2>
      <div className="data-table" style={{ margin: '16px 0' }}>
        <table>
          <thead><tr><th>Command</th><th>Description</th></tr></thead>
          <tbody>
            {[
          ['install', 'Install one or more packages'],
          ['publish', 'Publish a new version'],
          ['validate', 'Lint a manifest'],
          ['list', 'Show installed packages'],
          ['outdated', 'Show available updates'],
          ['update', 'Upgrade installed packages'],
          ['search', 'Search the registry']].
          map(([c, d]) => <tr key={c}><td className="mono-cell">{c}</td><td>{d}</td></tr>)}
          </tbody>
        </table>
      </div>
    </>

});

const cliInstallPage = () => ({
  title: 'install',
  headings: [{ id: 'usage', label: 'Usage' }, { id: 'flags', label: 'Flags' }],
  content:
  <>
      <h2 id="usage">Usage</h2>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'install']} value="<package>[@version]" /></CodeBlock>
      <h2 id="flags">Flags</h2>
      <ul>
        <li><code>--tool &lt;id&gt;</code> — restrict install to one tool</li>
        <li><code>--save</code> — write to <code>.ruleshub/config.yaml</code> (default true)</li>
        <li><code>--dry-run</code> — show what would change</li>
      </ul>
    </>

});

const cliPublishPage = () => ({
  title: 'publish',
  headings: [{ id: 'usage', label: 'Usage' }],
  content:
  <>
      <h2 id="usage">Usage</h2>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'publish']} flag="--dry-run" /></CodeBlock>
      <Callout kind="warning">You must be authenticated. Run <code>ruleshub auth login</code> first.</Callout>
    </>

});

const cliValidatePage = () => ({
  title: 'validate',
  headings: [{ id: 'usage', label: 'Usage' }],
  content:
  <>
      <h2 id="usage">Usage</h2>
      <p>Statically validates a manifest without contacting the registry.</p>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'validate']} /></CodeBlock>
    </>

});

const cliOutdatedPage = () => ({
  title: 'outdated & update',
  headings: [{ id: 'outdated', label: 'outdated' }, { id: 'update', label: 'update' }],
  content:
  <>
      <h2 id="outdated">outdated</h2>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'outdated']} /></CodeBlock>
      <h2 id="update">update</h2>
      <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'update']} flag="--latest" /></CodeBlock>
    </>

});

const apiOverviewPage = () => ({
  title: 'API Overview',
  headings: [{ id: 'base', label: 'Base URL' }, { id: 'auth', label: 'Authentication' }],
  content:
  <>
      <h2 id="base">Base URL</h2>
      <CodeBlock lang="http">https://api.ruleshub.dev/v1</CodeBlock>
      <h2 id="auth">Authentication</h2>
      <p>Bearer tokens. See <a href="#" data-doc="api-auth">Authentication</a>.</p>
    </>

});

const apiPackagesPage = () => ({
  title: 'API · Packages',
  headings: [{ id: 'list', label: 'List packages' }, { id: 'get', label: 'Get package' }],
  content:
  <>
      <h2 id="list">List packages</h2>
      <CodeBlock lang="http">{`GET /v1/packages?tool=cursor&type=rule&limit=20`}</CodeBlock>
      <h2 id="get">Get package</h2>
      <CodeBlock lang="http">{`GET /v1/packages/{ns}/{name}`}</CodeBlock>
    </>

});

const apiUsersPage = () => ({
  title: 'API · Users',
  headings: [{ id: 'get', label: 'Get user' }],
  content:
  <>
      <h2 id="get">Get user</h2>
      <CodeBlock lang="http">{`GET /v1/users/{handle}`}</CodeBlock>
    </>

});

const apiRecsPage = () => ({
  title: 'API · Recommendations',
  headings: [{ id: 'get', label: 'Get recommendations' }],
  content:
  <>
      <h2 id="get">Get recommendations</h2>
      <p>Suggests packages based on a manifest of repo signals (frameworks detected, languages, etc).</p>
      <CodeBlock lang="http">{`POST /v1/recommendations
Content-Type: application/json

{
  "frameworks": ["nextjs", "tailwindcss"],
  "language": "typescript"
}`}</CodeBlock>
    </>

});

const apiAuthPage = () => ({
  title: 'API · Authentication',
  headings: [{ id: 'tokens', label: 'Personal access tokens' }],
  content:
  <>
      <h2 id="tokens">Personal access tokens</h2>
      <p>Generate from your dashboard. Scope tokens to <code>read</code>, <code>publish</code>, or <code>admin</code>.</p>
      <CodeBlock lang="http">{`Authorization: Bearer rh_pat_••••••••••••`}</CodeBlock>
    </>

});

// Tool docs (the kind of page in the screenshots)
const toolDocPage = (toolId, navigate) => {
  const t = toolById(toolId);
  if (!t) return introductionPage();
  const paths = {
    'claude-code': 'CLAUDE.md',
    'cursor': '.cursor/rules/',
    'copilot': '.github/copilot-instructions.md',
    'windsurf': '.windsurf/rules/',
    'cline': '.clinerules',
    'aider': '.aiderrules',
    'continue': '.continue/config.json'
  };
  const path = paths[toolId];
  return {
    title: t.name,
    toolColor: t.color,
    headings: [
    { id: 'install-paths', label: 'Install paths by asset type' },
    { id: 'installing', label: 'Installing a package' },
    { id: 'target-key', label: 'Target key' },
    { id: 'writing-rules', label: `Writing rules for ${t.name}` },
    { id: 'limitations', label: 'Limitations' }],

    content:
    <>
        <p>{t.name} reads project configuration from <code>{path}</code>. RulesHub writes rule assets into this {path.endsWith('/') ? 'directory' : 'file'}.</p>
        <h2 id="install-paths">Install paths by asset type</h2>
        <div className="data-table" style={{ margin: '16px 0' }}>
          <table>
            <thead><tr><th>Asset type</th><th>Written to</th></tr></thead>
            <tbody>
              <tr><td><code>rule</code></td><td className="mono-cell">{path}</td></tr>
              <tr><td><code>command</code></td><td className="mono-cell">{toolId === 'claude-code' ? '.claude/commands/' : '— not supported'}</td></tr>
              <tr><td><code>workflow</code></td><td className="mono-cell">{toolId === 'claude-code' || toolId === 'cursor' ? `${path.replace(/\/$/, '')}/workflows/` : '— not supported'}</td></tr>
              <tr><td><code>mcp</code></td><td className="mono-cell">{toolId === 'claude-code' || toolId === 'cursor' ? '.mcp/servers.json' : '— not supported'}</td></tr>
            </tbody>
          </table>
        </div>
        <h2 id="installing">Installing a package</h2>
        <CodeBlock lang="bash"><BashCmd cmd="npx" args={['ruleshub', 'install', `lozymon/nestjs-rules`]} flag="--tool" value={toolId} /></CodeBlock>
        <h2 id="target-key">Target key</h2>
        <p>Use <code>{toolId}</code> in your manifest's <code>targets</code> map:</p>
        <CodeBlock filename="ruleshub.yaml">{`targets:
  ${toolId}: { ${path.endsWith('/') ? 'dir' : 'file'}: "${path}" }`}</CodeBlock>
        <h2 id="writing-rules">Writing rules for {t.name}</h2>
        <p>{t.name}'s {path.endsWith('.json') ? 'config.json supports a systemMessage field that injects custom context into every chat session' : 'context format is plain markdown — write headings, lists, and code samples'}:</p>
        <CodeBlock filename={path.endsWith('/') ? `${path}main.md` : path}>{path.endsWith('.json') ?
        `{
  "systemMessage": "This is a NestJS REST API using Prisma and PostgreSQL. Always use TypeScript strict mode."
}` :
        `# Project conventions
- Use TypeScript strict mode
- Prefer composition over inheritance
- Validate inputs with Zod at the controller boundary`}</CodeBlock>
        <Callout kind="note">{t.name} reloads rules on file save — no restart required.</Callout>
        <h2 id="limitations">Limitations</h2>
        <ul>
          <li>Maximum file size: {toolId === 'claude-code' ? '100KB' : '64KB'}</li>
          <li>{toolId === 'claude-code' || toolId === 'cursor' ? 'Supports nested rule directories' : 'Single-file only'}</li>
        </ul>
      </>

  };
};

// --- Main DocsPage ---
const DocsPage = ({ navigate, route }) => {
  const initial = route.doc || 'tool-continue';
  const [activeId, setActiveId] = React.useState(initial);
  const [search, setSearch] = React.useState('');
  const [activeHeading, setActiveHeading] = React.useState('');
  const articleRef = React.useRef(null);

  React.useEffect(() => {setActiveId(route.doc || 'tool-continue');}, [route.doc]);

  const page = docPage(activeId, navigate);
  const flatIdx = DOCS_FLAT.findIndex((i) => i.id === activeId);
  const prev = flatIdx > 0 ? DOCS_FLAT[flatIdx - 1] : null;
  const next = flatIdx < DOCS_FLAT.length - 1 ? DOCS_FLAT[flatIdx + 1] : null;
  const currentSection = sectionOf(activeId);

  const filteredNav = React.useMemo(() => {
    if (!search) return DOCS_NAV;
    const q = search.toLowerCase();
    return DOCS_NAV.
    map((s) => ({ ...s, items: s.items.filter((i) => i.label.toLowerCase().includes(q) || s.section.toLowerCase().includes(q)) })).
    filter((s) => s.items.length > 0);
  }, [search]);

  // Spy on H2 visibility to update right-rail TOC
  React.useEffect(() => {
    if (!articleRef.current) return;
    const headings = articleRef.current.querySelectorAll('h2[id]');
    if (!headings.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length) setActiveHeading(visible[0].target.id);
    }, { rootMargin: '-80px 0px -60% 0px' });
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [activeId]);

  // Click-to-navigate inside doc content
  const onContentClick = (e) => {
    const a = e.target.closest('a[data-doc]');
    if (a) {e.preventDefault();setActiveId(a.dataset.doc);window.scrollTo({ top: 0 });}
  };

  // Last updated (deterministic per page)
  const lastUpdated = React.useMemo(() => {
    const days = activeId.length * 7 % 30 + 1;
    return `${days}d ago`;
  }, [activeId]);

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', borderTop: '1px solid var(--border)', padding: 0, gap: 0 }}>
      {/* LEFT SIDEBAR */}
      <aside style={{
        borderRight: '1px solid var(--border)',
        padding: '20px 16px 60px',
        position: 'sticky', top: 56,
        alignSelf: 'start',
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        background: 'var(--bg)'
      }}>
        {/* Docs-scoped search */}
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <Icon name="search" size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-dim)' }} />
          <input
            placeholder="Search docs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', height: 32, padding: '0 12px 0 32px',
              background: 'var(--bg-elev)', border: '1px solid var(--border)',
              borderRadius: 6, fontSize: 12.5, color: 'var(--fg)'
            }} />
          
          <kbd style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-dim)',
            padding: '1px 5px', border: '1px solid var(--border)', borderRadius: 3
          }}>⌘K</kbd>
        </div>

        {filteredNav.map((s) => {
          const isCurrent = s.section === currentSection;
          return (
            <div key={s.section} style={{ marginBottom: 22 }}>
              <div style={{
                fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: isCurrent ? 'var(--fg)' : 'var(--fg-dim)',
                fontWeight: isCurrent ? 700 : 600,
                margin: '0 0 6px', padding: '0 8px'
              }}>{s.section}</div>
              {s.items.map((i) => {
                const active = i.id === activeId;
                return (
                  <button key={i.id}
                  onClick={() => {setActiveId(i.id);window.scrollTo({ top: 0 });}}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    padding: '5px 8px', borderRadius: 4,
                    fontSize: 12.5, textAlign: 'left',
                    color: active ? 'var(--accent)' : 'var(--fg-muted)',
                    background: active ? 'var(--accent-tint)' : 'transparent',
                    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                    paddingLeft: active ? 10 : 8,
                    fontWeight: active ? 500 : 400,
                    transition: 'all .12s'
                  }}
                  onMouseEnter={(e) => !active && (e.currentTarget.style.color = 'var(--fg)')}
                  onMouseLeave={(e) => !active && (e.currentTarget.style.color = 'var(--fg-muted)')}>
                    {i.label}</button>);

              })}
            </div>);

        })}
      </aside>

      {/* MIDDLE + RIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: 0 }}>
        <article ref={articleRef} onClick={onContentClick} style={{ padding: '32px 48px 80px', minWidth: 0 }}>
          {/* Breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14, gap: 16, flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-dim)' }}>
              <a href="#" onClick={(e) => {e.preventDefault();navigate({ page: 'home' });}} style={{ color: 'var(--fg-muted)' }}>Docs</a>
              <Icon name="chevronRight" size={10} />
              <span style={{ color: 'var(--fg-muted)' }}>{currentSection}</span>
              <Icon name="chevronRight" size={10} />
              <span style={{ color: 'var(--fg)' }}>{page.title}</span>
            </div>
            <a href="#" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--fg-muted)'
            }}>
              <Icon name="github" size={12} />
              Edit on GitHub
              <span style={{ color: 'var(--fg-faint)', marginLeft: 8 }}>· Updated {lastUpdated}</span>
            </a>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 32, margin: '0 0 12px', letterSpacing: '-0.025em', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            {page.toolColor && <span style={{ width: 10, height: 10, borderRadius: '50%', background: page.toolColor, flexShrink: 0 }} />}
            {page.title}
          </h1>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 24px' }} />

          {/* Content */}
          <div className="readme">{page.content}</div>

          {/* Prev/Next nav */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0 24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {prev ?
            <button onClick={() => {setActiveId(prev.id);window.scrollTo({ top: 0 });}} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg-elev)', textAlign: 'left',
              transition: 'border-color .15s'
            }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}>
                <span style={{ fontSize: 11, color: 'var(--fg-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="chevronRight" size={11} style={{ transform: 'rotate(180deg)' }} /> Previous
                </span>
                <span style={{ fontSize: 14, color: 'var(--fg)', fontWeight: 500, marginTop: 4 }}>{prev.label}</span>
              </button> :
            <div />}
            {next ?
            <button onClick={() => {setActiveId(next.id);window.scrollTo({ top: 0 });}} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
              padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg-elev)', textAlign: 'right',
              transition: 'border-color .15s'
            }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}>
                <span style={{ fontSize: 11, color: 'var(--fg-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Next <Icon name="chevronRight" size={11} />
                </span>
                <span style={{ fontSize: 14, color: 'var(--fg)', fontWeight: 500, marginTop: 4 }}>{next.label}</span>
              </button> :
            <div />}
          </div>
        </article>

        {/* RIGHT RAIL: On this page */}
        <aside style={{
          padding: '32px 24px 60px 0',
          position: 'sticky', top: 56,
          alignSelf: 'start',
          height: 'calc(100vh - 56px)',
          overflowY: 'auto'
        }}>
          <div style={{
            fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--fg-dim)', fontWeight: 600, margin: '0 0 10px'
          }}>On this page</div>
          {page.headings.map((h) => {
            const active = h.id === activeHeading;
            return (
              <a key={h.id} href={`#${h.id}`} style={{
                display: 'block', padding: '4px 0',
                fontSize: 12.5,
                color: active ? 'var(--accent)' : 'var(--fg-muted)',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid var(--border)',
                paddingLeft: 12, marginLeft: -2,
                fontWeight: active ? 500 : 400,
                transition: 'color .12s'
              }}>{h.label}</a>);

          })}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-muted)', padding: '4px 0' }}>
              <Icon name="comment" size={11} /> Was this helpful?
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-muted)', padding: '4px 0' }}>
              <Icon name="alert" size={11} /> Report an issue
            </a>
          </div>
        </aside>
      </div>
    </div>);

};

Object.assign(window, { DocsPage });