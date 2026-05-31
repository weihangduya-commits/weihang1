import type { WordDefinition } from "@/types";
import { getKnownChinese } from "@/lib/onlineDictionary";
import { normalizeWord } from "@/lib/subtitleParser";

const dictionary: Record<string, WordDefinition> = {
  context: {
    word: "context",
    phonetic: "/KON-tekst/",
    audioText: "context",
    chinese: "\u4e0a\u4e0b\u6587\uff1b\u8bed\u5883\uff1b\u80cc\u666f",
    english: "The situation, text, or information around something that helps you understand its meaning.",
    example: "You can guess many new words from the context of the sentence.",
    forms: {
      plural: "contexts",
      phrases: ["in context", "cultural context", "understand the context"]
    }
  },
  curiosity: {
    word: "curiosity",
    phonetic: "/kyoor-ee-AH-suh-tee/",
    audioText: "curiosity",
    chinese: "\u597d\u5947\u5fc3\uff1b\u6c42\u77e5\u6b32",
    english: "A strong desire to know or learn something.",
    example: "Curiosity helps learners notice patterns in a new language.",
    forms: {
      plural: "curiosities",
      phrases: ["spark curiosity", "natural curiosity", "intellectual curiosity"]
    }
  },
  language: {
    word: "language",
    phonetic: "/LANG-gwij/",
    audioText: "language",
    chinese: "\u8bed\u8a00\uff1b\u8868\u8fbe\u65b9\u5f0f",
    english: "A system of communication used by a country, community, or group of people.",
    example: "Video gives language a real voice and rhythm.",
    forms: {
      plural: "languages",
      phrases: ["body language", "target language", "language learning"]
    }
  },
  notice: {
    word: "notice",
    phonetic: "/NOH-tis/",
    audioText: "notice",
    chinese: "\u6ce8\u610f\u5230\uff1b\u5bdf\u89c9",
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
    phonetic: "/RITH-uhm/",
    audioText: "rhythm",
    chinese: "\u8282\u594f\uff1b\u97f5\u5f8b",
    english: "A regular pattern of sounds, movements, or events.",
    example: "Listening for rhythm makes spoken English easier to follow.",
    forms: {
      plural: "rhythms",
      phrases: ["natural rhythm", "speech rhythm", "sense of rhythm"]
    }
  },
  practice: {
    word: "practice",
    phonetic: "/PRAK-tis/",
    audioText: "practice",
    chinese: "\u7ec3\u4e60\uff1b\u5b9e\u8df5",
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
    chinese:
      getKnownChinese(word) ||
      "\u8be5\u8bcd\u6682\u672a\u6536\u5f55\u5230\u8bcd\u5e93\uff0c\u53ef\u5728\u540e\u53f0\u5355\u8bcd\u7ba1\u7406\u4e2d\u8865\u5145\u91ca\u4e49\u3002",
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
