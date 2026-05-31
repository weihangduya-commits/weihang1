"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  PlaySquare,
  Settings,
  Users,
  X
} from "lucide-react";
import { ReactNode, useState } from "react";

const menu = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/videos", label: "视频管理", icon: PlaySquare },
  { href: "/admin/subtitles", label: "字幕管理", icon: FileText },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/words", label: "单词管理", icon: BookOpen },
  { href: "/admin/learning", label: "学习记录", icon: GraduationCap },
  { href: "/admin/settings", label: "网站设置", icon: Settings }
];

function getCurrentLabel(pathname: string) {
  return menu.find((item) => item.href === pathname)?.label ?? "后台管理";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-white/10 bg-zinc-950/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-sm font-black text-ink shadow-glow">
            今
          </div>
          <div>
            <p className="text-sm font-semibold text-white">后台管理</p>
            <p className="text-xs text-zinc-500">jintianxuexilema111</p>
          </div>
        </Link>
        <button className="rounded-lg p-2 text-zinc-400 lg:hidden" onClick={() => setMobileOpen(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-lime text-ink shadow-glow"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              }`}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link className="admin-btn admin-btn-ghost w-full justify-center" href="/">
          返回前台
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-admin text-white">
      <div className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">{sidebar}</div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-72">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-zinc-950/75 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 text-zinc-300 hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-sm text-zinc-500 sm:flex">
              <span>Admin</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-zinc-200">{getCurrentLabel(pathname)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{session?.user?.email ?? "admin"}</p>
              <p className="text-xs text-zinc-500">管理员</p>
            </div>
            <button
              className="admin-btn admin-btn-ghost"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        </header>

        <main className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
