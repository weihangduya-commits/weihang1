import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok } from "@/lib/apiResponse";

export async function GET() {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    publishedVideos,
    draftVideos,
    todayLearners,
    savedWords,
    recentVideos,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.video.count({ where: { status: "published" } }),
    prisma.video.count({ where: { status: "draft" } }),
    prisma.learningProgress.groupBy({
      by: ["user_id"],
      where: { updated_at: { gte: today } }
    }),
    prisma.savedWord.count(),
    prisma.video.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        created_at: true
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        created_at: true
      }
    })
  ]);

  return ok({
    stats: {
      totalUsers,
      publishedVideos,
      draftVideos,
      todayLearners: todayLearners.length,
      savedWords
    },
    recentVideos,
    recentUsers
  });
}
