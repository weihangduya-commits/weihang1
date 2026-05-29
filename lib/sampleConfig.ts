import type { SampleConfig } from "@/types";

export const sampleConfig: SampleConfig = {
  title: "A Short Lesson on Curiosity",
  videoUrl:
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  subtitleUrl: "/sample.vtt"
};

export type VideoLibraryItem = SampleConfig & {
  id: string;
  category: string;
  level: string;
  duration: string;
};

export const videoLibrary: VideoLibraryItem[] = [
  {
    id: "education-curiosity",
    category: "教育",
    level: "Beginner",
    duration: "0:12",
    ...sampleConfig
  },
  {
    id: "science-observation",
    category: "科学",
    title: "Observation and Nature",
    level: "Beginner",
    duration: "0:12",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    subtitleUrl: "/sample.vtt"
  },
  {
    id: "sports-focus",
    category: "体育",
    title: "Focus Before the Game",
    level: "Easy",
    duration: "0:12",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    subtitleUrl: "/sample.vtt"
  },
  {
    id: "interview-story",
    category: "名人采访",
    title: "A Calm Interview Moment",
    level: "Easy",
    duration: "0:12",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    subtitleUrl: "/sample.vtt"
  },
  {
    id: "game-strategy",
    category: "游戏",
    title: "Strategy and Team Play",
    level: "Easy",
    duration: "0:12",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    subtitleUrl: "/sample.vtt"
  },
  {
    id: "music-rhythm",
    category: "音乐",
    title: "Rhythm in Listening",
    level: "Beginner",
    duration: "0:12",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    subtitleUrl: "/sample.vtt"
  },
  {
    id: "history-memory",
    category: "历史",
    title: "Memory and Stories",
    level: "Easy",
    duration: "0:12",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    subtitleUrl: "/sample.vtt"
  }
];
