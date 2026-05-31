import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { fail, ok } from "@/lib/apiResponse";
import { saveUploadFile } from "@/lib/storage";

const videoSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  difficulty: z.enum(["A1", "A2", "B1", "B2", "C1"]).default("A1"),
  category: z.string().min(1),
  videoUrl: z.string().min(1),
  subtitleUrl: z.string().optional().default(""),
  status: z.enum(["published", "draft", "archived"]).default("draft")
});

export async function GET(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status");
  const difficulty = url.searchParams.get("difficulty");

  const videos = await prisma.video.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(status && status !== "all" ? { status } : {}),
      ...(difficulty && difficulty !== "all" ? { difficulty } : {})
    },
    include: {
      subtitles: {
        select: { id: true, title: true, language: true, file_url: true }
      },
      _count: { select: { learning_progress: true } }
    },
    orderBy: { created_at: "desc" }
  });

  return ok(videos);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "");
    const difficulty = String(form.get("difficulty") ?? "A1");
    const category = String(form.get("category") ?? "教育");
    const status = String(form.get("status") ?? "draft");
    const video = form.get("video");
    const subtitle = form.get("subtitle");

    if (!(video instanceof File) || !title) {
      return fail("请填写标题并上传视频文件", 400);
    }

    if (!["A1", "A2", "B1", "B2", "C1"].includes(difficulty)) {
      return fail("难度不合法", 400);
    }

    const savedVideo = await saveUploadFile(video, "videos", ".mp4");
    let subtitleUrl = "";

    if (subtitle instanceof File && subtitle.size > 0) {
      const savedSubtitle = await saveUploadFile(subtitle, "subtitles", ".vtt");
      subtitleUrl = savedSubtitle.url;
    }

    const created = await prisma.video.create({
      data: {
        title,
        description,
        difficulty,
        category,
        status,
        published: status === "published",
        video_url: savedVideo.url,
        subtitle_url: subtitleUrl
      }
    });

    return ok(created, "视频已上传", 201);
  }

  const parsed = videoSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("视频数据不合法", 400, parsed.error.flatten());
  }

  const created = await prisma.video.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      category: parsed.data.category,
      status: parsed.data.status,
      video_url: parsed.data.videoUrl,
      subtitle_url: parsed.data.subtitleUrl,
      published: parsed.data.status === "published"
    }
  });

  return ok(created, "视频已创建", 201);
}
