# RulesHub Monorepo Audit

Findings from a whole-monorepo review covering `apps/api`, `apps/web`, `packages/*`, `packages-py`, `packages-php`, `packages-rs`, scripts, and root configuration. Each item links to the affected file and line and includes a one-line fix direction. Tick items as they land.

Severity scale: **critical** (data/auth bypass, exploitable today) · **high** (exploitable with effort or material hardening gap) · **medium** (correctness or defense-in-depth) · **low** (nice-to-have).

---

## Critical

- [x] **C1. Private packages publicly readable via detail endpoint** — [apps/api/src/packages/packages.service.ts:184](../apps/api/src/packages/packages.service.ts#L184) (`findByFullName`) and [diffVersions:582](../apps/api/src/packages/packages.service.ts#L582) don't check `isPrivate`. `GET /v1/packages/:namespace/:name` exfiltrates any private package by guessing the name. Fix: add `if (pkg.isPrivate && pkg.ownerUserId !== requesterId) throw NotFoundException` (or filter in `where`) and thread the optional caller through the controller. _Done: added `OptionalJwtAuthGuard` + `assertCanReadPackage` helper (covers user-owned + org-owned), threaded `requesterId` through `findByFullName`, `findVersion`, `getDownloadUrl`, `streamFile`, `getFilePreview`, `diffVersions`; 5 new e2e cases._
- [x] **C2. `fork` bypasses privacy + ownership** — [apps/api/src/packages/packages.service.ts:474](../apps/api/src/packages/packages.service.ts#L474). Anyone can fork a private package into their own namespace. Fix: reject when `source.isPrivate` and caller is not owner / org member. _Done: `fork` now calls `assertCanReadPackage(source, userId)` before cloning; non-owner gets 404._
- [x] **C3. JWT stored in `localStorage`** — [apps/web/src/lib/auth-storage.ts:5](../apps/web/src/lib/auth-storage.ts#L5). Any XSS exfiltrates the token. Fix: have the API set an `httpOnly; Secure; SameSite=Lax` cookie; the web app should never see the JWT directly. _Done: API now sets `rh_auth` (httpOnly, Secure in prod, SameSite=Lax) on OAuth callback; `JwtStrategy` extracts from cookie or Bearer header; web `apiClient` sends `credentials: 'include'`; `authStorage` no longer touches the JWT; `useAuth().token` removed, all callers migrated to `user`._
- [x] **C4. Middleware auth gate is trivially bypassable** — [apps/web/src/middleware.ts:50](../apps/web/src/middleware.ts#L50). Only checks the non-httpOnly `rh_session=1` cookie set by client code. `document.cookie = "rh_session=1"` opens dashboard/publish UI. Fix: rely on the httpOnly session cookie from C3, or drop the middleware check and treat it as UX-only. _Done: dropped the `PROTECTED_PATHS` check from middleware entirely (the `rh_auth` cookie is scoped to the API origin and unreachable from the web middleware, and `rh_session` was just a spoofable hint). Deleted `auth-storage.ts` and the `rh_session` cookie it managed. Protected pages (`/dashboard`, `/publish`) now self-redirect to the API's OAuth endpoint when there's no user; the API is the sole authority for auth._
- [x] **C5. OAuth callback leaks JWT through the URL** — [apps/web/src/app/auth/callback/auth-callback-client.tsx:19](../apps/web/src/app/auth/callback/auth-callback-client.tsx#L19). Token ends up in browser history and Referer headers. Fix: API sets cookie + redirects; never pass JWT in query string. _Done: callback redirect is now `${appUrl}/auth/callback` with no query string; the page just calls `/auth/me` (cookie sent automatically) and routes._
- [ ] **C6. README renderer accepts `javascript:` URLs** — [apps/web/src/components/packages/readme-markdown.tsx:8](../apps/web/src/components/packages/readme-markdown.tsx#L8). Scheme check allows any `[a-z][a-z0-9+.-]*:`, so `[click](javascript:alert(document.cookie))` is a working stored XSS. Fix: allowlist `http:`, `https:`, `mailto:`, and `#` fragments; reject everything else. Add `rehype-sanitize` for defense-in-depth.

## High

- [ ] **H1. SSRF in webhook delivery (DNS rebinding + missing ranges)** — [apps/api/src/webhooks/webhooks.service.ts:214](../apps/api/src/webhooks/webhooks.service.ts#L214). DNS resolved once for validation, re-resolved by `fetch`. Missing IPv6 ULA `fc00::/7`, `0.0.0.0/8`, `::`, IPv4-mapped IPv6. Fix: resolve all A/AAAA, reject if any private, then fetch by pinned IP with `Host` header; extend private-range list.
- [ ] **H2. GitHub-import tag injected into upstream URL** — [apps/api/src/imports/imports.service.ts:144](../apps/api/src/imports/imports.service.ts#L144). Webhook `tagName` is interpolated unvalidated into a GitHub API URL. Fix: validate against `^[A-Za-z0-9._/-]+$` and URL-encode before interpolation.
- [ ] **H3. JWT secret silently defaults to empty string** — [apps/api/src/auth/strategies/jwt.strategy.ts:21](../apps/api/src/auth/strategies/jwt.strategy.ts#L21). If `JWT_SECRET` is unset, app boots accepting any `""`-signed token. Fix: throw at startup if missing or shorter than 32 chars.
- [ ] **H4. No rate limiting anywhere** — `@nestjs/throttler` not registered ([apps/api/src/app.module.ts](../apps/api/src/app.module.ts)). OAuth callback, webhook ping (SSRF amplifier per H1), publish, fork all unprotected. Fix: register `ThrottlerModule` globally with tighter limits on `auth/*`, `webhooks/:id/ping`, and `packages` publish/fork.
- [ ] **H5. No `helmet`; CORS silently falls back to `localhost:3000`** — [apps/api/src/main.ts:18](../apps/api/src/main.ts#L18). Fix: add `helmet()`; require `APP_URL` to be set (throw at boot if missing).
- [ ] **H6. Admin by env-listed GitHub usernames** — [apps/api/src/admin/admin.guard.ts:18](../apps/api/src/admin/admin.guard.ts#L18). GitHub usernames are reusable after deletion. Fix: store `User.isAdmin` keyed by `githubId` in DB.
- [ ] **H7. `/v1/users/:username` leaks internal `githubId`** — [apps/api/src/users/users.service.ts:34](../apps/api/src/users/users.service.ts#L34) returns the raw Prisma row. Fix: return a DTO with explicit fields (`id`, `username`, `avatarUrl`, `bio`, `verified`, `createdAt`).
- [ ] **H8. Path-traversal risk in Rust CLI install** — [packages-rs/cli/src/api.rs:10](../packages-rs/cli/src/api.rs#L10) `parse_full_name` doesn't validate; `pkg_name` is concatenated into a file path in [tool.rs:97](../packages-rs/cli/src/tool.rs#L97). Fix: reject anything not `^[a-z0-9_-]+$`; canonicalize `dest_abs` and assert it stays within `output_path`.
- [ ] **H9. Python wheel builder ships unverified GitHub Release binaries** — [packages-py/cli/tools/build_wheels.py:65](../packages-py/cli/tools/build_wheels.py#L65). The npm and PHP wrappers verify SHA256SUMS; the Python builder does not. Compromised release = shipped to every `pip install ruleshub` user. Fix: mirror the npm/PHP code — fetch `SHA256SUMS`, verify each archive before extracting.
- [ ] **H10. Postgres + MinIO bound to `0.0.0.0` with trivial creds** — [docker-compose.yml:8](../docker-compose.yml#L8). `ports: ["5432:5432"]` binds host wildcard with `ruleshub:ruleshub`. Fix: bind `"127.0.0.1:5432:5432"` (and same for 9000/9001/8080).
- [ ] **H11. Workflows missing `permissions:` block** — `.github/workflows/ci.yml`, `cli-npm.yml`, `cli-php.yml`, `cli-pip.yml`, `cli-rust.yml`. Default token may be write-all. Fix: top-level `permissions: contents: read`; rely on `cli-release.yml`'s job-level grants for the release path.
- [ ] **H12. Third-party GitHub Actions pinned by tag** — `softprops/action-gh-release@v2`, `pypa/gh-action-pypi-publish@release/v1`, `Swatinem/rust-cache@v2`, `dtolnay/rust-toolchain@stable`, `shivammathur/setup-php@v2` in `cli-release.yml`. Compromised tag = RCE with publish tokens. Fix: pin to full SHA + version comment.

## Medium

- [ ] **M1. `new Function('return import(...)')` in client bundle** — [apps/web/src/components/docs/docs-search.tsx:27](../apps/web/src/components/docs/docs-search.tsx#L27). Breaks any CSP without `unsafe-eval`. Fix: use literal `import(/* webpackIgnore: true */ "/_pagefind/pagefind.js")`.
- [ ] **M2. `dangerouslySetInnerHTML` on Pagefind excerpts** — [apps/web/src/components/docs/docs-search.tsx:189](../apps/web/src/components/docs/docs-search.tsx#L189). Sanitize with `DOMPurify` or strip to text + apply highlight client-side.
- [ ] **M3. README link rewriter over-broad** — [apps/web/src/components/packages/readme-markdown.tsx:8](../apps/web/src/components/packages/readme-markdown.tsx#L8). Rewrites any absolute `/seg/seg`; `/api/health` becomes `/packages/api/health`. Fix: only rewrite when no leading slash, or guard against reserved top-level paths.
- [ ] **M4. Coming-soon bypass cookie stores the raw secret** — [apps/web/src/middleware.ts:32](../apps/web/src/middleware.ts#L32). Cookie value is `process.env.COMING_SOON_BYPASS_TOKEN` verbatim; not `Secure`. Fix: derive a random session id server-side; set `Secure` in production.
- [ ] **M5. Dashboard does client-side data fetching** — `apps/web/src/app/(main)/dashboard/page.tsx`, `dashboard/admin/page.tsx`, `dashboard/org/[slug]/page.tsx`. Violates `apps/web/CLAUDE.md` no-`useEffect`-fetching rule. Fix: split into RSC shell + client islands.
- [ ] **M6. Hardcoded API URL fallback in client** — [apps/web/src/app/(main)/dashboard/page.tsx:216](<../apps/web/src/app/(main)/dashboard/page.tsx#L216>) and `:224` duplicate `http://localhost:3001/v1`. Fix: import `config.apiUrl` from `@/lib/config`.
- [ ] **M7. `console.info` in `/api/waitlist`** — [apps/web/src/app/api/waitlist/route.ts:17](../apps/web/src/app/api/waitlist/route.ts#L17). Banned by root `CLAUDE.md`. Fix: replace with a proper logger or remove.
- [ ] **M8. Admin page-level auth check during render** — [apps/web/src/app/(main)/dashboard/admin/page.tsx:101](<../apps/web/src/app/(main)/dashboard/admin/page.tsx#L101>). Doesn't check `user.isAdmin`; calls `router.replace` during render. Fix: gate on `user.isAdmin`; move redirect into `useEffect`.
- [ ] **M9. Unbounded pagination** — [apps/api/src/webhooks/webhooks.controller.ts:60](../apps/api/src/webhooks/webhooks.controller.ts#L60) and [apps/api/src/admin/admin.controller.ts:53](../apps/api/src/admin/admin.controller.ts#L53) accept `limit` as raw `parseInt` with no max. Fix: DTO with `@IsInt @Min(1) @Max(100)`.
- [ ] **M10. Schema unbounded arrays + strings** — [packages/types/src/manifest.ts:35](../packages/types/src/manifest.ts#L35). `tags`, `projectTypes`, `includes` have no `.max()`; per-string no length cap. Fix: `.max(20)` on arrays, `.max(64)` per tag, `.max(100)` on `includes`.
- [ ] **M11. No SHA256 verify on artifact download in Rust CLI install** — [packages-rs/cli/src/commands/install.rs:186](../packages-rs/cli/src/commands/install.rs#L186). Only checks zip magic bytes. Fix: API returns `{ url, sha256 }`; verify before unzip.
- [ ] **M12. Rust CLI fetches schema over the network every validate/publish** — [packages-rs/cli/src/commands/validate.rs:8](../packages-rs/cli/src/commands/validate.rs#L8). Fix: embed via `include_str!`; refetch only with explicit `--refresh-schema`.
- [ ] **M13. Docker images on mutable tags** — `minio/minio`, `adminer` in [docker-compose.yml](../docker-compose.yml). Effectively `:latest`. Fix: pin to dated/explicit tags.
- [ ] **M14. No global Nest exception filter** — raw Prisma errors (including failing column names) leak in 500 responses. Fix: add `AllExceptionsFilter` that strips stack traces and replaces non-`HttpException` with generic 500.
- [ ] **M15. `create-ruleshub` missing `files` field** — [packages/create-ruleshub/package.json](../packages/create-ruleshub/package.json). `npm publish` ships `src/`, tsconfigs, tests. Fix: `"files": ["dist", "README.md", "LICENSE"]`.
- [ ] **M16. `imports/parseGitHubUrl` regex too loose** — [apps/api/src/imports/imports.service.ts:15](../apps/api/src/imports/imports.service.ts#L15). Matches `github.com/owner/repo` anywhere in string. Fix: anchor with `^https://github\.com/([^/]+)/([^/.]+?)(?:\.git)?/?$`.
- [ ] **M17. Response body length not bounded in Rust install** — [packages-rs/cli/src/commands/install.rs:97](../packages-rs/cli/src/commands/install.rs#L97). `reqwest::get` collects full body. Fix: set a content-length ceiling on the API client.
- [ ] **M18. PowerShell escape fragility in npm CLI installer** — [packages/cli/tools/install.js:54](../packages/cli/tools/install.js#L54). Already uses `-LiteralPath` (good); edge cases on paths containing newlines. Fix: prefer `-File` with a script over `-Command` string interpolation.

## Low

- [ ] **L1. No JWT revocation path** — [apps/api/src/auth/strategies/jwt.strategy.ts:25](../apps/api/src/auth/strategies/jwt.strategy.ts#L25). Stolen tokens valid for 7 days. Fix: add `User.tokensInvalidAfter`; compare against `iat`.
- [ ] **L2. `toPackageDto` leaks internal fields** — [apps/api/src/packages/packages.service.ts:74](../apps/api/src/packages/packages.service.ts#L74) spreads Prisma entity, exposing `ownerUserId`, `ownerOrgId`, `qualityScore`, `forkedFromId`. Fix: explicit DTO fields.
- [ ] **L3. `force-dynamic` on public pages** — [apps/web/src/app/(main)/browse/page.tsx:1](<../apps/web/src/app/(main)/browse/page.tsx#L1>), [users/[username]/page.tsx:1](<../apps/web/src/app/(main)/users/[username]/page.tsx#L1>). Disables caching unnecessarily. Fix: prefer `revalidate`.
- [ ] **L4. Missing form labels (a11y)** — `dashboard/page.tsx:467,478,594,689`, `dashboard/admin/page.tsx:123`, `components/docs/docs-search.tsx:158`, `browse-search.tsx:29`, `dashboard/org/[slug]/page.tsx:315`. Fix: `<label>` or `aria-label`.
- [ ] **L5. `ruleshub-kit` exports map missing `import`** — [packages/ruleshub-kit/package.json:9](../packages/ruleshub-kit/package.json#L9). Breaks ESM consumers. Fix: add `"import": "./dist/index.js"` (or split builds).
- [ ] **L6. External links in rendered READMEs lack `target=_blank rel=noopener`** — [apps/web/src/components/packages/readme-markdown.tsx:18](../apps/web/src/components/packages/readme-markdown.tsx#L18). Fix: add `target`/`rel` for `http(s)` hrefs.
- [ ] **L7. README link rewrite preserves case** — [apps/web/src/components/packages/readme-markdown.tsx:8](../apps/web/src/components/packages/readme-markdown.tsx#L8). Mixed-case input 404s. Fix: lowercase the matched segments.
- [ ] **L8. `redirect()` to magic string in `/docs`** — [apps/web/src/app/(main)/docs/page.tsx:4](<../apps/web/src/app/(main)/docs/page.tsx#L4>). Fix: use `routes.*` constant.
- [ ] **L9. `packages/types/package.json` exports map non-idiomatic** — [packages/types/package.json:7](../packages/types/package.json#L7). `exports.require` and `main` both point to `.js`; ESM falls through to require. Fix: clean up exports.

---

## Suggested fix order

1. **C1, C2** — close package privacy bypasses (smallest diff, highest impact).
2. **H3** — fail-closed on missing `JWT_SECRET`.
3. **C3, C4, C5** — move JWT to httpOnly cookie set by API; rework middleware.
4. **C6** — sanitize README link schemes.
5. **H1, H2** — SSRF hardening + tag validation.
6. **H8, H9** — CLI path-traversal + Python wheel verification.
7. **H10** — bind compose ports to `127.0.0.1`.
8. **H4, H5, H6, H7** — throttler, helmet, admin model, user DTO.
9. **H11, H12** — CI/CD permissions + SHA pinning.
10. **Medium block**, then **Low**.
