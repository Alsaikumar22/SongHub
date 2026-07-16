"use client";

import React, { useState, useEffect, useRef } from "react";
import { Music, Search, X, Play, ArrowRight } from "lucide-react";
import { useSearch } from "../../context/search-context";
import { useAudio } from "../../context/audio-context";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, showFullResults, setShowFullResults } = useSearch();
  const { songs, playSong } = useAudio();
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

  const totalMatches = songs.filter(song => {
    if (!trimmedQuery) return false;
    const titleMatch = (song.title || "").toLowerCase().includes(trimmedQuery);
    const telTitleMatch = (song.teluguTitle || "").toLowerCase().includes(trimmedQuery);
    const artistMatch = (song.artist || "").toLowerCase().includes(trimmedQuery);
    const lyricsMatch = (song.lyrics || "").toLowerCase().includes(trimmedQuery);
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
    <header className="h-16 bg-canvas/95 backdrop-blur-md border-b border-line-muted p-2 flex items-center justify-between gap-6 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-card-hover flex items-center justify-center text-white shadow-sm">
          <Music className="w-4 h-4" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-title hidden sm:inline">
          SongHub
        </span>
      </div>

      <div className="relative flex-1 max-w-sm h-full mx-auto group">
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
          className="w-full h-full pl-10 pr-10 text-sm bg-card border border-white/5 rounded-full focus:outline-none focus:border-white/20 focus:bg-[#181818] transition-all duration-200 text-copy placeholder-muted/50"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setShowFullResults(false);
            }}
            className="p-1 hover:bg-card-hover rounded-md absolute right-2 top-1/2 -translate-y-1/2 text-dim hover:text-copy cursor-pointer transition-all duration-150"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Quick Search Dropdown */}
        {isFocused && searchQuery && !showFullResults && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#121212] border border-white/[0.07] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)_inset] z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
              <span className="text-[10px] font-bold text-muted uppercase tracking-[0.18em]">
                Songs
              </span>
              <span className="text-[10px] text-dim tabular-nums">
                {totalMatches.length} result{totalMatches.length !== 1 ? "s" : ""}
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
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/[0.06] shrink-0 bg-card-hover">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-white block truncate group-hover:text-white/80 transition-colors">
                      {song.teluguTitle || song.title}
                    </span>
                    <span className="text-[10px] text-muted block truncate mt-0.5">
                      {song.artist}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-white/40 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
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
            {matchingSongs.length > 0 && (
              <button
                onMouseDown={() => {
                  setShowFullResults(true);
                  setIsFocused(false);
                  router.push("/");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-semibold text-muted hover:text-white uppercase tracking-widest border-t border-white/[0.05] transition-all cursor-pointer"
              >
                <span>See all {totalMatches.length} results</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-medium text-dim hidden sm:inline">
          Collaborator Mode
        </span>
        <div className="w-8 h-8 rounded-full bg-card-hover border border-line flex items-center justify-center text-xs font-semibold text-handle">
          CM
        </div>
      </div>
    </header>
  );
}
