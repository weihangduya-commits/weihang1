import type { WordDefinition, WordForms } from "@/types";

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

const commonChinese: Record<string, string> = {
  about: "关于；大约",
  after: "在……之后",
  again: "再次；又一次",
  answer: "回答；答案",
  ask: "询问；请求",
  because: "因为",
  before: "在……之前",
  believe: "相信；认为",
  better: "更好的；更好地",
  change: "改变；变化",
  context: "上下文；语境；背景",
  different: "不同的",
  example: "例子；示例",
  follow: "跟随；理解",
  good: "好的",
  important: "重要的",
  learn: "学习",
  listen: "听",
  mean: "意思是；意味着",
  memory: "记忆；记忆力",
  need: "需要",
  practice: "练习；实践",
  question: "问题",
  repeat: "重复",
  remember: "记住；想起",
  sentence: "句子",
  speak: "说；讲话",
  understand: "理解",
  video: "视频",
  word: "单词；词语"
};

function buildForms(word: string): WordForms {
  const base = word.toLowerCase();

  return {
    plural: base.endsWith("s") ? `${base}es` : `${base}s`,
    pastTense: base.endsWith("e") ? `${base}d` : `${base}ed`,
    pastParticiple: base.endsWith("e") ? `${base}d` : `${base}ed`,
    presentParticiple: base.endsWith("e") ? `${base.slice(0, -1)}ing` : `${base}ing`,
    thirdPerson: base.endsWith("s") ? `${base}es` : `${base}s`,
    phrases: [`${base} in context`, `learn ${base}`, `use ${base} correctly`]
  };
}

function pickPhonetic(entry: FreeDictionaryEntry) {
  return (
    entry.phonetic ||
    entry.phonetics?.find((item) => item.text)?.text ||
    ""
  );
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

export async function fetchOnlineWordDefinition(
  word: string
): Promise<WordDefinition | null> {
  const key = word.toLowerCase();
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`,
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

  return {
    word: entry.word || key,
    phonetic: pickPhonetic(entry),
    audioText: entry.word || key,
    chinese:
      commonChinese[key] ||
      "中文释义待补充；管理员可在后台词库中添加更准确的中文解释。",
    english,
    example,
    forms: buildForms(entry.word || key)
  };
}
