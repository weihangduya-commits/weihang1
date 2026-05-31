"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Eye, KeyRound, Trash2, UserPlus } from "lucide-react";
import {
  adminApi,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Panel,
  SearchBox,
  SkeletonRows,
  useToast
} from "@/components/admin/AdminUi";

type User = {
  id: string;
  email: string;
  role: "admin" | "user";
  disabled: boolean;
  created_at: string;
  _count?: { saved_words: number; learning_progress: number };
};

type Progress = {
  id: string;
  current_time: number;
  completed: boolean;
  updated_at: string;
  video: { title: string };
};

export function AdminUsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [progressUser, setProgressUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const { showToast, ToastNode } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const result = await adminApi<User[]>(`/api/admin/users?${params.toString()}`);
    if (result.ok && result.data) {
      setUsers(result.data);
    }
    setLoading(false);
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 250);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await adminApi<User>("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role")
      })
    });
    if (result.ok) {
      showToast("success", "用户已创建");
      event.currentTarget.reset();
      await refresh();
    } else {
      showToast("error", result.error ?? "创建失败");
    }
  }

  async function updateUser(user: User, patch: Partial<User> & { password?: string }) {
    const result = await adminApi<User>(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (result.ok) {
      showToast("success", "用户已更新");
      await refresh();
    } else {
      showToast("error", result.error ?? "更新失败");
    }
  }

  async function resetPassword(user: User) {
    const password = window.prompt("请输入新密码，至少 8 位");
    if (!password) return;
    await updateUser(user, { password });
  }

  async function viewProgress(user: User) {
    setProgressUser(user);
    const result = await adminApi<Progress[]>(`/api/admin/users/${user.id}/progress`);
    setProgress(result.ok && result.data ? result.data : []);
  }

  async function deleteUser(user: User) {
    const result = await adminApi(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (result.ok) {
      showToast("success", "用户已删除");
      await refresh();
    } else {
      showToast("error", result.error ?? "删除失败");
    }
  }

  return (
    <div className="space-y-6">
      {ToastNode}
      <PageHeader title="用户管理" description="管理注册用户、角色、账号状态和学习记录。" />

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Panel className="h-fit p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <UserPlus className="h-4 w-4 text-lime" />
            创建用户
          </h2>
          <form className="space-y-3" onSubmit={createUser}>
            <input className="admin-input" name="email" type="email" placeholder="邮箱" required />
            <input className="admin-input" name="password" type="password" minLength={8} placeholder="密码" required />
            <select className="admin-input" name="role" defaultValue="user">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button className="admin-btn admin-btn-primary w-full justify-center" type="submit">创建</button>
          </form>
        </Panel>

        <Panel>
          <div className="border-b border-white/10 p-4">
            <SearchBox value={query} onChange={setQuery} placeholder="搜索邮箱" />
          </div>
          {loading ? (
            <SkeletonRows />
          ) : users.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="p-4">用户</th>
                    <th className="p-4">角色</th>
                    <th className="p-4">状态</th>
                    <th className="p-4">数据</th>
                    <th className="p-4">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="p-4">
                        <p className="font-medium text-white">{user.email}</p>
                        <p className="mt-1 text-xs text-zinc-500">{new Date(user.created_at).toLocaleDateString("zh-CN")}</p>
                      </td>
                      <td className="p-4">
                        <select className="admin-input max-w-32" value={user.role} onChange={(event) => void updateUser(user, { role: event.target.value as "admin" | "user" })}>
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <button className="admin-btn admin-btn-ghost" onClick={() => void updateUser(user, { disabled: !user.disabled })}>
                          {user.disabled ? "启用" : "禁用"}
                        </button>
                      </td>
                      <td className="p-4 text-zinc-400">
                        收藏 {user._count?.saved_words ?? 0} · 进度 {user._count?.learning_progress ?? 0}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="admin-btn admin-btn-ghost" onClick={() => void viewProgress(user)}>
                            <Eye className="h-4 w-4" />
                            记录
                          </button>
                          <button className="admin-btn admin-btn-ghost" onClick={() => void resetPassword(user)}>
                            <KeyRound className="h-4 w-4" />
                            重置
                          </button>
                          <button className="admin-btn bg-rose-500/10 text-rose-300" onClick={() => setDeleting(user)}>
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
              <EmptyState title="没有找到用户" description="换个关键词试试，或创建一个新用户。" />
            </div>
          )}
        </Panel>
      </div>

      {progressUser ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">学习记录</h2>
                <p className="mt-1 text-sm text-zinc-500">{progressUser.email}</p>
              </div>
              <button className="admin-btn admin-btn-ghost" onClick={() => setProgressUser(null)}>关闭</button>
            </div>
            <div className="mt-4 space-y-3">
              {progress.length ? progress.map((item) => (
                <div key={item.id} className="rounded-xl bg-white/[0.04] p-3">
                  <p className="font-medium">{item.video.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    当前 {Math.round(item.current_time)} 秒 · {item.completed ? "已完成" : "学习中"} · {new Date(item.updated_at).toLocaleString("zh-CN")}
                  </p>
                </div>
              )) : <EmptyState title="暂无学习记录" description="该用户还没有观看进度。" />}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="删除用户"
        description={`确定删除 ${deleting?.email ?? ""} 吗？收藏和学习记录也会删除。`}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && void deleteUser(deleting)}
      />
    </div>
  );
}
