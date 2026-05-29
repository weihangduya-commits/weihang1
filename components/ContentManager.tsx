"use client";

import { ChangeEvent } from "react";
import { FileVideo, Link2, Settings2, Subtitles } from "lucide-react";

type ContentManagerProps = {
  videoUrl: string;
  onVideoUpload: (file: File) => void;
  onVideoUrlChange: (url: string) => void;
  onSubtitleUpload: (file: File) => void;
};

export function ContentManager({
  videoUrl,
  onVideoUpload,
  onVideoUrlChange,
  onSubtitleUpload
}: ContentManagerProps) {
  function handleVideoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onVideoUpload(file);
    }
  }

  function handleSubtitleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onSubtitleUpload(file);
    }
  }

  return (
    <section className="glass-panel rounded-[28px] p-4 shadow-card">
      <div className="mb-4 flex items-center gap-3 px-1">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] text-lime">
          <Settings2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-white">内容管理</h2>
          <p className="text-sm text-mist">上传视频与字幕，不占用学习播放器区域</p>
        </div>
      </div>

      <label className="flex min-w-0 items-center gap-2 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-mist ring-1 ring-white/10 transition focus-within:ring-lime/50">
        <Link2 className="h-4 w-4 shrink-0 text-lime" />
        <input
          className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-mist/50"
          value={videoUrl}
          onChange={(event) => onVideoUrlChange(event.target.value)}
          placeholder="Paste a sample video URL"
          aria-label="Video URL"
        />
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/[0.1]">
          <FileVideo className="h-4 w-4 text-coral" />
          上传本地视频
          <input
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={handleVideoFile}
          />
        </label>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-lime px-4 py-3 text-sm font-semibold text-ink shadow-glow transition hover:brightness-110">
          <Subtitles className="h-4 w-4" />
          上传字幕文件
          <input
            type="file"
            accept=".vtt,.srt,text/vtt,text/plain"
            className="sr-only"
            onChange={handleSubtitleFile}
          />
        </label>
      </div>
    </section>
  );
}
