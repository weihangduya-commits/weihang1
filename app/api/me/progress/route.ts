import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

const progressSchema = z.object({
  videoId: z.string().min(1),
  currentTime: z.number().min(0),
  completed: z.boolean().optional()
});

export async function GET() {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  const progress = await prisma.learningProgress.findMany({
    where: { user_id: auth.session.user.id },
    include: { video: true },
    orderBy: { updated_at: "desc" }
  });

  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  const parsed = progressSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
  }

  const progress = await prisma.learningProgress.upsert({
    where: {
      user_id_video_id: {
        user_id: auth.session.user.id,
        video_id: parsed.data.videoId
      }
    },
    update: {
      current_time: parsed.data.currentTime,
      completed: parsed.data.completed ?? false
    },
    create: {
      user_id: auth.session.user.id,
      video_id: parsed.data.videoId,
      current_time: parsed.data.currentTime,
      completed: parsed.data.completed ?? false
    }
  });

  return NextResponse.json(progress);
}
