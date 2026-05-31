import { NextResponse } from "next/server";
import { getMockWordDefinition } from "@/lib/mockDictionary";
import {
  buildTranslatedFallback,
  fetchOnlineWordDefinition,
  getKnownChinese
} from "@/lib/onlineDictionary";
import { requireUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import type { WordDefinition } from "@/types";

export const dynamic = "force-dynamic";

async function saveAutoDictionaryEntry(definition: WordDefinition) {
  const phrases = definition.forms.phrases?.join(", ") ?? "";
  const { phrases: _phrases, ...formsWithoutPhrases } = definition.forms;

  await prisma.dictionaryWord.upsert({
    where: { word: definition.word.toLowerCase() },
    update: {
      phonetic: definition.phonetic,
      chinese: definition.chinese,
      english: definition.english,
      example: definition.example,
      forms: JSON.stringify(formsWithoutPhrases),
      phrases
    },
    create: {
      word: definition.word.toLowerCase(),
      phonetic: definition.phonetic,
      chinese: definition.chinese,
      english: definition.english,
      example: definition.example,
      forms: JSON.stringify(formsWithoutPhrases),
      phrases
    }
  });
}

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
      forms: {
        ...JSON.parse(dictionaryWord.forms || "{}"),
        phrases: dictionaryWord.phrases
          ? dictionaryWord.phrases.split(",").map((phrase) => phrase.trim()).filter(Boolean)
          : JSON.parse(dictionaryWord.forms || "{}").phrases ?? []
      }
    });
  }

  const localDefinition = getMockWordDefinition(text);

  if (!localDefinition.english.startsWith("This is an automatically generated")) {
    await saveAutoDictionaryEntry(localDefinition).catch(() => undefined);
    return NextResponse.json(localDefinition);
  }

  const onlineDefinition = await fetchOnlineWordDefinition(word).catch(() => null);

  if (onlineDefinition) {
    if (getKnownChinese(word)) {
      onlineDefinition.chinese = getKnownChinese(word);
    }
    await saveAutoDictionaryEntry(onlineDefinition).catch(() => undefined);
    return NextResponse.json(onlineDefinition);
  }

  const translatedFallback = await buildTranslatedFallback(word);
  await saveAutoDictionaryEntry(translatedFallback).catch(() => undefined);
  return NextResponse.json(translatedFallback);
}
