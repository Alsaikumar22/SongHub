"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Heart, Share2, Download, MoreVertical, Check } from "lucide-react";
import { useAudio } from "../../context/audio-context";

export default function CategoryPlaylistTable({ category, songs, language }) {
  const { currentSong, isPlaying, playSong, togglePlay, toggleFavorite, favorites } = useAudio();
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [sharedSongId, setSharedSongId] = useState(null);

  const categoryName = language === "telugu" ? category.nameTe : category.nameEn;

  if (songs.length === 0) {
    return (
      <div className="p-12 text-center text-[#a7a7a7] border border-white/5 rounded-[22px] bg-[#121826]/20">
        <span className="font-semibold block text-white text-lg">No songs available</span>
        <span className="text-xs block mt-1">Try another language or search for a different theme.</span>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const handleShare = (e, songId) => {
    e.stopPropagation();
    setSharedSongId(songId);
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/song/${songId}`);
    }
    setTimeout(() => setSharedSongId(null), 2000);
  };

  const handleDownload = (e, songTitle) => {
    e.stopPropagation();
    alert(`Downloading "${songTitle}"...`);
  };

  return (
    <div className="w-full flex flex-col select-none">
      {/* Sticky Table Header */}
      <div className="sticky top-0 z-20 bg-[#070707] py-3 border-b border-white/5 grid grid-cols-[40px_1fr_80px] md:grid-cols-[40px_2.5fr_1.5fr_120px] lg:grid-cols-[40px_2.5fr_1.5fr_1.2fr_120px] gap-4 px-4 text-[11px] font-black text-[#a7a7a7] uppercase tracking-wider items-center select-none">
        <div className="text-center">#</div>
        <div>Title</div>
        <div className="hidden md:block">Album</div>
        <div className="hidden lg:block">Date Added</div>
        <div className="text-right pr-4">Duration</div>
      </div>

      {/* Table Body */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-1.5 mt-3"
      >
        {songs.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          const isSongPlaying = isCurrent && isPlaying;
          const isFav = favorites.includes(song.id);
          const isHovered = hoveredRowId === song.id;

          const displayTitle = language === "telugu" && song.teluguTitle ? song.teluguTitle : song.title;
          const subtitle = language === "telugu" && song.teluguTitle ? song.title : null;

          // Mock date added based on releaseYear or ID
          const year = song.releaseYear || 2024;
          const dateAdded = `Jan 15, ${year}`;

          return (
            <motion.div
              key={song.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredRowId(song.id)}
              onMouseLeave={() => setHoveredRowId(null)}
              onClick={() => {
                if (isCurrent) {
                  togglePlay();
                } else {
                  playSong(song);
                }
              }}
              className={`grid grid-cols-[40px_1fr_80px] md:grid-cols-[40px_2.5fr_1.5fr_120px] lg:grid-cols-[40px_2.5fr_1.5fr_1.2fr_120px] gap-4 items-center px-4 py-2.5 rounded-xl cursor-pointer border transition-all duration-200 select-none ${
                isCurrent
                  ? "bg-[#1E293B]/70 border-[#D4A32A]/30 shadow-[0_0_15px_rgba(212,163,42,0.08)]"
                  : "bg-transparent border-transparent hover:bg-card-hover/40"
              }`}
              whileHover={{
                scale: 1.01,
                borderColor: isCurrent ? "rgba(212, 163, 42, 0.45)" : "rgba(212, 163, 42, 0.25)",
                boxShadow: "0 0 15px rgba(212, 163, 42, 0.12), 0 4px 12px rgba(0, 0, 0, 0.3)"
              }}
            >
              {/* Index / Play Button */}
              <div className="w-10 flex items-center justify-center">
                {isHovered ? (
                  <button className="text-white hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                    {isSongPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                ) : isCurrent ? (
                  /* Animated Visualizer using app's classes */
                  <div className="flex items-end gap-[2px] w-4 h-4 text-[#D4A32A]">
                    <div className="w-[3px] bg-current rounded-full animate-music-bar-1" style={{ height: '30%' }}></div>
                    <div className="w-[3px] bg-current rounded-full animate-music-bar-2" style={{ height: '60%' }}></div>
                    <div className="w-[3px] bg-[#F5D061] rounded-full animate-music-bar-3" style={{ height: '40%' }}></div>
                  </div>
                ) : (
                  <span className="text-xs font-semibold tabular-nums text-[#a7a7a7]">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Title, Artist and Transliteration */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={song.coverUrl || "/worship_forest.png"}
                  alt={song.title}
                  className="w-10 h-10 object-cover rounded-lg border border-white/5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className={`font-bold text-sm block truncate transition-colors ${
                    isCurrent ? "text-[#D4A32A]" : "text-white"
                  }`}>
                    {displayTitle}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs text-[#a7a7a7] truncate">
                      {song.artist}
                    </span>
                    {subtitle && (
                      <>
                        <span className="text-[10px] text-[#a7a7a7]/40">&bull;</span>
                        <span className="text-[11px] text-[#a7a7a7]/60 truncate italic font-medium">
                          {subtitle}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Album (Category name) */}
              <div className="hidden md:block text-xs text-[#a7a7a7] truncate">
                {categoryName}
              </div>

              {/* Date Added */}
              <div className="hidden lg:block text-xs text-[#a7a7a7]/80">
                {dateAdded}
              </div>

              {/* Duration & Hover actions */}
              <div className="text-right pr-4 text-xs font-semibold text-[#a7a7a7] tabular-nums flex items-center justify-end relative h-10">
                <span className={`transition-opacity duration-200 ${isHovered ? "opacity-0 invisible" : "opacity-100"}`}>
                  {song.duration}
                </span>

                <div className={`absolute right-4 flex items-center gap-1 transition-all duration-200 ${isHovered ? "opacity-100 visible translate-x-0" : "opacity-0 invisible translate-x-2"}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song.id);
                    }}
                    className={`p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${isFav ? "text-red-400" : "text-[#a7a7a7] hover:text-white"}`}
                    title="Favorite"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                  </button>

                  <button
                    onClick={(e) => handleShare(e, song.id)}
                    className={`p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${sharedSongId === song.id ? "text-[#D4A32A]" : "text-[#a7a7a7] hover:text-white"}`}
                    title="Share"
                  >
                    {sharedSongId === song.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => handleDownload(e, song.title)}
                    className="p-1.5 rounded-full hover:bg-white/5 text-[#a7a7a7] hover:text-white transition-colors cursor-pointer"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1.5 rounded-full hover:bg-white/5 text-[#a7a7a7] hover:text-white transition-colors cursor-pointer"
                    title="More"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
