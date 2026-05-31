import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { fail, ok } from "@/lib/apiResponse";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]).default("user")
});

export async function GET(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          email: { contains: query, mode: "insensitive" }
        }
      : undefined,
    select: {
      id: true,
      email: true,
      role: true,
      disabled: true,
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

  return ok(users);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = createUserSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("用户数据不合法", 400, parsed.error.flatten());
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
      disabled: true,
      created_at: true
    }
  });

  return ok(user, "用户已创建", 201);
}
