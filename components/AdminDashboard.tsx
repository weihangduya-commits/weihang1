"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Database, Trash2, Upload, UserPlus } from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
  _count?: {
    saved_words: number;
    learning_progress: number;
  };
};

type AdminVideo = {
  id: string;
  title: string;
  category: string;
  video_url: string;
  subtitle_url: string;
  created_at: string;
};

type DictionaryWord = {
  id: string;
  word: string;
  phonetic: string;
  chinese: string;
  english: string;
  example: string;
};

export function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [message, setMessage] = useState("");

  async function refresh() {
    const [usersResponse, videosResponse, wordsResponse] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/videos"),
      fetch("/api/admin/words")
    ]);

    setUsers(await usersResponse.json());
    setVideos(await videosResponse.json());
    setWords(await wordsResponse.json());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role")
      })
    });

    setMessage(response.ok ? "用户已创建" : "创建用户失败");
    event.currentTarget.reset();
    await refresh();
  }

  async function resetPassword(userId: string) {
    const password = window.prompt("请输入新密码，至少 8 位");

    if (!password) {
      return;
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setMessage(response.ok ? "密码已重置" : "重置失败");
  }

  async function deleteUser(userId: string) {
    if (!window.confirm("确定删除这个用户吗？")) {
      return;
    }

    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    await refresh();
  }

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

  async function deleteVideo(videoId: string) {
    await fetch(`/api/admin/videos/${videoId}`, { method: "DELETE" });
    await refresh();
  }

  async function saveWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: form.get("word"),
        phonetic: form.get("phonetic"),
        chinese: form.get("chinese"),
        english: form.get("english"),
        example: form.get("example"),
        forms: {
          phrases: String(form.get("phrases") ?? "")
            .split(",")
            .map((phrase) => phrase.trim())
            .filter(Boolean)
        }
      })
    });

    setMessage(response.ok ? "单词已保存" : "保存单词失败");
    event.currentTarget.reset();
    await refresh();
  }

  async function deleteWord(wordId: string) {
    await fetch(`/api/admin/words/${wordId}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <main className="h-screen overflow-hidden px-4 text-white md:px-8">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">管理员后台</h1>
          <p className="text-sm text-mist">用户、视频、字幕、词库与学习记录</p>
        </div>
        <div className="flex gap-3">
          <Link className="rounded-full bg-white/[0.06] px-4 py-2 text-sm" href="/">
            返回前台
          </Link>
          <button
            className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            退出
          </button>
        </div>
      </nav>

      <section className="mx-auto grid h-[calc(100vh-92px)] max-w-7xl gap-5 overflow-hidden xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5 overflow-y-auto pr-1">
          <form className="glass-panel rounded-[28px] p-5 shadow-card" onSubmit={createUser}>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <UserPlus className="h-5 w-5 text-lime" />
              创建用户
            </h2>
            <input className="admin-input" name="email" placeholder="邮箱" type="email" required />
            <input className="admin-input mt-3" name="password" placeholder="密码" type="password" minLength={8} required />
            <select className="admin-input mt-3" name="role" defaultValue="user">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button className="mt-4 w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink">
              创建
            </button>
          </form>

          <form className="glass-panel rounded-[28px] p-5 shadow-card" onSubmit={uploadVideo}>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Upload className="h-5 w-5 text-lime" />
              上传视频和字幕
            </h2>
            <input className="admin-input" name="title" placeholder="视频标题" required />
            <input className="admin-input mt-3" name="category" placeholder="分类，例如 体育" required />
            <label className="mt-3 block text-sm text-mist">视频文件</label>
            <input className="admin-input mt-2" name="video" type="file" accept="video/*" required />
            <label className="mt-3 block text-sm text-mist">字幕文件</label>
            <input className="admin-input mt-2" name="subtitle" type="file" accept=".vtt,.srt,text/vtt,text/plain" required />
            <button className="mt-4 w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink">
              上传
            </button>
          </form>

          <form className="glass-panel rounded-[28px] p-5 shadow-card" onSubmit={saveWord}>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Database className="h-5 w-5 text-lime" />
              管理单词数据
            </h2>
            <input className="admin-input" name="word" placeholder="word" required />
            <input className="admin-input mt-3" name="phonetic" placeholder="音标" />
            <input className="admin-input mt-3" name="chinese" placeholder="中文释义" />
            <textarea className="admin-input mt-3 min-h-20" name="english" placeholder="英英解释" />
            <textarea className="admin-input mt-3 min-h-20" name="example" placeholder="例句" />
            <input className="admin-input mt-3" name="phrases" placeholder="短语，用英文逗号分隔" />
            <button className="mt-4 w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink">
              保存单词
            </button>
          </form>
        </div>

        <div className="grid min-h-0 gap-5 overflow-y-auto pr-1">
          {message ? (
            <div className="rounded-2xl bg-lime/10 px-4 py-3 text-sm font-semibold text-lime">
              {message}
            </div>
          ) : null}

          <section className="glass-panel rounded-[28px] p-5 shadow-card">
            <h2 className="mb-4 font-semibold">所有用户</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{user.email}</p>
                      <p className="text-sm text-mist">
                        {user.role} · 收藏 {user._count?.saved_words ?? 0} · 进度 {user._count?.learning_progress ?? 0}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-full bg-white/[0.06] px-3 py-2 text-xs" onClick={() => resetPassword(user.id)}>
                        重置密码
                      </button>
                      <button className="rounded-full bg-coral px-3 py-2 text-xs font-semibold text-white" onClick={() => deleteUser(user.id)}>
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[28px] p-5 shadow-card">
            <h2 className="mb-4 font-semibold">视频列表</h2>
            <div className="space-y-3">
              {videos.map((video) => (
                <div key={video.id} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{video.title}</p>
                      <p className="text-sm text-mist">{video.category}</p>
                      <p className="truncate text-xs text-mist">{video.video_url}</p>
                    </div>
                    <button className="rounded-full bg-coral p-2 text-white" onClick={() => deleteVideo(video.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[28px] p-5 shadow-card">
            <h2 className="mb-4 font-semibold">词库</h2>
            <div className="flex flex-wrap gap-2">
              {words.map((word) => (
                <button key={word.id} className="rounded-full bg-white/[0.06] px-3 py-2 text-sm" onClick={() => deleteWord(word.id)}>
                  {word.word}
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
