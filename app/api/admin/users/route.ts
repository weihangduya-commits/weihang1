import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]).default("user")
});

export async function GET() {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      created_at: true,
      _count: {
        select: {
          saved_words: true,
          learning_progress: true
        }
      }
    },
    orderBy: { created_at: "desc" }
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = createUserSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid user payload" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      password_hash: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role
    },
    select: {
      id: true,
      email: true,
      role: true,
      created_at: true
    }
  });

  return NextResponse.json(user, { status: 201 });
}
