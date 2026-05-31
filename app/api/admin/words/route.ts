import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { fail, ok } from "@/lib/apiResponse";

const wordSchema = z.object({
  word: z.string().min(1),
  phonetic: z.string().default(""),
  audio_url: z.string().default(""),
  chinese: z.string().default(""),
  english: z.string().default(""),
  example: z.string().default(""),
  forms: z.record(z.string(), z.unknown()).default({}),
  phrases: z.array(z.string()).default([])
});

function parseCsv(input: string) {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(",").map((item) => item.trim());

  return rows.map((row) => {
    const cells = row.split(",").map((item) => item.trim());
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

export async function GET(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();

  const words = await prisma.dictionaryWord.findMany({
    where: query
      ? {
          OR: [
            { word: { contains: query, mode: "insensitive" } },
            { chinese: { contains: query, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: { word: "asc" }
  });

  return ok(words);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("csv");

    if (!(file instanceof File)) {
      return fail("请上传 CSV 文件", 400);
    }

    const rows = parseCsv(await file.text());
    const imported = [];

    for (const row of rows) {
      if (!row.word) {
        continue;
      }

      imported.push(
        await prisma.dictionaryWord.upsert({
          where: { word: row.word.toLowerCase() },
          update: {
            phonetic: row.phonetic ?? "",
            audio_url: row.audio_url ?? "",
            chinese: row.chinese ?? row["中文释义"] ?? "",
            english: row.english ?? row["英英解释"] ?? "",
            example: row.example ?? row["例句"] ?? "",
            forms: row.forms ?? "{}",
            phrases: row.phrases ?? row["短语"] ?? ""
          },
          create: {
            word: row.word.toLowerCase(),
            phonetic: row.phonetic ?? "",
            audio_url: row.audio_url ?? "",
            chinese: row.chinese ?? row["中文释义"] ?? "",
            english: row.english ?? row["英英解释"] ?? "",
            example: row.example ?? row["例句"] ?? "",
            forms: row.forms ?? "{}",
            phrases: row.phrases ?? row["短语"] ?? ""
          }
        })
      );
    }

    return ok(imported, `已导入 ${imported.length} 个单词`, 201);
  }

  const parsed = wordSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("单词数据不合法", 400, parsed.error.flatten());
  }

  const forms = JSON.stringify(parsed.data.forms);
  const phrases = parsed.data.phrases.join(", ");

  const word = await prisma.dictionaryWord.upsert({
    where: { word: parsed.data.word.toLowerCase() },
    update: {
      phonetic: parsed.data.phonetic,
      audio_url: parsed.data.audio_url,
      chinese: parsed.data.chinese,
      english: parsed.data.english,
      example: parsed.data.example,
      forms,
      phrases
    },
    create: {
      word: parsed.data.word.toLowerCase(),
      phonetic: parsed.data.phonetic,
      audio_url: parsed.data.audio_url,
      chinese: parsed.data.chinese,
      english: parsed.data.english,
      example: parsed.data.example,
      forms,
      phrases
    }
  });

  return ok(word, "单词已保存");
}
