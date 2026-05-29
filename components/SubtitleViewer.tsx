"use client";

import { motion } from "framer-motion";
import type { SubtitleCue, SubtitleDisplayMode } from "@/types";
import { normalizeWord, splitSubtitleIntoTokens } from "@/lib/subtitleParser";

type SubtitleViewerProps = {
  cue?: SubtitleCue;
  displayMode: SubtitleDisplayMode;
  isVisible: boolean;
  selectedWord?: string | null;
  onDisplayModeChange: (mode: SubtitleDisplayMode) => void;
  onToggleVisible: () => void;
  onWordClick: (word: string) => void;
};

export function SubtitleViewer({
  cue,
  displayMode,
  isVisible,
  selectedWord,
  onDisplayModeChange,
  onToggleVisible,
  onWordClick
}: SubtitleViewerProps) {
  const englishText = cue?.english ?? "Load a video and subtitles to begin.";
  const chineseText = cue?.chinese ?? "暂无中文字幕";
  const tokens = splitSubtitleIntoTokens(englishText);
  const modeOptions: Array<{ label: string; value: SubtitleDisplayMode }> = [
    { label: "英文", value: "english" },
    { label: "中文", value: "chinese" },
    { label: "双语", value: "bilingual" }
  ];

  return (
    <motion.section
      className="glass-panel min-h-[112px] rounded-[22px] p-3 shadow-card md:p-4"
      layout
    >
      <div className="mb-2 flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime">
            Now Playing
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-white">当前字幕</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="grid grid-cols-3 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  displayMode === option.value
                    ? "bg-lime text-ink"
                    : "text-mist hover:text-white"
                ].join(" ")}
                onClick={() => onDisplayModeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-mist">
            {cue ? `${cue.start.toFixed(1)}s - ${cue.end.toFixed(1)}s` : "Ready"}
          </div>
          <button
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-mist transition hover:bg-white/[0.09] hover:text-white"
            onClick={onToggleVisible}
          >
            {isVisible ? "隐藏字幕" : "显示字幕"}
          </button>
        </div>
      </div>

      {!isVisible ? (
        <div className="grid min-h-[48px] place-items-center rounded-2xl bg-white/[0.04] text-sm font-medium text-mist ring-1 ring-white/10">
          字幕已遮盖，点击“显示字幕”恢复
        </div>
      ) : null}

      {isVisible && (displayMode === "english" || displayMode === "bilingual") && (
        <motion.p
          key={cue?.id ?? "empty"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-pretty text-lg font-semibold leading-snug text-white md:text-2xl md:leading-snug"
        >
          {tokens.map((token, index) => {
            const normalized = normalizeWord(token);
            const isWord = /^[a-z]+(?:'[a-z]+)?$/i.test(token);
            const isSelected = normalized && normalized === selectedWord;

            if (!isWord) {
              return <span key={`${token}-${index}`}>{token}</span>;
            }

            return (
              <button
                key={`${token}-${index}`}
                className={[
                  "mx-0.5 rounded-lg px-1.5 py-0.5 text-left transition duration-200",
                  "hover:bg-lime/15 hover:text-lime focus:outline-none focus:ring-2 focus:ring-lime/50",
                  isSelected
                    ? "bg-lime text-ink shadow-glow"
                    : "text-white decoration-white/20 underline-offset-4 hover:underline"
                ].join(" ")}
                onClick={() => onWordClick(normalized)}
              >
                {token}
              </button>
            );
          })}
        </motion.p>
      )}

      {isVisible && (displayMode === "chinese" || displayMode === "bilingual") && (
        <motion.p
          key={`${cue?.id ?? "empty"}-zh`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={[
            "text-pretty font-medium leading-snug text-mist",
            displayMode === "chinese"
              ? "text-lg md:text-2xl"
              : "mt-1 text-sm md:text-lg"
          ].join(" ")}
        >
          {chineseText}
        </motion.p>
      )}
    </motion.section>
  );
}
