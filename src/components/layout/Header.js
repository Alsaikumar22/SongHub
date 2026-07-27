"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useSearch } from "@/context/search-context";
import { useAudio } from "@/context/audio-context";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import ProfileDropdown from "@/components/auth/ProfileDropdown";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    <img
      src={song.coverUrl}
      alt={song.title}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function Header({ setShowAuth, setAuthMode }) {
  const router = useRouter();
  const { searchQuery, setSearchQuery, showFullResults, setShowFullResults } =
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

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const totalMatches = songs.filter((song) => {
    if (!trimmedQuery) return false;
    const titleMatch = (song.title || "").toLowerCase().includes(trimmedQuery);
    const telTitleMatch = (song.teluguTitle || "")
      .toLowerCase()
      .includes(trimmedQuery);
    const artistMatch = (song.artist || "")
      .toLowerCase()
      .includes(trimmedQuery);
    const lyricsRaw = song.lyrics;
    const lyricsStr = Array.isArray(lyricsRaw)
      ? lyricsRaw.join(" ")
      : lyricsRaw || "";
    const lyricsMatch = lyricsStr.toLowerCase().includes(trimmedQuery);
    return titleMatch || telTitleMatch || artistMatch || lyricsMatch;
  });

  const matchingSongs = totalMatches.slice(0, 5);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setShowFullResults(true);
      setIsFocused(false);
      e.target.blur();
      router.push("/");
    }
  };

  return (
    <header
      className={`h-16 bg-canvas/95 backdrop-blur-md border-b border-line-muted p-2 items-center justify-between gap-6 shrink-0 sticky top-0 z-50 lg:flex flex`}
    >
      <Link
        href="/"
        onClick={() => {
          setActiveTab("discover");
          setActivePlaylistId(null);
          setViewedSongId(null);
          setSearchQuery("");
          setShowFullResults(false);
          setShowFullHome(true);
        }}
        className="flex items-center gap-4 flex-shrink-0 group"
        aria-label="You Worship home"
      >
        <img
          src="/youlogo.png"
          alt="You Worship"
          className="w-11 h-11 object-contain"
        />
        <div className="flex min-w-0 flex-col leading-none">
          <span className="text-[19px] font-black tracking-[0.01em] text-title whitespace-nowrap">
            You Worship
          </span>
          <span className="mt-1 hidden text-[11px] font-bold tracking-[0.16em] text-amber-400 sm:block">
            🎸Anywhere🎸
          </span>
        </div>
      </Link>

      <div className="hidden lg:flex items-center gap-3.5 flex-1 max-w-md mx-auto h-full">
        <button
          onClick={() => {
            setActiveTab("discover");
            setActivePlaylistId(null);
            setViewedSongId(null);
            setSearchQuery("");
            setShowFullResults(false);
            setShowFullHome(true);
            router.push("/");
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
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowFullResults(false);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full pl-11 pr-16 text-sm bg-input border border-line/50 rounded-full focus:outline-none focus:border-white/35 focus:bg-card-hover transition-all duration-200 text-copy placeholder-muted/70"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowFullResults(false);
                }}
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
                  setSearchQuery("");
                  setShowFullResults(false);
                  router.push("/");
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

          {/* Quick Search Dropdown */}
          {isFocused && searchQuery && !showFullResults && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-card border border-line rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)_inset] z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                <span className="text-[10px] font-bold text-muted uppercase tracking-[0.18em]">
                  Songs
                </span>
                <span className="text-[10px] text-dim tabular-nums">
                  {totalMatches.length} result
                  {totalMatches.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Results */}
              <div className="max-h-[280px] overflow-y-auto no-scrollbar py-1">
                {matchingSongs.map((song) => (
                  <button
                    key={song.id}
                    onMouseDown={() => {
                      playSong(song);
                      setIsFocused(false);
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
                        {song.artist}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-card-hover group-hover:bg-white flex items-center justify-center text-title group-hover:text-black opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <Play className="w-3 h-3 fill-current text-current pl-[1px]" />
                    </div>
                  </button>
                ))}

                {matchingSongs.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <Search className="w-5 h-5 text-dim mx-auto mb-2" />
                    <p className="text-xs text-muted">No matching songs found</p>
                  </div>
                )}
              </div>

              {/* See all results */}
              {totalMatches.length > 0 && (
                <button
                  onMouseDown={() => {
                    setShowFullResults(true);
                    setIsFocused(false);
                    router.push("/");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-card-hover/20 hover:bg-card-hover/50 text-[10px] font-semibold text-muted hover:text-title uppercase tracking-widest border-t border-line transition-all cursor-pointer hover:text-title"
                >
                  <span>See all {totalMatches.length} results</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
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

    </header>
  );
}
