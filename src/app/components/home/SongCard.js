"use client";

import React from "react";
import { Play, Pause } from "lucide-react";

export default function SongCard({ song, currentSong, isPlaying, playSong, size = "md" }) {
  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;

  const isSmall = size === "sm";

  return (
    <div
      onClick={() => playSong(song)}
      className={`flex-shrink-0 ${
        isSmall ? "w-36" : "w-48"
      } transition-all duration-300 group cursor-pointer`}
    >
      <div
        className={`relative aspect-square w-full rounded-xl overflow-hidden border border-line/50 shadow-md bg-card ${
          isSmall ? "mb-2" : "mb-3"
        }`}
      >
        <img
          src={song.coverUrl}
          alt={song.teluguTitle || song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div
            className={`rounded-full bg-title text-canvas flex items-center justify-center shadow-md scale-90 group-hover:scale-100 transition-transform ${
              isSmall ? "w-10 h-10" : "w-12 h-12"
            }`}
          >
            {isThisPlaying ? (
              <Pause className={isSmall ? "w-4.5 h-4.5 fill-current" : "w-5 h-5 fill-current"} />
            ) : (
              <Play className={`fill-current ml-0.5 ${isSmall ? "w-4.5 h-4.5" : "w-5 h-5"}`} />
            )}
          </div>
        </div>
        <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/60 rounded-md text-xs text-handle font-medium">
          {song.duration}
        </div>
      </div>
      <span
        className={`font-semibold text-white block truncate group-hover:text-handle transition-colors ${
          isSmall ? "text-sm" : "text-base"
        } ${song.teluguTitle ? "font-telugu" : ""}`}
      >
        {song.teluguTitle || song.title}
      </span>
      <span
        className={`text-muted block truncate mt-0.5 ${
          isSmall ? "text-xs" : "text-sm"
        }`}
      >
        {song.artist}
      </span>
    </div>
  );
}
