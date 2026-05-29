"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Settings = {
  site_name: string;
  logo_url: string;
  theme_color: string;
  home_title: string;
  home_subtitle: string;
  dark_mode_enabled: boolean;
  player_help_text: string;
};

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((response) => response.json())
      .then(setSettings)
      .catch(() => undefined);
  }, []);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_name: form.get("site_name"),
        logo_url: form.get("logo_url"),
        theme_color: form.get("theme_color"),
        home_title: form.get("home_title"),
        home_subtitle: form.get("home_subtitle"),
        dark_mode_enabled: form.get("dark_mode_enabled") === "on",
        player_help_text: form.get("player_help_text")
      })
    });
    setMessage(response.ok ? "设置已保存" : "保存失败");
    if (response.ok) {
      setSettings(await response.json());
    }
  }

  if (!settings) {
    return <main className="grid h-screen place-items-center text-white">Loading...</main>;
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 text-white">
      <form className="glass-panel w-full max-w-2xl rounded-[28px] p-6 shadow-card" onSubmit={saveSettings}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">网站设置</h1>
            <p className="text-sm text-mist">这些内容会显示在前台页面</p>
          </div>
          <Link className="rounded-full bg-white/[0.06] px-4 py-2 text-sm" href="/admin">
            返回后台
          </Link>
        </div>
        <input className="admin-input" name="site_name" defaultValue={settings.site_name} placeholder="网站名称" />
        <input className="admin-input mt-3" name="logo_url" defaultValue={settings.logo_url} placeholder="Logo URL" />
        <input className="admin-input mt-3" name="theme_color" defaultValue={settings.theme_color} placeholder="主题颜色，例如 #B7F36B" />
        <input className="admin-input mt-3" name="home_title" defaultValue={settings.home_title} placeholder="首页标题" />
        <textarea className="admin-input mt-3 min-h-20" name="home_subtitle" defaultValue={settings.home_subtitle} placeholder="首页副标题" />
        <textarea className="admin-input mt-3 min-h-20" name="player_help_text" defaultValue={settings.player_help_text} placeholder="播放器页面说明文字" />
        <label className="mt-4 flex items-center gap-2 text-sm text-mist">
          <input name="dark_mode_enabled" type="checkbox" defaultChecked={settings.dark_mode_enabled} />
          启用深色模式
        </label>
        <button className="mt-5 w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink">
          保存设置
        </button>
        {message ? <p className="mt-3 text-sm text-lime">{message}</p> : null}
      </form>
    </main>
  );
}
