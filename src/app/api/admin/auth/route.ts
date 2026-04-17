import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin password not configured on the server." },
        { status: 500 }
      );
    }

    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}
