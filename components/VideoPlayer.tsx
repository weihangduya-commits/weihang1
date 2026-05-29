"use client";

import { RefObject } from "react";
import { Gauge } from "lucide-react";

type VideoPlayerProps = {
  videoRef: RefObject<HTMLVideoElement>;
  videoUrl: string;
  playbackRate: number;
  helpText: string;
  onTimeUpdate: (time: number) => void;
  onPlaybackRateChange: (rate: number) => void;
};

export function VideoPlayer({
  videoRef,
  videoUrl,
  playbackRate,
  helpText,
  onTimeUpdate,
  onPlaybackRateChange
}: VideoPlayerProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-3">
      <div className="min-h-0 flex-1 overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-card">
        <video
          ref={videoRef}
          key={videoUrl}
          className="h-full max-h-[42vh] w-full bg-black object-contain"
          controls
          crossOrigin="anonymous"
          preload="metadata"
          src={videoUrl}
          onTimeUpdate={(event) => onTimeUpdate(event.currentTarget.currentTime)}
        />
      </div>

      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[22px] p-3">
        <p className="px-2 text-sm text-mist">{helpText}</p>
        <label className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-2.5 text-sm text-mist ring-1 ring-white/10">
          <Gauge className="h-4 w-4 shrink-0 text-lime" />
          <input
            className="h-1.5 w-28 accent-lime"
            type="range"
            min="0.2"
            max="2"
            step="0.05"
            value={playbackRate}
            onChange={(event) => onPlaybackRateChange(Number(event.target.value))}
            aria-label="Playback speed"
          />
          <span className="w-12 text-right font-semibold text-white">
            {playbackRate.toFixed(2).replace(/0$/, "")}x
          </span>
        </label>
      </div>
    </section>
  );
}
