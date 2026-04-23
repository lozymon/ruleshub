import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  // TODO: wire up email service (SendGrid, Resend, etc.)
  console.info("[waitlist]", result.data.email);

  return NextResponse.json({ success: true });
}
