// Pages: Profile, Tool, Leaderboard

const ProfilePage = ({ handle, navigate }) => {
  const user = userByHandle(handle);
  const userPackages = PACKAGES.filter(p => p.ns === handle);
  const totalStars = userPackages.reduce((a, p) => a + p.stars, 0);
  const totalDownloads = userPackages.reduce((a, p) => a + p.downloads, 0);
  const [tab, setTab] = React.useState('packages');

  return (
    <div className="container">
      <div className="profile-header">
        <div className="profile-avatar" style={{
          background: `linear-gradient(135deg, oklch(0.55 0.15 ${[...handle].reduce((a,c)=>a+c.charCodeAt(0),0) % 360}), oklch(0.32 0.1 ${([...handle].reduce((a,c)=>a+c.charCodeAt(0),0)+40) % 360}))`,
        }}>
          {handle.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="profile-name">
            {user.name}
            {user.verified && <Verified size={18} />}
          </h1>
          <div className="profile-handle">@{handle}</div>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          <div className="profile-meta">
            {user.location && <span className="item"><Icon name="mapPin" size={13} />{user.location}</span>}
            <span className="item"><Icon name="github" size={13} />github.com/{handle}</span>
            <span className="item"><Icon name="star" size={13} style={{ color: 'var(--star)' }} />{totalStars.toLocaleString()} stars received</span>
            <span className="item"><Icon name="download" size={13} />{totalDownloads.toLocaleString()} total installs</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline"><Icon name="plus" size={13} /> Follow</button>
          <button className="btn btn-ghost btn-icon"><Icon name="settings" size={14} /></button>
        </div>
      </div>

      <div className="tabs" style={{ marginTop: 24 }}>
        <button className={`tab ${tab === 'packages' ? 'active' : ''}`} onClick={() => setTab('packages')}>
          <Icon name="pack" size={13} /> Packages <span className="count">{userPackages.length}</span>
        </button>
        <button className={`tab ${tab === 'starred' ? 'active' : ''}`} onClick={() => setTab('starred')}>
          <Icon name="star" size={13} /> Starred
        </button>
        <button className={`tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
          <Icon name="clock" size={13} /> Activity
        </button>
      </div>

      <div style={{ padding: '24px 0 64px' }}>
        {tab === 'packages' && (
          userPackages.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><Icon name="pack" size={22} /></div>
              <h3>No packages yet</h3>
              <p>This publisher hasn't shipped anything to the registry.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {userPackages.map(p => (
                <PackageCard key={p.name} pkg={p}
                  onClick={() => navigate({ page: 'package', ns: p.ns, name: p.name })} />
              ))}
            </div>
          )
        )}
        {tab === 'starred' && (
          <div className="cards-grid">
            {PACKAGES.filter(p => p.ns !== handle).slice(0, 3).map(p => (
              <PackageCard key={p.name} pkg={p}
                onClick={() => navigate({ page: 'package', ns: p.ns, name: p.name })} />
            ))}
          </div>
        )}
        {tab === 'activity' && (
          <div className="data-table">
            <table>
              <thead>
                <tr><th>Action</th><th>Package</th><th>When</th></tr>
              </thead>
              <tbody>
                {[
                  { a: 'Published', p: userPackages[0], t: '4h ago' },
                  { a: 'Updated', p: userPackages[0], t: '2d ago' },
                  { a: 'Starred', p: PACKAGES[1], t: '3d ago' },
                  { a: 'Commented on', p: PACKAGES[3], t: '5d ago' },
                ].filter(r => r.p).map((r, i) => (
                  <tr key={i}>
                    <td>{r.a}</td>
                    <td className="mono-cell">
                      <a href="#" onClick={e => { e.preventDefault(); navigate({ page: 'package', ns: r.p.ns, name: r.p.name }); }}>
                        {r.p.ns}/{r.p.name}
                      </a>
                    </td>
                    <td style={{ color: 'var(--fg-dim)' }}>{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolPage = ({ tool, navigate }) => {
  const t = toolById(tool) || TOOLS[0];
  const list = PACKAGES.filter(p => p.tools.includes(t.id));
  const [type, setType] = React.useState('all');
  const filtered = type === 'all' ? list : list.filter(p => p.type === type);

  return (
    <>
      <div className="tool-hero" style={{
        background: `linear-gradient(180deg, ${t.color}10, transparent)`,
      }}>
        <div className="container" style={{ display: 'flex', gap: 24, alignItems: 'center', width: '100%' }}>
          <div className="tool-hero-logo" style={{ background: t.color }}>
            {t.short[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h1>{t.name}</h1>
            <p style={{ color: 'var(--fg-muted)', margin: 0, maxWidth: 560 }}>
              {list.length} assets compatible with {t.name}. Rules, commands, workflows, and MCP servers
              ready to install — with guaranteed manifest compatibility.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500 }}>{list.length}</div>
            <div style={{ color: 'var(--fg-dim)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>packages</div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 0 64px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            className={`tool-tab ${type === 'all' ? 'active' : ''}`}
            style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, borderBottomColor: type === 'all' ? 'var(--accent)' : '', background: type === 'all' ? 'var(--accent-tint)' : '' }}
            onClick={() => setType('all')}>All types</button>
          {TYPES.map(ty => {
            const n = list.filter(p => p.type === ty.id).length;
            if (n === 0) return null;
            return (
              <button key={ty.id}
                className={`tool-tab ${type === ty.id ? 'active' : ''}`}
                style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, borderBottomColor: type === ty.id ? 'var(--accent)' : '', background: type === ty.id ? 'var(--accent-tint)' : '' }}
                onClick={() => setType(ty.id)}>
                <Icon name={typeIcon(ty.id)} size={12} />
                {ty.plural} <span className="count">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="cards-grid">
          {filtered.map(p => (
            <PackageCard key={p.name} pkg={p}
              onClick={() => navigate({ page: 'package', ns: p.ns, name: p.name })} />
          ))}
        </div>
      </div>
    </>
  );
};

const LeaderboardPage = ({ navigate }) => {
  const topPublishers = USERS.map(u => ({
    ...u,
    pkgs: PACKAGES.filter(p => p.ns === u.handle),
    totalStars: PACKAGES.filter(p => p.ns === u.handle).reduce((a, p) => a + p.stars, 0),
  })).sort((a, b) => b.totalStars - a.totalStars);

  const trending = [...PACKAGES].sort((a, b) => (a.trending || 99) - (b.trending || 99)).slice(0, 8);
  const mostStarred = [...PACKAGES].sort((a, b) => b.stars - a.stars).slice(0, 8);

  return (
    <div className="container">
      <div style={{ padding: '32px 0 8px' }}>
        <h1 style={{ fontSize: 28, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          <Icon name="trophy" size={22} style={{ verticalAlign: '-4px', marginRight: 8, color: 'var(--star)' }} />
          Leaderboard
        </h1>
        <p style={{ color: 'var(--fg-dim)', margin: 0 }}>Top contributors and trending assets across the registry.</p>
      </div>

      <div className="lb-wrap">
        <div className="lb-col">
          <h3><Icon name="trophy" size={14} style={{ color: 'var(--star)' }} /> Top Publishers</h3>
          {topPublishers.map((u, i) => (
            <div key={u.handle}
              className={`lb-row ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}`}
              onClick={() => navigate({ page: 'profile', handle: u.handle })}>
              <span className="lb-rank">{i + 1}</span>
              <Avatar handle={u.handle} size={28} />
              <div className="lb-info">
                <div className="t">
                  {u.name}
                  {u.verified && <span style={{ marginLeft: 5, verticalAlign: 'middle', display: 'inline-flex' }}><Verified size={11} /></span>}
                </div>
                <div className="s">@{u.handle} · {u.pkgs.length} packages</div>
              </div>
              <span className="lb-stat"><Icon name="star" size={11} style={{ color: 'var(--star)' }} /> {u.totalStars.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="lb-col">
          <h3><Icon name="flame" size={14} style={{ color: 'var(--warn)' }} /> Trending This Week</h3>
          {trending.map((p, i) => (
            <div key={p.name}
              className={`lb-row ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}`}
              onClick={() => navigate({ page: 'package', ns: p.ns, name: p.name })}>
              <span className="lb-rank">{i + 1}</span>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', color: 'var(--fg-muted)', flexShrink: 0 }}>
                <Icon name={typeIcon(p.type)} size={14} />
              </div>
              <div className="lb-info">
                <div className="t mono" style={{ fontSize: 12.5 }}>{p.ns}/{p.name}</div>
                <div className="s">{typeById(p.type)?.name} · {p.downloads.toLocaleString()} installs</div>
              </div>
              <span className="lb-stat" style={{ color: 'var(--success)' }}>↑ {((p.trending || 10) * 4 + 2)}%</span>
            </div>
          ))}
        </div>

        <div className="lb-col">
          <h3><Icon name="star" size={14} style={{ color: 'var(--star)' }} /> Most Starred All Time</h3>
          {mostStarred.map((p, i) => (
            <div key={p.name}
              className={`lb-row ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}`}
              onClick={() => navigate({ page: 'package', ns: p.ns, name: p.name })}>
              <span className="lb-rank">{i + 1}</span>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', color: 'var(--fg-muted)', flexShrink: 0 }}>
                <Icon name={typeIcon(p.type)} size={14} />
              </div>
              <div className="lb-info">
                <div className="t mono" style={{ fontSize: 12.5 }}>{p.ns}/{p.name}</div>
                <div className="s">{typeById(p.type)?.name} · v{p.version}</div>
              </div>
              <span className="lb-stat"><Icon name="star" size={11} style={{ color: 'var(--star)' }} /> {p.stars.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ProfilePage, ToolPage, LeaderboardPage });
