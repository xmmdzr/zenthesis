import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { createSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ensureStartupBackfill } from "@/lib/startup-backfill";

export async function POST(request: Request) {
  await ensureStartupBackfill();

  const payload = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  const email = payload?.email?.trim().toLowerCase() ?? "";
  const password = payload?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const session = await createSession(user.id);

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
    authenticated: true,
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: session.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });

  return response;
}
