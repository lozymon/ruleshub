# RulesHub — Components & Gotchas

> Implementation notes for the components that bit us last time. Read this **before** writing the components.

---

## CodeBlock

The single component we spent the most time on. Get the structure right the first time.

### Anatomy

```
.code-block                     ← outer wrapper, owns border + radius + overflow:hidden
  .code-block-header            ← header strip (top): label + copy button
    .code-block-header-title    ← left: optional file icon + label (BASH / YAML / filename)
    .code-block-copy            ← right: copy button (icon + "Copy" / "Copied!")
  pre.code-block-body           ← body: <code> with syntax-highlighted spans
```

### Required CSS contract

```css
.code-block {
  margin: 16px 0;
  background: var(--code-bg);
  border: 1px solid var(--code-border);
  border-radius: 6px;
  overflow: hidden;                  /* clips header to outer radius */
}
.code-block-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  background: var(--code-header-bg);
  border-bottom: 1px solid var(--code-border);
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--code-header-fg);
}
[data-theme="light"] .code-block-header {
  border-bottom-color: #d4d4d8;      /* lighter divider for light mode */
}
.code-block-body {
  margin: 0;
  padding: 14px 16px;
  font-size: 12.5px;
  line-height: 1.6;
  background: var(--code-bg);
  color: var(--code-fg);
  overflow-x: auto;
  font-family: var(--font-mono);
}
.code-block .code-block-body code {
  background: none; border: none; padding: 0;
  color: var(--code-fg); font-size: inherit;
}
```

### ⚠️ GOTCHAS (these all bit us — read carefully)

1. **Generic `.readme pre` and `.readme code` styles bleed in.** If your prose styles set `background` and `border` on `pre`/`code`, they'll paint a second box inside `.code-block`. Add scoped overrides:
    ```css
    .readme .code-block-body { background: transparent !important; border: none !important; padding: 14px 16px !important; }
    .readme .code-block-body code { background: none !important; border: none !important; padding: 0 !important; color: var(--code-fg) !important; }
    ```
2. **Do NOT put inline `style={{ backgroundColor: ... }}` on the header.** Use the CSS token. Inline styles override the token and break theme switching. (We had `rgba(18,18,18,0.796)` hardcoded — it took 30 minutes to find.)
3. **`.code-block` MUST have `overflow: hidden`** or the header's background corners will poke past the outer border-radius.
4. **The "Copy" button is a real `<button>`, not a div.** Default `display: inline-flex`, `gap: 5px`, padding `3px 8px`, radius `4px`. Hover = `background: var(--code-header-hover)`. After copy success, swap text to "Copied!" and class `.copied` (color: `var(--success)`).
5. **Bash highlighting is regex-based, not a full lexer.** Just split on whitespace and tag tokens by position:
    - First token after `$` → cmd (`--code-tok-cmd`)
    - Tokens starting with `-` or `--` → flag
    - Token after a flag → value
    - Everything else → arg
6. **Cache busting.** When iterating on `styles.css` against a long-running preview, append `?v=N` to the `<link>` so browsers re-fetch. Production builds won't need this.

### React shape

```jsx
function CodeBlock({ language = "bash", filename, code }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="code-block">
      <div className="code-block-header">
        <div className="code-block-header-title">
          {filename
            ? <><Icon name="file" size={11} /><span>{filename}</span></>
            : <span>{language.toUpperCase()}</span>}
        </div>
        <button className={`code-block-copy${copied ? " copied" : ""}`} onClick={onCopy}>
          <Icon name={copied ? "check" : "copy"} size={11} />
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="code-block-body">
        <code dangerouslySetInnerHTML={{ __html: highlight(code, language) }} />
      </pre>
    </div>
  );
}
```

---

## ToolTabs (segmented filter on Browse / docs)

A horizontal row of pill-buttons that pick which tool's rules you're viewing. Active tab gets the **accent underline that runs the full width of the wrapper, not just the active pill**.

### Gotcha
The underline is a **separate pseudo-element on the wrapper**, not on the active tab. Implementation:

```css
.tool-tabs {
  position: relative;
  display: flex; gap: 4px;
  border-bottom: 1px solid var(--border);
  padding: 0;
}
.tool-tabs button {
  /* pill — no underline of its own */
  padding: 10px 14px;
  background: transparent; border: 0;
  color: var(--fg-muted);
  font: inherit;
  cursor: pointer;
}
.tool-tabs button[aria-selected="true"] {
  color: var(--fg);
  position: relative;
}
.tool-tabs button[aria-selected="true"]::after {
  content: "";
  position: absolute; left: 0; right: 0; bottom: -1px;
  height: 2px; background: var(--accent);
}
```

The `border-bottom` on the wrapper is what gives you the **full-width line**; the `::after` is the highlight under the active tab. Don't try to draw the full-width line *on the active tab* — it never aligns.

---

## Stats bar (home hero)

The bar with `12,847 rules · 3,241 publishers · 47k installs/wk` etc.

### Gotchas
- Numbers are **live** (animated in on mount with a count-up from 0). Use a small hook, ~600ms, easeOutCubic.
- Separator between stats is a **middle-dot character** `·`, not a vertical pipe, with `color: var(--fg-muted)` and 12px horizontal margin.
- Do NOT wrap each stat in a card — it's a single inline row.

---

## PackageCard

The repeated card in browse / home / profile.

```
.package-card
  .package-card-header
    avatar-or-icon (32×32)
    .package-card-title-block
      <h3>scope/name</h3>
      <p>one-line description</p>
  .package-card-meta-row
    ToolBadge
    "1.2k installs"
    "★ 247"
    "2d ago"
```

- Border `1px solid var(--border)`, radius `8px`, padding `16px`.
- On hover: lift to `var(--shadow-hover)` (which includes `0 0 0 1px var(--border-hover)`); **don't** also raise via `transform: translateY` — the shadow alone is enough.
- The whole card is one anchor; nested ToolBadge link must stop propagation if it routes elsewhere.

---

## Navbar

- Sticky at top, `--bg-elev` background, `1px solid var(--border)` bottom.
- Logo (left) → primary nav (Browse / Docs / Leaderboard) → search → theme toggle → "Sign in" / avatar (right).
- The search input expands on focus from 240px to 360px. Easing `cubic-bezier(.4,0,.2,1)`, 180ms.

---

## Tweaks panel

If you keep the tweak system, follow the host protocol exactly (already documented in our `tweaks-panel.jsx` starter). Don't expose tweaks in production — they're for the design preview only.

---

## Icons

Inline SVG, single file `icons.jsx` exporting `<Icon name="..." size={16} />`. All current icons are **stroked outlines**, `stroke-width: 1.75`, `stroke: currentColor`, `fill: none`. Don't mix in filled icons; the visual rhythm breaks.

Used: `search`, `arrow-right`, `arrow-up`, `chevron-down`, `chevron-right`, `check`, `copy`, `file`, `folder`, `download`, `star`, `bookmark`, `sun`, `moon`, `external`, `github`, `package`, `tag`, `users`, `x`, `plus`, `menu`, `bell`, `settings`, `trash`.
