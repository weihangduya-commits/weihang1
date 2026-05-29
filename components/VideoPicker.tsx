"use client";

import { PlayCircle } from "lucide-react";
import type { VideoLibraryItem } from "@/lib/sampleConfig";

type VideoPickerProps = {
  videos: VideoLibraryItem[];
  activeVideoId: string;
  onSelectVideo: (video: VideoLibraryItem) => void;
};

export function VideoPicker({
  videos,
  activeVideoId,
  onSelectVideo
}: VideoPickerProps) {
  return (
    <section className="glass-panel rounded-[28px] p-4 shadow-card">
      <div className="mb-4 px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime">
          Playlist
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">选择视频</h2>
      </div>

      <div className="space-y-3">
        {videos.map((video) => {
          const isActive = video.id === activeVideoId;

          return (
            <button
              key={video.id}
              className={[
                "flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 transition",
                isActive
                  ? "bg-lime text-ink shadow-glow ring-lime/60"
                  : "bg-white/[0.04] text-white ring-white/10 hover:bg-white/[0.08]"
              ].join(" ")}
              onClick={() => onSelectVideo(video)}
            >
              <span
                className={[
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                  isActive ? "bg-ink/10 text-ink" : "bg-white/[0.06] text-lime"
                ].join(" ")}
              >
                <PlayCircle className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{video.title}</span>
                <span
                  className={[
                    "mt-0.5 block text-xs",
                    isActive ? "text-ink/70" : "text-mist"
                  ].join(" ")}
                >
                  {video.level} · {video.duration}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
