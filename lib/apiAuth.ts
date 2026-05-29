import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  return { session, response: null };
}

export async function requireAdmin() {
  const auth = await requireUser();

  if (auth.response) {
    return auth;
  }

  if (auth.session.user.role !== "admin") {
    return {
      session: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 })
    };
  }

  return auth;
}
