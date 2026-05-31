import type { WordDefinition, WordForms } from "@/types";
import { translateEnglishToChinese } from "@/lib/translation";

type FreeDictionaryMeaning = {
  partOfSpeech?: string;
  definitions?: Array<{
    definition?: string;
    example?: string;
  }>;
};

type FreeDictionaryEntry = {
  word?: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings?: FreeDictionaryMeaning[];
};

export const commonChinese: Record<string, string> = {
  a: "\u4e00\u4e2a\uff1b\u4e00\u79cd",
  about: "\u5173\u4e8e\uff1b\u5927\u7ea6",
  after: "\u5728\u2026\u2026\u4e4b\u540e",
  again: "\u518d\u6b21\uff1b\u53c8\u4e00\u6b21",
  am: "\u662f\uff1b\u5728",
  an: "\u4e00\u4e2a\uff1b\u4e00\u79cd",
  and: "\u548c\uff1b\u5e76\u4e14",
  any: "\u4efb\u4f55\uff1b\u4e00\u4e9b",
  are: "\u662f\uff1b\u5728",
  answer: "\u56de\u7b54\uff1b\u7b54\u6848",
  ask: "\u8be2\u95ee\uff1b\u8bf7\u6c42",
  be: "\u662f\uff1b\u6210\u4e3a\uff1b\u5b58\u5728",
  become: "\u53d8\u6210\uff1b\u6210\u4e3a",
  because: "\u56e0\u4e3a",
  before: "\u5728\u2026\u2026\u4e4b\u524d",
  believe: "\u76f8\u4fe1\uff1b\u8ba4\u4e3a",
  better: "\u66f4\u597d\u7684\uff1b\u66f4\u597d\u5730",
  change: "\u6539\u53d8\uff1b\u53d8\u5316",
  confidence: "\u4fe1\u5fc3\uff1b\u81ea\u4fe1",
  context: "\u4e0a\u4e0b\u6587\uff1b\u8bed\u5883\uff1b\u80cc\u666f",
  curiosity: "\u597d\u5947\u5fc3\uff1b\u6c42\u77e5\u6b32",
  different: "\u4e0d\u540c\u7684",
  example: "\u4f8b\u5b50\uff1b\u793a\u4f8b",
  explain: "\u89e3\u91ca\uff1b\u8bf4\u660e",
  follow: "\u8ddf\u968f\uff1b\u7406\u89e3",
  good: "\u597d\u7684",
  important: "\u91cd\u8981\u7684",
  improve: "\u6539\u8fdb\uff1b\u63d0\u9ad8",
  in: "\u5728\u2026\u2026\u91cc\uff1b\u7528\u2026\u2026",
  interview: "\u91c7\u8bbf\uff1b\u9762\u8bd5",
  is: "\u662f\uff1b\u5b58\u5728\uff1b\u7b49\u4e8e",
  it: "\u5b83\uff1b\u8fd9\u4ef6\u4e8b",
  language: "\u8bed\u8a00\uff1b\u8868\u8fbe\u65b9\u5f0f",
  learn: "\u5b66\u4e60",
  listen: "\u542c",
  mean: "\u610f\u601d\u662f\uff1b\u610f\u5473\u7740",
  meaning: "\u610f\u601d\uff1b\u542b\u4e49",
  memory: "\u8bb0\u5fc6\uff1b\u8bb0\u5fc6\u529b",
  natural: "\u81ea\u7136\u7684",
  need: "\u9700\u8981",
  notice: "\u6ce8\u610f\u5230\uff1b\u5bdf\u89c9",
  of: "\u2026\u2026\u7684\uff1b\u5c5e\u4e8e",
  or: "\u6216\uff1b\u5426\u5219",
  phrase: "\u77ed\u8bed\uff1b\u8bcd\u7ec4",
  practice: "\u7ec3\u4e60\uff1b\u5b9e\u8df5",
  pronunciation: "\u53d1\u97f3",
  question: "\u95ee\u9898",
  repeat: "\u91cd\u590d",
  remember: "\u8bb0\u4f4f\uff1b\u60f3\u8d77",
  review: "\u590d\u4e60\uff1b\u56de\u987e",
  rhythm: "\u8282\u594f\uff1b\u97f5\u5f8b",
  sentence: "\u53e5\u5b50",
  short: "\u77ed\u7684\uff1b\u7b80\u77ed\u7684",
  speak: "\u8bf4\uff1b\u8bb2\u8bdd",
  speaker: "\u8bf4\u8bdd\u8005\uff1b\u6f14\u8bb2\u8005",
  the: "\u8fd9\uff1b\u90a3\uff1b\u5b9a\u51a0\u8bcd",
  to: "\u5230\uff1b\u5411\uff1b\u4e3a\u4e86",
  understand: "\u7406\u89e3",
  useful: "\u6709\u7528\u7684",
  video: "\u89c6\u9891",
  with: "\u548c\u2026\u2026\u4e00\u8d77\uff1b\u5177\u6709\uff1b\u7528",
  word: "\u5355\u8bcd\uff1b\u8bcd\u8bed"
};

