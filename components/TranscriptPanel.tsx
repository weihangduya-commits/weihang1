"use client";

import { Play, ScrollText } from "lucide-react";
import type { SubtitleCue, SubtitleDisplayMode } from "@/types";
import { normalizeWord, splitSubtitleIntoTokens } from "@/lib/subtitleParser";

type TranscriptPanelProps = {
  cues: SubtitleCue[];
  activeCueId?: string;
  displayMode: SubtitleDisplayMode;
  isOpen: boolean;
  selectedWord?: string | null;
  onToggleOpen: () => void;
  onCueSelect: (cue: SubtitleCue) => void;
  onWordClick: (word: string) => void;
};

export function TranscriptPanel({
  cues,
  activeCueId,
  displayMode,
  isOpen,
  selectedWord,
  onToggleOpen,
  onCueSelect,
  onWordClick
}: TranscriptPanelProps) {
  return (
    <aside className="glass-panel h-fit rounded-[28px] p-4 shadow-card xl:sticky xl:top-5">
      <button
        className="mb-4 flex w-full items-center justify-between gap-3 rounded-2xl px-1 text-left"
        onClick={onToggleOpen}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] text-lime">
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-white">完整字幕</h2>
            <p className="text-sm text-mist">
              {isOpen ? "点一句跳转播放，点单词查含义" : "点击展开所有字幕"}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-mist">
          {isOpen ? "收起" : "展开"}
        </div>
      </button>

      {isOpen && <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
        {cues.map((cue) => {
          const isActive = cue.id === activeCueId;

          return (
            <article
              key={cue.id}
              className={[
                "rounded-2xl p-3 ring-1 transition",
                isActive
                  ? "bg-lime/12 ring-lime/40"
                  : "bg-white/[0.04] ring-white/10 hover:bg-white/[0.07]"
              ].join(" ")}
            >
              <button
                className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-mist transition hover:bg-lime hover:text-ink"
                onClick={() => onCueSelect(cue)}
              >
                <Play className="h-3.5 w-3.5" />
                {formatTime(cue.start)}
              </button>

              {(displayMode === "english" || displayMode === "bilingual") && (
                <p className="text-sm font-medium leading-6 text-white">
                  {splitSubtitleIntoTokens(cue.english).map((token, index) => {
                    const normalized = normalizeWord(token);
                    const isWord = /^[a-z]+(?:'[a-z]+)?$/i.test(token);
                    const isSelected = normalized && normalized === selectedWord;

                    if (!isWord) {
                      return <span key={`${cue.id}-${token}-${index}`}>{token}</span>;
                    }

                    return (
                      <button
                        key={`${cue.id}-${token}-${index}`}
                        className={[
                          "rounded-md px-1 transition hover:bg-lime/15 hover:text-lime",
                          isSelected ? "bg-lime text-ink" : ""
                        ].join(" ")}
                        onClick={() => onWordClick(normalized)}
                      >
                        {token}
                      </button>
                    );
                  })}
                </p>
              )}

              {(displayMode === "chinese" || displayMode === "bilingual") && (
                <p
                  className={[
                    "leading-6 text-mist",
                    displayMode === "chinese" ? "text-sm font-medium" : "mt-1 text-xs"
                  ].join(" ")}
                >
                  {cue.chinese ?? "暂无中文字幕"}
                </p>
              )}
            </article>
          );
        })}
      </div>}
    </aside>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
