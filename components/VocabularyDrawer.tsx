"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpenCheck, GripHorizontal, X } from "lucide-react";

export type SavedWordEntry = {
  word: string;
  savedAt: string;
};

type VocabularyDrawerProps = {
  words: SavedWordEntry[];
  isOpen: boolean;
  onClose: () => void;
  onWordClick: (word: string) => void;
};

const reviewGroups = [
  { label: "1 天前", minDays: 0, maxDays: 1 },
  { label: "3 天前", minDays: 1, maxDays: 3 },
  { label: "一周前", minDays: 3, maxDays: 7 },
  { label: "更早", minDays: 7, maxDays: Infinity }
];

export function VocabularyDrawer({
  words,
  isOpen,
  onClose,
  onWordClick
}: VocabularyDrawerProps) {
  const groupedWords = reviewGroups.map((group) => ({
    ...group,
    words: words.filter((entry) => {
      const days = getAgeInDays(entry.savedAt);
      return days >= group.minDays && days < group.maxDays;
    })
  }));

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          className="fixed bottom-5 right-4 z-40 w-[calc(100vw-2rem)] max-w-lg cursor-default rounded-[28px] border border-white/12 bg-[#111827]/95 p-5 shadow-card backdrop-blur-2xl md:bottom-8 md:right-8"
          drag
          dragMomentum={false}
          initial={{ opacity: 0, x: 28, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, y: 12, scale: 0.97 }}
          transition={{ type: "spring", damping: 24, stiffness: 260 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] text-lime">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">我的生词本</h2>
                  <GripHorizontal className="h-4 w-4 text-mist" />
                </div>
                <p className="text-sm text-mist">拖动浮窗，按复习时间查看收藏</p>
              </div>
            </div>

            <button
              className="rounded-full bg-white/[0.06] p-2 text-mist transition hover:bg-white/[0.12] hover:text-white"
              onClick={onClose}
              aria-label="Close vocabulary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 max-h-[420px] space-y-4 overflow-y-auto pr-1">
            {words.length ? (
              groupedWords.map((group) => (
                <section
                  key={group.label}
                  className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      {group.label}
                    </h3>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-mist">
                      {group.words.length}
                    </span>
                  </div>

                  {group.words.length ? (
                    <div className="flex flex-wrap gap-2">
                      {group.words.map((entry) => (
                        <button
                          key={`${group.label}-${entry.word}`}
                          className="rounded-full bg-white/[0.06] px-3 py-2 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-lime hover:text-ink"
                          onClick={() => onWordClick(entry.word)}
                        >
                          {entry.word}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-mist">这个复习区暂时没有单词。</p>
                  )}
                </section>
              ))
            ) : (
              <p className="rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-mist">
                还没有收藏单词。点击字幕中的单词，在词卡里收藏后会出现在这里。
              </p>
            )}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function getAgeInDays(savedAt: string): number {
  const savedTime = new Date(savedAt).getTime();

  if (Number.isNaN(savedTime)) {
    return 0;
  }

  return Math.max(0, (Date.now() - savedTime) / 86400000);
}
