import type { WordDefinition } from "@/types";
import { normalizeWord } from "@/lib/subtitleParser";

const dictionary: Record<string, WordDefinition> = {
  context: {
    word: "context",
    phonetic: "/ˈkɑːntekst/",
    audioText: "context",
    chinese: "上下文；语境；背景",
    english: "The situation, text, or information around something that helps you understand its meaning.",
    example: "You can guess many new words from the context of the sentence.",
    forms: {
      plural: "contexts",
      phrases: ["in context", "cultural context", "understand the context"]
    }
  },
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
    english: "A system of communication used by a country, community, or group of people.",
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

function buildFallbackDefinition(text: string): WordDefinition {
  const key = normalizeWord(text);
  const word = key || text.trim();

  return {
    word,
    phonetic: "",
    audioText: word,
    chinese: "该词暂未收录到词库，可在后台单词管理中补充释义。",
    english:
      "This word is not in the built-in dictionary yet. Add a full definition in the admin word library.",
    example: `Try to understand "${word}" from the sentence and add your own example later.`,
    forms: {
      phrases: [`${word} in context`, `learn ${word}`, `review ${word}`]
    }
  };
}

export function getMockWordDefinition(text: string): WordDefinition {
  const key = normalizeWord(text);
  return dictionary[key] ?? buildFallbackDefinition(text);
}
