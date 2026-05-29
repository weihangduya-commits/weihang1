"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setIsLoading(false);
      setError("注册失败，请检查邮箱是否已被使用，密码至少 8 位。");
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setIsLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 text-white">
      <form
        className="glass-panel w-full max-w-md rounded-[28px] p-6 shadow-card"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-bold">创建账号</h1>
        <p className="mt-1 text-sm text-mist">注册后即可进入英语视频学习页面</p>

        <label className="mt-6 block text-sm font-medium text-mist">
          邮箱
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-lime/60"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-mist">
          密码
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-lime/60"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        {error ? <p className="mt-4 text-sm text-coral">{error}</p> : null}

        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-lime px-4 py-3 font-semibold text-ink shadow-glow transition hover:brightness-110 disabled:opacity-60"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
          {isLoading ? "注册中..." : "注册"}
        </button>

        <p className="mt-5 text-center text-sm text-mist">
          已有账号？{" "}
          <Link className="font-semibold text-lime" href="/login">
            去登录
          </Link>
        </p>
      </form>
    </main>
  );
}
