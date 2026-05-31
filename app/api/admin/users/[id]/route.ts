import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { fail, ok } from "@/lib/apiResponse";

const updateUserSchema = z.object({
  password: z.string().min(8).optional(),
  role: z.enum(["admin", "user"]).optional(),
  disabled: z.boolean().optional()
});

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  if (params.id === auth.session.user.id) {
    return fail("不能删除当前登录账号", 400);
  }

  await prisma.user.delete({ where: { id: params.id } });

  return ok({ id: params.id }, "用户已删除");
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = updateUserSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("用户数据不合法", 400, parsed.error.flatten());
  }

  if (params.id === auth.session.user.id && parsed.data.disabled) {
    return fail("不能禁用当前登录账号", 400);
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      role: parsed.data.role,
      disabled: parsed.data.disabled,
      password_hash: parsed.data.password
        ? await bcrypt.hash(parsed.data.password, 12)
        : undefined
    },
    select: {
      id: true,
      email: true,
      role: true,
      disabled: true,
      created_at: true
    }
  });

  return ok(updated, "用户已更新");
}
