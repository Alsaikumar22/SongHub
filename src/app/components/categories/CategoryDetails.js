"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Grid, List } from "lucide-react";
import { useAudio } from "../../context/audio-context";
import CategoryHeroBanner from "./CategoryHeroBanner";
import CategorySongCard from "./CategorySongCard";
import CategoryPlaylistTable from "./CategoryPlaylistTable";

export default function CategoryDetails({ category, language, onBack }) {
  const { songs, playSong } = useAudio();
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "playlist"

  const songIds = language === "telugu" ? category.songIdsTe : category.songIdsEn;
  
  // Filter songs based on category and language
  const categorySongs = (songs || [])
    .filter((song) => songIds.includes(song.id));

  // Reset viewMode when category changes
  useEffect(() => {
    setViewMode("cards");
  }, [category.id]);

  const handlePlayAll = () => {
    if (categorySongs.length > 0) {
      setViewMode("playlist");
      playSong(categorySongs[0]);
    }
  };

  const handleSongCardClick = (song) => {
    setViewMode("playlist");
    playSong(song);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Headers and Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            if (viewMode === "playlist") {
              setViewMode("cards");
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#a7a7a7] hover:text-white transition-all duration-150 cursor-pointer self-start select-none"
        >
          <ChevronLeft className="w-4 h-4" />
          {viewMode === "playlist" ? "Back to Song Cards" : "Back to Categories"}
        </button>

        {/* Toggle between Grid View and Playlist View */}
        {categorySongs.length > 0 && (
          <div className="flex bg-[#121826]/40 border border-white/5 rounded-lg p-0.5 shadow-md select-none">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#D4A32A]/20 text-[#D4A32A]"
                  : "text-[#a7a7a7] hover:text-white"
              }`}
              title="View as Cards Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("playlist")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "playlist"
                  ? "bg-[#D4A32A]/20 text-[#D4A32A]"
                  : "text-[#a7a7a7] hover:text-white"
              }`}
              title="View as Playlist Table"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Hero Banner Component */}
      <CategoryHeroBanner
        category={category}
        language={language}
        songCount={categorySongs.length}
        onPlayAll={handlePlayAll}
      />

      {/* Main Content Area: Song Cards Grid or Playlist Table */}
      <div className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
          {categorySongs.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-12 text-center text-[#a7a7a7] border border-white/5 rounded-[22px] bg-[#121826]/20 select-none"
            >
              <span className="font-semibold block text-white text-lg">No songs available</span>
              <span className="text-xs block mt-1">Try another language.</span>
            </motion.div>
          ) : viewMode === "cards" ? (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {categorySongs.map((song) => (
                <CategorySongCard
                  key={song.id}
                  song={song}
                  language={language}
                  onClick={() => handleSongCardClick(song)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="playlist-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <CategoryPlaylistTable
                category={category}
                songs={categorySongs}
                language={language}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
