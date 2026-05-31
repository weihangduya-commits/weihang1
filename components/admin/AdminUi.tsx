"use client";

import { ReactNode, useCallback, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Search, X } from "lucide-react";

type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export async function adminApi<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const response = await fetch(input, init);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.ok === false) {
    return {
      ok: false,
      error: payload.error ?? "请求失败"
    };
  }

  return {
    ok: true,
    data: payload.data ?? payload,
    message: payload.message
  };
}

export function useToast() {
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const node = toast ? (
    <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur">
      {toast.type === "success" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-rose-400" />
      )}
      {toast.text}
    </div>
  ) : null;

  return { showToast, ToastNode: node };
}

export function ConfirmDialog({
  title,
  description,
  open,
  onClose,
  onConfirm
}: {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
          </div>
          <button className="rounded-lg p-1 text-zinc-400 hover:bg-white/10" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="admin-btn admin-btn-ghost" onClick={onClose}>
            取消
          </button>
          <button
            className="admin-btn bg-rose-500 text-white hover:bg-rose-400"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            确认操作
          </button>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-lime">Admin Console</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.035] shadow-admin ${className}`}>
      {children}
    </section>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        className="admin-input pl-9"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-white/10 bg-black/10 p-8 text-center">
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
      ))}
    </div>
  );
}

export function LoadingButton({
  loading,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button className={className} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
    draft: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
    archived: "bg-zinc-400/10 text-zinc-300 ring-zinc-400/20"
  };
  const labels: Record<string, string> = {
    published: "已发布",
    draft: "草稿",
    archived: "已下架"
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${styles[status] ?? styles.draft}`}>
      {labels[status] ?? status}
    </span>
  );
}
