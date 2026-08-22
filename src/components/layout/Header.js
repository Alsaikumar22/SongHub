"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  Play,
  ArrowRight,
  LayoutGrid,
  Sun,
  Moon,
  Music,
  Home,
  Mic,
} from "lucide-react";
import { useSearch } from "@/context/search-context";
import { useLyricsSearch } from "@/hooks/useLyricsSearch";
import { useAudio } from "@/context/audio-context";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import ProfileDropdown from "@/components/auth/ProfileDropdown";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

function SearchResultImage({ song }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !song.coverUrl) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center">
        <Music className="w-3.5 h-3.5 text-white/30" />
      </div>
    );
  }

  return (
    <ImageWithFallback
      src={song.coverUrl}
      alt={song.title}
      width={32}
      height={32}
      className="w-full h-full object-cover"
      sizes="32px"
    />
  );
}

export default function Header({ setShowAuth, setAuthMode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  const { searchQuery, setSearchQuery, showFullResults, setShowFullResults, searchMode, setSearchMode, voiceSearchTrigger } =
    useSearch();
  const {
    songs,
    playSong,
    activeTab,
    setActiveTab,
    setActivePlaylistId,
    setViewedSongId,
    setShowFullHome,
  } = useAudio();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeout = useRef(null);

  const {
    inputValue,
    handleChange: handleSearchChange,
    flush: flushSearch,
    clear: clearSearch,
  } = useDebouncedSearch({
    initialValue: searchQuery,
    onCommit: setSearchQuery,
    debounceMs: 250,
  });

  // Lyrics search state (only used when searchMode === "lyrics")
  const {
    query: lyricsQuery,
    setQuery: setLyricsQuery,
    results: lyricsResults,
    total: lyricsTotal,
    loading: lyricsLoading,
    clear: clearLyricsSearch,
  } = useLyricsSearch({ debounceMs: 350 });

  useEffect(() => {
    if (voiceSearchTrigger > 0) {
      startVoiceSearch();
    }
  }, [voiceSearchTrigger]);

  const onSearchChange = (e) => {
    handleSearchChange(e);
    setShowFullResults(false);
    // Always update lyrics query for live results
    setLyricsQuery(e.target.value);
  };

  const [voiceSearchState, setVoiceSearchState] = useState("inactive"); // "inactive" | "listening" | "error"
  const recognitionRef = useRef(null);
  const hasVoiceResultRef = useRef(false);
  const isManualCloseRef = useRef(false);

  const startVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "te-IN";

      hasVoiceResultRef.current = false;
      isManualCloseRef.current = false;

      rec.onstart = () => {
        setVoiceSearchState("listening");
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (!isManualCloseRef.current) {
          setVoiceSearchState("error");
        }
      };

      rec.onend = () => {
        if (isManualCloseRef.current) {
          setVoiceSearchState("inactive");
          return;
        }
        if (!hasVoiceResultRef.current) {
          setVoiceSearchState("error");
        }
      };

      rec.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          hasVoiceResultRef.current = true;
          onSearchChange({ target: { value: resultText } });
          setSearchQuery(resultText);
          setShowFullResults(true);
          setVoiceSearchState("inactive");
          router.push("/home");
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error("Speech recognition init failed:", e);
      setVoiceSearchState("error");
    }
  };

  const handleVoiceSearch = () => {
    if (voiceSearchState === "listening") {
      isManualCloseRef.current = true;
      recognitionRef.current?.stop();
      setVoiceSearchState("inactive");
    } else {
      startVoiceSearch();
    }
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => {
      setIsFocused(false);
    }, 180);
  };

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setIsFocused(true);
  };

  useEffect(() => {
    return () => {
      if (blurTimeout.current) clearTimeout(blurTimeout.current);
    };
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase().normalize("NFC");

  const normalizeText = (value) => (value || "").toString().toLowerCase().normalize("NFC");

  const totalMatches = songs.filter((song) => {
    if (!trimmedQuery) return false;
    const titleMatch = normalizeText(song.title).includes(trimmedQuery);
    const telTitleMatch = normalizeText(song.teluguTitle).includes(trimmedQuery);
    const titleEnglishMatch = normalizeText(song.titleEnglish).includes(trimmedQuery);
    const artistMatch = normalizeText(song.artist).includes(trimmedQuery);

    // Check all possible lyrics fields to match Telugu and English lyrics
    const lyricsSources = [
      song.lyrics,
      song.lyricsTelugu,
      song.lyricsEnglish,
    ];
    const lyricsMatch = lyricsSources.some((source) => {
      if (!source) return false;
      const text = Array.isArray(source) ? source.join(" ") : source;
      return text.toLowerCase().normalize("NFC").includes(trimmedQuery);
    });

    return titleMatch || telTitleMatch || titleEnglishMatch || artistMatch || lyricsMatch;
  });

  const matchingSongs = totalMatches.slice(0, 5);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      flushSearch(); // ensure context has the latest typed value
      setShowFullResults(true);
      setIsFocused(false);
      e.target.blur();
      router.push("/home");
    }
  };

  return (
    <header
      className={`h-16 bg-canvas/95 backdrop-blur-md border-b border-line-muted p-2 items-center justify-between gap-6 shrink-0 sticky top-0 z-50 lg:flex flex`}
    >
      <Link
        href="/home"
        onClick={() => {
          setActiveTab("discover");
          setActivePlaylistId(null);
          setViewedSongId(null);
          setSearchQuery("");
          setShowFullResults(false);
          setShowFullHome(true);
        }}
        className="flex items-center gap-2 md:gap-4 flex-shrink-0 group"
        aria-label="You Worship home"
      >
        <div className="bg-black rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-md">
          <ImageWithFallback
            src="/youworship-logo.png"
            alt="You Worship"
            width={44}
            height={44}
            className="w-8 h-8 md:w-10 md:h-10 object-contain"
          />
        </div>
        <div className="flex min-w-0 flex-col leading-none">
          <span className="text-sm md:text-[19px] font-black tracking-[0.01em] text-title whitespace-nowrap">
            You Worship
          </span>
          <span className="mt-1 text-[11px] font-bold tracking-[0.16em] text-amber-400">
            Anywhere
          </span>
        </div>
      </Link>

      <div className="hidden lg:flex items-center gap-3 flex-1 max-w-[480px] mx-auto h-full">
        <button
          onClick={() => {
            setActiveTab("discover");
            setActivePlaylistId(null);
            setViewedSongId(null);
            clearSearch();
            setShowFullHome(true);
            router.push("/home");
          }}
          className="p-2 hover:bg-card-hover rounded-full text-dim hover:text-copy cursor-pointer transition-all duration-200 active:scale-90 flex-shrink-0"
          title="Home"
          aria-label="Go to Home"
        >
          <Home className="w-5 h-5" />
        </button>

        <div className="relative flex-1 h-full group">
          <Search className="w-4.5 h-4.5 text-muted absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-copy" />
          <input
            type="text"
            placeholder="Search songs, artists, lyrics..."
            value={inputValue}
            onChange={onSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full pl-11 pr-16 text-sm bg-input border border-line/50 rounded-full focus:outline-none focus:border-white/35 focus:bg-card-hover transition-all duration-200 text-copy placeholder-muted/70"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="p-1 hover:bg-line/30 rounded-full text-dim hover:text-copy cursor-pointer transition-all duration-150"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab(
                  activeTab === "categories" ? "discover" : "categories",
                );
                if (activeTab !== "categories") {
                  clearSearch();
                  router.push("/home");
                }
              }}
              className={`p-1 hover:bg-line/30 rounded-full cursor-pointer transition-all duration-150 ${
                activeTab === "categories"
                  ? "text-title bg-card-hover"
                  : "text-dim hover:text-copy"
              }`}
              title="Browse Categories"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Unified Quick Search Dropdown */}
          {isFocused && searchQuery && !showFullResults && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-card border border-line rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)_inset] z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Results Container */}
              <div className="max-h-[360px] overflow-y-auto no-scrollbar py-1">
                
                {/* 1. Song matches */}
                {matchingSongs.length > 0 && (
                  <>
                    <div className="px-4 py-2 border-b border-line/35">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-[0.18em]">
                        Songs
                      </span>
                    </div>
                    {matchingSongs.map((song) => (
                      <button
                        key={song.id}
                        onMouseDown={() => {
                          playSong(song);
                          setIsFocused(false);
                          router.push(`/song/${encodeURIComponent(song.slug || song.id)}`);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-card-hover/40 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-line shrink-0 bg-card-hover">
                          <SearchResultImage song={song} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-title block truncate transition-colors">
                            {song.teluguTitle || song.title}
                          </span>
                          <span className="text-[10px] text-muted block truncate mt-0.5">
                            {song.titleEnglish && song.titleEnglish !== (song.teluguTitle || song.title) ? `${song.titleEnglish} • ` : ""}{song.artist}
                          </span>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-card-hover group-hover:bg-white flex items-center justify-center text-title group-hover:text-black opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <Play className="w-3 h-3 fill-current text-current pl-[1px]" />
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* 2. Lyrics matches (from useLyricsSearch) */}
                {lyricsResults.length > 0 && (
                  <>
                    <div className="px-4 py-2 border-b border-line/35 mt-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        ♪ Found in lyrics
                      </span>
                    </div>
                    {lyricsResults.slice(0, 5).map((song) => (
                      <button
                        key={song.songId}
                        onMouseDown={() => {
                          playSong({
                            id: song.songId,
                            title: song.title,
                            teluguTitle: song.teluguTitle,
                            titleEnglish: song.titleEnglish,
                            artist: song.artist,
                            imageUrl: song.imageUrl,
                            slug: song.slug,
                          });
                          setIsFocused(false);
                          router.push(`/song/${encodeURIComponent(song.slug || song.songId)}`);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-card-hover/40 text-left transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-line shrink-0 bg-card-hover">
                          <SearchResultImage song={{ coverUrl: song.imageUrl, title: song.title }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-title block truncate transition-colors">
                            {song.teluguTitle || song.title}
                          </span>
                          {song.matchedLines.length > 0 && (
                            <span className="text-[10px] text-amber-400/80 block truncate mt-0.5">
                              {song.matchedLines[0].text.slice(0, 50)}{song.matchedLines[0].text.length > 50 ? "..." : ""}
                            </span>
                          )}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-card-hover group-hover:bg-white flex items-center justify-center text-title group-hover:text-black opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <Play className="w-3 h-3 fill-current text-current pl-[1px]" />
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Loading state if we are searching and have no results yet */}
                {lyricsLoading && matchingSongs.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-muted">Searching...</p>
                  </div>
                )}

                {/* Empty state */}
                {matchingSongs.length === 0 && lyricsResults.length === 0 && !lyricsLoading && (
                  <div className="px-4 py-8 text-center">
                    <Search className="w-5 h-5 text-dim mx-auto mb-2" />
                    <p className="text-xs text-muted">No matching songs found</p>
                  </div>
                )}
              </div>

              {/* See all results */}
              {(totalMatches.length > 0 || lyricsTotal > 0) && (
                <button
                  onMouseDown={() => {
                    setShowFullResults(true);
                    setIsFocused(false);
                    router.push("/home");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-card-hover/20 hover:bg-card-hover/50 text-[10px] font-semibold text-muted hover:text-title uppercase tracking-widest border-t border-line transition-all cursor-pointer"
                >
                  <span>See all results</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Circular Microphone Button for Voice Search */}
        <button
          onClick={handleVoiceSearch}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 cursor-pointer ${
            voiceSearchState === "listening"
              ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.2)]"
              : "bg-card border-line hover:border-white/35 text-dim hover:text-title hover:bg-card-hover"
          }`}
          title="Voice Search"
        >
          {voiceSearchState === "listening" ? (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all duration-300 cursor-pointer hover:bg-card-hover active:scale-90 text-title`}
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>

        {isAuthenticated && user ? (
          /* ─── Logged In: ProfileDropdown ─── */
          <ProfileDropdown />
        ) : (
          /* ─── Logged Out: Sign Up + Log In ─── */
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAuthMode("signup");
                setShowAuth(true);
              }}
              className="px-4 py-1.5 rounded-full bg-[#D4A32A] text-black text-xs font-bold hover:bg-[#c49527] transition-all active:scale-95 cursor-pointer"
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuth(true);
              }}
              className="px-4 py-1.5 rounded-full border border-[#D4A32A] text-[#D4A32A] text-xs font-bold hover:bg-[#D4A32A]/10 transition-all active:scale-95 cursor-pointer"
            >
              Log In
            </button>
          </div>
        )}
      </div>

      {/* Voice Search Immersive Modal Overlay (using Portal to escape relative layout clip bounds) */}
      {mounted && typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {voiceSearchState !== "inactive" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0B0E]/85 backdrop-blur-md p-6 select-none"
                >
                  {/* Modal Card */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-card border border-line rounded-3xl w-full max-w-md p-8 flex flex-col items-center justify-center gap-10 shadow-[0_24px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => {
                        isManualCloseRef.current = true;
                        recognitionRef.current?.stop();
                        setVoiceSearchState("inactive");
                      }}
                      className="absolute top-4 right-4 p-2 hover:bg-card-hover rounded-full text-dim hover:text-copy cursor-pointer transition-colors duration-150 active:scale-95"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Text Indicator */}
                    <div className="text-center space-y-2 mt-4">
                      <h3 className="text-xl font-bold text-title tracking-tight transition-all duration-300">
                        {voiceSearchState === "listening" ? "Listening..." : "Didn't hear that. Try again."}
                      </h3>
                      <p className="text-xs text-muted">
                        {voiceSearchState === "listening" ? "Speak now in Telugu or English" : "Tap the microphone below to try again"}
                      </p>
                    </div>

                    {/* Listening Waveform (only when listening) */}
                    {voiceSearchState === "listening" && (
                      <div className="flex items-center gap-1.5 h-8">
                        <span className="w-1.5 bg-amber-400 rounded-full animate-voice-wave-1 h-3" />
                        <span className="w-1.5 bg-amber-400 rounded-full animate-voice-wave-2 h-6" />
                        <span className="w-1.5 bg-amber-400 rounded-full animate-voice-wave-3 h-4" />
                        <span className="w-1.5 bg-amber-400 rounded-full animate-voice-wave-4 h-7" />
                        <span className="w-1.5 bg-amber-400 rounded-full animate-voice-wave-5 h-3" />
                      </div>
                    )}

                    {/* Large Circular Microphone Button */}
                    <div className="relative flex items-center justify-center">
                      {voiceSearchState === "listening" && (
                        <>
                          <span className="absolute w-28 h-28 rounded-full bg-amber-400/10 animate-ping duration-1000" />
                          <span className="absolute w-24 h-24 rounded-full bg-amber-400/20 animate-pulse duration-700" />
                        </>
                      )}
                      <button
                        onClick={() => {
                          if (voiceSearchState === "listening") {
                            isManualCloseRef.current = true;
                            recognitionRef.current?.stop();
                            setVoiceSearchState("error");
                          } else {
                            startVoiceSearch();
                          }
                        }}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 shadow-lg cursor-pointer ${
                          voiceSearchState === "listening"
                            ? "bg-[#D4A32A] border-[#D4A32A] text-black active:scale-95 shadow-[#D4A32A]/20 hover:bg-[#c49527]"
                            : "bg-card-hover border-line hover:border-white/35 text-dim hover:text-title hover:scale-105 active:scale-95"
                        }`}
                      >
                        <Mic className="w-8 h-8 fill-current" />
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}

    </header>
  );
}
