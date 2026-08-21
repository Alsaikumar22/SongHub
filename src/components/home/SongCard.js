"use client";

import React from "react";
import Image from "next/image";
import { Play, Pause, Music } from "lucide-react";

const letterGradients = {
  A: "from-red-600 to-red-900",
  B: "from-orange-600 to-orange-900",
  C: "from-amber-600 to-amber-900",
  D: "from-yellow-600 to-yellow-900",
  E: "from-lime-600 to-lime-900",
  F: "from-green-600 to-green-900",
  G: "from-emerald-600 to-emerald-900",
  H: "from-teal-600 to-teal-900",
  I: "from-cyan-600 to-cyan-900",
  J: "from-sky-600 to-sky-900",
  K: "from-blue-600 to-blue-900",
  L: "from-indigo-600 to-indigo-900",
  M: "from-violet-600 to-violet-900",
  N: "from-purple-600 to-purple-900",
  O: "from-fuchsia-600 to-fuchsia-900",
  P: "from-pink-600 to-pink-900",
  Q: "from-rose-600 to-rose-900",
  R: "from-red-500 to-rose-900",
  S: "from-orange-500 to-amber-900",
  T: "from-yellow-500 to-lime-900",
  U: "from-green-500 to-emerald-900",
  V: "from-teal-500 to-cyan-900",
  W: "from-sky-500 to-blue-900",
  X: "from-indigo-500 to-violet-900",
  Y: "from-purple-500 to-fuchsia-900",
  Z: "from-pink-500 to-rose-900",
};

function getLetterGradient(song) {
  const title = song.titleEnglish || song.title || song.teluguTitle || "";
  const firstLetter = title.charAt(0).toUpperCase();
  return letterGradients[firstLetter] || "from-slate-600 to-slate-900";
}

export default function SongCard({ song, currentSong, isPlaying, playSong, size = "md", language }) {
  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;

  const isSmall = size === "sm";

  return (
    <div
      onClick={() => playSong(song)}
      className={`relative flex-shrink-0 ${isSmall ? "w-36" : "w-48"} transition-all duration-300 group cursor-pointer`}
    >
      <div
        className={`relative aspect-square w-full rounded-xl overflow-hidden border border-line/50 shadow-md bg-card ${
          isSmall ? "mb-2" : "mb-3"
        }`}
      >
        {song.imageUrl || song.coverUrl ? (
          <Image
            src={song.imageUrl || song.coverUrl}
            alt={song.teluguTitle || song.title}
            width={300}
            height={300}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getLetterGradient(song)} flex items-center justify-center`}>
            <Music className="w-10 h-10 text-white/25" />
          </div>
        )}

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
        className={`font-bold text-title block truncate group-hover:text-handle transition-colors ${
          isSmall ? "text-sm" : "text-base"
        } font-song-title`}
      >
        {language === "english"
          ? (song.titleEnglish || song.title)
          : (song.teluguTitle || song.title)}
      </span>

      {((language === "english"
        ? (song.teluguTitle && song.teluguTitle !== (song.titleEnglish || song.title) ? song.teluguTitle : null)
        : (song.titleEnglish && song.titleEnglish !== (song.teluguTitle || song.title) ? song.titleEnglish : null))) && (
        <span className={`text-muted block truncate mt-0.5 font-bold font-song-title ${isSmall ? "text-xs" : "text-sm"}`}>
          {language === "english" ? song.teluguTitle : song.titleEnglish}
        </span>
      )}
    </div>
  );
}
