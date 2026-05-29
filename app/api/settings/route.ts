import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.setting.upsert({
    where: { id: "site" },
    update: {},
    create: { id: "site" }
  });

  return NextResponse.json(settings);
}
