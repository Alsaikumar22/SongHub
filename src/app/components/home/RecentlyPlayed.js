"use client";

import React, { useRef } from "react";
import { useAudio } from "../../context/audio-context";
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

  if (recentlyPlayedList.length === 0) return null;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-white/90 uppercase tracking-wider">
          Recently Played
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollRecent("left")}
              className="w-8 h-8 rounded-full bg-card-hover hover:bg-line/40 border border-line/55 flex items-center justify-center text-white hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollRecent("right")}
              className="w-8 h-8 rounded-full bg-card-hover hover:bg-line/40 border border-line/55 flex items-center justify-center text-white hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setActiveTab("recently-played");
              setActivePlaylistId(null);
            }}
            className="text-sm font-semibold text-white/95 hover:text-white hover:underline transition-all cursor-pointer"
          >
            View All
          </button>
        </div>
      </div>
      <div ref={recentScrollRef} className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
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
    </div>
  );
}
