"use client";

import { useMemo } from "react";
import { BookOpenCheck, Headphones, UserRound } from "lucide-react";
import { getDailyLesson } from "@/lib/dailyLearning";

type PersonalPanelProps = {
  savedCount: number;
  onOpenVocabulary: () => void;
  onPracticeWord: (word: string) => void;
};

export function PersonalPanel({
  savedCount,
  onOpenVocabulary,
  onPracticeWord
}: PersonalPanelProps) {
  const dailyLesson = useMemo(() => getDailyLesson(), []);

  function speak(text: string) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className="glass-panel rounded-[28px] p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-ink shadow-glow">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-white">个人学习</h2>
          <p className="truncate text-sm text-mist">
            每日更新 · {dailyLesson.dateKey}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-3 py-2.5 text-left text-sm text-white ring-1 ring-white/10 transition hover:bg-white/[0.09]"
          onClick={onOpenVocabulary}
        >
          <span className="inline-flex items-center gap-2 font-semibold">
            <BookOpenCheck className="h-4 w-4 text-coral" />
            我的生词本
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {savedCount}
          </span>
        </button>

        <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
            Daily Word Drill
          </p>
          <div className="flex flex-wrap gap-2">
            {dailyLesson.words.map((word) => (
              <button
                key={word}
                className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-lime hover:text-ink"
                onClick={() => onPracticeWord(word)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
            <Headphones className="h-4 w-4" />
            Daily Listening
          </div>
          <div className="space-y-2">
            {dailyLesson.sentences.map((sentence) => (
              <button
                key={sentence}
                className="w-full rounded-xl bg-white/[0.04] px-3 py-2 text-left text-xs leading-5 text-mist transition hover:bg-white/[0.08] hover:text-white"
                onClick={() => speak(sentence)}
              >
                {sentence}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
