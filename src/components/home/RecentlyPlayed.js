"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAudio } from "@/context/audio-context";
import SongCard from "./SongCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RecentlyPlayed() {
  const {
    songs,
    recentlyPlayed,
    currentSong,
    isPlaying,
    playSong,
    setActiveTab,
    setActivePlaylistId,
  } = useAudio();

  const recentScrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const updateScrollStatus = () => {
    const el = recentScrollRef.current;
    if (el) {
      setShowLeftArrow(el.scrollLeft > 10);
      setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  const scrollRecent = (direction) => {
    const el = recentScrollRef.current;
    if (el) {
      const scrollAmount = 300;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const recentlyPlayedList = recentlyPlayed
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean);

  useEffect(() => {
    const el = recentScrollRef.current;
    if (el) {
      updateScrollStatus();
      window.addEventListener("resize", updateScrollStatus);
      return () => window.removeEventListener("resize", updateScrollStatus);
    }
  }, [recentlyPlayedList]);

  if (recentlyPlayedList.length === 0) return null;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-title/90 uppercase tracking-wider">
          Recently Played
        </h2>
        <button
          onClick={() => {
            setActiveTab("recently-played");
            setActivePlaylistId(null);
          }}
          className="text-xs font-bold text-handle hover:text-title transition-colors cursor-pointer"
        >
          Show all
        </button>
      </div>
      <div className="relative group/row">
        {/* Left overlay arrow — centered vertically on sm cover art (top-[72px]) */}
        <button
          onClick={() => scrollRecent("left")}
          className={`absolute left-2 top-[72px] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 hover:bg-card-hover backdrop-blur-sm hover:scale-105 items-center justify-center text-title cursor-pointer opacity-0 group-hover/row:opacity-100 transition-all duration-200 border border-line shadow-xl hidden ${
            showLeftArrow ? "md:flex" : "md:hidden"
          } animate-in fade-in zoom-in`}
          title="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={recentScrollRef}
          onScroll={updateScrollStatus}
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
        >
          {recentlyPlayedList.map((song) => (
            <SongCard
              key={`recent-${song.id}`}
              song={song}
              currentSong={currentSong}
              isPlaying={isPlaying}
              playSong={playSong}
              size="sm"
            />
          ))}
        </div>

        {/* Right overlay arrow — centered vertically on sm cover art (top-[72px]) */}
        <button
          onClick={() => scrollRecent("right")}
          className={`absolute right-2 top-[72px] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 hover:bg-card-hover backdrop-blur-sm hover:scale-105 items-center justify-center text-title cursor-pointer opacity-0 group-hover/row:opacity-100 transition-all duration-200 border border-line shadow-xl hidden ${
            showRightArrow ? "md:flex" : "md:hidden"
          } animate-in fade-in zoom-in`}
          title="Scroll Right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
