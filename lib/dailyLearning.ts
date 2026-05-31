export type DailyLesson = {
  dateKey: string;
  sentences: string[];
  words: string[];
};

const sentenceBank = [
  "Could you say that again?",
  "I am working on my English.",
  "That sounds good to me.",
  "Let me think about it.",
  "What do you usually do after work?",
  "I did not catch the last part.",
  "Could you give me an example?",
  "That is a useful way to explain it.",
  "I want to improve my listening skills.",
  "Please speak a little more slowly.",
  "I learned a new phrase today.",
  "This sentence sounds natural.",
  "I need more practice with pronunciation.",
  "Can you explain the context?",
  "I will review these words later.",
  "The speaker uses a very clear rhythm.",
  "I understand the main idea now.",
  "Let us try another short video.",
  "This word appears often in interviews.",
  "I feel more confident when I repeat aloud."
];

const wordBank = [
  "context",
  "confidence",
  "improve",
  "listen",
  "repeat",
  "example",
  "natural",
  "pronunciation",
  "interview",
  "explain",
  "review",
  "sentence",
  "rhythm",
  "useful",
  "understand",
  "phrase",
  "speaker",
  "practice",
  "memory",
  "meaning"
];

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayNumber(date: Date) {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
}

function rotate<T>(items: T[], start: number, count: number) {
  return Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
}

export function getDailyLesson(date = new Date()): DailyLesson {
  const day = dayNumber(date);
  return {
    dateKey: dateKey(date),
    sentences: rotate(sentenceBank, (day * 5) % sentenceBank.length, 5),
    words: rotate(wordBank, (day * 7) % wordBank.length, 10)
  };
}
