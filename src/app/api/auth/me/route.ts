import { NextResponse } from "next/server";

import { getSessionUserIdFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ensureStartupBackfill } from "@/lib/startup-backfill";

export async function GET(request: Request) {
  await ensureStartupBackfill();

  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
    },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
