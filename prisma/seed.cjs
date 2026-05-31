const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin", disabled: false },
    create: {
      email: adminEmail,
      password_hash: await bcrypt.hash(adminPassword, 12),
      role: "admin"
    }
  });

  await prisma.video.upsert({
    where: { id: "education-curiosity" },
    update: { published: true, status: "published", difficulty: "A1" },
    create: {
      id: "education-curiosity",
      title: "A Short Lesson on Curiosity",
      description: "A short demo lesson for testing subtitles, word cards, and dictation.",
      difficulty: "A1",
      category: "教育",
      status: "published",
      video_url:
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      subtitle_url: "/sample.vtt",
      published: true
    }
  });

  await prisma.setting.upsert({
    where: { id: "site" },
    update: {
      site_name: "jintianxuexilema111",
      home_title: "选择一个视频开始沉浸学习",
      home_subtitle: "用短视频、字幕、词卡和听写练习提升英语理解力。",
      player_help_text: "使用倍速慢听难句，或加速复习熟悉片段。"
    },
    create: { id: "site" }
  });

  await prisma.dictionaryWord.upsert({
    where: { word: "curiosity" },
    update: {},
    create: {
      word: "curiosity",
      phonetic: "/ˌkjʊriˈɑːsəti/",
      chinese: "好奇心；求知欲",
      english: "A strong desire to know or learn something.",
      example: "Curiosity helps learners notice patterns in a new language.",
      forms: JSON.stringify({
        plural: "curiosities",
        phrases: ["spark curiosity", "natural curiosity"]
      }),
      phrases: "spark curiosity, natural curiosity"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
