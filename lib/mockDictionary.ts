import type { WordDefinition } from "@/types";
import { normalizeWord } from "@/lib/subtitleParser";

const dictionary: Record<string, WordDefinition> = {
  curiosity: {
    word: "curiosity",
    phonetic: "/ˌkjʊriˈɑːsəti/",
    audioText: "curiosity",
    chinese: "好奇心；求知欲",
    english: "A strong desire to know or learn something.",
    example: "Curiosity helps learners notice patterns in a new language.",
    forms: {
      plural: "curiosities",
      phrases: ["spark curiosity", "natural curiosity", "intellectual curiosity"]
    }
  },
  language: {
    word: "language",
    phonetic: "/ˈlæŋɡwɪdʒ/",
    audioText: "language",
    chinese: "语言；表达方式",
    english: "A system of communication used by a country or community.",
    example: "Video gives language a real voice and rhythm.",
    forms: {
      plural: "languages",
      phrases: ["body language", "target language", "language learning"]
    }
  },
  notice: {
    word: "notice",
    phonetic: "/ˈnoʊtɪs/",
    audioText: "notice",
    chinese: "注意到；察觉",
    english: "To become aware of something by seeing, hearing, or feeling it.",
    example: "Try to notice how the speaker connects each word.",
    forms: {
      pastTense: "noticed",
      pastParticiple: "noticed",
      presentParticiple: "noticing",
      thirdPerson: "notices",
      phrases: ["notice a detail", "take notice", "short notice"]
    }
  },
  rhythm: {
    word: "rhythm",
    phonetic: "/ˈrɪðəm/",
    audioText: "rhythm",
    chinese: "节奏；韵律",
    english: "A regular pattern of sounds, movements, or events.",
    example: "Listening for rhythm makes spoken English easier to follow.",
    forms: {
      plural: "rhythms",
      phrases: ["natural rhythm", "speech rhythm", "sense of rhythm"]
    }
  },
  practice: {
    word: "practice",
    phonetic: "/ˈpræktɪs/",
    audioText: "practice",
    chinese: "练习；实践",
    english: "The repeated exercise of an activity in order to improve.",
    example: "Small daily practice is more powerful than rare long sessions.",
    forms: {
      pastTense: "practiced",
      pastParticiple: "practiced",
      presentParticiple: "practicing",
      thirdPerson: "practices",
      phrases: ["daily practice", "best practice", "practice speaking"]
    }
  }
};

export function getMockWordDefinition(text: string): WordDefinition {
  const key = normalizeWord(text);

  return (
    dictionary[key] ?? {
      word: key || text,
      phonetic: "/ˈlɜːrnɪŋ/",
      audioText: key || text,
      chinese: "模拟释义：与视频语境相关的英文词汇",
      english:
        "Mock dictionary data for the MVP. Replace this with a real dictionary API later.",
      example: `Try repeating "${key || text}" aloud and then use it in your own sentence.`,
      forms: {
        plural: `${key}s`,
        pastTense: `${key}ed`,
        pastParticiple: `${key}ed`,
        presentParticiple: `${key}ing`,
        thirdPerson: `${key}s`,
        phrases: [`learn ${key}`, `${key} in context`, `remember ${key}`]
      }
    }
  );
}
