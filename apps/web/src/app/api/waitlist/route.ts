import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  // TODO: wire up email service (SendGrid, Resend, etc.) — until then
  // the email is validated and dropped. Logging it would violate the
  // root CLAUDE.md no-console.log rule and would also log a PII-shaped
  // string on every signup.
  void email;

  return NextResponse.json({ success: true });
}
