"use client";

import { useEffect, useState } from "react";
import { BookMarked, FileVideo, Users, Activity, Clock, UserPlus } from "lucide-react";
import { adminApi, EmptyState, PageHeader, Panel, SkeletonRows } from "@/components/admin/AdminUi";

type DashboardData = {
  stats: {
    totalUsers: number;
    publishedVideos: number;
    draftVideos: number;
    todayLearners: number;
    savedWords: number;
  };
  recentVideos: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    created_at: string;
  }>;
  recentUsers: Array<{
    id: string;
    email: string;
    role: string;
    created_at: string;
  }>;
};

const cards = [
  { key: "totalUsers", label: "总用户数", icon: Users },
  { key: "publishedVideos", label: "已发布视频", icon: FileVideo },
  { key: "draftVideos", label: "草稿视频", icon: Clock },
  { key: "todayLearners", label: "今日学习人数", icon: Activity },
  { key: "savedWords", label: "总收藏单词", icon: BookMarked }
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi<DashboardData>("/api/admin/dashboard").then((result) => {
      if (result.ok && result.data) {
        setData(result.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="集中查看用户、视频、字幕和学习行为的关键数据。"
      />

      {loading || !data ? (
        <SkeletonRows rows={6} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Panel key={card.key} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">{card.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{data.stats[card.key]}</p>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-lime/12 text-lime ring-1 ring-lime/20">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel>
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <h2 className="font-semibold">最近上传视频</h2>
                <FileVideo className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="p-4">
                {data.recentVideos.length ? (
                  <div className="space-y-3">
                    {data.recentVideos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{video.title}</p>
                          <p className="mt-1 text-xs text-zinc-500">{video.category} · {video.status}</p>
                        </div>
                        <span className="text-xs text-zinc-500">{formatDate(video.created_at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="还没有视频" description="上传第一个视频后会出现在这里。" />
                )}
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <h2 className="font-semibold">最近注册用户</h2>
                <UserPlus className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="p-4">
                {data.recentUsers.length ? (
                  <div className="space-y-3">
                    {data.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{user.email}</p>
                          <p className="mt-1 text-xs text-zinc-500">{user.role}</p>
                        </div>
                        <span className="text-xs text-zinc-500">{formatDate(user.created_at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="还没有用户" description="普通用户注册后会出现在这里。" />
                )}
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
