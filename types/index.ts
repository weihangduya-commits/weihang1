export type SubtitleCue = {
  id: string;
  start: number;
  end: number;
  text: string;
  english: string;
  chinese?: string;
};

export type SubtitleDisplayMode = "english" | "chinese" | "bilingual";

export type WordForms = {
  plural?: string;
  pastTense?: string;
  pastParticiple?: string;
  presentParticiple?: string;
  thirdPerson?: string;
  phrases: string[];
};

export type WordDefinition = {
  word: string;
  phonetic: string;
  audioText: string;
  chinese: string;
  english: string;
  example: string;
  forms: WordForms;
};

export type SampleConfig = {
  title: string;
  videoUrl: string;
  subtitleUrl: string;
};
