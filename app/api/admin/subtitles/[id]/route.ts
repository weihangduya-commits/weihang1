import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { fail, ok } from "@/lib/apiResponse";

const updateSubtitleSchema = z.object({
  title: z.string().min(1).optional(),
  videoId: z.string().nullable().optional(),
  language: z.string().optional(),
  content: z.string().min(1).optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = updateSubtitleSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("字幕数据不合法", 400, parsed.error.flatten());
  }

  const updated = await prisma.subtitle.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title,
      video_id: parsed.data.videoId,
      language: parsed.data.language,
      content: parsed.data.content
    }
  });

  if (updated.video_id && updated.file_url) {
    await prisma.video.update({
      where: { id: updated.video_id },
      data: { subtitle_url: updated.file_url }
    });
  }

  return ok(updated, "字幕已更新");
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  await prisma.subtitle.delete({ where: { id: params.id } });
  return ok({ id: params.id }, "字幕已删除");
}
