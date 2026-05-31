"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Check, Edit3, Plus, Trash2, Upload } from "lucide-react";
import {
  adminApi,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Panel,
  SearchBox,
  SkeletonRows,
  StatusBadge,
  useToast
} from "@/components/admin/AdminUi";

type Video = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  status: string;
  video_url: string;
  subtitle_url: string;
  created_at: string;
};

const difficulties = ["all", "A1", "A2", "B1", "B2", "C1"];
const statuses = [
  { value: "all", label: "全部" },
  { value: "published", label: "已发布" },
  { value: "draft", label: "草稿" },
  { value: "archived", label: "已下架" }
];

export function AdminVideosManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [editing, setEditing] = useState<Video | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<Video | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showToast, ToastNode } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status !== "all") params.set("status", status);
    if (difficulty !== "all") params.set("difficulty", difficulty);
    const result = await adminApi<Video[]>(`/api/admin/videos?${params.toString()}`);
    if (result.ok && result.data) {
      setVideos(result.data);
    } else {
      showToast("error", result.error ?? "加载视频失败");
    }
    setLoading(false);
  }, [difficulty, query, showToast, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 250);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const allChecked = useMemo(() => videos.length > 0 && selected.length === videos.length, [videos, selected]);

  async function uploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setUploadProgress(12);
    const timer = window.setInterval(() => {
      setUploadProgress((value) => Math.min(value + 12, 88));
    }, 220);

    const result = await adminApi<Video>("/api/admin/videos", {
      method: "POST",
      body: form
    });

    window.clearInterval(timer);
    setUploadProgress(100);
    window.setTimeout(() => setUploadProgress(0), 700);

    if (result.ok) {
      showToast("success", result.message ?? "视频已上传");
      event.currentTarget.reset();
      await refresh();
    } else {
      showToast("error", result.error ?? "上传失败");
    }
  }

  async function patchVideo(video: Video, patch: Partial<Video>) {
    const result = await adminApi<Video>(`/api/admin/videos/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: patch.title,
        description: patch.description,
        difficulty: patch.difficulty,
        category: patch.category,
        videoUrl: patch.video_url,
        subtitleUrl: patch.subtitle_url,
        status: patch.status
      })
    });

    if (result.ok) {
      showToast("success", result.message ?? "视频已更新");
      setEditing(null);
      await refresh();
    } else {
      showToast("error", result.error ?? "更新失败");
    }
  }

  async function deleteVideo(video: Video) {
    const result = await adminApi(`/api/admin/videos/${video.id}`, { method: "DELETE" });
    if (result.ok) {
      showToast("success", "视频已删除");
      await refresh();
    } else {
      showToast("error", result.error ?? "删除失败");
    }
  }

  async function bulkUpdate(nextStatus: string) {
    await Promise.all(
      selected.map((id) => {
        const video = videos.find((item) => item.id === id);
        return video ? patchVideo(video, { status: nextStatus }) : Promise.resolve();
      })
    );
    setSelected([]);
  }

  return (
    <div className="space-y-6">
      {ToastNode}
      <PageHeader
        title="视频管理"
        description="上传、搜索、编辑、发布或下架学习视频。普通用户只会看到已发布视频。"
        action={
          <div className="flex gap-2">
            <button className="admin-btn admin-btn-ghost" disabled={!selected.length} onClick={() => void bulkUpdate("archived")}>
              <Archive className="h-4 w-4" />
              批量下架
            </button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Panel className="h-fit p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Upload className="h-4 w-4 text-lime" />
            上传视频
          </h2>
          <form className="space-y-3" onSubmit={uploadVideo}>
            <input className="admin-input" name="title" placeholder="视频标题" required />
            <textarea className="admin-input min-h-20" name="description" placeholder="简介" />
            <div className="grid grid-cols-2 gap-3">
              <select className="admin-input" name="difficulty" defaultValue="A1">
                {difficulties.filter((item) => item !== "all").map((item) => <option key={item}>{item}</option>)}
              </select>
              <input className="admin-input" name="category" placeholder="分类" defaultValue="教育" required />
            </div>
            <select className="admin-input" name="status" defaultValue="draft">
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">已下架</option>
            </select>
            <label className="block text-sm text-zinc-400">
              视频文件
              <input className="admin-input mt-2" name="video" type="file" accept="video/*" required />
            </label>
            <label className="block text-sm text-zinc-400">
              字幕文件（可选）
              <input className="admin-input mt-2" name="subtitle" type="file" accept=".vtt,.srt,text/vtt,text/plain" />
            </label>
            {uploadProgress ? (
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            ) : null}
            <button className="admin-btn admin-btn-primary w-full justify-center" type="submit">
              <Plus className="h-4 w-4" />
              上传
            </button>
          </form>
        </Panel>

        <Panel>
          <div className="grid gap-3 border-b border-white/10 p-4 lg:grid-cols-[1fr_160px_160px]">
            <SearchBox value={query} onChange={setQuery} placeholder="搜索标题或分类" />
            <select className="admin-input" value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select className="admin-input" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              {difficulties.map((item) => <option key={item} value={item}>{item === "all" ? "全部难度" : item}</option>)}
            </select>
          </div>

          {loading ? (
            <SkeletonRows />
          ) : videos.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="p-4">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(event) => setSelected(event.target.checked ? videos.map((video) => video.id) : [])}
                      />
                    </th>
                    <th className="p-4">视频</th>
                    <th className="p-4">分类</th>
                    <th className="p-4">难度</th>
                    <th className="p-4">状态</th>
                    <th className="p-4">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-white/[0.025]">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(video.id)}
                          onChange={(event) => {
                            setSelected((current) =>
                              event.target.checked
                                ? [...current, video.id]
                                : current.filter((id) => id !== video.id)
                            );
                          }}
                        />
                      </td>
                      <td className="max-w-xs p-4">
                        <p className="truncate font-medium text-white">{video.title}</p>
                        <p className="mt-1 truncate text-xs text-zinc-500">{video.video_url}</p>
                      </td>
                      <td className="p-4 text-zinc-300">{video.category}</td>
                      <td className="p-4 text-zinc-300">{video.difficulty}</td>
                      <td className="p-4"><StatusBadge status={video.status} /></td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(video)}>
                            <Edit3 className="h-4 w-4" />
                            编辑
                          </button>
                          <button
                            className="admin-btn admin-btn-ghost"
                            onClick={() => void patchVideo(video, { status: video.status === "published" ? "archived" : "published" })}
                          >
                            <Check className="h-4 w-4" />
                            {video.status === "published" ? "下架" : "发布"}
                          </button>
                          <button className="admin-btn bg-rose-500/10 text-rose-300" onClick={() => setDeleting(video)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4">
              <EmptyState title="没有找到视频" description="调整筛选条件，或上传一个新视频。" />
            </div>
          )}
        </Panel>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
          <form
            className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void patchVideo(editing, {
                title: String(form.get("title")),
                description: String(form.get("description")),
                difficulty: String(form.get("difficulty")),
                category: String(form.get("category")),
                video_url: String(form.get("videoUrl")),
                subtitle_url: String(form.get("subtitleUrl")),
                status: String(form.get("status"))
              });
            }}
          >
            <h2 className="text-lg font-semibold">编辑视频</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="admin-input" name="title" defaultValue={editing.title} />
              <input className="admin-input" name="category" defaultValue={editing.category} />
              <select className="admin-input" name="difficulty" defaultValue={editing.difficulty}>
                {difficulties.filter((item) => item !== "all").map((item) => <option key={item}>{item}</option>)}
              </select>
              <select className="admin-input" name="status" defaultValue={editing.status}>
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已下架</option>
              </select>
              <input className="admin-input sm:col-span-2" name="videoUrl" defaultValue={editing.video_url} />
              <input className="admin-input sm:col-span-2" name="subtitleUrl" defaultValue={editing.subtitle_url} />
              <textarea className="admin-input min-h-24 sm:col-span-2" name="description" defaultValue={editing.description} />
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
        title="删除视频"
        description={`确定删除「${deleting?.title ?? ""}」吗？这个操作不可恢复。`}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && void deleteVideo(deleting)}
      />
    </div>
  );
}
