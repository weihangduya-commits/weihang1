import type { SubtitleCue } from "@/types";

const timestampPattern =
  /(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})/;

function parseTimestamp(value: string): number {
  const match = value.trim().match(timestampPattern);

  if (!match) {
    return 0;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const milliseconds = Number(match[4]);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

function normalizeSubtitle(input: string): string {
  return input
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/^WEBVTT.*\n/i, "")
    .replace(/^NOTE[\s\S]*?(?=\n\n)/gim, "");
}

const mockTranslations: Record<string, string> = {
  "Curiosity is the engine of language learning.":
    "好奇心是语言学习的引擎。",
  "When you notice rhythm, words become easier to remember.":
    "当你注意到节奏时，单词会变得更容易记住。",
  "Practice with short videos and listen for natural pronunciation.":
    "用短视频练习，并留意自然的发音。",
  "Click any word to build your personal vocabulary.":
    "点击任意单词，建立你的个人词汇库。"
};

function isChineseLine(line: string): boolean {
  return /[\u4e00-\u9fff]/.test(line);
}

function normalizeCaptionText(lines: string[]): {
  text: string;
  english: string;
  chinese?: string;
} {
  const contentLines = lines
    .map((line) => line.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
  const english = contentLines.filter((line) => !isChineseLine(line)).join(" ");
  const chineseFromFile = contentLines.filter(isChineseLine).join(" ");
  const text = english || contentLines.join(" ");

  return {
    text,
    english: text,
    chinese: chineseFromFile || mockTranslations[text]
  };
}

export function parseSubtitleFile(input: string): SubtitleCue[] {
  const blocks = normalizeSubtitle(input)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim());
      const timingIndex = lines.findIndex((line) => line.includes("-->"));

      if (timingIndex === -1) {
        return null;
      }

      const [startRaw, endRaw] = lines[timingIndex].split("-->");
      const captions = normalizeCaptionText(lines.slice(timingIndex + 1));

      return {
        id: lines[0] && timingIndex > 0 ? lines[0] : String(index + 1),
        start: parseTimestamp(startRaw),
        end: parseTimestamp(endRaw),
        ...captions
      };
    })
    .filter((cue): cue is SubtitleCue => Boolean(cue && cue.text));
}

export function splitSubtitleIntoTokens(text: string): string[] {
  return text.match(/[A-Za-z]+(?:'[A-Za-z]+)?|[^A-Za-z]+/g) ?? [];
}

export function normalizeWord(text: string): string {
  return text.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, "");
}
