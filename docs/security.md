# RulesHub — Security Findings

Tracked vulnerabilities identified during pre-launch security review (2026-04-26).

---

## VULN-001 — SSRF via Webhook URL

| Field          | Detail     |
| -------------- | ---------- |
| **Status**     | ✅ Fixed   |
| **Severity**   | High       |
| **Confidence** | 9/10       |
| **Found**      | 2026-04-26 |
| **Fixed**      | 2026-04-26 |

**Location:** `apps/api/src/webhooks/webhooks.service.ts` — `deliver()` method

**Description:**
`CreateWebhookDto` validates the URL with `@IsUrl({ protocols: ["https"], require_tld: true })`, which is a string-only check. A registered user can point a webhook at a domain they control whose DNS A record resolves to a private/internal IP (`169.254.169.254`, `10.x.x.x`, `192.168.x.x`, `127.0.0.1`). When the webhook fires, `fetch(url)` is called with no post-DNS IP-range check, enabling SSRF into internal infrastructure.

**Exploit scenario:**

1. Attacker registers `evil.attacker.com → 169.254.169.254`.
2. Calls `POST /webhooks` — passes `IsUrl` because it has a valid TLD.
3. Calls `POST /webhooks/:id/ping` or publishes a version to trigger delivery.
4. API server fetches the URL; on IMDSv1-enabled cloud hosts, may receive IAM credentials.

**Fix:** Resolve the hostname before `fetch` and reject any IP in RFC 1918, loopback, or link-local ranges.

---

## VULN-002 — Any Org Member Can Publish / Yank

| Field          | Detail     |
| -------------- | ---------- |
| **Status**     | ✅ Fixed   |
| **Severity**   | High       |
| **Confidence** | 9/10       |
| **Found**      | 2026-04-26 |
| **Fixed**      | 2026-04-26 |

**Location:** `apps/api/src/packages/packages.service.ts` — `assertOwnership()` method

**Description:**
`assertOwnership` checks that the user has _any_ `OrgMember` row for the namespace, but never inspects the `role` field. The `OrgRole` enum has `owner`, `admin`, and `member` — a plain `member` passes the gate and can publish new versions or yank existing ones under any org namespace they belong to.

**Exploit scenario:**

1. Alice is a `member` in the `acme` org.
2. She calls `POST /packages` with `name: "acme/trusted-package"` and malicious content.
3. `assertOwnership` finds her membership row and returns — role is never checked.
4. Malicious version is published under `acme`'s trusted namespace.

**Fix:** Filter `assertOwnership` to only pass `owner` and `admin` roles.

---

## VULN-003 — Private Package Data Exposed via Download / Preview Endpoints

| Field        | Detail        |
| ------------ | ------------- |
| **Status**   | ✅ Fixed      |
| **Severity** | High (latent) |
| **Found**    | 2026-04-26    |
| **Fixed**    | 2026-04-26    |

**Location:** `apps/api/src/packages/packages.service.ts` — `findVersion()`

**Description:**
`GET .../download` and `GET .../preview` are unauthenticated and `findVersion` did not check `isPrivate`. Any caller who knew a private package's `namespace/name/version` could download or read its full contents. The field existed in the schema but no API surface could set it to `true` yet, so there was no immediate exposure — but the gate was absent.

**Fix:** `findVersion` now treats `isPrivate: true` the same as not found, returning `404` to avoid leaking package existence. When Phase 7 (private packages) is built, replace this with a proper ownership check that grants access to the owner and authorised org members.
