// Page: Home
const HomePage = ({ navigate, search }) => {
  const [toolFilter, setToolFilter] = React.useState('all');

  const filtered = React.useMemo(() => {
    let list = PACKAGES;
    if (toolFilter !== 'all') list = list.filter(p => p.tools.includes(toolFilter));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => (p.name + p.ns + p.desc).toLowerCase().includes(q));
    }
    return list;
  }, [toolFilter, search]);

  const trending = [...filtered].sort((a, b) => (a.trending || 99) - (b.trending || 99)).slice(0, 6);
  const recent = filtered.slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-inner">
          <div className="hero-kicker">
            <span className="dot" />
            v0.9.3 now supports MCP servers
          </div>
          <h1>The registry for <span className="accent">AI coding tool</span> assets.</h1>
          <p className="hero-sub">
            Publish and install rules, commands, workflows, agents, and MCP servers for Claude Code, Cursor, Copilot, and more — one manifest, every tool.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => navigate({ page: 'browse' })}>
              Browse assets <Icon name="arrowRight" size={14} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate({ page: 'publish' })}>
              Publish yours →
            </button>
            <span className="hero-install">
              <span className="prompt">$</span>
              <span className="cmd">npx ruleshub install <span style={{ color: 'var(--accent)' }}>vercel/nextjs-app-router</span></span>
            </span>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <div className="stats-bar-inner">
            <div className="stat">
              <div className="stat-num">{PACKAGES.length}</div>
              <div className="stat-label">Assets published</div>
            </div>
            <div className="stat">
              <div className="stat-num stat-num-empty">—</div>
              <div className="stat-label">Monthly installs</div>
            </div>
            <div className="stat">
              <div className="stat-num stat-num-empty">—</div>
              <div className="stat-label">Publishers</div>
            </div>
            <div className="stat">
              <div className="stat-num">{TOOLS.length}</div>
              <div className="stat-label">Tools supported</div>
              <div className="stat-delta">+ more coming</div>
            </div>
          </div>
        </div>
      </section>

      <div className="tool-tabs-bar">
        <div className="container">
          <ToolTabs active={toolFilter} onChange={setToolFilter} />
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Icon name="flame" size={18} style={{ color: 'var(--warn)' }} />
                Trending this week
              </h2>
              <div className="section-sub">Based on installs, stars, and recency</div>
            </div>
            <a href="#" className="section-link" onClick={e => { e.preventDefault(); navigate({ page: 'browse', sort: 'trending' }); }}>
              See all trending <Icon name="arrowRight" size={12} />
            </a>
          </div>
          <div className="cards-grid">
            {trending.map(p => (
              <PackageCard key={p.ns + p.name} pkg={p}
                onClick={() => navigate({ page: 'package', ns: p.ns, name: p.name })} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Icon name="clock" size={18} style={{ color: 'var(--fg-muted)' }} />
                Recently published
              </h2>
              <div className="section-sub">Fresh assets from the community</div>
            </div>
            <a href="#" className="section-link" onClick={e => { e.preventDefault(); navigate({ page: 'browse', sort: 'newest' }); }}>
              See all recent <Icon name="arrowRight" size={12} />
            </a>
          </div>
          <div className="cards-grid">
            {recent.map(p => (
              <PackageCard key={p.ns + p.name} pkg={p}
                onClick={() => navigate({ page: 'package', ns: p.ns, name: p.name })} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ borderBottom: 'none' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Supported tools</h2>
              <div className="section-sub">One manifest, every surface</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {TOOLS.map(t => {
              const count = PACKAGES.filter(p => p.tools.includes(t.id)).length;
              return (
                <a key={t.id} href="#"
                   onClick={e => { e.preventDefault(); navigate({ page: 'tool', tool: t.id }); }}
                   style={{
                     background: 'var(--bg-elev)', border: '1px solid var(--border)',
                     borderRadius: 10, padding: 16, transition: 'all .15s',
                     display: 'flex', alignItems: 'center', gap: 12,
                   }}
                   onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                   onMouseLeave={e => e.currentTarget.style.borderColor = ''}
                >
                  <span style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: t.color + '22',
                    display: 'grid', placeItems: 'center',
                    color: t.color, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
                  }}>{t.short[0]}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}>{count} assets</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

// Page: Browse
const BrowsePage = ({ navigate, search, initialTool }) => {
  const [toolFilter, setToolFilter] = React.useState(initialTool || 'all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [sort, setSort] = React.useState('trending');
  const [page, setPage] = React.useState(1);

  React.useEffect(() => { setPage(1); }, [toolFilter, typeFilter, sort, search]);

  const typeCounts = React.useMemo(() => {
    const c = { all: PACKAGES.length };
    TYPES.forEach(t => { c[t.id] = PACKAGES.filter(p => p.type === t.id).length; });
    return c;
  }, []);

  const filtered = React.useMemo(() => {
    let list = PACKAGES.slice();
    if (toolFilter !== 'all') list = list.filter(p => p.tools.includes(toolFilter));
    if (typeFilter !== 'all') list = list.filter(p => p.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => (p.name + p.ns + p.desc).toLowerCase().includes(q));
    }
    if (sort === 'newest') list.sort((a, b) => a.updated.localeCompare(b.updated));
    else if (sort === 'stars') list.sort((a, b) => b.stars - a.stars);
    else if (sort === 'downloads') list.sort((a, b) => b.downloads - a.downloads);
    else list.sort((a, b) => (a.trending || 99) - (b.trending || 99));
    return list;
  }, [toolFilter, typeFilter, sort, search]);

  const perPage = 9;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container">
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontSize: 26, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Browse packages</h1>
        <p style={{ color: 'var(--fg-dim)', margin: 0 }}>
          <span className="mono">{filtered.length.toLocaleString()}</span> packages matching your filters
        </p>
      </div>

      <div style={{ marginTop: 20 }}>
        <ToolTabs active={toolFilter} onChange={setToolFilter} />
      </div>

      <div className="browse-wrap">
        <aside className="filter-panel">
          <div className="filter-group">
            <div className="filter-label">Asset type</div>
            <button className={`filter-option ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>
              All types
              <span className="count">{typeCounts.all}</span>
            </button>
            {TYPES.map(t => (
              <button key={t.id}
                className={`filter-option ${typeFilter === t.id ? 'active' : ''}`}
                onClick={() => setTypeFilter(t.id)}>
                <Icon name={typeIcon(t.id)} size={14} />
                {t.plural}
                <span className="count">{typeCounts[t.id]}</span>
              </button>
            ))}
          </div>
          <div className="filter-group">
            <div className="filter-label">Sort by</div>
            {[
              { id: 'trending', label: 'Trending', icon: 'flame' },
              { id: 'newest', label: 'Newest', icon: 'clock' },
              { id: 'stars', label: 'Most stars', icon: 'star' },
              { id: 'downloads', label: 'Most downloads', icon: 'download' },
            ].map(o => (
              <button key={o.id}
                className={`filter-option ${sort === o.id ? 'active' : ''}`}
                onClick={() => setSort(o.id)}>
                <Icon name={o.icon} size={14} />
                {o.label}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <div className="filter-label">Community</div>
            <button className="filter-option"><Icon name="shield" size={14} />Verified only</button>
            <button className="filter-option"><Icon name="github" size={14} />Open source</button>
          </div>
        </aside>

        <div>
          {pageItems.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><Icon name="search" size={22} /></div>
              <h3>No packages match</h3>
              <p>Try a different combination of filters or a broader search term.</p>
              <button className="btn btn-outline" onClick={() => { setToolFilter('all'); setTypeFilter('all'); }}>Clear filters</button>
            </div>
          ) : (
            <div className="cards-grid">
              {pageItems.map(p => (
                <PackageCard key={p.ns + p.name} pkg={p}
                  onClick={() => navigate({ page: 'package', ns: p.ns, name: p.name })} />
              ))}
            </div>
          )}
          {pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { HomePage, BrowsePage });
