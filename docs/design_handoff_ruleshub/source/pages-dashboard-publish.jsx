// Pages: Dashboard, Publish

const DashboardPage = ({ navigate, user }) => {
  const myPkgs = PACKAGES.filter(p => p.ns === user.handle).length > 0
    ? PACKAGES.filter(p => p.ns === user.handle)
    : PACKAGES.slice(0, 4).map(p => ({ ...p, ns: user.handle }));

  const totalDownloads = myPkgs.reduce((a, p) => a + p.downloads, 0);
  const totalStars = myPkgs.reduce((a, p) => a + p.stars, 0);

  const chartData = React.useMemo(() => {
    const rand = seededRand(42);
    let v = 80;
    return Array.from({ length: 30 }, () => { v += (rand() - 0.35) * 20; return Math.max(20, v); });
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 0 8px', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ color: 'var(--fg-dim)', margin: 0 }}>
            Welcome back, <span className="mono">@{user.handle}</span>. Here's how your packages are doing.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate({ page: 'publish' })}>
          <Icon name="upload" size={14} /> Publish new package
        </button>
      </div>

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat-label">Total downloads</div>
          <div className="dash-stat-val">{(totalDownloads / 1000).toFixed(1)}k</div>
          <div className="dash-stat-delta">↑ 12.4% this month</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">Total stars</div>
          <div className="dash-stat-val">{totalStars.toLocaleString()}</div>
          <div className="dash-stat-delta">↑ 8.1% this month</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">Packages published</div>
          <div className="dash-stat-val">{myPkgs.length}</div>
          <div className="dash-stat-delta">2 drafts</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">Weekly installs</div>
          <div className="dash-stat-val">{((totalDownloads * 0.05) | 0).toLocaleString()}</div>
          <div className="dash-stat-delta">↑ 23% vs last week</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 32 }}>
        <div className="dash-stat" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div className="dash-stat-label">Installs · last 30 days</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, marginTop: 4, letterSpacing: '-0.01em' }}>
                {((totalDownloads * 0.12) | 0).toLocaleString()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['7d', '30d', '90d', 'All'].map((p, i) => (
                <button key={p} className="btn btn-ghost btn-sm" style={{
                  background: i === 1 ? 'var(--bg-elev-2)' : '',
                  color: i === 1 ? 'var(--fg)' : '',
                }}>{p}</button>
              ))}
            </div>
          </div>
          <Sparkline data={chartData} height={140} />
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label" style={{ marginBottom: 12 }}>Top packages</div>
          {myPkgs.slice(0, 4).map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12.5 }}>
              <Icon name={typeIcon(p.type)} size={12} style={{ color: 'var(--fg-muted)' }} />
              <span className="mono" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                {(p.downloads / 1000).toFixed(1)}k
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 15, margin: 0 }}>My packages</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm">Filter</button>
          <button className="btn btn-ghost btn-sm">Export CSV</button>
        </div>
      </div>
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Type</th>
              <th>Version</th>
              <th style={{ textAlign: 'right' }}>Downloads</th>
              <th style={{ textAlign: 'right' }}>Stars</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {myPkgs.map(p => (
              <tr key={p.name}>
                <td className="mono-cell">
                  <a href="#" onClick={e => { e.preventDefault(); navigate({ page: 'package', ns: p.ns, name: p.name }); }}>
                    {p.ns}/{p.name}
                  </a>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--fg-muted)' }}>
                    <Icon name={typeIcon(p.type)} size={12} />
                    {typeById(p.type)?.name}
                  </span>
                </td>
                <td className="mono-cell">v{p.version}</td>
                <td className="mono-cell" style={{ textAlign: 'right' }}>{p.downloads.toLocaleString()}</td>
                <td className="mono-cell" style={{ textAlign: 'right' }}>{p.stars.toLocaleString()}</td>
                <td style={{ color: 'var(--fg-dim)', fontSize: 12.5 }}>{p.updated}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm"><Icon name="edit" size={11} /></button>
                    <button className="btn btn-ghost btn-sm"><Icon name="eye" size={11} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}><Icon name="trash" size={11} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: 64 }} />
    </div>
  );
};

