import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  await prisma.dictionaryWord.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
