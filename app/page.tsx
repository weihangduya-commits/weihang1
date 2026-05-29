"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  ArrowLeft,
  Bookmark,
  Dumbbell,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Landmark,
  Mic2,
  Music,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { DictationPanel } from "@/components/DictationPanel";
import { PersonalPanel } from "@/components/PersonalPanel";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { VideoPlayer } from "@/components/VideoPlayer";
import {
  SavedWordEntry,
  VocabularyDrawer
} from "@/components/VocabularyDrawer";
import { SubtitleViewer } from "@/components/SubtitleViewer";
import { WordCard } from "@/components/WordCard";
import { videoLibrary, type VideoLibraryItem } from "@/lib/sampleConfig";
import { parseSubtitleFile } from "@/lib/subtitleParser";
import type { SubtitleCue, SubtitleDisplayMode, WordDefinition } from "@/types";

type SiteSettings = {
  site_name: string;
  logo_url: string;
  theme_color: string;
  home_title: string;
  home_subtitle: string;
  dark_mode_enabled: boolean;
  player_help_text: string;
};

const defaultSettings: SiteSettings = {
  site_name: "jintianxuexilema111",
  logo_url: "",
  theme_color: "#B7F36B",
  home_title: "选择一个视频开始沉浸学习",
  home_subtitle: "用短视频、字幕、词卡和听写练习提升英语理解力。",
  dark_mode_enabled: true,
  player_help_text: "使用倍速慢听难句，或加速复习熟悉片段。"
};

const categories = [
  { name: "体育", description: "赛事采访与运动解说", icon: Dumbbell },
  { name: "教育", description: "课程、演讲与学习方法", icon: GraduationCap },
  { name: "科学", description: "科普视频与研究故事", icon: FlaskConical },
  { name: "名人采访", description: "访谈、播客与人物故事", icon: Mic2 },
  { name: "游戏", description: "电竞、策略与团队沟通", icon: Gamepad2 },
  { name: "音乐", description: "歌词、节奏与音乐访谈", icon: Music },
  { name: "历史", description: "历史故事与纪录片片段", icon: Landmark }
];

