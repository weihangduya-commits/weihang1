import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  const videos = await prisma.video.findMany({
    where: { published: true },
    orderBy: { created_at: "desc" }
  });

  return NextResponse.json(videos);
}
