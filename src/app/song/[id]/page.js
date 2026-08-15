"use client";

import React, { use, useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Music,
  FileText,
  Plus,
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  Heart,
  Maximize2,
  Minimize2,
  Link as LinkIcon,
} from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useTheme } from "@/context/theme-context";
import { useSearch } from "@/context/search-context";
import { useAuth } from "@/context/auth-context";

import SongLyrics, { LanguageSegmented } from "@/components/song/SongLyrics";
import YouTubeIcon from "@/components/ui/YouTubeIcon";
import { extractDominantColor } from "@/utils/extract-color";
import { SongPageSkeleton } from "@/components/ui/SongSkeleton";
import ProtectedAction from "@/components/auth/ProtectedAction";
import { songService } from "@/services/songService";
import {
  getShareableSongUrl,
  getShareableSongText,
  getShareableSongTitle,
} from "@/utils/share";

function formatVideoEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.includes("youtube.com/embed/")) return trimmed;
  if (trimmed.includes("youtube.com/watch")) {
    const match = trimmed.match(/[?&]v=([^&]+)/);
    if (match && match[1])
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
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
        "*",
      );
    } else {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
        "*",
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

  // Read view mode from URL synchronously on every render.
  // Avoids useSearchParams() which can crash during client-side navigation in Next.js 16.
  // Safe because SongPageContent only renders on the client (use(params) suspends during SSR).
  const viewMode =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("view") || null
      : null; // "video" | "lyrics" | null

  const lyricsContainerRef = useRef(null);
  const [isFullscreenLyrics, setIsFullscreenLyrics] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(0.6);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreenLyrics(
        document.fullscreenElement === lyricsContainerRef.current,
      );
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreenLyrics = () => {
    const el = lyricsContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const increaseFontSize = () => {
    setFontSizeMultiplier((prev) => Math.min(prev + 0.15, 2.0));
  };
  const decreaseFontSize = () => {
    setFontSizeMultiplier((prev) => Math.max(prev - 0.15, 0.7));
  };

  const { isAuthenticated, loading: authLoading } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const {
    songs,
    songsLoading,
    currentSong,
    isPlaying,
    playSong,
    favorites,
    toggleFavorite,
    playlists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    setActiveTab,
    lyricsLanguage,
    setLyricsLanguage,
  } = useAudio();

  const { setSearchQuery, setShowFullResults } = useSearch();

  const [song, setSong] = useState(null);
  const selectedLanguage = lyricsLanguage;
  const setSelectedLanguage = setLyricsLanguage;

  useEffect(() => {
    if (song) {
      const songLanguage = (song.language || "").toLowerCase();
      const isHi = songLanguage === "hi" || songLanguage === "hindi";
      const isTa = songLanguage === "ta" || songLanguage === "tamil";
      
      if (isHi && lyricsLanguage !== "hindi" && lyricsLanguage !== "english") {
        setLyricsLanguage("hindi");
      } else if (isTa && lyricsLanguage !== "tamil" && lyricsLanguage !== "english") {
        setLyricsLanguage("tamil");
      } else if (!isHi && !isTa && lyricsLanguage !== "telugu" && lyricsLanguage !== "english" && lyricsLanguage !== "chords") {
        setLyricsLanguage("telugu");
      }
    }
  }, [song, lyricsLanguage, setLyricsLanguage]);
  const [gradientColor, setGradientColor] = useState({ r: 18, g: 18, b: 18 });
  const fetchingRef = useRef(false);
  const prevIdRef = useRef(id);

  const isCurrentSong = currentSong?.id === song?.id;
  const isThisPlaying = isCurrentSong && isPlaying;

  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const playlistDropdownRef = useRef(null);
  const shareDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        playlistDropdownRef.current &&
        !playlistDropdownRef.current.contains(e.target)
      ) {
        setShowPlaylistDropdown(false);
      }
      if (
        shareDropdownRef.current &&
        !shareDropdownRef.current.contains(e.target)
      ) {
        setShowShareDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const songTitle = song ? song.teluguTitle || song.title : "";
  const songSubtitle =
    song && (song.titleEnglish || song.title) !== songTitle
      ? ` (${song.titleEnglish || song.title})`
      : "";

  // canonical URL is generated on-the-fly by handleShare / handleCopyLink

  const handleShare = async () => {
    setShowShareDropdown(false);
    const shareUrl = getShareableSongUrl(song);
    const shareText = getShareableSongText(song);
    const shareTitle = getShareableSongTitle(song);

    // Try native Web Share API first (mobile & modern desktop)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return; // Success — done
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if (err.name !== "AbortError") {
          console.debug("Web Share API error:", err);
        }
      }
    }

    // Fallback: copy clean URL to clipboard
    await handleCopyLink(shareUrl);
  };

  const handleCopyLink = async (url) => {
    const linkToCopy = url || getShareableSongUrl(song);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(linkToCopy);
      } else {
        // Older fallback for browsers without Clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = linkToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setToastMessage("Link copied!");
      setShowShareDropdown(false);
    } catch (err) {
      console.error("Clipboard write failed:", err);
      // Last resort: show the URL so user can manually copy
      setToastMessage(
        "Could not copy. Select and copy the link from the address bar.",
      );
    }
    setTimeout(() => setToastMessage(""), 2500);
  };

  const getRawLyrics = (lang) => {
    if (!song) return "";
    if (lang === "english") {
      if (song.lyricsEnglish) {
        return Array.isArray(song.lyricsEnglish)
          ? song.lyricsEnglish.join("\n")
          : song.lyricsEnglish;
      }
      if (Array.isArray(song.lyrics)) {
        const matched = song.lyrics.find((l) => l.language === "en");
        if (matched) return matched.content || matched.text || "";
      }
      return "";
    } else {
      if (song.lyricsTelugu) {
        return Array.isArray(song.lyricsTelugu)
          ? song.lyricsTelugu.join("\n")
          : song.lyricsTelugu;
      }
      if (Array.isArray(song.lyrics)) {
        const matched = song.lyrics.find((l) => l.language === "te");
        if (matched) return matched.content || matched.text || "";
      }
      if (typeof song.lyrics === "string") return song.lyrics;
      return "";
    }
  };

  const handleCopyLyrics = async () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      let lyricsText = "";
      let header = "";

      if (selectedLanguage === "telugu") {
        lyricsText = getRawLyrics("telugu");
        header = `YouWorship Lyrics: ${song.teluguTitle || song.title} (Telugu)\n\n`;
      } else if (selectedLanguage === "english") {
        lyricsText = getRawLyrics("english");
        header = `YouWorship Lyrics: ${song.titleEnglish || song.title} (English)\n\n`;
      } else {
        // Dual view
        const teluguLyrics = getRawLyrics("telugu");
        const englishLyrics = getRawLyrics("english");

        if (teluguLyrics && englishLyrics && teluguLyrics !== englishLyrics) {
          const teluguLines = teluguLyrics
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          const englishLines = englishLyrics
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          const combined = [];
          const maxLen = Math.max(teluguLines.length, englishLines.length);
          for (let i = 0; i < maxLen; i++) {
            if (teluguLines[i]) combined.push(teluguLines[i]);
            if (englishLines[i]) combined.push(englishLines[i]);
            if (teluguLines[i] || englishLines[i]) combined.push("");
          }
          lyricsText = combined.join("\n");
          header = `YouWorship Lyrics: ${song.teluguTitle || song.title} - ${song.titleEnglish || song.title} (Bilingual)\n\n`;
        } else {
          lyricsText = teluguLyrics || englishLyrics;
          header = `YouWorship Lyrics: ${song.teluguTitle || song.title}\n\n`;
        }
      }

      try {
        await navigator.clipboard.writeText(header + lyricsText);
      } catch (e) {
        // Clipboard write failed silently
      }
      setToastMessage(
        `Lyrics (${selectedLanguage === "dual" ? "bilingual" : selectedLanguage}) copied!`,
      );
      setTimeout(() => setToastMessage(""), 2000);
    }
  };

  useEffect(() => {
    if (prevIdRef.current !== id) {
      setSong(null);
      fetchingRef.current = false;
      prevIdRef.current = id;
    }

    let decodedId = id;
    try {
      decodedId = decodeURIComponent(id || "");
    } catch (e) {
      decodedId = id;
    }

    const targetNFC = (decodedId || "").normalize("NFC");
    const rawNFC = (id || "").normalize("NFC");

    const foundSong =
      songs.find((s) => {
        const sIdNFC = (s.id || "").normalize("NFC");
        const sSlugNFC = (s.slug || "").normalize("NFC");
        const sSlugEnglishNFC = (s.slugEnglish || "").normalize("NFC");
        return (
          sIdNFC === targetNFC ||
          sIdNFC === rawNFC ||
          sSlugNFC === targetNFC ||
          sSlugNFC === rawNFC ||
          sSlugEnglishNFC === targetNFC ||
          sSlugEnglishNFC === rawNFC ||
          decodeURIComponent(sIdNFC) === targetNFC ||
          decodeURIComponent(sSlugNFC) === targetNFC
        );
      }) ||
      (currentSong &&
      ((currentSong.id || "").normalize("NFC") === targetNFC ||
        (currentSong.id || "").normalize("NFC") === rawNFC ||
        (currentSong.slug || "").normalize("NFC") === targetNFC ||
        (currentSong.slug || "").normalize("NFC") === rawNFC ||
        (currentSong.slugEnglish || "").normalize("NFC") === targetNFC ||
        (currentSong.slugEnglish || "").normalize("NFC") === rawNFC)
        ? currentSong
        : null);

    if (foundSong) {
      queueMicrotask(() => setSong(foundSong));
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    songService
      .getSongById(decodedId)
      .then((fetchedSong) => {
        if (fetchedSong) {
          setSong(fetchedSong);
          fetchingRef.current = false;
        } else {
          // Fallback to Next.js API route if not found directly
          fetch(`/api/songs/${encodeURIComponent(decodedId)}`, {
            cache: "no-store",
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.song) setSong(data.song);
              fetchingRef.current = false;
            })
            .catch((err) => {
              console.error("API fallback fetch failed:", err);
              fetchingRef.current = false;
            });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch song directly from Firestore:", err);
        // Fallback to API route on error
        fetch(`/api/songs/${encodeURIComponent(decodedId)}`, {
          cache: "no-store",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.song) setSong(data.song);
            fetchingRef.current = false;
          })
          .catch((fetchErr) => {
            console.error(
              "API fallback fetch failed on direct error:",
              fetchErr,
            );
            fetchingRef.current = false;
          });
      });
  }, [id, songs, currentSong]);

  useEffect(() => {
    if (song?.coverUrl) {
      extractDominantColor(song.coverUrl).then(setGradientColor);
    }
  }, [song]);

  useEffect(() => {
    if (song) {
      const hasTelugu = !!(
        (typeof song.lyricsTelugu === "string" &&
          song.lyricsTelugu.trim().length > 0) ||
        (Array.isArray(song.lyricsTelugu) && song.lyricsTelugu.length > 0) ||
        (Array.isArray(song.lyrics) &&
          song.lyrics.some((l) => l.language === "te"))
      );
      setSelectedLanguage(hasTelugu ? "telugu" : "english");
    }
  }, [song]);

  const handlePlayClick = () => {
    playSong(song);
  };

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-[#070707]">
        <Music className="w-12 h-12 text-title mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white">
          {songsLoading ? "Loading song..." : "Song not found"}
        </h2>
        {!songsLoading && (
          <Link href="/home" className="mt-4 text-sm text-title hover:underline">
            Return to home
          </Link>
        )}
      </div>
    );
  }

  const isFavorited = favorites.includes(song.id);
  const hasDualLyrics = !!(
    song &&
    ((typeof song.lyricsTelugu === "string" &&
      song.lyricsTelugu.trim().length > 0) ||
      (Array.isArray(song.lyricsTelugu) && song.lyricsTelugu.length > 0)) &&
    ((typeof song.lyricsEnglish === "string" &&
      song.lyricsEnglish.trim().length > 0) ||
      (Array.isArray(song.lyricsEnglish) && song.lyricsEnglish.length > 0))
  );

  const rawVideoUrl =
    song.media?.video || song.videoUrl || song.youtubeUrl || "";
  const embedUrl = formatVideoEmbedUrl(rawVideoUrl);
  const { r, g, b } = gradientColor;

  // 1. FULL CENTER SCREEN VIDEO VIEW (?view=video)
  if (viewMode === "video") {
    return (
      <div
        className="relative flex-1 flex flex-col h-full overflow-hidden bg-canvas transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(120% 120% at 50% 0%, rgba(${r},${g},${b},0.2) 0%, rgba(${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(0, b - 30)},0.05) 45%, var(--canvas) 100%)`,
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

          <button
            onClick={() =>
              router.push(
                `/song/${encodeURIComponent(song.slug || song.id)}?view=lyrics`,
              )
            }
            className="flex items-center gap-1.5 text-muted hover:text-title text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer bg-card hover:bg-card-hover px-3.5 py-1.5 rounded-full border border-line shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-title" />
            <span>View Lyrics</span>
          </button>
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
                <h2
                  className="text-xl md:text-2xl font-bold text-title font-song-title"
                >
                  {selectedLanguage === "english" ? (song.titleEnglish || song.title) : (song.teluguTitle || song.title)}
                </h2>
                {((selectedLanguage === "english"
                  ? (song.teluguTitle && song.teluguTitle !== (song.titleEnglish || song.title) ? song.teluguTitle : null)
                  : (song.titleEnglish && song.titleEnglish !== (song.teluguTitle || song.title) ? song.titleEnglish : null))) && (
                  <p className="text-xs text-muted/80 italic mt-0.5">
                    {selectedLanguage === "english" ? song.teluguTitle : song.titleEnglish}
                  </p>
                )}
                <p className="text-xs text-muted mt-1">
                  {selectedLanguage === "english"
                    ? (song.artistNameEnglish || song.artist)
                    : (song.artist === "Unknown Artist" ? "తెలియని కళాకారుడు" : (song.artistName || song.artist))}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-8 py-16">
              <div className="w-20 h-20 rounded-full bg-card border border-line flex items-center justify-center mb-5 shadow-sm">
                <YouTubeIcon className="w-9 h-9 text-muted" />
              </div>
              <h4 className="text-lg font-bold text-muted mb-2">
                No Video Available
              </h4>
              <p className="text-sm text-muted max-w-sm">
                A video for this track has not been added yet.
              </p>
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
          background: `radial-gradient(120% 120% at 50% 0%, rgba(${r},${g},${b},0.2) 0%, rgba(${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(0, b - 30)},0.05) 45%, var(--canvas) 100%)`,
        }}
      >
        <div className="p-6 flex items-center justify-between z-40">
          <button
            onClick={() => router.back()}
            className="p-1.5 md:p-2 hover:bg-card-hover rounded-full text-dim hover:text-copy cursor-pointer transition-all duration-200 active:scale-95 flex-shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Font Size Controls */}
            <div className="flex items-center bg-card-hover/80 backdrop-blur-sm border border-line/40 rounded-full p-0.5 shadow-sm h-8 md:h-9 overflow-hidden shrink-0">
              <button
                onClick={decreaseFontSize}
                className="px-2.5 md:px-3 h-full flex items-center justify-center text-muted hover:text-title hover:bg-card/45 rounded-full transition-all cursor-pointer font-bold text-[11px]"
                title="Decrease Font Size"
              >
                A
              </button>
              <button
                onClick={increaseFontSize}
                className="px-2.5 md:px-3 h-full flex items-center justify-center text-muted hover:text-title hover:bg-card/45 rounded-full transition-all cursor-pointer font-black text-sm md:text-base"
                title="Increase Font Size"
              >
                A
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-1.5 md:p-2 rounded-full text-muted hover:text-title hover:bg-card-hover/60 transition-all cursor-pointer active:scale-90 shrink-0"
              title="Share song"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Copy Lyrics Button */}
            <button
              onClick={handleCopyLyrics}
              className="p-1.5 md:p-2 rounded-full text-muted hover:text-title hover:bg-card-hover/60 transition-all cursor-pointer active:scale-90 shrink-0"
              title="Copy lyrics to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>

            <LanguageSegmented
              selected={selectedLanguage}
              onChange={setSelectedLanguage}
              songLanguage={(song?.language || "").toLowerCase()}
            />
          </div>
        </div>

        <div className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-16 lg:px-24 flex flex-col justify-center overflow-hidden">
          <SongLyrics
            song={song}
            isImmersive={true}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            fontSizeMultiplier={fontSizeMultiplier}
          />
        </div>

        {/* Share/Copy Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-24 right-8 bg-[#D4A32A] text-black px-4 py-2.5 rounded-xl text-xs font-black shadow-2xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-3">
            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}
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
      {/* Sticky Action Header Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-8 py-3 bg-canvas/95 backdrop-blur-md border-b border-line/35 shadow-sm">
        {/* Left Side: Back button + Titles */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-card-hover rounded-full text-dim hover:text-copy cursor-pointer transition-all duration-200 active:scale-95 flex-shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col leading-tight min-w-0">
            <h1
              className="text-title text-base md:text-lg font-bold truncate font-song-title"
            >
              {selectedLanguage === "english" ? (song.titleEnglish || song.title) : (song.teluguTitle || song.title)}
            </h1>
            {song.artist && (
              <p className="text-[11px] text-muted truncate mt-0.5 font-semibold tracking-wide">
                {selectedLanguage === "english"
                  ? `${song.teluguTitle && song.teluguTitle !== (song.titleEnglish || song.title) ? `${song.teluguTitle} • ` : ""}${song.artistNameEnglish || song.artist}`
                  : `${song.titleEnglish && song.titleEnglish !== (song.teluguTitle || song.title) ? `${song.titleEnglish} • ` : ""}${song.artist === "Unknown Artist" ? "తెలియని కళాకారుడు" : (song.artistName || song.artist)}`}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Action Icons Group */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0 select-none">
          <button
            onClick={handlePlayClick}
            className="w-9 h-9 rounded-full bg-title text-card flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex-shrink-0"
            title={isThisPlaying ? "Pause" : "Play"}
          >
            {isThisPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* 2. Favorite Button */}
          <ProtectedAction action={() => toggleFavorite(song.id)}>
            <button
              onClick={() => toggleFavorite(song.id)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm flex-shrink-0 ${
                isFavorited
                  ? "border-red-500/40 text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  : "border-line bg-card text-muted hover:text-title hover:bg-card-hover"
              }`}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`}
              />
            </button>
          </ProtectedAction>

          {/* 3. Add to Playlist Icon with Dropdown */}
          <div className="relative" ref={playlistDropdownRef}>
            <ProtectedAction
              action={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
            >
              <button
                onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                className="w-9 h-9 rounded-full bg-card hover:bg-card-hover border border-line text-muted hover:text-title flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
                title="Add to playlist"
              >
                <Plus className="w-4 h-4" />
              </button>
            </ProtectedAction>
            {showPlaylistDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-line rounded-2xl shadow-xl py-1.5 z-50 w-48 max-h-48 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-line">
                  Select Playlist
                </div>
                {playlists.length > 0 ? (
                  playlists.map((list) => {
                    const isInPlaylist = list.songIds.includes(song.id);
                    return (
                      <button
                        key={list.id}
                        onClick={() => {
                          if (isInPlaylist) {
                            removeSongFromPlaylist(list.id, song.id);
                          } else {
                            addSongToPlaylist(list.id, song.id);
                          }
                          setShowPlaylistDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-xs text-copy hover:bg-card-hover text-left flex items-center justify-between"
                      >
                        <span className="truncate">{list.name}</span>
                        {isInPlaylist ? (
                          <span className="text-[10px] bg-card-hover text-handle px-1.5 py-0.5 rounded font-semibold border border-line flex-shrink-0">
                            Added
                          </span>
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-muted" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-muted italic text-center">
                    No custom playlists
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Watch Video Button */}
          {rawVideoUrl && embedUrl && (
            <Link
              href={`/song/${encodeURIComponent(song.slug || song.id)}?view=video`}
              onClick={() => {
                if (currentSong?.id !== song.id) playSong(song);
              }}
              className="w-9 h-9 rounded-full border border-line bg-card text-muted hover:text-title hover:bg-card-hover flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm flex-shrink-0"
              title="Watch Video"
            >
              <YouTubeIcon className="w-4 h-4 text-red-400" />
            </Link>
          )}

          {/* 5. Share Button — uses native share sheet or copies link */}
          <div className="relative" ref={shareDropdownRef}>
            <button
              onClick={() => {
                // On mobile, try native share directly without showing dropdown
                if (typeof navigator !== "undefined" && navigator.share) {
                  handleShare();
                } else {
                  setShowShareDropdown(!showShareDropdown);
                }
              }}
              className="w-9 h-9 rounded-full bg-card hover:bg-card-hover border border-line text-muted hover:text-title flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
              title="Share song"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {showShareDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-line rounded-2xl shadow-xl py-1.5 z-50 w-48 font-sans animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-line">
                  Share
                </div>
                {/* Share via native sheet */}
                <button
                  onClick={handleShare}
                  className="w-full px-3 py-2.5 text-xs text-copy hover:bg-card-hover text-left flex items-center gap-2.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-muted shrink-0" />
                  <span className="font-semibold text-title">Share</span>
                </button>
                {/* Copy Link */}
                <button
                  onClick={() => handleCopyLink()}
                  className="w-full px-3 py-2.5 text-xs text-copy hover:bg-card-hover text-left flex items-center gap-2.5 border-t border-line/35 cursor-pointer"
                >
                  <LinkIcon className="w-4 h-4 text-muted shrink-0" />
                  <span className="font-semibold text-title">Copy Link</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. Copy Icon (Copies full lyrics text) */}
          <button
            onClick={handleCopyLyrics}
            className="w-9 h-9 rounded-full bg-card hover:bg-card-hover border border-line text-muted hover:text-title flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
            title="Copy lyrics to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full px-6 md:px-8 pb-16 pt-2 space-y-8 flex-1 flex flex-col">
        {/* Lyrics Section */}
        <div className="space-y-4 pt-2 flex-1 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.25em]">
              Lyrics
            </h3>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <LanguageSegmented
                selected={selectedLanguage}
                onChange={setSelectedLanguage}
                songLanguage={(song?.language || "").toLowerCase()}
              />

              {/* Size & Full Screen Controls */}
              <div className="flex items-center bg-card-hover border border-line/60 rounded-full p-0.5 shadow-sm h-9 md:h-11 overflow-hidden shrink-0">
                {/* A- (Decrease Font Size) */}
                <button
                  onClick={decreaseFontSize}
                  className="px-3 h-full flex items-center justify-center text-muted hover:text-title hover:bg-card/45 rounded-full transition-all cursor-pointer font-bold text-xs"
                  title="Decrease Font Size"
                >
                  A
                </button>
                {/* A+ (Increase Font Size) */}
                <button
                  onClick={increaseFontSize}
                  className="px-3 h-full flex items-center justify-center text-muted hover:text-title hover:bg-card/45 rounded-full transition-all cursor-pointer font-black text-base"
                  title="Increase Font Size"
                >
                  A
                </button>
                <div className="w-[1px] h-4 bg-line/30 mx-1 shrink-0" />
                {/* Full Screen Toggle */}
                <button
                  onClick={toggleFullscreenLyrics}
                  className={`px-3 h-full flex items-center justify-center transition-all cursor-pointer rounded-full hover:bg-card/45 ${
                    isFullscreenLyrics
                      ? "text-amber-500 font-bold"
                      : "text-muted hover:text-title"
                  }`}
                  title="Toggle Fullscreen Lyrics"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={lyricsContainerRef}
            className={`relative flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden border border-line bg-card shadow-sm transition-all ${
              isFullscreenLyrics ? "p-6 md:p-12 bg-card" : ""
            }`}
          >
            {isFullscreenLyrics && (
              <button
                onClick={toggleFullscreenLyrics}
                className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-card/90 backdrop-blur-md border border-line/60 hover:bg-card-hover text-dim hover:text-title text-[11px] font-bold rounded-full px-3 py-1.5 shadow-lg transition-all cursor-pointer active:scale-95"
                title="Exit Fullscreen"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </button>
            )}
            <SongLyrics
              song={song}
              isImmersive={true}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              fontSizeMultiplier={fontSizeMultiplier}
            />
          </div>
        </div>
      </div>

      {/* Share/Copy Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-8 bg-[#D4A32A] text-black px-4 py-2.5 rounded-xl text-xs font-black shadow-2xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

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
