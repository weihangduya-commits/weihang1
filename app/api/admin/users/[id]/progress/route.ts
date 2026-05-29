import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const progress = await prisma.learningProgress.findMany({
    where: { user_id: params.id },
    include: { video: true },
    orderBy: { updated_at: "desc" }
  });

  return NextResponse.json(progress);
}
