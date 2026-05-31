"use client";

import { useEffect, useState } from "react";
import { adminApi, EmptyState, PageHeader, Panel, SkeletonRows } from "@/components/admin/AdminUi";

type Progress = {
  id: string;
  current_time: number;
  completed: boolean;
  updated_at: string;
  user: { email: string };
  video: { title: string };
};

export function AdminLearningPage() {
  const [items, setItems] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi<Progress[]>("/api/admin/learning").then((result) => {
      if (result.ok && result.data) setItems(result.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="学习记录" description="查看最近 200 条用户学习进度。" />
      <Panel>
        {loading ? (
          <SkeletonRows />
        ) : items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                <tr>
                  <th className="p-4">用户</th>
                  <th className="p-4">视频</th>
                  <th className="p-4">进度</th>
                  <th className="p-4">状态</th>
                  <th className="p-4">更新时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4 text-white">{item.user.email}</td>
                    <td className="p-4 text-zinc-300">{item.video.title}</td>
                    <td className="p-4 text-zinc-400">{Math.round(item.current_time)} 秒</td>
                    <td className="p-4 text-zinc-400">{item.completed ? "已完成" : "学习中"}</td>
                    <td className="p-4 text-zinc-500">{new Date(item.updated_at).toLocaleString("zh-CN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <EmptyState title="暂无学习记录" description="用户开始观看视频后，这里会显示学习进度。" />
          </div>
        )}
      </Panel>
    </div>
  );
}
