import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { ok } from "@/lib/apiResponse";

export async function GET() {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const progress = await prisma.learningProgress.findMany({
    include: {
      user: { select: { email: true } },
      video: { select: { title: true } }
    },
    orderBy: { updated_at: "desc" },
    take: 200
  });

  return ok(progress);
}
