"use client";

import { FormEvent, useEffect, useState } from "react";
import { Edit3, FileText, Trash2, Upload } from "lucide-react";
import { srtToVtt } from "@/lib/subtitleFormat";
import {
  adminApi,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Panel,
  SkeletonRows,
  useToast
} from "@/components/admin/AdminUi";

type Video = { id: string; title: string };
type Subtitle = {
  id: string;
  title: string;
  language: string;
  content: string;
  file_url: string;
  video_id: string | null;
  video?: Video | null;
};

export function AdminSubtitlesManager() {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState("");
  const [editing, setEditing] = useState<Subtitle | null>(null);
  const [deleting, setDeleting] = useState<Subtitle | null>(null);
  const { showToast, ToastNode } = useToast();

  async function refresh() {
    setLoading(true);
    const [subtitleResult, videoResult] = await Promise.all([
      adminApi<Subtitle[]>("/api/admin/subtitles"),
      adminApi<Video[]>("/api/admin/videos")
    ]);
    if (subtitleResult.ok && subtitleResult.data) setSubtitles(subtitleResult.data);
    if (videoResult.ok && videoResult.data) setVideos(videoResult.data);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setPreview(file.name.toLowerCase().endsWith(".srt") ? srtToVtt(text) : text);
  }

  async function uploadSubtitle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await adminApi<Subtitle>("/api/admin/subtitles", {
      method: "POST",
      body: form
    });
    if (result.ok) {
      showToast("success", result.message ?? "字幕已上传");
      event.currentTarget.reset();
      setPreview("");
      await refresh();
    } else {
      showToast("error", result.error ?? "上传失败");
    }
  }

  async function updateSubtitle(subtitle: Subtitle, payload: Partial<Subtitle>) {
    const result = await adminApi<Subtitle>(`/api/admin/subtitles/${subtitle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: payload.title,
        videoId: payload.video_id,
        language: payload.language,
        content: payload.content
      })
    });
    if (result.ok) {
      showToast("success", "字幕已更新");
      setEditing(null);
      await refresh();
    } else {
      showToast("error", result.error ?? "更新失败");
    }
  }

  async function deleteSubtitle(subtitle: Subtitle) {
    const result = await adminApi(`/api/admin/subtitles/${subtitle.id}`, { method: "DELETE" });
    if (result.ok) {
      showToast("success", "字幕已删除");
      await refresh();
    } else {
      showToast("error", result.error ?? "删除失败");
    }
  }

  return (
    <div className="space-y-6">
      {ToastNode}
      <PageHeader title="字幕管理" description="上传、预览、转换、编辑字幕，并绑定到指定视频。" />

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel className="h-fit p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Upload className="h-4 w-4 text-lime" />
            上传字幕
          </h2>
          <form className="space-y-3" onSubmit={uploadSubtitle}>
            <input className="admin-input" name="title" placeholder="字幕标题" required />
            <select className="admin-input" name="videoId" defaultValue="">
              <option value="">不绑定视频</option>
              {videos.map((video) => <option key={video.id} value={video.id}>{video.title}</option>)}
            </select>
            <input className="admin-input" name="language" defaultValue="en" placeholder="语言，例如 en / zh" />
            <input
              className="admin-input"
              name="subtitle"
              type="file"
              accept=".vtt,.srt,text/vtt,text/plain"
              onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
              required
            />
            <button className="admin-btn admin-btn-primary w-full justify-center" type="submit">
              上传并转换
            </button>
          </form>
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-zinc-300">字幕预览</p>
            <pre className="max-h-72 overflow-auto rounded-xl bg-black/30 p-3 text-xs leading-5 text-zinc-400">
              {preview || "选择 .srt 或 .vtt 文件后会在这里预览。SRT 会自动转换为 WebVTT。"}
            </pre>
          </div>
        </Panel>

        <Panel>
          <div className="border-b border-white/10 p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <FileText className="h-4 w-4 text-lime" />
              字幕列表
            </h2>
          </div>
          {loading ? (
            <SkeletonRows />
          ) : subtitles.length ? (
            <div className="divide-y divide-white/10">
              {subtitles.map((subtitle) => (
                <div key={subtitle.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_180px_150px] lg:items-center">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{subtitle.title}</p>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {subtitle.video?.title ?? "未绑定视频"} · {subtitle.file_url || "仅数据库内容"}
                    </p>
                  </div>
                  <span className="text-sm text-zinc-400">{subtitle.language.toUpperCase()}</span>
                  <div className="flex justify-end gap-2">
                    <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(subtitle)}>
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="admin-btn bg-rose-500/10 text-rose-300" onClick={() => setDeleting(subtitle)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <EmptyState title="还没有字幕" description="上传字幕后可绑定到视频。" />
            </div>
          )}
        </Panel>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
          <form
            className="w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void updateSubtitle(editing, {
                title: String(form.get("title")),
                video_id: String(form.get("videoId")) || null,
                language: String(form.get("language")),
                content: String(form.get("content"))
              });
            }}
          >
            <h2 className="text-lg font-semibold">编辑字幕</h2>
            <div className="mt-4 grid gap-3">
              <input className="admin-input" name="title" defaultValue={editing.title} />
              <select className="admin-input" name="videoId" defaultValue={editing.video_id ?? ""}>
                <option value="">不绑定视频</option>
                {videos.map((video) => <option key={video.id} value={video.id}>{video.title}</option>)}
              </select>
              <input className="admin-input" name="language" defaultValue={editing.language} />
              <textarea className="admin-input min-h-[320px] font-mono text-xs" name="content" defaultValue={editing.content} />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button className="admin-btn admin-btn-ghost" type="button" onClick={() => setEditing(null)}>取消</button>
              <button className="admin-btn admin-btn-primary" type="submit">保存</button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="删除字幕"
        description={`确定删除「${deleting?.title ?? ""}」吗？`}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && void deleteSubtitle(deleting)}
      />
    </div>
  );
}
