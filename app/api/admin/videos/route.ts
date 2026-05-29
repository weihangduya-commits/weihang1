import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

const createVideoSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  difficulty: z.string().default("Beginner"),
  category: z.string().min(1),
  videoUrl: z.string().min(1),
  subtitleUrl: z.string().min(1),
  published: z.boolean().default(false)
});

export async function GET() {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const videos = await prisma.video.findMany({
    orderBy: { created_at: "desc" }
  });

  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const title = String(form.get("title") ?? "");
    const description = String(form.get("description") ?? "");
    const difficulty = String(form.get("difficulty") ?? "Beginner");
    const category = String(form.get("category") ?? "教育");
    const published = form.get("published") === "on";
    const video = form.get("video");
    const subtitle = form.get("subtitle");

    if (!(video instanceof File) || !(subtitle instanceof File) || !title.trim()) {
      return NextResponse.json({ error: "Missing video, subtitle, or title" }, { status: 400 });
    }

    const uploadId = randomUUID();
    const uploadDir = path.join(process.cwd(), "public", "uploads", uploadId);
    await mkdir(uploadDir, { recursive: true });

    const videoExtension = path.extname(video.name) || ".mp4";
    const subtitleExtension = path.extname(subtitle.name) || ".vtt";
    const videoName = `video${videoExtension}`;
    const subtitleName = `subtitle${subtitleExtension}`;

    await writeFile(
      path.join(uploadDir, videoName),
      Buffer.from(await video.arrayBuffer())
    );
    await writeFile(
      path.join(uploadDir, subtitleName),
      Buffer.from(await subtitle.arrayBuffer())
    );

    const created = await prisma.video.create({
      data: {
        title,
        description,
        difficulty,
        category,
        video_url: `/uploads/${uploadId}/${videoName}`,
        subtitle_url: `/uploads/${uploadId}/${subtitleName}`,
        published
      }
    });

    return NextResponse.json(created, { status: 201 });
  }

  const parsed = createVideoSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid video payload" }, { status: 400 });
  }

  const created = await prisma.video.create({
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

  return NextResponse.json(created, { status: 201 });
}
