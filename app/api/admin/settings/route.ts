import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

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

  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  const parsed = settingsSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }

  const settings = await prisma.setting.upsert({
    where: { id: "site" },
    update: parsed.data,
    create: {
      id: "site",
      ...parsed.data
    }
  });

  return NextResponse.json(settings);
}
