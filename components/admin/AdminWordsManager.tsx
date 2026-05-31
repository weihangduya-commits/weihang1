"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Edit3, FileUp, Plus, Trash2 } from "lucide-react";
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

type Word = {
  id: string;
  word: string;
  phonetic: string;
  audio_url: string;
  chinese: string;
  english: string;
  example: string;
  forms: string;
  phrases: string;
};

export function AdminWordsManager() {
  const [words, setWords] = useState<Word[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Word | null>(null);
  const [deleting, setDeleting] = useState<Word | null>(null);
  const { showToast, ToastNode } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const result = await adminApi<Word[]>(`/api/admin/words?${params.toString()}`);
    if (result.ok && result.data) setWords(result.data);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 250);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function saveWord(event: FormEvent<HTMLFormElement>, word?: Word) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      word: String(form.get("word")),
      phonetic: String(form.get("phonetic")),
      audio_url: String(form.get("audio_url")),
      chinese: String(form.get("chinese")),
      english: String(form.get("english")),
      example: String(form.get("example")),
      forms: {},
      phrases: String(form.get("phrases")).split(",").map((item) => item.trim()).filter(Boolean)
    };
    const result = await adminApi<Word>(word ? `/api/admin/words/${word.id}` : "/api/admin/words", {
      method: word ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (result.ok) {
      showToast("success", word ? "单词已更新" : "单词已创建");
      setEditing(null);
      event.currentTarget.reset();
      await refresh();
    } else {
      showToast("error", result.error ?? "保存失败");
    }
  }

  async function importCsv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await adminApi<Word[]>("/api/admin/words", { method: "POST", body: form });
    if (result.ok) {
      showToast("success", result.message ?? "CSV 已导入");
      event.currentTarget.reset();
      await refresh();
    } else {
      showToast("error", result.error ?? "导入失败");
    }
  }

  async function deleteWord(word: Word) {
    const result = await adminApi(`/api/admin/words/${word.id}`, { method: "DELETE" });
    if (result.ok) {
      showToast("success", "单词已删除");
      await refresh();
    } else {
      showToast("error", result.error ?? "删除失败");
    }
  }

  const form = (word?: Word) => (
    <form className="space-y-3" onSubmit={(event) => void saveWord(event, word)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="admin-input" name="word" placeholder="word" defaultValue={word?.word} required />
        <input className="admin-input" name="phonetic" placeholder="phonetic" defaultValue={word?.phonetic} />
        <input className="admin-input" name="audio_url" placeholder="audio_url" defaultValue={word?.audio_url} />
        <input className="admin-input" name="chinese" placeholder="中文释义" defaultValue={word?.chinese} />
        <textarea className="admin-input min-h-20 sm:col-span-2" name="english" placeholder="英英解释" defaultValue={word?.english} />
        <textarea className="admin-input min-h-20 sm:col-span-2" name="example" placeholder="例句" defaultValue={word?.example} />
        <input className="admin-input sm:col-span-2" name="phrases" placeholder="短语，用英文逗号分隔" defaultValue={word?.phrases} />
      </div>
      <button className="admin-btn admin-btn-primary w-full justify-center" type="submit">
        <Plus className="h-4 w-4" />
        保存单词
      </button>
    </form>
  );

  return (
    <div className="space-y-6">
      {ToastNode}
      <PageHeader title="单词管理" description="维护内置词库，支持新增、编辑、删除和 CSV 批量导入。" />

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Panel className="p-5">
            <h2 className="mb-4 font-semibold">新增单词</h2>
            {form()}
          </Panel>
          <Panel className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <FileUp className="h-4 w-4 text-lime" />
              CSV 批量导入
            </h2>
            <form className="space-y-3" onSubmit={importCsv}>
              <input className="admin-input" name="csv" type="file" accept=".csv,text/csv" required />
              <p className="text-xs leading-5 text-zinc-500">表头建议：word, phonetic, audio_url, chinese, english, example, forms, phrases</p>
              <button className="admin-btn admin-btn-ghost w-full justify-center" type="submit">导入 CSV</button>
            </form>
          </Panel>
        </div>

        <Panel>
          <div className="border-b border-white/10 p-4">
            <SearchBox value={query} onChange={setQuery} placeholder="搜索单词或中文释义" />
          </div>
          {loading ? (
            <SkeletonRows />
          ) : words.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="p-4">单词</th>
                    <th className="p-4">音标</th>
                    <th className="p-4">中文释义</th>
                    <th className="p-4">短语</th>
                    <th className="p-4">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {words.map((word) => (
                    <tr key={word.id}>
                      <td className="p-4 font-medium text-white">{word.word}</td>
                      <td className="p-4 text-zinc-400">{word.phonetic}</td>
                      <td className="max-w-xs truncate p-4 text-zinc-300">{word.chinese}</td>
                      <td className="max-w-xs truncate p-4 text-zinc-500">{word.phrases}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(word)}>
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="admin-btn bg-rose-500/10 text-rose-300" onClick={() => setDeleting(word)}>
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
              <EmptyState title="词库为空" description="新增单词或导入 CSV 后会显示在这里。" />
            </div>
          )}
        </Panel>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">编辑单词</h2>
              <button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>关闭</button>
            </div>
            {form(editing)}
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="删除单词"
        description={`确定删除「${deleting?.word ?? ""}」吗？`}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && void deleteWord(deleting)}
      />
    </div>
  );
}
