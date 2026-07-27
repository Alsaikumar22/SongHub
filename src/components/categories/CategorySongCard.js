"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Heart, Share2, Download, MoreVertical, Check } from "lucide-react";
import { useAudio } from "@/context/audio-context";
import ProtectedAction from "@/components/auth/ProtectedAction";

export default function CategorySongCard({ song, language, onClick }) {
  const { toggleFavorite, favorites, currentSong, isPlaying, playSong } = useAudio();
  const [isShared, setIsShared] = useState(false);

  const handlePlayClick = () => {
    if (onClick) {
      onClick();
    } else {
      playSong(song);
    }
  };

  const isCurrent = currentSong?.id === song.id;
  const isSongPlaying = isCurrent && isPlaying;
  const isFav = favorites.includes(song.id);

  const displayTitle = language === "telugu" && song.teluguTitle ? song.teluguTitle : (song.titleEnglish || song.title);
  const subtitle = language === "telugu" ? (song.titleEnglish || null) : (song.teluguTitle || null);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(song.id);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setIsShared(true);
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/song/${song.id}`);
    }
    setTimeout(() => setIsShared(false), 2000);
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    // Simulate download
    alert(`Downloading "${song.title}"...`);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      onClick={onClick}
      className="relative rounded-2xl p-4 bg-card-hover/20 border border-line shadow-lg flex flex-col justify-between select-none cursor-pointer group transition-all duration-300"
      whileHover={{
        scale: 1.04,
        borderColor: "rgba(255, 255, 255, 0.25)",
        boxShadow: "0 0 20px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.4)"
      }}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 border border-line">
        <motion.img
          src={song.coverUrl}
          alt={song.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxZTFlMWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYTBhMGEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0zOCA1NSBMMzggODUgTDU1IDgwIEw1NSA1MFoiIGZpbGw9IiMzMzMiLz48L3N2Zz4='; }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Hover overlay with Play button */}
        <ProtectedAction action={handlePlayClick}>
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255, 255, 255, 0.2)] scale-90 group-hover:scale-100 transition-all duration-300">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        </ProtectedAction>

        {/* Active Now Playing indicator */}
        {isSongPlaying && (
          <div className="absolute bottom-2 right-2 bg-white text-black px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase animate-pulse">
            Playing
          </div>
        )}
      </div>

      {/* Info and Titles */}
      <div className="flex-1 min-w-0 mb-3">
        <h4 className={`text-sm font-black truncate leading-tight transition-colors ${isCurrent ? "text-white font-extrabold" : "text-title"}`}>
          {displayTitle}
        </h4>
        {subtitle && (
          <p className="text-[11px] text-muted/80 truncate mt-0.5 italic">
            {subtitle}
          </p>
        )}
        <p className="text-xs text-muted truncate mt-1">
          {song.artist}
        </p>
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-line">
        <span className="text-[10px] font-bold text-muted">{song.duration}</span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleFavoriteClick}
            className={`p-1 rounded-full hover:bg-card-hover transition-colors cursor-pointer ${isFav ? "text-red-400" : "text-muted hover:text-title"}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
          </button>
          
          <button
            onClick={handleShareClick}
            className={`p-1 rounded-full hover:bg-card-hover transition-colors cursor-pointer ${isShared ? "text-title" : "text-muted hover:text-title"}`}
          >
            {isShared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={handleDownloadClick}
            className="p-1 rounded-full hover:bg-card-hover text-muted hover:text-title transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleMoreClick}
            className="p-1 rounded-full hover:bg-card-hover text-muted hover:text-title transition-colors cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
