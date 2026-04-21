const { useState, useEffect } = React;

// Client-side router
function useRouter() {
  const [route, setRoute] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ruleshub:route')) || { page: 'home' };
    } catch { return { page: 'home' }; }
  });
  const navigate = (r) => {
    setRoute(r);
    try { localStorage.setItem('ruleshub:route', JSON.stringify(r)); } catch {}
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  return [route, navigate];
}

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ruleshub:theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ruleshub:theme', theme); } catch {}
  }, [theme]);
  return [theme, () => setTheme(t => t === 'dark' ? 'light' : 'dark')];
}

function App() {
  const [route, navigate] = useRouter();
  const [theme, toggleTheme] = useTheme();
  const [search, setSearch] = useState('');
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [variant, setVariant] = useState(() => localStorage.getItem('ruleshub:variant') || 'default');
  const [accent, setAccent] = useState(() => localStorage.getItem('ruleshub:accent') || 'blue');

  const user = { handle: 'shadcn', name: 'shadcn' };

  useEffect(() => {
    const el = document.documentElement;
    // accent sets base variant; sharp is an additive class
    el.setAttribute('data-variant', accent === 'blue' ? '' : accent);
    el.classList.toggle('shape-sharp', variant === 'sharp');
    try { localStorage.setItem('ruleshub:variant', variant); } catch {}
    try { localStorage.setItem('ruleshub:accent', accent); } catch {}
  }, [variant, accent]);

  // Tweaks host bridge
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  let page;
  if (route.page === 'home') page = <HomePage navigate={navigate} search={search} />;
  else if (route.page === 'browse') page = <BrowsePage navigate={navigate} search={search} initialTool={route.tool} />;
  else if (route.page === 'package') page = <PackageDetailPage ns={route.ns} name={route.name} navigate={navigate} />;
  else if (route.page === 'profile') page = <ProfilePage handle={route.handle} navigate={navigate} />;
  else if (route.page === 'tool') page = <ToolPage tool={route.tool} navigate={navigate} />;
  else if (route.page === 'leaderboard') page = <LeaderboardPage navigate={navigate} />;
  else if (route.page === 'dashboard') page = <DashboardPage navigate={navigate} user={user} />;
  else if (route.page === 'publish') page = <PublishPage navigate={navigate} />;
  else if (route.page === 'docs') page = (
    <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="empty-state" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="icon"><Icon name="book" size={22} /></div>
        <h3>Docs coming soon</h3>
        <p>The docs site is built separately at docs.ruleshub.dev</p>
        <button className="btn btn-outline" onClick={() => navigate({ page: 'home' })}>Back to home</button>
      </div>
    </div>
  );

  return (
    <>
      <Navbar route={route} navigate={navigate} theme={theme} toggleTheme={toggleTheme}
        user={user} search={search} setSearch={setSearch} />
      {page}
      <Footer />
      {tweaksOpen && (
        <TweaksPanel
          variant={variant} setVariant={setVariant}
          accent={accent} setAccent={setAccent}
          theme={theme} toggleTheme={toggleTheme}
          onClose={() => setTweaksOpen(false)}
        />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