export default function Home() {
  const { data: session, status } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [videos, setVideos] = useState<VideoLibraryItem[]>(videoLibrary);
  const [currentVideo, setCurrentVideo] = useState<VideoLibraryItem>(
    videoLibrary[0]
  );
  const [videoUrl, setVideoUrl] = useState(videoLibrary[0].videoUrl);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [subtitleDisplayMode, setSubtitleDisplayMode] =
    useState<SubtitleDisplayMode>("bilingual");
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordCard, setWordCard] = useState<WordDefinition | null>(null);
  const [savedWords, setSavedWords] = useState<SavedWordEntry[]>([]);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isVocabularyOpen, setIsVocabularyOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("体育");
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true);
  const [isLearningView, setIsLearningView] = useState(false);
  const [isSubtitleVisible, setIsSubtitleVisible] = useState(true);

  const currentCue = useMemo(
    () =>
      subtitleCues.find(
        (cue) => currentTime >= cue.start && currentTime < cue.end
      ),
    [currentTime, subtitleCues]
  );

  const categoryVideos = useMemo(
    () => videos.filter((video) => video.category === selectedCategory),
    [selectedCategory, videos]
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => (response.ok ? response.json() : defaultSettings))
      .then(setSettings)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch(currentVideo.subtitleUrl)
      .then((response) => response.text())
      .then((content) => setSubtitleCues(parseSubtitleFile(content)))
      .catch(() => setSubtitleCues([]));
  }, [currentVideo]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    fetch("/api/videos")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Array<{
        id: string;
        title: string;
        description?: string;
        difficulty?: string;
        category: string;
        video_url: string;
        subtitle_url: string;
      }>) => {
        if (!data.length) {
          return;
        }

        const mapped = data.map((video) => ({
          id: video.id,
          title: video.title,
          category: video.category,
          videoUrl: video.video_url,
          subtitleUrl: video.subtitle_url,
          level: video.difficulty ?? "Course",
          duration: "3:00"
        }));
        setVideos(mapped);
        setCurrentVideo(mapped[0]);
        setVideoUrl(mapped[0].videoUrl);
        setSelectedCategory(mapped[0].category);
      })
      .catch(() => undefined);

    fetch("/api/me/saved-words")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Array<{ word: string; created_at: string }>) => {
        setSavedWords(
          data.map((entry) => ({
            word: entry.word,
            savedAt: entry.created_at
          }))
        );
      })
      .catch(() => undefined);
  }, [status]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, videoUrl]);

  useEffect(() => {
    if (status !== "authenticated" || !isLearningView) {
      return;
    }

    const timer = window.setTimeout(() => {
      void fetch("/api/me/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: currentVideo.id,
          currentTime,
          completed: false
        })
      });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [currentTime, currentVideo.id, isLearningView, status]);

  async function handleWordClick(word: string) {
    setSelectedWord(word);
    setIsCardOpen(true);

    const response = await fetch(`/api/word?text=${encodeURIComponent(word)}`);
    const data = (await response.json()) as WordDefinition;
    setWordCard(data);
  }

  async function toggleSave(word: string) {
    const normalized = word.toLowerCase();
    const exists = savedWords.some((item) => item.word === normalized);

    if (exists) {
      await fetch(`/api/me/saved-words/${encodeURIComponent(normalized)}`, {
        method: "DELETE"
      });
      setSavedWords((current) =>
        current.filter((item) => item.word !== normalized)
      );
      return;
    }

    const response = await fetch("/api/me/saved-words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: normalized })
    });
    const saved = (await response.json()) as { word: string; created_at: string };
    setSavedWords((current) => [
      { word: saved.word, savedAt: saved.created_at },
      ...current
    ]);
  }

  function seekToCue(cue: SubtitleCue) {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.currentTime = cue.start + 0.01;
    setCurrentTime(cue.start + 0.01);
    void videoRef.current.play();
  }

  function replayCurrentCue() {
    if (!currentCue || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    video.currentTime = currentCue.start + 0.01;
    setCurrentTime(currentCue.start + 0.01);
    void video.play();

    window.setTimeout(
      () => {
        if (video.currentTime >= currentCue.end - 0.15) {
          video.pause();
        }
      },
      Math.max(400, ((currentCue.end - currentCue.start) / playbackRate) * 1000)
    );
  }

  function openVideo(video: VideoLibraryItem) {
    setCurrentVideo(video);
    setVideoUrl(video.videoUrl);
    setCurrentTime(0);
    setSelectedWord(null);
    setWordCard(null);
    setIsCardOpen(false);
    setIsLearningView(true);
  }

  if (status === "loading") {
    return (
      <main className="grid h-screen place-items-center text-white">
        <p className="text-mist">正在检查登录状态...</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="grid h-screen place-items-center px-4 text-white">
        <section className="glass-panel max-w-md rounded-[28px] p-6 text-center shadow-card">
          <h1 className="text-2xl font-bold">请先登录</h1>
          <p className="mt-2 text-sm leading-6 text-mist">
            登录后可以观看视频、收藏单词、保存学习进度和使用听写练习。
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link className="rounded-full bg-lime px-5 py-3 font-semibold text-ink" href="/login">
              登录
            </Link>
            <Link className="rounded-full bg-white/[0.06] px-5 py-3 font-semibold text-white" href="/register">
              注册
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-hidden px-4 text-white md:px-8">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {settings.logo_url ? (
            <img
              className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-glow"
              src={settings.logo_url}
              alt={settings.site_name}
            />
          ) : (
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-ink shadow-glow"
              style={{ backgroundColor: settings.theme_color }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-normal">{settings.site_name}</p>
            <p className="truncate text-sm text-mist">
              {isLearningView ? currentVideo.title : settings.home_title}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white shadow-card transition hover:bg-white/[0.09]"
            onClick={() => setIsVocabularyOpen(true)}
          >
            <Bookmark className="h-4 w-4 text-coral" />
            <span className="hidden sm:inline">收藏单词</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
              {savedWords.length}
            </span>
          </button>
          {session.user.role === "admin" ? (
            <Link className="rounded-full bg-white/[0.06] px-4 py-2 text-sm font-medium text-white" href="/admin">
              后台
            </Link>
          ) : null}
          <button
            className="rounded-full bg-white/[0.06] px-4 py-2 text-sm font-medium text-white"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            退出
          </button>
        </div>
      </nav>

      {!isLearningView ? (
        <section className="mx-auto grid h-[calc(100vh-92px)] max-w-7xl gap-5 overflow-hidden xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-full min-h-0 space-y-4 overflow-y-auto pr-1">
            <PersonalPanel
              savedCount={savedWords.length}
              onOpenVocabulary={() => setIsVocabularyOpen(true)}
              onPracticeWord={handleWordClick}
            />

            <div className="glass-panel rounded-[28px] p-4 shadow-card">
              <div className="mb-4 px-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime">
                  Channels
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">视频分类</h2>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1 xl:flex-col xl:pb-0">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.name;

                  return (
                    <button
                      key={category.name}
                      className={[
                        "group flex min-w-[178px] items-center gap-3 rounded-2xl p-3 text-left ring-1 transition xl:min-w-0",
                        isActive
                          ? "bg-lime text-ink shadow-glow ring-lime/60"
                          : "bg-white/[0.04] text-white ring-white/10 hover:bg-white/[0.08]"
                      ].join(" ")}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <span
                        className={[
                          "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition",
                          isActive
                            ? "bg-ink/10 text-ink"
                            : "bg-white/[0.06] text-lime group-hover:bg-white/[0.1]"
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{category.name}</span>
                        <span
                          className={[
                            "mt-0.5 block text-xs leading-5",
                            isActive ? "text-ink/70" : "text-mist"
                          ].join(" ")}
                        >
                          {category.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="glass-panel h-full overflow-hidden rounded-[28px] p-5 shadow-card">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime">
                  Browse
                </p>
                <h1 className="mt-1 text-2xl font-bold text-white">
                  {selectedCategory}视频
                </h1>
                <p className="mt-1 text-sm text-mist">{settings.home_subtitle}</p>
              </div>
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-sm text-mist ring-1 ring-white/10">
                {categoryVideos.length} 个视频
              </span>
            </div>

            <div className="grid h-[calc(100%-84px)] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 2xl:grid-cols-3">
              {categoryVideos.map((video) => (
                <button
                  key={video.id}
                  className="group flex min-h-[190px] flex-col justify-between rounded-[24px] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:-translate-y-0.5 hover:border-lime/40 hover:bg-white/[0.075] hover:shadow-glow"
                  onClick={() => openVideo(video)}
                >
                  <div>
                    <div className="mb-4 aspect-video rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(183,243,107,0.24),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,122,110,0.1))] ring-1 ring-white/10" />
                    <h2 className="line-clamp-2 text-lg font-semibold text-white">
                      {video.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-mist">
                      点击进入学习界面，查看字幕、词卡和听写练习。
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-lime/10 px-3 py-1 text-xs font-semibold text-lime">
                      {video.level}
                    </span>
                    <span className="text-sm text-mist">{video.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </section>
      ) : (
        <section className="mx-auto grid h-[calc(100vh-92px)] max-w-7xl gap-5 overflow-hidden xl:grid-cols-[minmax(0,0.74fr)_460px]">
          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-3 overflow-hidden">
            <div className="glass-panel flex items-center justify-between gap-4 rounded-[22px] px-4 py-3 shadow-card">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/[0.12]"
                onClick={() => {
                  setIsLearningView(false);
                  videoRef.current?.pause();
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                返回视频列表
              </button>
              <p className="truncate text-sm text-mist">
                {currentVideo.category} /{" "}
                <span className="font-semibold text-white">{currentVideo.title}</span>
              </p>
            </div>

            <motion.div
              className="min-h-0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <VideoPlayer
                videoRef={videoRef}
                videoUrl={videoUrl}
                playbackRate={playbackRate}
                helpText={settings.player_help_text}
                onTimeUpdate={setCurrentTime}
                onPlaybackRateChange={setPlaybackRate}
              />
            </motion.div>

            <SubtitleViewer
              cue={currentCue}
              displayMode={subtitleDisplayMode}
              isVisible={isSubtitleVisible}
              selectedWord={selectedWord}
              onDisplayModeChange={setSubtitleDisplayMode}
              onToggleVisible={() => setIsSubtitleVisible((value) => !value)}
              onWordClick={handleWordClick}
            />

            <DictationPanel cue={currentCue} onReplay={replayCurrentCue} />
          </div>

          <div className="min-h-0 overflow-y-auto pr-1">
            <TranscriptPanel
              cues={subtitleCues}
              activeCueId={currentCue?.id}
              displayMode={subtitleDisplayMode}
              isOpen={isTranscriptOpen}
              selectedWord={selectedWord}
              onToggleOpen={() => setIsTranscriptOpen((value) => !value)}
              onCueSelect={seekToCue}
              onWordClick={handleWordClick}
            />
          </div>
        </section>
      )}

      <VocabularyDrawer
        words={savedWords}
        isOpen={isVocabularyOpen}
        onClose={() => setIsVocabularyOpen(false)}
        onWordClick={handleWordClick}
      />

      <WordCard
        word={wordCard}
        isOpen={isCardOpen}
        isSaved={Boolean(
          wordCard &&
            savedWords.some((item) => item.word === wordCard.word.toLowerCase())
        )}
        onClose={() => setIsCardOpen(false)}
        onToggleSave={toggleSave}
      />
    </main>
  );
}
