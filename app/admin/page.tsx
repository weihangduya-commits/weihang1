import Link from "next/link";
import { requireAdminPage } from "@/components/AdminGuard";

export default async function AdminPage() {
  await requireAdminPage();

  return (
    <main className="grid min-h-screen place-items-center px-4 text-white">
      <section className="glass-panel w-full max-w-3xl rounded-[28px] p-6 shadow-card">
        <h1 className="text-2xl font-bold">管理员后台</h1>
        <p className="mt-2 text-mist">管理视频、字幕、网站设置、用户和词库。</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link className="rounded-2xl bg-lime p-5 font-semibold text-ink shadow-glow" href="/admin/videos">
            视频与字幕管理
          </Link>
          <Link className="rounded-2xl bg-white/[0.06] p-5 font-semibold text-white ring-1 ring-white/10" href="/admin/settings">
            网站设置
          </Link>
        </div>
      </section>
    </main>
  );
}
