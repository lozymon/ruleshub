import { NextRequest, NextResponse } from 'next/server';

const MAINTENANCE_PATH = '/maintenance';

export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== 'true') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === MAINTENANCE_PATH) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(MAINTENANCE_PATH, request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
