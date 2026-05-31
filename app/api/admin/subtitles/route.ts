import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { fail, ok } from "@/lib/apiResponse";
import { detectSubtitleFormat, srtToVtt } from "@/lib/subtitleFormat";
import { saveUploadFile } from "@/lib/storage";

const subtitleSchema = z.object({
  title: z.string().min(1),
  videoId: z.string().optional().nullable(),
  language: z.string().default("en"),
  content: z.string().min(1)
});

export async function GET() {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const subtitles = await prisma.subtitle.findMany({
    include: {
      video: { select: { id: true, title: true } }
    },
    orderBy: { created_at: "desc" }
  });

  return ok(subtitles);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("subtitle");
    const title = String(form.get("title") ?? "").trim();
    const language = String(form.get("language") ?? "en");
    const videoId = String(form.get("videoId") ?? "") || null;

    if (!(file instanceof File) || !title) {
      return fail("请填写标题并上传字幕文件", 400);
    }

    const raw = await file.text();
    const format = detectSubtitleFormat(file.name);
    const content = format === "srt" ? srtToVtt(raw) : raw;
    const saved = await saveUploadFile(
      new File([content], file.name.replace(/\.srt$/i, ".vtt"), { type: "text/vtt" }),
      "subtitles",
      ".vtt"
    );

    const created = await prisma.subtitle.create({
      data: {
        title,
        language,
        format: "vtt",
        content,
        file_url: saved.url,
        video_id: videoId
      }
    });

    if (videoId) {
      await prisma.video.update({
        where: { id: videoId },
        data: { subtitle_url: saved.url }
      });
    }

    return ok(created, "字幕已上传", 201);
  }

  const parsed = subtitleSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("字幕数据不合法", 400, parsed.error.flatten());
  }

  const created = await prisma.subtitle.create({
    data: {
      title: parsed.data.title,
      language: parsed.data.language,
      format: "vtt",
      content: parsed.data.content,
      video_id: parsed.data.videoId || null
    }
  });

  return ok(created, "字幕已创建", 201);
}
