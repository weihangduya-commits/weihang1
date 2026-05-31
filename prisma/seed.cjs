const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const words = [
  {
    word: "curiosity",
    phonetic: "/ˌkjʊriˈɑːsəti/",
    chinese: "好奇心；求知欲",
    english: "A strong desire to know or learn something.",
    example: "Curiosity helps learners notice patterns in a new language.",
    forms: { plural: "curiosities" },
    phrases: "spark curiosity, natural curiosity"
  },
  {
    word: "context",
    phonetic: "/ˈkɑːntekst/",
    chinese: "上下文；语境；背景",
    english: "The situation, text, or information around something that helps you understand its meaning.",
    example: "You can guess many new words from the context of the sentence.",
    forms: { plural: "contexts" },
    phrases: "in context, cultural context, understand the context"
  }
];

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

  for (const item of words) {
    await prisma.dictionaryWord.upsert({
      where: { word: item.word },
      update: {
        phonetic: item.phonetic,
        chinese: item.chinese,
        english: item.english,
        example: item.example,
        forms: JSON.stringify(item.forms),
        phrases: item.phrases
      },
      create: {
        word: item.word,
        phonetic: item.phonetic,
        chinese: item.chinese,
        english: item.english,
        example: item.example,
        forms: JSON.stringify(item.forms),
        phrases: item.phrases
      }
    });
  }
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
