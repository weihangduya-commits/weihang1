import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

const wordSchema = z.object({
  word: z.string().min(1),
  phonetic: z.string().default(""),
  chinese: z.string().default(""),
  english: z.string().default(""),
  example: z.string().default(""),
  forms: z.record(z.string(), z.unknown()).default({})
});

export async function GET() {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const words = await prisma.dictionaryWord.findMany({
    orderBy: { word: "asc" }
  });

  return NextResponse.json(words);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = wordSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid word payload" }, { status: 400 });
  }

  const forms = JSON.stringify(parsed.data.forms);

  const word = await prisma.dictionaryWord.upsert({
    where: { word: parsed.data.word.toLowerCase() },
    update: {
      phonetic: parsed.data.phonetic,
      chinese: parsed.data.chinese,
      english: parsed.data.english,
      example: parsed.data.example,
      forms
    },
    create: {
      word: parsed.data.word.toLowerCase(),
      phonetic: parsed.data.phonetic,
      chinese: parsed.data.chinese,
      english: parsed.data.english,
      example: parsed.data.example,
      forms
    }
  });

  return NextResponse.json(word);
}
