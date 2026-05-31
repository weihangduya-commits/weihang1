import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { fail, ok } from "@/lib/apiResponse";

const wordPatchSchema = z.object({
  word: z.string().min(1).optional(),
  phonetic: z.string().optional(),
  audio_url: z.string().optional(),
  chinese: z.string().optional(),
  english: z.string().optional(),
  example: z.string().optional(),
  forms: z.record(z.string(), z.unknown()).optional(),
  phrases: z.array(z.string()).optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = wordPatchSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("单词数据不合法", 400, parsed.error.flatten());
  }

  const updated = await prisma.dictionaryWord.update({
    where: { id: params.id },
    data: {
      word: parsed.data.word?.toLowerCase(),
      phonetic: parsed.data.phonetic,
      audio_url: parsed.data.audio_url,
      chinese: parsed.data.chinese,
      english: parsed.data.english,
      example: parsed.data.example,
      forms: parsed.data.forms ? JSON.stringify(parsed.data.forms) : undefined,
      phrases: parsed.data.phrases ? parsed.data.phrases.join(", ") : undefined
    }
  });

  return ok(updated, "单词已更新");
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  await prisma.dictionaryWord.delete({ where: { id: params.id } });

  return ok({ id: params.id }, "单词已删除");
}
