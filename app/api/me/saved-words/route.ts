import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

const saveWordSchema = z.object({
  word: z.string().min(1).max(80)
});

export async function GET() {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  const words = await prisma.savedWord.findMany({
    where: { user_id: auth.session.user.id },
    orderBy: { created_at: "desc" }
  });

  return NextResponse.json(words);
}

export async function POST(request: Request) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  const parsed = saveWordSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid word" }, { status: 400 });
  }

  const word = parsed.data.word.toLowerCase();
  const saved = await prisma.savedWord.upsert({
    where: {
      user_id_word: {
        user_id: auth.session.user.id,
        word
      }
    },
    update: {},
    create: {
      user_id: auth.session.user.id,
      word
    }
  });

  return NextResponse.json(saved);
}
