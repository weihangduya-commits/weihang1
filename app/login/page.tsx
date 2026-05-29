"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setIsLoading(false);

    if (result?.error) {
      setError("邮箱或密码不正确");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 text-white">
      <form
        className="glass-panel w-full max-w-md rounded-[28px] p-6 shadow-card"
        onSubmit={handleSubmit}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-ink shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">登录 jintianxuexilema111</h1>
            <p className="text-sm text-mist">登录后继续学习视频和单词</p>
          </div>
        </div>

        <label className="block text-sm font-medium text-mist">
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
            required
          />
        </label>

        {error ? <p className="mt-4 text-sm text-coral">{error}</p> : null}

        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-lime px-4 py-3 font-semibold text-ink shadow-glow transition hover:brightness-110 disabled:opacity-60"
          disabled={isLoading}
        >
          <LogIn className="h-4 w-4" />
          {isLoading ? "登录中..." : "登录"}
        </button>

        <p className="mt-5 text-center text-sm text-mist">
          没有账号？{" "}
          <Link className="font-semibold text-lime" href="/register">
            注册
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center px-4 text-white">
          <p className="text-mist">Loading...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