const lookupAliases: Record<string, string> = {
  am: "be",
  are: "be",
  is: "be",
  was: "be",
  were: "be",
  been: "be",
  being: "be"
};

function buildForms(word: string): WordForms {
  const base = word.toLowerCase();

  return {
    phrases: [`${base} in context`, `learn ${base}`, `use ${base} correctly`]
  };
}

function pickPhonetic(entry: FreeDictionaryEntry) {
  return entry.phonetic || entry.phonetics?.find((item) => item.text)?.text || "";
}

function pickDefinition(entry: FreeDictionaryEntry) {
  const meaning = entry.meanings?.find((item) => item.definitions?.length);
  const definition = meaning?.definitions?.[0];

  return {
    english: definition?.definition || "No English definition found.",
    example:
      definition?.example ||
      `Try to understand "${entry.word}" from the context of the sentence.`
  };
}

export function getKnownChinese(word: string) {
  return commonChinese[word.toLowerCase()];
}

export async function fetchOnlineWordDefinition(
  word: string
): Promise<WordDefinition | null> {
  const key = word.toLowerCase();
  const lookupWord = lookupAliases[key] ?? key;
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lookupWord)}`,
    {
      next: { revalidate: 60 * 60 * 24 * 14 }
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as FreeDictionaryEntry[];
  const entry = data[0];

  if (!entry) {
    return null;
  }

  const { english, example } = pickDefinition(entry);
  const knownChinese = getKnownChinese(key);
  const translatedChinese = knownChinese
    ? ""
    : await translateEnglishToChinese(english).catch(() => "");

  return {
    word: key,
    phonetic: pickPhonetic(entry),
    audioText: key,
    chinese:
      knownChinese ||
      translatedChinese ||
      "\u6682\u65f6\u65e0\u6cd5\u81ea\u52a8\u7ffb\u8bd1\uff0c\u53ef\u5728\u540e\u53f0\u8bcd\u5e93\u4e2d\u8865\u5145\u4e2d\u6587\u89e3\u91ca\u3002",
    english,
    example,
    forms: buildForms(key)
  };
}

export async function buildTranslatedFallback(word: string): Promise<WordDefinition> {
  const key = word.toLowerCase();
  const translated = getKnownChinese(key) || (await translateEnglishToChinese(key).catch(() => ""));

  return {
    word: key,
    phonetic: "",
    audioText: key,
    chinese:
      translated ||
      "\u6682\u65f6\u65e0\u6cd5\u81ea\u52a8\u7ffb\u8bd1\uff0c\u53ef\u5728\u540e\u53f0\u8bcd\u5e93\u4e2d\u8865\u5145\u4e2d\u6587\u89e3\u91ca\u3002",
    english:
      "This word was translated automatically. Add a richer dictionary entry in the admin word library if you need a precise explanation.",
    example: `Try to understand "${key}" from the sentence and review how it is used in context.`,
    forms: {
      phrases: [`${key} in context`, `learn ${key}`, `review ${key}`]
    }
  };
}
