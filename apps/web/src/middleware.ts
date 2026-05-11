import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_PATH = "/maintenance";
const COMING_SOON_PATH = "/coming-soon";
const BYPASS_COOKIE = "rh_bypass";

// SHA-256 hex digest using the edge-runtime-available Web Crypto API.
// The cookie stores this hash, never the raw env token, so a leaked
// cookie (extension, shared browser, accidental log) doesn't reveal the
// secret — though a stolen hash can still be replayed within the cookie
// lifetime, which is acceptable for a "coming soon" gate.
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function isBypassed(request: NextRequest): Promise<boolean> {
  const token = process.env.COMING_SOON_BYPASS_TOKEN;
  if (!token) return false;
  const cookie = request.cookies.get(BYPASS_COOKIE)?.value;
  if (!cookie) return false;
  const expected = await sha256Hex(token);
  return timingSafeEqual(cookie, expected);
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── Maintenance mode ──────────────────────────────────────────
  if (process.env.MAINTENANCE_MODE === "true") {
    if (pathname === MAINTENANCE_PATH) return NextResponse.next();
    return NextResponse.redirect(new URL(MAINTENANCE_PATH, request.url));
  }

  // ── Coming soon mode ──────────────────────────────────────────
  if (process.env.COMING_SOON_MODE === "true") {
    const bypassToken = process.env.COMING_SOON_BYPASS_TOKEN;

    // Activate bypass: set cookie then redirect to home
    if (
      pathname === COMING_SOON_PATH &&
      bypassToken &&
      searchParams.get("bypass") === bypassToken
    ) {
      const res = NextResponse.redirect(new URL("/", request.url));
      res.cookies.set(BYPASS_COOKIE, await sha256Hex(bypassToken), {
        httpOnly: true,
        // Secure in prod; left off in dev so http://localhost flows still work.
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      });
      return res;
    }

    if (pathname === COMING_SOON_PATH || (await isBypassed(request))) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(COMING_SOON_PATH, request.url));
  }

  // Auth-protected routes are enforced by the pages themselves via
  // `useAuth()` + a redirect to the API's OAuth endpoint. Doing the check
  // here is impossible — the auth credential (`rh_auth`) is an httpOnly
  // cookie scoped to the API origin, so this middleware never sees it.
  // A previous version relied on a JS-set `rh_session` cookie, which was
  // trivially spoofable (`document.cookie = "rh_session=1"`).
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
