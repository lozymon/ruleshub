// Shared UI components: Navbar, PackageCard, ToolBadge, Footer, etc.

const ToolBadge = ({ toolId, size = 'sm' }) => {
  const t = toolById(toolId);
  if (!t) return null;
  return (
    <span className="tool-badge">
      <span className="dot" style={{ background: t.color }} />
      {t.short}
    </span>
  );
};

const Verified = ({ size = 14 }) => (
  <span className="verified" style={{ width: size, height: size }} title="Verified publisher">
    <Icon name="check" size={size * 0.6} />
  </span>
);

const Avatar = ({ handle, size = 24 }) => {
  const u = userByHandle(handle);
  // Deterministic hue from handle
  const hue = [...handle].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="pkg-avatar"
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, oklch(0.55 0.15 ${hue}), oklch(0.35 0.12 ${(hue + 40) % 360}))`,
        display: 'grid', placeItems: 'center',
        fontSize: size * 0.42, fontWeight: 600, color: 'white',
        fontFamily: 'var(--font-mono)', flexShrink: 0, letterSpacing: '-0.02em',
      }}
    >
      {handle.slice(0, 1).toUpperCase()}
    </span>
  );
};

const PackageCard = ({ pkg, onClick }) => {
  const type = typeById(pkg.type);
  return (
    <div className="pkg-card" onClick={onClick}>
      <div className="pkg-head">
        <div className="pkg-icon"><Icon name={typeIcon(pkg.type)} size={18} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pkg-name">
            <span className="ns">{pkg.ns}</span>
            <span className="sep">/</span>
            <span>{pkg.name}</span>
            {pkg.verified && <Verified size={12} />}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
            <span className="pkg-type-pill">{type?.name.toLowerCase()}</span>
            <span style={{ fontSize: 11.5, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}>
              {pkg.updated}
            </span>
          </div>
        </div>
      </div>
      <p className="pkg-desc">{pkg.desc}</p>
      <div className="pkg-tools">
        {pkg.tools.slice(0, 4).map(t => <ToolBadge key={t} toolId={t} />)}
        {pkg.tools.length > 4 && <span className="tool-badge">+{pkg.tools.length - 4}</span>}
      </div>
      <div className="pkg-meta">
        <span className="item">
          <Icon name="star" size={12} />
          {pkg.stars.toLocaleString()}
        </span>
        <span className="item">
          <Icon name="download" size={12} />
          {pkg.downloads >= 1000 ? (pkg.downloads / 1000).toFixed(1) + 'k' : pkg.downloads}
        </span>
        <span className="ver">v{pkg.version}</span>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="pkg-card" style={{ cursor: 'default' }}>
    <div className="pkg-head">
      <div className="skel" style={{ width: 32, height: 32 }} />
      <div style={{ flex: 1 }}>
        <div className="skel" style={{ width: '60%', height: 14, marginBottom: 8 }} />
        <div className="skel" style={{ width: '30%', height: 10 }} />
      </div>
    </div>
    <div className="skel" style={{ width: '100%', height: 10, marginTop: 4 }} />
    <div className="skel" style={{ width: '80%', height: 10 }} />
    <div style={{ display: 'flex', gap: 6 }}>
      <div className="skel" style={{ width: 60, height: 18 }} />
      <div className="skel" style={{ width: 50, height: 18 }} />
    </div>
    <div className="pkg-meta">
      <div className="skel" style={{ width: 40, height: 10 }} />
      <div className="skel" style={{ width: 40, height: 10 }} />
      <div className="skel" style={{ width: 40, height: 10, marginLeft: 'auto' }} />
    </div>
  </div>
);

const Navbar = ({ route, navigate, theme, toggleTheme, user, search, setSearch }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isActive = (path) => route.page === path || (path === 'browse' && route.page === 'tool');
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#" onClick={e => { e.preventDefault(); navigate({ page: 'home' }); }} className="logo">
          <span className="logo-mark">R</span>
          <span>ruleshub</span>
        </a>
        <div className="nav-links">
          <a href="#" onClick={e => { e.preventDefault(); navigate({ page: 'browse' }); }}
             className={`nav-link ${isActive('browse') ? 'active' : ''}`}>Browse</a>
          <a href="#" onClick={e => { e.preventDefault(); navigate({ page: 'leaderboard' }); }}
             className={`nav-link ${isActive('leaderboard') ? 'active' : ''}`}>Leaderboard</a>
          <a href="#" onClick={e => { e.preventDefault(); navigate({ page: 'docs' }); }}
             className="nav-link">Docs</a>
        </div>
        <div className="nav-right">
          <div className="nav-search" style={{ display: window.innerWidth > 720 ? 'block' : 'none' }}>
            <Icon name="search" size={14} />
            <input
              placeholder="Search packages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => navigate({ page: 'browse' })}
            />
            <kbd>⌘K</kbd>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          </button>
          <a href="#" className="btn btn-ghost btn-icon" aria-label="GitHub">
            <Icon name="github" size={16} />
          </a>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-outline"
                style={{ padding: '0 6px 0 6px', gap: 6 }}
                onClick={() => setMenuOpen(v => !v)}
              >
                <Avatar handle={user.handle} size={22} />
                <span style={{ fontSize: 12.5 }}>{user.handle}</span>
                <Icon name="chevronDown" size={12} />
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%', width: 180,
                  background: 'var(--bg-elev)', border: '1px solid var(--border-strong)',
                  borderRadius: 8, padding: 6, zIndex: 60,
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.4)',
                }}>
                  {[
                    { label: 'Your profile', page: 'profile', args: { handle: user.handle } },
                    { label: 'Dashboard', page: 'dashboard' },
                    { label: 'Publish', page: 'publish' },
                  ].map(i => (
                    <a key={i.label} href="#"
                       style={{ display: 'block', padding: '7px 10px', fontSize: 13, borderRadius: 4 }}
                       onClick={e => { e.preventDefault(); navigate({ page: i.page, ...i.args }); setMenuOpen(false); }}
                       onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elev-2)'}
                       onMouseLeave={e => e.currentTarget.style.background = ''}
                    >{i.label}</a>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  <a href="#" style={{ display: 'block', padding: '7px 10px', fontSize: 13, borderRadius: 4, color: 'var(--fg-muted)' }}
                     onClick={e => { e.preventDefault(); setMenuOpen(false); }}>Sign out</a>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate({ page: 'dashboard' })}>
              <Icon name="github" size={14} /> Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer>
    <div className="container">
      <div className="footer-grid">
        <div>
          <div className="logo" style={{ marginBottom: 10 }}>
            <span className="logo-mark">R</span>
            <span>ruleshub</span>
          </div>
          <p style={{ color: 'var(--fg-muted)', fontSize: 13, margin: '0 0 14px', maxWidth: 320 }}>
            The open registry for AI coding tool configuration. Publish once, install everywhere.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="#" className="btn btn-outline btn-sm"><Icon name="github" size={12} /> GitHub</a>
          </div>
        </div>
        <div>
          <h5>Product</h5>
          <a href="#">Browse</a>
          <a href="#">Publish</a>
          <a href="#">CLI</a>
          <a href="#">Status</a>
        </div>
        <div>
          <h5>Resources</h5>
          <a href="#">Documentation</a>
          <a href="#">Publishing guide</a>
          <a href="#">Manifest spec</a>
          <a href="#">Changelog</a>
        </div>
        <div>
          <h5>Community</h5>
          <a href="#">Discord</a>
          <a href="#">Twitter</a>
          <a href="#">Report issue</a>
          <a href="#">Code of conduct</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 ruleshub.dev</span>
        <span>v0.9.3 · built with ❤ by the community</span>
      </div>
    </div>
  </footer>
);

const ToolTabs = ({ active, onChange, showCounts = true }) => {
  const counts = React.useMemo(() => {
    const c = { all: PACKAGES.length };
    TOOLS.forEach(t => { c[t.id] = PACKAGES.filter(p => p.tools.includes(t.id)).length; });
    return c;
  }, []);
  return (
    <div className="tool-tabs">
      <button className={`tool-tab ${active === 'all' ? 'active' : ''}`} onClick={() => onChange('all')}>
        All {showCounts && <span className="count">{counts.all}</span>}
      </button>
      {TOOLS.map(t => (
        <button key={t.id}
          className={`tool-tab ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="tool-dot" style={{ background: t.color }} />
          {t.name}
          {showCounts && <span className="count">{counts[t.id]}</span>}
        </button>
      ))}
    </div>
  );
};

const Sparkline = ({ data, height = 72, color = 'var(--accent)', fill = true }) => {
  const w = 260, h = height, pad = 2;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - v / max) * (h - pad * 2);
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const fillPath = path + ` L${points[points.length - 1][0]},${h} L${points[0][0]},${h} Z`;
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={fillPath} fill={color} opacity="0.1" />}
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

Object.assign(window, { ToolBadge, Verified, Avatar, PackageCard, SkeletonCard, Navbar, Footer, ToolTabs, Sparkline });
