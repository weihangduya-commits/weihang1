import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { fail, ok } from "@/lib/apiResponse";

const updateVideoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  difficulty: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
  category: z.string().min(1).optional(),
  videoUrl: z.string().min(1).optional(),
  subtitleUrl: z.string().optional(),
  status: z.enum(["published", "draft", "archived"]).optional()
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
    return fail("视频数据不合法", 400, parsed.error.flatten());
  }

  const status = parsed.data.status;
  const updated = await prisma.video.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      category: parsed.data.category,
      video_url: parsed.data.videoUrl,
      subtitle_url: parsed.data.subtitleUrl,
      status,
      published: status ? status === "published" : undefined
    }
  });

  return ok(updated, "视频已更新");
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

  return ok({ id: params.id }, "视频已删除");
}
