"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Music, Video } from "lucide-react";
import { useAudio } from "@/context/audio-context";
import SongHero from "@/components/song/SongHero";
import SongLyrics, { LanguageSegmented } from "@/components/song/SongLyrics";
import SongTabs from "@/components/song/SongTabs";
import { extractDominantColor } from "@/utils/extract-color";

function formatVideoEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.includes("youtube.com/embed/")) return trimmed;
  if (trimmed.includes("youtube.com/watch")) {
    const match = trimmed.match(/[?&]v=([^&]+)/);
    if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/");
    if (parts[1]) {
      const id = parts[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
  }
  return trimmed;
}

function SongPageContent({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const showImmersiveLyrics = searchParams.get("view") === "lyrics";

  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    favorites,
    toggleFavorite,
    playlists,
    addSongToPlaylist,
    removeSongFromPlaylist
  } = useAudio();

  const [song, setSong] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("telugu");
  const [gradientColor, setGradientColor] = useState({ r: 18, g: 18, b: 18 });
  const [activeTab, setActiveTab] = useState("lyrics");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    let decodedId = id;
    try {
      decodedId = decodeURIComponent(id || "");
    } catch (e) {
      decodedId = id;
    }

    const foundSong =
      songs.find(
        (s) =>
          s.id === decodedId ||
          s.id === id ||
          encodeURIComponent(s.id) === id ||
          decodeURIComponent(s.id || "") === decodedId
      ) ||
      (currentSong && (currentSong.id === decodedId || currentSong.id === id)
        ? currentSong
        : null);

    if (foundSong) {
      setSong(foundSong);
      setActiveTab("lyrics");
      return;
    }

    if (fetching) return;
    setFetching(true);

    fetch(`/api/songs/${encodeURIComponent(decodedId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.song) setSong(data.song);
      })
      .catch((err) => console.error("Failed to fetch song:", err));
  }, [id, songs, currentSong]);

  useEffect(() => {
    if (song?.coverUrl) {
      extractDominantColor(song.coverUrl).then(setGradientColor);
    }
  }, [song]);

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-[#070707]">
        <Music className="w-12 h-12 text-title mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white">Finding song...</h2>
        <Link href="/" className="mt-4 text-sm text-title hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const isFavorited = favorites.includes(song.id);

    const hasDualLyrics = !!(
      song &&
      Array.isArray(song.lyricsTelugu) &&
      Array.isArray(song.lyricsEnglish) &&
      song.lyricsTelugu.length > 0 &&
      song.lyricsEnglish.length > 0
    );

  const { r, g, b } = gradientColor;

  // 1. IMMERSIVE LYRICS FULL SCREEN VIEW (?view=lyrics)
  if (showImmersiveLyrics) {
    return (
      <div
        className="relative flex-1 flex flex-col h-full overflow-hidden bg-[#070707] transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(120% 120% at 50% 0%, rgba(${r},${g},${b},0.32) 0%, rgba(${Math.max(0, r-30)},${Math.max(0, g-30)},${Math.max(0, b-30)},0.10) 45%, #070707 100%)`,
        }}
      >
        {/* Minimal ghost back link (no black box) */}
        <button
          onClick={() => router.back()}
          className="absolute top-5 left-5 z-40 flex items-center gap-1.5 text-white/55 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Top Bar: Tabs + Language Selector */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 flex-wrap justify-center">
          <SongTabs
            tabs={[
              { id: "lyrics", label: "Lyrics" },
              { id: "video", label: "Video" },
            ]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          {activeTab === "lyrics" && hasDualLyrics && (
            <LanguageSegmented
              selected={selectedLanguage}
              onChange={setSelectedLanguage}
              hasDual={hasDualLyrics}
            />
          )}
        </div>

        {/* Immersive Main Display Area */}
        <div className="flex-1 w-full flex flex-col justify-center overflow-hidden relative">
          {activeTab === "lyrics" ? (
            <div className="w-full max-w-4xl mx-auto px-6 md:px-16 lg:px-24 flex-1 flex flex-col justify-center overflow-hidden">
              <SongLyrics
                song={song}
                isImmersive={true}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6 md:p-12">
              {(() => {
                const rawVideoUrl = song.media?.video || song.videoUrl || song.youtubeUrl || "";
                const embedUrl = formatVideoEmbedUrl(rawVideoUrl);
                if (!rawVideoUrl) {
                  return (
                    <div className="flex flex-col items-center justify-center text-center px-8 py-16">
                      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                        <Video className="w-9 h-9 text-muted" />
                      </div>
                      <h4 className="text-lg font-bold text-white/70 mb-2">No Video Available</h4>
                      <p className="text-sm text-muted max-w-sm">A video for this track hasn&apos;t been added yet.</p>
                    </div>
                  );
                }

                if (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be")) {
                  return (
                    <YouTubeVideoTab
                      embedUrl={embedUrl}
                      title={song.title}
                      isPlaying={isPlaying}
                    />
                  );
                }

                return (
                  <DirectVideoTab src={rawVideoUrl} isPlaying={isPlaying} />
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  }

function YouTubeVideoTab({ embedUrl, title, isPlaying }) {
  const iframeRef = React.useRef(null);

  React.useEffect(() => {
    if (!iframeRef.current) return;
    if (isPlaying) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: "" }),
        "*"
      );
    } else {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
        "*"
      );
    }
  }, [isPlaying]);

  const srcWithJsApi = `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}enablejsapi=1`;

  return (
    <div className="relative w-full max-w-5xl aspect-video bg-black/40 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <iframe
        ref={iframeRef}
        src={srcWithJsApi}
        title={`${title} - Video`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}

function DirectVideoTab({ src, isPlaying }) {
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch((e) => console.error(e));
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="relative w-full max-w-5xl aspect-video bg-black/40 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full h-full object-contain"
      />
    </div>
  );
}

  // 2. SONG DETAILS VIEW (DEFAULT)
  return (
    <div
      className="relative flex-1 min-h-0 flex flex-col overflow-y-auto bg-transparent min-w-0 font-lato"
      style={{
        background: `radial-gradient(140% 80% at 50% 0%, rgba(${r},${g},${b},0.28) 0%, rgba(${Math.max(0, r-30)},${Math.max(0, g-30)},${Math.max(0, b-30)},0.08) 50%, transparent 100%)`,
      }}
    >
      {/* Back button at top of song page */}
      <div className="sticky top-0 z-30 flex items-center px-6 md:px-8 pt-4 pb-2 bg-gradient-to-b from-[#070707]/80 to-transparent pointer-events-none">
        <button
          onClick={() => router.back()}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 hover:border-white/20 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer"
          title="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      <div className="w-full px-6 md:px-8 pb-16 pt-2 space-y-6 flex-1 flex flex-col">
        <SongHero
          song={song}
          currentSong={currentSong}
          isPlaying={isPlaying}
          playSong={playSong}
          isFavorited={isFavorited}
          toggleFavorite={() => toggleFavorite(song.id)}
          playlists={playlists}
          addSongToPlaylist={addSongToPlaylist}
          removeSongFromPlaylist={removeSongFromPlaylist}
        />

        {/* Language Selector for Lyrics */}
        <div className="flex items-center justify-between pt-2 pb-1">
          <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.25em]">
            Lyrics
          </h3>
          {hasDualLyrics && (
            <LanguageSegmented
              selected={selectedLanguage}
              onChange={setSelectedLanguage}
              hasDual={hasDualLyrics}
            />
          )}
        </div>

        {/* Immersive-style Lyrics Display */}
        <div
          className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/5"
          style={{
            background: `radial-gradient(120% 100% at 50% 0%, rgba(${r},${g},${b},0.20) 0%, rgba(${Math.max(0, r-20)},${Math.max(0, g-20)},${Math.max(0, b-20)},0.04) 60%, transparent 100%)`,
          }}
        >
          <SongLyrics
            song={song}
            isImmersive={true}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        </div>
      </div>
    </div>
  );
}

export default function SongPage({ params }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-[#070707]">
        <Music className="w-12 h-12 text-title mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white">Loading...</h2>
      </div>
    }>
      <SongPageContent params={params} />
    </Suspense>
  );
}
