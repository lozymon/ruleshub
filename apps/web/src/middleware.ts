import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_PATH = "/maintenance";
const COMING_SOON_PATH = "/coming-soon";
const BYPASS_COOKIE = "rh_bypass";

function isBypassed(request: NextRequest): boolean {
  const token = process.env.COMING_SOON_BYPASS_TOKEN;
  if (!token) return false;
  return request.cookies.get(BYPASS_COOKIE)?.value === token;
}

export function middleware(request: NextRequest) {
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
      res.cookies.set(BYPASS_COOKIE, bypassToken, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      });
      return res;
    }

    if (pathname === COMING_SOON_PATH || isBypassed(request)) {
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