// --- Publish flow ---
const PublishPage = ({ navigate }) => {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    ns: 'you',
    name: 'my-awesome-rules',
    version: '0.1.0',
    description: '',
    type: 'rule',
    tools: { 'claude-code': true, 'cursor': true },
    toolPaths: {
      'claude-code': 'CLAUDE.md',
      'cursor': '.cursor/rules/',
      'copilot': '.github/copilot-instructions.md',
      'windsurf': '.windsurf/rules/',
      'cline': '.clinerules',
      'aider': '.aiderrules',
      'continue': '.continue/rules/',
    },
    source: 'zip',
    repoUrl: '',
    uploaded: false,
    dragging: false,
  });

  const update = (patch) => setForm(f => ({ ...f, ...patch }));
  const toggleTool = (id) => setForm(f => ({ ...f, tools: { ...f.tools, [id]: !f.tools[id] } }));

  const validation = [
    { key: 'name', ok: /^[a-z][-a-z0-9]*$/.test(form.name), msg: `name: ${form.name} follows naming convention` },
    { key: 'ns', ok: !!form.ns, msg: `namespace: @${form.ns} verified` },
    { key: 'version', ok: /^\d+\.\d+\.\d+$/.test(form.version), msg: `version: ${form.version} is valid semver` },
    { key: 'desc', ok: form.description.length >= 20, msg: form.description.length >= 20 ? `description: ${form.description.length} chars (min 20)` : `description: need at least 20 chars (has ${form.description.length})` },
    { key: 'tools', ok: Object.values(form.tools).some(Boolean), msg: `tools: ${Object.values(form.tools).filter(Boolean).length} targets selected` },
    { key: 'upload', ok: form.uploaded || form.repoUrl.length > 0, msg: form.uploaded ? `source: ${form.ns}-${form.name}.zip uploaded (12.4 KB)` : (form.repoUrl ? `source: ${form.repoUrl}` : 'source: no files uploaded') },
  ];
  const canContinue = step === 1 ? validation.slice(0, 5).every(v => v.ok)
                    : step === 2 ? (form.uploaded || form.repoUrl.length > 0)
                    : true;

  return (
    <div className="container publish-wrap">
      <h1 style={{ fontSize: 26, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Publish a package</h1>
      <p style={{ color: 'var(--fg-dim)', margin: '0 0 28px' }}>
        Share rules, commands, workflows, agents, or MCP configs with the community.
      </p>

      <div className="publish-steps">
        {[
          { n: 1, label: 'Manifest' },
          { n: 2, label: 'Upload' },
          { n: 3, label: 'Preview' },
        ].map(s => (
          <button key={s.n}
            className={`publish-step ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}
            onClick={() => s.n < step && setStep(s.n)}>
            <span className="publish-step-num">
              {step > s.n ? <Icon name="check" size={12} /> : s.n}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Namespace</label>
              <div className="form-hint">Your username or verified org</div>
              <input className="form-input mono" value={form.ns} onChange={e => update({ ns: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Package name</label>
              <div className="form-hint">Lowercase, hyphen-separated</div>
              <input className="form-input mono" value={form.name} onChange={e => update({ name: e.target.value })} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Version</label>
              <div className="form-hint">Semver (e.g. 1.0.0)</div>
              <input className="form-input mono" value={form.version} onChange={e => update({ version: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Asset type</label>
              <div className="form-hint">What kind of asset is this?</div>
              <select className="form-select" value={form.type} onChange={e => update({ type: e.target.value })}>
                {TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Description</label>
            <div className="form-hint">One or two sentences explaining what it does.</div>
            <textarea className="form-textarea" value={form.description} onChange={e => update({ description: e.target.value })}
              placeholder="Strict conventions for…"/>
          </div>

          <div className="form-field">
            <label className="form-label">Tool targets</label>
            <div className="form-hint">Which tools should this package install for? The path shows where files will be written.</div>
            {TOOLS.map(t => (
              <div key={t.id}
                className={`tool-target-row ${form.tools[t.id] ? 'checked' : ''}`}
                onClick={() => toggleTool(t.id)}>
                <div className="check">
                  {form.tools[t.id] && <Icon name="check" size={12} style={{ color: 'white' }} strokeWidth={3} />}
                </div>
                <div className="name">
                  <span className="tool-dot" style={{ background: t.color }} />
                  {t.name}
                </div>
                <div className="path">{form.toolPaths[t.id]}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => navigate({ page: 'dashboard' })}>Cancel</button>
            <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!canContinue}
              style={{ opacity: canContinue ? 1 : 0.5, pointerEvents: canContinue ? 'auto' : 'none' }}>
              Continue to upload <Icon name="arrowRight" size={13} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              className={`btn ${form.source === 'zip' ? 'btn-outline' : 'btn-ghost'}`}
              style={form.source === 'zip' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
              onClick={() => update({ source: 'zip' })}>
              <Icon name="upload" size={13} /> Upload .zip
            </button>
            <button
              className={`btn ${form.source === 'github' ? 'btn-outline' : 'btn-ghost'}`}
              style={form.source === 'github' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
              onClick={() => update({ source: 'github' })}>
              <Icon name="github" size={13} /> From GitHub repo
            </button>
          </div>

          {form.source === 'zip' ? (
            <div className={`drop-zone ${form.dragging ? 'dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); update({ dragging: true }); }}
              onDragLeave={() => update({ dragging: false })}
              onDrop={e => { e.preventDefault(); update({ dragging: false, uploaded: true }); }}>
              {form.uploaded ? (
                <>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-tint)', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                    <Icon name="check" size={22} />
                  </div>
                  <h3>{form.ns}-{form.name}-{form.version}.zip</h3>
                  <p>12.4 KB · 5 files detected</p>
                  <button className="btn btn-outline" onClick={() => update({ uploaded: false })}>Upload a different file</button>
                </>
              ) : (
                <>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-elev-2)', color: 'var(--fg-muted)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                    <Icon name="upload" size={22} />
                  </div>
                  <h3>Drag and drop your .zip file</h3>
                  <p>or browse — up to 10 MB, .zip only</p>
                  <button className="btn btn-primary" onClick={() => update({ uploaded: true })}>Select file</button>
                </>
              )}
            </div>
          ) : (
            <div className="form-field">
              <label className="form-label">GitHub repository URL</label>
              <div className="form-hint">Point to a public repo. We'll read the manifest from the default branch.</div>
              <input className="form-input mono" placeholder="https://github.com/owner/repo"
                value={form.repoUrl} onChange={e => update({ repoUrl: e.target.value })} />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!canContinue}
              style={{ opacity: canContinue ? 1 : 0.5, pointerEvents: canContinue ? 'auto' : 'none' }}>
              Preview <Icon name="arrowRight" size={13} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ fontSize: 14, margin: '0 0 10px' }}>Manifest validation</h3>
          <div className="side-card" style={{ marginBottom: 20 }}>
            <ul className="validation-list">
              {validation.map(v => (
                <li key={v.key}>
                  <Icon name={v.ok ? 'check' : 'x'} size={12} className={v.ok ? 'ok' : 'err'} />
                  {v.msg}
                </li>
              ))}
            </ul>
          </div>

          <h3 style={{ fontSize: 14, margin: '20px 0 10px' }}>Dry-run: files to write</h3>
          <div className="files-preview">
            <div className="files-preview-head">
              <Icon name="terminal" size={12} />
              <span>ruleshub publish --dry-run {form.ns}/{form.name}@{form.version}</span>
            </div>
            <div className="files-preview-body">
              {Object.entries(form.tools).filter(([, v]) => v).map(([id]) => {
                const t = toolById(id);
                const path = form.toolPaths[id];
                return (
                  <div key={id} className="write">
                    <span className="plus">+</span>
                    <span style={{ color: t?.color, minWidth: 90 }}>[{t?.short}]</span>
                    <span>{path}{path.endsWith('/') ? `${form.name}.md` : ''}</span>
                    <span style={{ color: '#71717a', marginLeft: 'auto' }}>
                      {(1.2 + Math.random() * 3).toFixed(1)} KB
                    </span>
                  </div>
                );
              })}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', color: '#a1a1aa', fontSize: 12 }}>
                ✓ Would publish {form.ns}/{form.name}@{form.version}
                <br />
                ✓ {Object.values(form.tools).filter(Boolean).length} tools targeted · {Object.values(form.tools).filter(Boolean).length} files to write
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline">Save as draft</button>
              <button className="btn btn-primary" onClick={() => {
                alert(`🎉 Published ${form.ns}/${form.name}@${form.version}`);
                navigate({ page: 'dashboard' });
              }}>
                <Icon name="upload" size={13} /> Publish package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { DashboardPage, PublishPage });
