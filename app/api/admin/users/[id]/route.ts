import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

const resetPasswordSchema = z.object({
  password: z.string().min(8)
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
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = resetPasswordSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: {
      password_hash: await bcrypt.hash(parsed.data.password, 12)
    }
  });

  return NextResponse.json({ ok: true });
}
