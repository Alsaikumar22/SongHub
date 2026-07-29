"use client";

import React from "react";
import { Play, Pause } from "lucide-react";
import SongArtwork from "../ui/SongArtwork";
import ProtectedAction from "@/components/auth/ProtectedAction";

export default function SongCard({ song, currentSong, isPlaying, playSong, size = "md" }) {
  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;

  const isSmall = size === "sm";

  return (
    <ProtectedAction action={() => playSong(song)}>
    <div
      className={`relative flex-shrink-0 ${isSmall ? "w-36" : "w-48"} transition-all duration-300 group cursor-pointer`}
    >
      <div
        className={`relative aspect-square w-full rounded-xl overflow-hidden border border-line/50 shadow-md bg-card ${
          isSmall ? "mb-2" : "mb-3"
        }`}
      >
        <SongArtwork
          song={song}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          iconSize="w-8 h-8"
        />

        {/* Overlay: centered play/pause — always visible on mobile, hover on desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div
            className={`transform scale-90 group-hover:scale-100 transition-transform duration-200 pointer-events-auto rounded-full bg-white text-black flex items-center justify-center shadow-xl ${
              isSmall ? "w-9 h-9" : "w-11 h-11"
            }`}
          >
            {isThisPlaying ? (
              <Pause className={isSmall ? "w-4 h-4 fill-current text-black" : "w-5 h-5 fill-current text-black"} />
            ) : (
              <Play className={`fill-current ml-0.5 text-black ${isSmall ? "w-4 h-4" : "w-5 h-5"}`} />
            )}
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/60 rounded-md text-xs text-handle font-medium z-10">
          {song.duration}
        </div>
      </div>

      <span
        className={`font-semibold text-title block truncate group-hover:text-handle transition-colors ${
          isSmall ? "text-sm" : "text-base"
        } ${song.teluguTitle ? "font-telugu" : ""}`}
      >
        {song.teluguTitle || song.title}
      </span>

      <span className={`text-muted block truncate mt-0.5 ${isSmall ? "text-xs" : "text-sm"}`}>
        {song.titleEnglish}
      </span>
    </div>
    </ProtectedAction>
  );
}
