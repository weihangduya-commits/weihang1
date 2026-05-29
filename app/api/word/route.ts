import { NextResponse } from "next/server";
import { getMockWordDefinition } from "@/lib/mockDictionary";
import { requireUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireUser();

  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") ?? "";

  if (!text.trim()) {
    return NextResponse.json(
      { error: "Missing required query parameter: text" },
      { status: 400 }
    );
  }

  const word = text.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, "");
  const dictionaryWord = await prisma.dictionaryWord.findUnique({
    where: { word }
  });

  if (dictionaryWord) {
    return NextResponse.json({
      word: dictionaryWord.word,
      phonetic: dictionaryWord.phonetic,
      audioText: dictionaryWord.word,
      chinese: dictionaryWord.chinese,
      english: dictionaryWord.english,
      example: dictionaryWord.example,
      forms: JSON.parse(dictionaryWord.forms)
    });
  }

  return NextResponse.json(getMockWordDefinition(text));
}
