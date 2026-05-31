import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { fail, ok } from "@/lib/apiResponse";

const settingsSchema = z.object({
  site_name: z.string().min(1),
  logo_url: z.string().default(""),
  theme_color: z.string().min(1),
  home_title: z.string().min(1),
  home_subtitle: z.string().default(""),
  dark_mode_enabled: z.boolean(),
  player_help_text: z.string().default("")
});

export async function GET() {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const settings = await prisma.setting.upsert({
    where: { id: "site" },
    update: {},
    create: { id: "site" }
  });

  return ok(settings);
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = settingsSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("设置数据不合法", 400, parsed.error.flatten());
  }

  const settings = await prisma.setting.upsert({
    where: { id: "site" },
    update: parsed.data,
    create: {
      id: "site",
      ...parsed.data
    }
  });

  return ok(settings, "设置已保存");
}
