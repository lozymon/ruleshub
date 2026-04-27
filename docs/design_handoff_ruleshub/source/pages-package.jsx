// Page: Package Detail
const StarButton = ({ initialStars, initialStarred = false }) => {
  const [starred, setStarred] = React.useState(initialStarred);
  const [bursting, setBursting] = React.useState(false);
  const [count, setCount] = React.useState(initialStars);
  const onClick = () => {
    setBursting(true);
    setTimeout(() => setBursting(false), 500);
    if (starred) {
      setStarred(false);
      setCount(c => c - 1);
    } else {
      setStarred(true);
      setCount(c => c + 1);
    }
  };
  return (
    <button className={`star-btn ${starred ? 'starred' : ''} ${bursting ? 'bursting' : ''}`} onClick={onClick}>
      <Icon name="star" size={14} className="icon" />
      <span className="star-count-flip">{count.toLocaleString()}</span>
    </button>
  );
};

const InstallBlock = ({ pkg }) => {
  const [activeTab, setActiveTab] = React.useState('npx');
  const [copied, setCopied] = React.useState(false);
  const variants = {
    npx: `npx ruleshub install ${pkg.ns}/${pkg.name}`,
    pnpm: `pnpm dlx ruleshub install ${pkg.ns}/${pkg.name}`,
    bun: `bunx ruleshub install ${pkg.ns}/${pkg.name}`,
    'scoped': `npx ruleshub install ${pkg.ns}/${pkg.name} --tool ${pkg.tools[0]}`,
  };
  const labels = { npx: 'npx', pnpm: 'pnpm', bun: 'bun', scoped: '--tool' };
  const cmd = variants[activeTab];
  const copy = () => {
    navigator.clipboard?.writeText(cmd).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const renderCmd = () => {
    const parts = cmd.split(/(\s+)/);
    return parts.map((p, i) => {
      if (/^--/.test(p)) return <span key={i} style={{ color: 'var(--accent-hover)' }}>{p}</span>;
      if (p.includes('/')) return <span key={i} style={{ color: 'var(--accent-hover)' }}>{p}</span>;
      return <span key={i}>{p}</span>;
    });
  };

  return (
    <div className="install-block">
      <div className="install-block-tabs">
        {Object.keys(variants).map(k => (
          <button key={k}
            className={`install-tab ${activeTab === k ? 'active' : ''}`}
            onClick={() => setActiveTab(k)}>{labels[k]}</button>
        ))}
      </div>
      <div className="install-body">
        <span>
          <span className="prompt">$ </span>
          {renderCmd()}
        </span>
        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} size={12} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

const readmeContent = (pkg) => (
  <div className="readme">
    <h1>{pkg.ns}/{pkg.name}</h1>
    <p>{pkg.desc}</p>
    <p>
      This {typeById(pkg.type)?.name.toLowerCase()} targets{' '}
      {pkg.tools.map((t, i) => (
        <React.Fragment key={t}>
          <code>{toolById(t)?.name}</code>
          {i < pkg.tools.length - 1 ? ', ' : ''}
        </React.Fragment>
      ))} and installs a single, consistent ruleset across all of them.
    </p>

    <h2>Installation</h2>
    <pre><code>{`npx ruleshub install ${pkg.ns}/${pkg.name}`}</code></pre>
    <p>The CLI writes the appropriate files per detected tool. For example, Claude Code receives a <code>CLAUDE.md</code> delta, Cursor receives <code>.cursor/rules/*.mdc</code>, and Copilot gets <code>.github/copilot-instructions.md</code>.</p>

    <h2>What it does</h2>
    <ul>
      <li>Defines project-wide conventions that every AI assistant follows consistently</li>
      <li>Scopes rules per file pattern — only active when relevant files are in context</li>
      <li>Ships a changelog so you can pin versions and upgrade predictably</li>
      <li>Plays well with other ruleshub packages — no conflicts, composes cleanly</li>
    </ul>

    <h2>Configuration</h2>
    <pre><code>{`# .ruleshub/config.yaml
packages:
  - ${pkg.ns}/${pkg.name}@${pkg.version}
  - vercel/nextjs-app-router@latest

overrides:
  ${pkg.ns}/${pkg.name}:
    strict: true`}</code></pre>

    <h2>Contributing</h2>
    <p>This package is open source. See <a href="#">CONTRIBUTING.md</a> for details on how to submit changes, tests, or new patterns.</p>
  </div>
);

const VersionsTab = ({ pkg }) => {
  const versions = [
    { v: pkg.version, date: '2d ago', note: 'Added support for strict mode and narrowed generic inference rules.' },
    { v: '2.3.0', date: '2w ago', note: 'Deprecated legacy patterns from v1. Introduces new cache invalidation rule.' },
    { v: '2.2.1', date: '1mo ago', note: 'Patch: fix false positive on branded types in discriminated unions.' },
    { v: '2.2.0', date: '2mo ago', note: 'New: enforce explicit return types on exported functions.' },
    { v: '2.1.0', date: '3mo ago', note: 'Expanded tool support to Windsurf and Aider.' },
    { v: '2.0.0', date: '5mo ago', note: 'Breaking: manifest v2 format. See migration guide.' },
  ];
  return (
    <div className="data-table versions-table">
      <table>
        <thead>
          <tr><th>Version</th><th>Released</th><th>Notes</th><th></th></tr>
        </thead>
        <tbody>
          {versions.map((r, i) => (
            <tr key={r.v}>
              <td className="mono-cell">
                {r.v}
                {i === 0 && <span style={{ marginLeft: 8, fontSize: 10.5, color: 'var(--accent)', fontFamily: 'var(--font-mono)', padding: '1px 6px', border: '1px solid var(--accent-border)', borderRadius: 3 }}>LATEST</span>}
              </td>
              <td style={{ color: 'var(--fg-dim)' }}>{r.date}</td>
              <td className="chg">{r.note}</td>
              <td><button className="btn btn-ghost btn-sm">Install</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FilesTab = ({ pkg }) => {
  const fileMap = {
    rule: {
      'rules/core.md': `# Core Rules
When editing TypeScript files:
- Never use \`any\` — prefer \`unknown\` and narrow
- Always provide explicit return types on exported functions
- Use discriminated unions for state machines
- Prefer \`satisfies\` over type assertions

When editing React components:
- Server components by default; mark client boundary explicitly
- Colocate data fetching with the component that uses it`,
      'rules/imports.md': `# Import Conventions
Group imports in this order:
1. Node built-ins
2. External packages
3. Aliased internal imports (@/...)
4. Relative imports

Separate groups with a blank line. No default exports.`,
      'ruleshub.yaml': `name: ${pkg.ns}/${pkg.name}
version: ${pkg.version}
type: rule
tools:
${pkg.tools.map(t => `  - ${t}`).join('\n')}
description: ${pkg.desc.slice(0, 60)}...`,
    }
  };
  const files = fileMap.rule;
  const [active, setActive] = React.useState(Object.keys(files)[0]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ borderRight: '1px solid var(--border)', padding: 8 }}>
        <div className="filter-label" style={{ padding: '4px 8px' }}>Files</div>
        {Object.keys(files).map(f => (
          <button key={f}
            onClick={() => setActive(f)}
            className="filter-option"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              background: active === f ? 'var(--bg-elev-2)' : '',
              color: active === f ? 'var(--fg)' : '',
            }}>
            <Icon name="file" size={12} />
            {f}
          </button>
        ))}
      </div>
      <div>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{active}</span>
          <span style={{ color: 'var(--fg-faint)' }}>{files[active].split('\n').length} lines</span>
        </div>
        <pre style={{ margin: 0, padding: 16, fontSize: 12.5, lineHeight: 1.6, background: 'var(--bg-code)', color: '#ededf0', overflow: 'auto', maxHeight: 500 }}>
          <code>{files[active]}</code>
        </pre>
      </div>
    </div>
  );
};

const CommentsTab = () => {
  const comments = [
    { user: 'shadcn', time: '2d ago', text: 'Works beautifully with the new App Router patterns. Saved our migration a week.', replies: [
      { user: 'vercel', time: '1d ago', text: 'Thanks! There\'s a new rule in v2.4 for `parallel routes` that you might want.' }
    ]},
    { user: 'sindresorhus', time: '5d ago', text: 'Request: please add a rule for `Server Actions` error boundaries. Happy to PR if there\'s interest.' },
    { user: 'tanstack', time: '1w ago', text: 'Been using this across 4 client projects. The cache invalidation rule alone is worth installing.' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, padding: 14, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16 }}>
        <Avatar handle="guest" size={32} />
        <textarea className="form-textarea" placeholder="Leave a comment… (sign in to post)" style={{ minHeight: 60, flex: 1 }} />
      </div>
      {comments.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
          <Avatar handle={c.user} size={32} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, marginBottom: 4 }}>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{c.user}</strong>
              <span style={{ color: 'var(--fg-dim)', marginLeft: 8, fontSize: 12 }}>{c.time}</span>
              {userByHandle(c.user).verified && <span style={{ marginLeft: 6, display: 'inline-flex', verticalAlign: 'middle' }}><Verified size={11} /></span>}
            </div>
            <div style={{ color: 'var(--fg)', fontSize: 13.5 }}>{c.text}</div>
            {c.replies && c.replies.map((r, j) => (
              <div key={j} style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-elev)', borderRadius: 8, borderLeft: '2px solid var(--accent)' }}>
                <div style={{ fontSize: 13, marginBottom: 2 }}>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.user}</strong>
                  <span style={{ color: 'var(--fg-dim)', marginLeft: 8, fontSize: 12 }}>{r.time}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const PackageDetailPage = ({ ns, name, navigate }) => {
  const pkg = PACKAGES.find(p => p.ns === ns && p.name === name) || PACKAGES[0];
  const [tab, setTab] = React.useState('readme');
  const sparkData = React.useMemo(() => {
    const rand = seededRand(pkg.name.length * 17);
    let v = 40;
    return Array.from({ length: 30 }, () => { v += (rand() - 0.3) * 10; return Math.max(10, v); });
  }, [pkg.name]);

  return (
    <div className="container pkg-detail">
      <div style={{ fontSize: 12, color: 'var(--fg-dim)', marginBottom: 14, fontFamily: 'var(--font-mono)', display: 'flex', gap: 6, alignItems: 'center' }}>
        <a href="#" onClick={e => { e.preventDefault(); navigate({ page: 'browse' }); }} style={{ color: 'var(--fg-muted)' }}>browse</a>
        <Icon name="chevronRight" size={10} />
        <a href="#" onClick={e => { e.preventDefault(); navigate({ page: 'profile', handle: pkg.ns }); }} style={{ color: 'var(--fg-muted)' }}>{pkg.ns}</a>
        <Icon name="chevronRight" size={10} />
        <span>{pkg.name}</span>
      </div>

      <div className="pkg-detail-header">
        <div className="pkg-detail-icon"><Icon name={typeIcon(pkg.type)} size={26} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="pkg-detail-title">
            <span className="ns">{pkg.ns}/</span><span>{pkg.name}</span>
            {pkg.verified && <Verified size={16} />}
            <span className="pkg-type-pill" style={{ marginLeft: 4 }}>{typeById(pkg.type)?.name.toLowerCase()}</span>
          </h1>
          <p className="pkg-detail-desc">{pkg.desc}</p>
          <div className="pkg-detail-sub">
            <a href="#" className="pkg-author-chip" onClick={e => { e.preventDefault(); navigate({ page: 'profile', handle: pkg.ns }); }}>
              <Avatar handle={pkg.ns} size={20} />
              <span>{pkg.ns}</span>
            </a>
            <span>·</span>
            <span className="mono">v{pkg.version}</span>
            <span>·</span>
            <span><Icon name="clock" size={11} style={{ verticalAlign: '-2px', marginRight: 4 }} />updated {pkg.updated}</span>
            <span>·</span>
            <span><Icon name="download" size={11} style={{ verticalAlign: '-2px', marginRight: 4 }} />{pkg.downloads.toLocaleString()} installs</span>
            <span>·</span>
            <div style={{ display: 'flex', gap: 5 }}>
              {pkg.tools.map(t => <ToolBadge key={t} toolId={t} />)}
            </div>
          </div>
        </div>
        <div className="pkg-actions-row">
          <StarButton initialStars={pkg.stars} />
          <button className="btn btn-outline">
            <Icon name="download" size={14} /> Download
          </button>
          <button className="btn btn-outline">
            <Icon name="chevronDown" size={12} /> v{pkg.version}
          </button>
        </div>
      </div>

      <InstallBlock pkg={pkg} />

      <div className="pkg-layout">
        <div>
          <div className="tabs">
            {[
              { id: 'readme', label: 'README', icon: 'book' },
              { id: 'versions', label: 'Versions', icon: 'history', count: 12 },
              { id: 'files', label: 'Files', icon: 'file', count: 3 },
              { id: 'comments', label: 'Comments', icon: 'comment', count: 8 },
            ].map(t => (
              <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <Icon name={t.icon} size={13} />
                {t.label}
                {t.count && <span className="count">{t.count}</span>}
              </button>
            ))}
          </div>
          {tab === 'readme' && readmeContent(pkg)}
          {tab === 'versions' && <VersionsTab pkg={pkg} />}
          {tab === 'files' && <FilesTab pkg={pkg} />}
          {tab === 'comments' && <CommentsTab />}
        </div>
        <aside>
          <div className="side-card">
            <h4>Install trend · 30d</h4>
            <Sparkline data={sparkData} />
            <div className="row"><span className="label">This week</span><span className="val">+{(pkg.downloads * 0.04 | 0).toLocaleString()}</span></div>
            <div className="row"><span className="label">All time</span><span className="val">{pkg.downloads.toLocaleString()}</span></div>
          </div>
          <div className="side-card">
            <h4>Repository</h4>
            <a href="#" className="side-link"><Icon name="github" size={14} /> github.com/{pkg.ns}/{pkg.name}</a>
            <a href="#" className="side-link"><Icon name="link" size={14} /> Homepage</a>
            <a href="#" className="side-link"><Icon name="alert" size={14} /> Report issue</a>
          </div>
          <div className="side-card">
            <h4>License</h4>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>MIT</div>
          </div>
          <div className="side-card">
            <h4>Included in packs</h4>
            {PACKAGES.filter(p => p.type === 'pack').slice(0, 2).map(p => (
              <a key={p.name} href="#" className="side-link"
                 onClick={e => { e.preventDefault(); navigate({ page: 'package', ns: p.ns, name: p.name }); }}>
                <Icon name="pack" size={14} />
                <span className="mono" style={{ fontSize: 12 }}>{p.ns}/{p.name}</span>
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

Object.assign(window, { PackageDetailPage });
