"use client";

import React, { use, useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Music,
  Video,
  FileText,
  Plus,
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  Heart
} from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useTheme } from "@/context/theme-context";
import { useSearch } from "@/context/search-context";

import SongLyrics, { LanguageSegmented } from "@/components/song/SongLyrics";
import { extractDominantColor } from "@/utils/extract-color";
import { SongPageSkeleton } from "@/components/ui/SongSkeleton";
import ProtectedAction from "@/components/auth/ProtectedAction";
import { songService } from "@/services/songService";

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

  const { theme, toggleTheme } = useTheme();
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
    removeSongFromPlaylist,
    setActiveTab
  } = useAudio();

  const { setSearchQuery, setShowFullResults } = useSearch();

  const [song, setSong] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("telugu");
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
      if (playlistDropdownRef.current && !playlistDropdownRef.current.contains(e.target)) {
        setShowPlaylistDropdown(false);
      }
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target)) {
        setShowShareDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const songTitle = song ? (song.teluguTitle || song.title) : "";
  const songSubtitle = song && (song.titleEnglish || song.title) !== songTitle ? ` (${song.titleEnglish || song.title})` : "";

  const getShareUrl = (source) => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set("utm_source", source);
    return decodeURIComponent(url.toString());
  };

  const handleShareWhatsApp = () => {
    const url = getShareUrl("whatsapp");
    const text = `YouWorship Lyrics: ${songTitle}${songSubtitle} - ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    setShowShareDropdown(false);
  };

  const handleShareTwitter = () => {
    const url = getShareUrl("twitter");
    const text = `YouWorship Lyrics: ${songTitle}${songSubtitle} - ${url}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    setShowShareDropdown(false);
  };

  const handleShareFacebook = () => {
    const url = getShareUrl("facebook");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    setShowShareDropdown(false);
  };

  const handleShareCopy = () => {
    const url = getShareUrl("copy");
    const text = `YouWorship Lyrics: ${songTitle}${songSubtitle} - ${url}`;
    navigator.clipboard.writeText(text);
    setToastMessage("Lyrics link copied!");
    setTimeout(() => setToastMessage(""), 2000);
    setShowShareDropdown(false);
  };

  const handleSystemShare = async () => {
    const url = getShareUrl("system");
    const text = `YouWorship Lyrics: ${songTitle}${songSubtitle}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `YouWorship Lyrics: ${songTitle}`,
          text: text,
          url: url,
        });
      } catch (err) {
        console.log("System share failed or cancelled:", err);
      }
    } else {
      navigator.clipboard.writeText(`${text} - ${url}`);
      setToastMessage("Lyrics link copied!");
      setTimeout(() => setToastMessage(""), 2000);
    }
    setShowShareDropdown(false);
  };

  const getRawLyrics = (lang) => {
    if (!song) return "";
    if (lang === "english") {
      if (song.lyricsEnglish) {
        return Array.isArray(song.lyricsEnglish) ? song.lyricsEnglish.join("\n") : song.lyricsEnglish;
      }
      if (Array.isArray(song.lyrics)) {
        const matched = song.lyrics.find((l) => l.language === "en");
        if (matched) return matched.content || matched.text || "";
      }
      return "";
    } else {
      if (song.lyricsTelugu) {
        return Array.isArray(song.lyricsTelugu) ? song.lyricsTelugu.join("\n") : song.lyricsTelugu;
      }
      if (Array.isArray(song.lyrics)) {
        const matched = song.lyrics.find((l) => l.language === "te");
        if (matched) return matched.content || matched.text || "";
      }
      if (typeof song.lyrics === "string") return song.lyrics;
      return "";
    }
  };

  const handleCopyLyrics = () => {
    if (typeof window !== "undefined") {
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
          const teluguLines = teluguLyrics.split("\n").map(l => l.trim()).filter(Boolean);
          const englishLines = englishLyrics.split("\n").map(l => l.trim()).filter(Boolean);
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

      navigator.clipboard.writeText(header + lyricsText);
      setToastMessage(`Lyrics (${selectedLanguage === "dual" ? "bilingual" : selectedLanguage}) copied!`);
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
        return (
          sIdNFC === targetNFC ||
          sIdNFC === rawNFC ||
          sSlugNFC === targetNFC ||
          sSlugNFC === rawNFC ||
          decodeURIComponent(sIdNFC) === targetNFC ||
          decodeURIComponent(sSlugNFC) === targetNFC
        );
      }) ||
      (currentSong && (
        (currentSong.id || "").normalize("NFC") === targetNFC ||
        (currentSong.id || "").normalize("NFC") === rawNFC ||
        (currentSong.slug || "").normalize("NFC") === targetNFC ||
        (currentSong.slug || "").normalize("NFC") === rawNFC
      ) ? currentSong : null);

    if (foundSong) {
      setSong(foundSong);
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    songService.getSongById(decodedId)
      .then((fetchedSong) => {
        if (fetchedSong) {
          setSong(fetchedSong);
          fetchingRef.current = false;
        } else {
          // Fallback to Next.js API route if not found directly
          fetch(`/api/songs/${encodeURIComponent(decodedId)}`, { cache: "no-store" })
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
        fetch(`/api/songs/${encodeURIComponent(decodedId)}`, { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => {
            if (data.song) setSong(data.song);
            fetchingRef.current = false;
          })
          .catch((fetchErr) => {
            console.error("API fallback fetch failed on direct error:", fetchErr);
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
        ((typeof song.lyricsTelugu === "string" && song.lyricsTelugu.trim().length > 0) || (Array.isArray(song.lyricsTelugu) && song.lyricsTelugu.length > 0)) ||
        (Array.isArray(song.lyrics) && song.lyrics.some((l) => l.language === "te"))
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
    ((typeof song.lyricsTelugu === "string" && song.lyricsTelugu.trim().length > 0) || (Array.isArray(song.lyricsTelugu) && song.lyricsTelugu.length > 0)) &&
    ((typeof song.lyricsEnglish === "string" && song.lyricsEnglish.trim().length > 0) || (Array.isArray(song.lyricsEnglish) && song.lyricsEnglish.length > 0))
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

          <ProtectedAction action={() => router.push(`/song/${encodeURIComponent(song.slug || song.id)}?view=lyrics`)}>
            <button
              className="flex items-center gap-1.5 text-muted hover:text-title text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer bg-card hover:bg-card-hover px-3.5 py-1.5 rounded-full border border-line shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-title" />
              <span>View Lyrics</span>
            </button>
          </ProtectedAction>
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
            <h1 className={`text-title text-base md:text-lg font-bold truncate ${song.teluguTitle ? "font-telugu" : ""}`}>
              {song.teluguTitle || song.title}
            </h1>
            {song.artist && (
              <p className="text-[11px] text-muted truncate mt-0.5 font-semibold tracking-wide">
                {song.artist}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Action Icons Group */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0 select-none">
          {/* 1. Play/Pause Button */}
          <ProtectedAction action={handlePlayClick}>
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
          </ProtectedAction>

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
              <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
            </button>
          </ProtectedAction>

          {/* 3. Add to Playlist Icon with Dropdown */}
          <div className="relative" ref={playlistDropdownRef}>
            <ProtectedAction action={() => setShowPlaylistDropdown(!showPlaylistDropdown)}>
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
              <Video className="w-4 h-4 text-red-400" />
            </Link>
          )}

          {/* 5. Share Icon with Platform Choices Dropdown */}
          <div className="relative" ref={shareDropdownRef}>
            <button
              onClick={() => setShowShareDropdown(!showShareDropdown)}
              className="w-9 h-9 rounded-full bg-card hover:bg-card-hover border border-line text-muted hover:text-title flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
              title="Share lyrics link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {showShareDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-line rounded-2xl shadow-xl py-1.5 z-50 w-48 max-h-64 overflow-y-auto font-sans animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-line">
                  Share via
                </div>
                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full px-3 py-2.5 text-xs text-copy hover:bg-card-hover text-left flex items-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-[#25D366] fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.424 5.429 0 12.022 0a12.025 12.025 0 0 1 12 12.022c0 6.603-5.427 12-12.022 12-1.996-.002-3.956-.5-5.713-1.448L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.424 9.863-9.864.003-5.44-4.421-9.868-9.863-9.868-5.437 0-9.868 4.428-9.87 9.87-.001 1.747.457 3.447 1.332 4.966L1.93 20.854l4.717-1.24z"/>
                  </svg>
                  <span className="font-semibold text-title">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleShareFacebook}
                  className="w-full px-3 py-2.5 text-xs text-copy hover:bg-card-hover text-left flex items-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-[#1877F2] fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-semibold text-title">Facebook</span>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={handleShareTwitter}
                  className="w-full px-3 py-2.5 text-xs text-copy hover:bg-card-hover text-left flex items-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-title fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="font-semibold text-title">X / Twitter</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleShareCopy}
                  className="w-full px-3 py-2.5 text-xs text-copy hover:bg-card-hover text-left flex items-center gap-2.5 border-t border-line/35 mt-1 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-muted shrink-0" />
                  <span className="font-semibold text-title">Copy Link</span>
                </button>

                {/* Other Apps (System Share) */}
                <button
                  onClick={handleSystemShare}
                  className="w-full px-3 py-2.5 text-xs text-copy hover:bg-card-hover text-left flex items-center gap-2.5 border-t border-line/35 cursor-pointer"
                  title="Share to other installed apps"
                >
                  <Share2 className="w-4 h-4 text-muted shrink-0" />
                  <span className="font-semibold text-title">Other Apps...</span>
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
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.25em]">
              Lyrics
            </h3>
            <LanguageSegmented
              selected={selectedLanguage}
              onChange={setSelectedLanguage}
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
