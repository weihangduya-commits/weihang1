"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Upload } from "lucide-react";

type AdminVideo = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  video_url: string;
  subtitle_url: string;
  published: boolean;
};

export function AdminVideosPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [message, setMessage] = useState("");

  async function refresh() {
    const response = await fetch("/api/admin/videos");
    setVideos(await response.json());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function uploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/videos", {
      method: "POST",
      body: form
    });
    setMessage(response.ok ? "视频已上传" : "上传失败");
    event.currentTarget.reset();
    await refresh();
  }

  async function updateVideo(video: AdminVideo, patch: Partial<AdminVideo>) {
    const response = await fetch(`/api/admin/videos/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: patch.title ?? video.title,
        description: patch.description ?? video.description,
        difficulty: patch.difficulty ?? video.difficulty,
        category: patch.category ?? video.category,
        videoUrl: patch.video_url ?? video.video_url,
        subtitleUrl: patch.subtitle_url ?? video.subtitle_url,
        published: patch.published ?? video.published
      })
    });
    setMessage(response.ok ? "视频已更新" : "更新失败");
    await refresh();
  }

  async function deleteVideo(id: string) {
    if (!window.confirm("确定删除这个视频吗？")) {
      return;
    }

    await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <main className="h-screen overflow-hidden px-4 text-white md:px-8">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">视频与字幕管理</h1>
          <p className="text-sm text-mist">上传、编辑、发布或下架视频</p>
        </div>
        <div className="flex gap-3">
          <Link className="rounded-full bg-white/[0.06] px-4 py-2 text-sm" href="/admin">
            后台首页
          </Link>
          <Link className="rounded-full bg-white/[0.06] px-4 py-2 text-sm" href="/">
            前台
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid h-[calc(100vh-92px)] max-w-7xl gap-5 overflow-hidden xl:grid-cols-[380px_minmax(0,1fr)]">
        <form className="glass-panel h-fit rounded-[28px] p-5 shadow-card" onSubmit={uploadVideo}>
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Upload className="h-5 w-5 text-lime" />
            上传视频
          </h2>
          <input className="admin-input" name="title" placeholder="视频标题" required />
          <textarea className="admin-input mt-3 min-h-20" name="description" placeholder="简介" />
          <input className="admin-input mt-3" name="difficulty" placeholder="难度，例如 Beginner" required />
          <input className="admin-input mt-3" name="category" placeholder="分类，例如 体育" required />
          <label className="mt-3 block text-sm text-mist">视频文件</label>
          <input className="admin-input mt-2" name="video" type="file" accept="video/*" required />
          <label className="mt-3 block text-sm text-mist">字幕文件 .vtt / .srt</label>
          <input className="admin-input mt-2" name="subtitle" type="file" accept=".vtt,.srt,text/vtt,text/plain" required />
          <label className="mt-3 flex items-center gap-2 text-sm text-mist">
            <input name="published" type="checkbox" />
            上传后立即发布
          </label>
          <button className="mt-4 w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink">
            上传
          </button>
          {message ? <p className="mt-3 text-sm text-lime">{message}</p> : null}
        </form>

        <div className="space-y-4 overflow-y-auto pr-1">
          {videos.map((video) => (
            <article key={video.id} className="glass-panel rounded-[24px] p-4 shadow-card">
              <div className="grid gap-3 md:grid-cols-2">
                <input className="admin-input" defaultValue={video.title} onBlur={(event) => updateVideo(video, { title: event.target.value })} />
                <input className="admin-input" defaultValue={video.category} onBlur={(event) => updateVideo(video, { category: event.target.value })} />
                <input className="admin-input" defaultValue={video.difficulty} onBlur={(event) => updateVideo(video, { difficulty: event.target.value })} />
                <input className="admin-input" defaultValue={video.video_url} onBlur={(event) => updateVideo(video, { video_url: event.target.value })} />
                <input className="admin-input md:col-span-2" defaultValue={video.subtitle_url} onBlur={(event) => updateVideo(video, { subtitle_url: event.target.value })} />
                <textarea className="admin-input min-h-20 md:col-span-2" defaultValue={video.description} onBlur={(event) => updateVideo(video, { description: event.target.value })} />
              </div>
              <div className="mt-4 flex flex-wrap justify-between gap-3">
                <button
                  className={video.published ? "rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white" : "rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink"}
                  onClick={() => updateVideo(video, { published: !video.published })}
                >
                  {video.published ? "下架" : "发布"}
                </button>
                <button className="rounded-full bg-white/[0.06] p-2 text-coral" onClick={() => deleteVideo(video.id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
