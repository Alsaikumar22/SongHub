"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Heart, Share2, Download, MoreVertical, Check } from "lucide-react";
import { useAudio } from "@/context/audio-context";

export default function CategorySongCard({ song, language, onClick }) {
  const { toggleFavorite, favorites, currentSong, isPlaying } = useAudio();
  const [isShared, setIsShared] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const isSongPlaying = isCurrent && isPlaying;
  const isFav = favorites.includes(song.id);

  // If language is Telugu, show Telugu title, and English title as transliteration.
  const displayTitle = language === "telugu" && song.teluguTitle ? song.teluguTitle : song.title;
  const subtitle = language === "telugu" && song.teluguTitle ? song.title : null;

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
      className="relative rounded-2xl p-4 bg-white/[0.02] border border-white/5 shadow-lg flex flex-col justify-between select-none cursor-pointer group transition-all duration-300"
      whileHover={{
        scale: 1.04,
        borderColor: "rgba(255, 255, 255, 0.25)",
        boxShadow: "0 0 20px rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.4)"
      }}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 border border-white/5">
        <motion.img
          src={song.coverUrl || "/worship_forest.png"}
          alt={song.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Hover overlay with Play button */}
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255, 255, 255, 0.2)] scale-90 group-hover:scale-100 transition-all duration-300">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Active Now Playing indicator */}
        {isSongPlaying && (
          <div className="absolute bottom-2 right-2 bg-white text-black px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase animate-pulse">
            Playing
          </div>
        )}
      </div>

      {/* Info and Titles */}
      <div className="flex-1 min-w-0 mb-3">
        <h4 className={`text-sm font-black truncate leading-tight transition-colors ${isCurrent ? "text-white font-extrabold" : "text-white"}`}>
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
      <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
        <span className="text-[10px] font-bold text-muted">{song.duration}</span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleFavoriteClick}
            className={`p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${isFav ? "text-red-400" : "text-muted hover:text-white"}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
          </button>
          
          <button
            onClick={handleShareClick}
            className={`p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${isShared ? "text-white" : "text-muted hover:text-white"}`}
          >
            {isShared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={handleDownloadClick}
            className="p-1 rounded-full hover:bg-white/5 text-muted hover:text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleMoreClick}
            className="p-1 rounded-full hover:bg-white/5 text-muted hover:text-white transition-colors cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
