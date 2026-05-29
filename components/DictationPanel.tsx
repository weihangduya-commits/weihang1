"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Ear, RotateCcw } from "lucide-react";
import type { SubtitleCue } from "@/types";

type DictationPanelProps = {
  cue?: SubtitleCue;
  onReplay: () => void;
};

export function DictationPanel({ cue, onReplay }: DictationPanelProps) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAnswer("");
    setChecked(false);
  }, [cue?.id]);

  const score = useMemo(() => {
    if (!cue || !answer.trim()) {
      return 0;
    }

    const expected = normalize(cue.english);
    const actual = normalize(answer);
    const expectedWords = expected.split(" ").filter(Boolean);
    const actualWords = new Set(actual.split(" ").filter(Boolean));
    const matched = expectedWords.filter((word) => actualWords.has(word)).length;

    return Math.round((matched / Math.max(expectedWords.length, 1)) * 100);
  }, [answer, cue]);

  return (
    <section className="glass-panel rounded-[22px] p-3 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] text-lime">
          <Ear className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">听写练习</h2>
          <p className="text-xs text-mist">先听一句，再输入你听到的英文</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-full bg-lime px-3 py-2 text-xs font-semibold text-ink shadow-glow transition hover:brightness-110 disabled:opacity-50"
          onClick={onReplay}
          disabled={!cue}
        >
          <RotateCcw className="h-4 w-4" />
          重听当前句
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/[0.12] disabled:opacity-50"
          onClick={() => setChecked(true)}
          disabled={!cue}
        >
          <CheckCircle2 className="h-4 w-4" />
          检查
        </button>
      </div>

      <textarea
        className="mt-3 h-16 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-5 text-white outline-none transition placeholder:text-mist/50 focus:border-lime/60"
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          setChecked(false);
        }}
        placeholder="Type what you hear..."
      />

      {checked && cue ? (
        <div className="mt-3 rounded-2xl bg-white/[0.05] p-3 text-sm leading-6">
          <p className="font-semibold text-lime">匹配度：{score}%</p>
          <p className="mt-2 text-mist">正确句子：</p>
          <p className="text-white">{cue.english}</p>
        </div>
      ) : null}
    </section>
  );
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
