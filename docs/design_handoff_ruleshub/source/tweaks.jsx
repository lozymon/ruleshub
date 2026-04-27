// Tweaks panel for in-prototype configuration

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "default",
  "accent": "blue",
  "density": "balanced",
  "showTweaks": false
}/*EDITMODE-END*/;

const TweaksPanel = ({ state, setState, variant, setVariant, accent, setAccent, theme, toggleTheme, onClose }) => {
  return (
    <div className="tweaks-panel">
      <h4>
        Tweaks
        <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22 }} onClick={onClose}>
          <Icon name="x" size={12} />
        </button>
      </h4>

      <div className="tweak-row">
        <span className="tlabel">Theme</span>
        <div className="tweak-chips">
          {['dark', 'light'].map(t => (
            <button key={t}
              className={`tweak-chip ${theme === t ? 'active' : ''}`}
              onClick={() => theme !== t && toggleTheme()}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <span className="tlabel">Card style</span>
        <div className="tweak-chips">
          {[
            { id: 'default', label: 'rounded' },
            { id: 'sharp', label: 'sharp' },
          ].map(o => (
            <button key={o.id}
              className={`tweak-chip ${variant === o.id ? 'active' : ''}`}
              onClick={() => setVariant(o.id)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <span className="tlabel">Accent</span>
        <div className="tweak-chips">
          {[
            { id: 'blue', label: 'blue' },
            { id: 'warm', label: 'warm' },
            { id: 'mint', label: 'mint' },
          ].map(o => (
            <button key={o.id}
              className={`tweak-chip ${accent === o.id ? 'active' : ''}`}
              onClick={() => setAccent(o.id)}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 5, verticalAlign: 'middle',
                background: o.id === 'blue' ? '#3b82f6' : o.id === 'warm' ? '#ea580c' : '#10b981' }} />
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}>
        toggle via toolbar
      </div>
    </div>
  );
};

Object.assign(window, { TweaksPanel, TWEAK_DEFAULTS });
