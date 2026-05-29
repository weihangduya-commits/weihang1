import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

const updateVideoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  difficulty: z.string().optional(),
  category: z.string().min(1).optional(),
  videoUrl: z.string().min(1).optional(),
  subtitleUrl: z.string().min(1).optional(),
  published: z.boolean().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = updateVideoSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid video payload" }, { status: 400 });
  }

  const updated = await prisma.video.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      category: parsed.data.category,
      video_url: parsed.data.videoUrl,
      subtitle_url: parsed.data.subtitleUrl,
      published: parsed.data.published
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  await prisma.video.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
