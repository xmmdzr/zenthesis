import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { createSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    name?: string;
  } | null;

  const email = payload?.email?.trim().toLowerCase() ?? "";
  const password = payload?.password ?? "";
  const name = payload?.name?.trim() || null;

  if (!isEmail(email)) {
    return NextResponse.json({ error: "valid email is required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      preferences: {
        create: {
          theme: "system",
          locale: "zh",
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const session = await createSession(user.id);

  const response = NextResponse.json({
    user,
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
