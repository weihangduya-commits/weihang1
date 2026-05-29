import { NextResponse } from "next/server";
import { requireUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: { word: string } }
) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  await prisma.savedWord.deleteMany({
    where: {
      user_id: auth.session.user.id,
      word: decodeURIComponent(params.word).toLowerCase()
    }
  });

  return NextResponse.json({ ok: true });
}
