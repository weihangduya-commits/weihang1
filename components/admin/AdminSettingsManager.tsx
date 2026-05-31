"use client";

import { FormEvent, useEffect, useState } from "react";
import { Palette, Save } from "lucide-react";
import { adminApi, PageHeader, Panel, SkeletonRows, useToast } from "@/components/admin/AdminUi";

type Settings = {
  site_name: string;
  logo_url: string;
  theme_color: string;
  home_title: string;
  home_subtitle: string;
  dark_mode_enabled: boolean;
  player_help_text: string;
};

export function AdminSettingsManager() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast, ToastNode } = useToast();

  useEffect(() => {
    adminApi<Settings>("/api/admin/settings").then((result) => {
      if (result.ok && result.data) setSettings(result.data);
    });
  }, []);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    const result = await adminApi<Settings>("/api/admin/settings", {
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
    setSaving(false);
    if (result.ok && result.data) {
      setSettings(result.data);
      showToast("success", result.message ?? "设置已保存");
    } else {
      showToast("error", result.error ?? "保存失败");
    }
  }

  return (
    <div className="space-y-6">
      {ToastNode}
      <PageHeader title="网站设置" description="统一管理前台品牌、主题颜色和播放页说明文字。" />

      {!settings ? (
        <SkeletonRows rows={6} />
      ) : (
        <Panel className="p-5">
          <form className="grid gap-5 lg:grid-cols-[1fr_320px]" onSubmit={saveSettings}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-zinc-400">
                  网站名称
                  <input className="admin-input mt-2" name="site_name" defaultValue={settings.site_name} />
                </label>
                <label className="block text-sm text-zinc-400">
                  Logo URL
                  <input className="admin-input mt-2" name="logo_url" defaultValue={settings.logo_url} />
                </label>
                <label className="block text-sm text-zinc-400">
                  主题颜色
                  <input className="admin-input mt-2" name="theme_color" defaultValue={settings.theme_color} />
                </label>
                <label className="flex items-end gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-zinc-300">
                  <input name="dark_mode_enabled" type="checkbox" defaultChecked={settings.dark_mode_enabled} />
                  默认启用深色模式
                </label>
              </div>
              <label className="block text-sm text-zinc-400">
                首页标题
                <input className="admin-input mt-2" name="home_title" defaultValue={settings.home_title} />
              </label>
              <label className="block text-sm text-zinc-400">
                首页副标题
                <textarea className="admin-input mt-2 min-h-24" name="home_subtitle" defaultValue={settings.home_subtitle} />
              </label>
              <label className="block text-sm text-zinc-400">
                播放器页面说明文字
                <textarea className="admin-input mt-2 min-h-24" name="player_help_text" defaultValue={settings.player_help_text} />
              </label>
              <button className="admin-btn admin-btn-primary" disabled={saving} type="submit">
                <Save className="h-4 w-4" />
                {saving ? "保存中..." : "保存设置"}
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Palette className="h-4 w-4 text-lime" />
                前台预览
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950 p-5">
                <div className="mb-5 h-2 w-24 rounded-full" style={{ backgroundColor: settings.theme_color }} />
                <p className="text-xl font-semibold">{settings.site_name}</p>
                <p className="mt-5 text-lg font-semibold">{settings.home_title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{settings.home_subtitle}</p>
              </div>
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}
