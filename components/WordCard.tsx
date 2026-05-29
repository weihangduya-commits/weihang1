"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, Volume2, X } from "lucide-react";
import type { WordDefinition } from "@/types";

type WordCardProps = {
  word: WordDefinition | null;
  isOpen: boolean;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (word: string) => void;
};

const formLabels: Record<string, string> = {
  plural: "复数",
  pastTense: "过去式",
  pastParticiple: "过去分词",
  presentParticiple: "现在分词",
  thirdPerson: "第三人称单数"
};

export function WordCard({
  word,
  isOpen,
  isSaved,
  onClose,
  onToggleSave
}: WordCardProps) {
  function speak() {
    if (!word || typeof window === "undefined") {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.audioText);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }

  const formEntries = word
    ? Object.entries(word.forms).filter(
        ([key, value]) => key !== "phrases" && Boolean(value)
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && word ? (
        <motion.div
          className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-xl md:bottom-8 md:right-8 md:left-auto md:mx-0"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          transition={{ type: "spring", damping: 24, stiffness: 260 }}
        >
          <div className="rounded-[28px] border border-white/12 bg-[#111827]/95 p-5 shadow-card backdrop-blur-2xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-3xl font-bold tracking-normal text-white">
                    {word.word}
                  </h3>
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-mist">
                    {word.phonetic}
                  </span>
                </div>
                <p className="mt-2 text-base font-medium text-lime">
                  {word.chinese}
                </p>
              </div>

              <button
                className="rounded-full bg-white/[0.06] p-2 text-mist transition hover:bg-white/[0.12] hover:text-white"
                onClick={onClose}
                aria-label="Close word card"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink shadow-glow transition hover:brightness-110"
                onClick={speak}
              >
                <Volume2 className="h-4 w-4" />
                发音
              </button>
              <motion.button
                className={[
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
                  isSaved
                    ? "bg-coral text-white ring-coral/50"
                    : "bg-white/[0.06] text-white ring-white/10 hover:bg-white/[0.12]"
                ].join(" ")}
                onClick={() => onToggleSave(word.word)}
                whileTap={{ scale: 0.92 }}
              >
                {isSaved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {isSaved ? "已收藏" : "收藏单词"}
              </motion.button>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-white/[0.05] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mist">
                  Definition
                </p>
                <p className="mt-2 text-sm leading-6 text-white/90">{word.english}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.05] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mist">
                  Example
                </p>
                <p className="mt-2 text-sm leading-6 text-white/90">{word.example}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {formEntries.map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-mist"
                >
                  {formLabels[key] ?? key}:{" "}
                  <strong className="font-semibold text-white">{String(value)}</strong>
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {word.forms.phrases.map((phrase) => (
                <span
                  key={phrase}
                  className="rounded-full bg-lime/10 px-3 py-1.5 text-xs font-medium text-lime"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
