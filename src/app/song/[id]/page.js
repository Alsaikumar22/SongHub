"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Music, Video, FileText } from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useTheme } from "@/context/theme-context";
import SongHero from "@/components/song/SongHero";
import SongLyrics, { LanguageSegmented } from "@/components/song/SongLyrics";
import { extractDominantColor } from "@/utils/extract-color";
import { SongPageSkeleton } from "@/components/ui/SongSkeleton";

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

function YouTubeVideoPlayer({ embedUrl, title, isPlaying }) {
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
    <div className="relative w-full max-w-5xl aspect-video bg-black/40 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 mx-auto">
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

function SongPageContent({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view"); // "video" | "lyrics" | null

  const { theme } = useTheme();
  const isLight = theme === "light";
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

  const rawVideoUrl = song.media?.video || song.videoUrl || song.youtubeUrl || "";
  const embedUrl = formatVideoEmbedUrl(rawVideoUrl);
  const { r, g, b } = gradientColor;

  // 1. FULL CENTER SCREEN VIDEO VIEW (?view=video)
  if (viewMode === "video") {
    return (
      <div
        className="relative flex-1 flex flex-col h-full overflow-hidden bg-canvas transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(120% 120% at 50% 0%, rgba(${r},${g},${b},0.2) 0%, rgba(${Math.max(0, r-30)},${Math.max(0, g-30)},${Math.max(0, b-30)},0.05) 45%, var(--canvas) 100%)`,
        }}
      >
        {/* Minimal back link */}
        <div className="p-6 flex items-center justify-between z-40">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-muted hover:text-title text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer bg-card hover:bg-card-hover px-3 py-1.5 rounded-full border border-line shadow-sm"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <Link
            href={`/song/${encodeURIComponent(song.id)}?view=lyrics`}
            className="flex items-center gap-1.5 text-muted hover:text-title text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer bg-card hover:bg-card-hover px-3.5 py-1.5 rounded-full border border-line shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-title" />
            <span>View Lyrics</span>
          </Link>
        </div>

        {/* Center Main Screen Video Player */}
        <div className="flex-1 w-full flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
          {rawVideoUrl && embedUrl ? (
            <div className="w-full max-w-5xl space-y-4">
              <YouTubeVideoPlayer
                embedUrl={embedUrl}
                title={song.title}
                isPlaying={isPlaying}
              />
              <div className="text-center">
                <h2 className={`text-xl md:text-2xl font-bold text-title ${song.teluguTitle ? "font-telugu" : ""}`}>
                  {song.teluguTitle || song.title}
                </h2>
                <p className="text-xs text-muted mt-1">{song.artist}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-8 py-16">
              <div className="w-20 h-20 rounded-full bg-card border border-line flex items-center justify-center mb-5 shadow-sm">
                <Video className="w-9 h-9 text-muted" />
              </div>
              <h4 className="text-lg font-bold text-muted mb-2">No Video Available</h4>
              <p className="text-sm text-muted max-w-sm">A video for this track has not been added yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. FULL SCREEN IMMERSIVE LYRICS VIEW (?view=lyrics)
  if (viewMode === "lyrics") {
    return (
      <div
        className="relative flex-1 flex flex-col h-full overflow-hidden bg-canvas transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(120% 120% at 50% 0%, rgba(${r},${g},${b},0.2) 0%, rgba(${Math.max(0, r-30)},${Math.max(0, g-30)},${Math.max(0, b-30)},0.05) 45%, var(--canvas) 100%)`,
        }}
      >
        <div className="p-6 flex items-center justify-between z-40">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-muted hover:text-title text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer bg-card hover:bg-card-hover px-3 py-1.5 rounded-full border border-line shadow-sm"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <LanguageSegmented
            selected={selectedLanguage}
            onChange={setSelectedLanguage}
            hasDual={true}
          />
        </div>

        <div className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-16 lg:px-24 flex flex-col justify-center overflow-hidden">
          <SongLyrics
            song={song}
            isImmersive={true}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
        </div>
      </div>
    );
  }

  // 3. MAIN SONG DETAILS VIEW (DEFAULT)
  return (
    <div
      className="relative flex-1 min-h-0 flex flex-col overflow-y-auto bg-canvas text-copy min-w-0 font-lato"
      style={{
        background: isLight
          ? "none"
          : `radial-gradient(140% 80% at 50% 0%, rgba(${r},${g},${b},0.2) 0%, transparent 80%)`,
      }}
    >
      {/* Back button at top of song page */}
      <div className="sticky top-0 z-30 flex items-center px-6 md:px-8 pt-4 pb-2 bg-gradient-to-b from-canvas/90 via-canvas/60 to-transparent pointer-events-none">
        <button
          onClick={() => router.back()}
          className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card/85 backdrop-blur-md border border-line hover:bg-card-hover text-muted hover:text-title text-[11px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
          title="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      <div className="w-full px-6 md:px-8 pb-16 pt-2 space-y-8 flex-1 flex flex-col">
        {/* Song Hero Banner */}
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

        {/* Lyrics Section */}
        <div className="space-y-4 pt-2 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.25em]">
              Lyrics
            </h3>
            <LanguageSegmented
              selected={selectedLanguage}
              onChange={setSelectedLanguage}
              hasDual={true}
            />
          </div>

          <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-line bg-card shadow-sm">
            <SongLyrics
              song={song}
              isImmersive={true}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SongPage({ params }) {
  return (
    <Suspense fallback={<SongPageSkeleton />}>
      <SongPageContent params={params} />
    </Suspense>
  );
}
