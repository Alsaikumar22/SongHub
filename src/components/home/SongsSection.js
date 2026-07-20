"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Grid, List, Plus, Share2, Check } from "lucide-react";
import SongCard from "./SongCard";
import SongArtwork from "../ui/SongArtwork";
import { useAudio } from "@/context/audio-context";
import CategoryPlaylistTable from "../categories/CategoryPlaylistTable";
import { SongsSectionSkeleton } from "../ui/SongSkeleton";
import { AnimatePresence, motion } from "framer-motion";

const TELUGU_ALPHABET_ORDER = [
  "అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఋ", "ౠ", "ఎ", "ఏ", "ఐ", "ఒ", "ఓ", "ఔ", "అం", "అః",
  "క", "ఖ", "గ", "ఘ", "ఙ", "చ", "ఛ", "జ", "ఝ", "ఞ", "ట", "ఠ", "డ", "ఢ", "ణ",
  "త", "థ", "ద", "ధ", "న", "ప", "ఫ", "బ", "భ", "మ", "య", "ర", "ల", "వ",
  "శ", "ష", "స", "హ", "ళ", "క్ష", "ఱ",
];

function teluguSort(a, b) {
  const o = TELUGU_ALPHABET_ORDER;
  const idxA = o.indexOf(a);
  const idxB = o.indexOf(b);
  
  if (idxA !== -1 && idxB !== -1) {
    return idxA - idxB;
  }
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;
  
  return a.localeCompare(b);
}

export default function SongsSection({
  songs,
  songsLoading,
  currentSong,
  isPlaying,
  playSong,
  selectedLetter,
  setSelectedLetter,
}) {
  const sectionRefs = useRef({});
  const scrollRefs = useRef({});
  const [activeLetter, setActiveLetter] = useState(selectedLetter || null);
  const [scriptLang, setScriptLang] = useState("telugu");

  // State hooks for Spotify-style letter detail views
  const { playlists, addSongToPlaylist } = useAudio();
  const [viewMode, setViewMode] = useState("playlist"); // "playlist" | "cards"
  const [isShared, setIsShared] = useState(false);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [scrollStates, setScrollStates] = useState({});

  // Sync scroll position & default views on selectedLetter change
  useEffect(() => {
    setViewMode("playlist");
    const scrollable = document.querySelector(".overflow-y-auto");
    if (scrollable) {
      scrollable.scrollTop = 0;
    }
  }, [selectedLetter]);

  // Click-outside dropdown closer
  useEffect(() => {
    const handleCloseMenu = () => {
      setShowPlaylistDropdown(false);
    };
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  const updateLetterScroll = (letter) => {
    const el = scrollRefs.current[letter];
    if (el) {
      setScrollStates((prev) => ({
        ...prev,
        [letter]: {
          left: el.scrollLeft > 10,
          right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10
        }
      }));
    }
  };

  const letterGroups = useMemo(() => {
    const groups = {};
    const safeSongs = Array.isArray(songs) ? songs : [];
    safeSongs.forEach((song) => {
      // 1. Group under Telugu letter
      if (song.teluguFirstLetter) {
        const tLetter = song.teluguFirstLetter;
        if (!groups[tLetter]) groups[tLetter] = [];
        groups[tLetter].push(song);
      }
      
      // 2. Group under English letter if the title starts with an English character
      const firstChar = song.title ? song.title.charAt(0).toUpperCase() : "";
      if (/[A-Z]/.test(firstChar)) {
        if (!groups[firstChar]) groups[firstChar] = [];
        if (!groups[firstChar].includes(song)) {
          groups[firstChar].push(song);
        }
      }
    });
    return groups;
  }, [songs]);

  const availableLetters = useMemo(() => {
    const activeKeys = Object.keys(letterGroups);
    if (scriptLang === "telugu") {
      return activeKeys.filter((k) => !/[A-Z]/.test(k)).sort(teluguSort);
    } else {
      return activeKeys.filter((k) => /[A-Z]/.test(k)).sort();
    }
  }, [letterGroups, scriptLang]);

  useEffect(() => {
    if (availableLetters.length > 0 && !selectedLetter) {
      setActiveLetter(availableLetters[0]);
    }
  }, [availableLetters, selectedLetter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      availableLetters.forEach((letter) => {
        updateLetterScroll(letter);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [availableLetters, songs]);

  const scrollRow = (letter, direction) => {
    const el = scrollRefs.current[letter];
    if (el) {
      const scrollAmt = 300;
      el.scrollLeft += direction === "left" ? -scrollAmt : scrollAmt;
    }
  };

  const handleLetterClick = (letter) => {
    if (selectedLetter) {
      setSelectedLetter(letter);
    } else {
      setActiveLetter(letter);
      const el = sectionRefs.current[letter];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleShare = () => {
    setIsShared(true);
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/?tab=discover&letter=${selectedLetter}`);
    }
    setTimeout(() => setIsShared(false), 2000);
  };

  const handlePlayAll = () => {
    const letterSongs = letterGroups[selectedLetter] || [];
    if (letterSongs.length > 0) {
      playSong(letterSongs[0]);
    }
  };

  if (songsLoading) {
    return <SongsSectionSkeleton />;
  }

  if (availableLetters.length === 0) {
    return (
      <div className="p-12 text-center text-muted">
        <span className="font-semibold block text-copy">No songs found</span>
        <span className="text-xs block mt-1">Try adjusting your search or browse a different category.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!selectedLetter && (
        <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-md -mt-4 pt-3.5 md:pt-4 -mx-4 px-3 md:px-4 pb-2.5 md:pb-3.5 border-b border-line/35 shadow-md mb-3 flex flex-col gap-3">
          {/* Immersive Script Selector */}
          <div className="flex bg-card-hover/60 p-0.5 rounded-xl border border-white/5 self-start shadow-inner">
            <button
              onClick={() => setScriptLang("telugu")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                scriptLang === "telugu"
                  ? "bg-white text-black shadow-sm font-black"
                  : "text-muted hover:text-white"
              }`}
            >
              Telugu (తెలుగు)
            </button>
            <button
              onClick={() => setScriptLang("english")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                scriptLang === "english"
                  ? "bg-white text-black shadow-sm font-black"
                  : "text-muted hover:text-white"
              }`}
            >
              English (A-Z)
            </button>
          </div>

          {/* Letters Scroll List */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {availableLetters.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm md:text-base font-black transition-all shrink-0 cursor-pointer ${
                  /[A-Z]/.test(letter) ? "font-sans" : "font-telugu"
                } ${
                  activeLetter === letter
                    ? "bg-title text-canvas scale-105 shadow-sm"
                    : "bg-card-hover text-white/90 hover:bg-line/60"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedLetter ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setSelectedLetter(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-white transition-all duration-150 cursor-pointer self-start"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to Browse
            </button>
          </div>

          {/* Dynamic Fading Color Banner (matched CategoryDetails) */}
          <div className="relative w-full pt-16 pb-6 px-6 md:px-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end select-none overflow-hidden bg-gradient-to-b from-[#312e81]/25 to-[#070707] rounded-2xl border border-white/5 shadow-md">
            {/* Letter Cover Art Card */}
            <div className="w-44 h-44 md:w-48 md:h-48 rounded-md bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-300 flex items-center justify-center text-white font-bold text-5xl md:text-6xl tracking-tight select-none border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)] shrink-0">
              {selectedLetter}
            </div>

            {/* Banner details */}
            <div className="flex-1 text-center md:text-left z-10 flex flex-col justify-end">
              <span className="text-[11px] font-bold text-white uppercase tracking-widest block mb-1">
                Alphabet Browser
              </span>
              <h1 className={`text-white text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 drop-shadow-md ${/[A-Z]/.test(selectedLetter) ? "" : "font-telugu"}`}>
                Songs starting with &ldquo;{selectedLetter}&rdquo;
              </h1>
              <p className="text-xs md:text-sm text-muted max-w-xl mb-4 leading-relaxed font-medium">
                Browse Christian worship songs starting with the alphabet letter {selectedLetter}.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-white/90 font-bold">
                <span>SongHub</span>
                <span className="text-muted/50">&bull;</span>
                <span className="text-muted font-medium">{scriptLang === "telugu" ? "Telugu" : "English"}</span>
                <span className="text-muted/50">&bull;</span>
                <span>{letterGroups[selectedLetter]?.length || 0} track{(letterGroups[selectedLetter]?.length || 0) !== 1 && "s"}</span>
              </div>
            </div>
          </div>

          {/* Action Bar (Situated below colored banner per Spotify layout) */}
          <div className="flex items-center justify-between px-2 py-2 select-none">
            <div className="flex items-center gap-6">
              {/* Play Button (Spotify Round Play circle) */}
              <button
                onClick={handlePlayAll}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                title="Play All"
              >
                <Play className="w-6 h-6 fill-current text-black ml-0.5" />
              </button>

              {/* Add to Playlist button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistDropdown(!showPlaylistDropdown);
                  }}
                  className="p-2 rounded-full transition-colors cursor-pointer text-muted hover:text-white"
                  title="Add Letter Songs to Playlist"
                >
                  <Plus className="w-6 h-6" />
                </button>

                {showPlaylistDropdown && (
                  <div className="absolute left-0 top-[110%] bg-dropdown border border-white/[0.08] rounded-xl shadow-2xl z-50 py-2 w-48 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider px-4 py-1.5 block border-b border-white/[0.05] mb-1">
                      Add to Playlist
                    </span>
                    {playlists.length === 0 ? (
                      <span className="text-xs text-muted px-4 py-2 block">No playlists created</span>
                    ) : (
                      playlists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => {
                            const letterSongs = letterGroups[selectedLetter] || [];
                            letterSongs.forEach((song) => {
                              if (!list.songIds.includes(song.id)) {
                                addSongToPlaylist(list.id, song.id);
                              }
                            });
                            setShowPlaylistDropdown(false);
                            alert(`Added ${letterSongs.length} songs to "${list.name}"`);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          {list.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isShared ? "text-white" : "text-muted hover:text-white"
                }`}
                title="Copy link"
              >
                {isShared ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
              </button>
            </div>

            {/* View layout toggler */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === "playlist" ? "cards" : "playlist")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5 text-xs font-bold text-muted hover:text-white transition-colors cursor-pointer"
              >
                {viewMode === "playlist" ? (
                  <>
                    <List className="w-4 h-4" />
                    <span>List</span>
                  </>
                ) : (
                  <>
                    <Grid className="w-4 h-4" />
                    <span>Grid</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tracklist or Song Grid */}
          <div className="relative min-h-[250px]">
            <AnimatePresence mode="wait">
              {viewMode === "cards" ? (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                >
                  {letterGroups[selectedLetter]?.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      currentSong={currentSong}
                      isPlaying={isPlaying}
                      playSong={playSong}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="playlist-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <CategoryPlaylistTable
                    category={{
                      id: `letter-${selectedLetter}`,
                      nameTe: `అక్షరం "${selectedLetter}"`,
                      nameEn: `Letter "${selectedLetter}"`
                    }}
                    songs={letterGroups[selectedLetter] || []}
                    language={scriptLang}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {availableLetters.map((letter) => (
            <div
              key={letter}
              ref={(el) => { sectionRefs.current[letter] = el; }}
              data-letter={letter}
              className="scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold text-white ${
                    /[A-Z]/.test(letter) ? "font-sans" : "font-telugu"
                  }`}>{letter}</span>
                  <span className="text-xs text-muted/80 font-medium ml-1">({letterGroups[letter].length})</span>
                </div>
                <button
                  onClick={() => setSelectedLetter(letter)}
                  className="text-xs font-bold text-handle hover:text-white transition-colors cursor-pointer"
                >
                  Show all
                </button>
              </div>

              <div className="relative group/row">
                {/* Left overlay arrow — centered vertically on md cover art (top-[96px]) */}
                <button
                  onClick={() => scrollRow(letter, "left")}
                  className={`absolute left-2 top-[96px] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 hover:scale-105 items-center justify-center text-white cursor-pointer opacity-0 group-hover/row:opacity-100 transition-all duration-200 border border-white/5 shadow-xl hidden ${
                    scrollStates[letter]?.left ? "md:flex" : "md:hidden"
                  } animate-in fade-in zoom-in`}
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                  ref={(el) => { scrollRefs.current[letter] = el; }}
                  onScroll={() => updateLetterScroll(letter)}
                  className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
                >
                  {letterGroups[letter].slice(0, 10).map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      currentSong={currentSong}
                      isPlaying={isPlaying}
                      playSong={playSong}
                      size="md"
                    />
                  ))}
                </div>

                {/* Right overlay arrow — centered vertically on md cover art (top-[96px]) */}
                <button
                  onClick={() => scrollRow(letter, "right")}
                  className={`absolute right-2 top-[96px] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 hover:scale-105 items-center justify-center text-white cursor-pointer opacity-0 group-hover/row:opacity-100 transition-all duration-200 border border-white/5 shadow-xl hidden ${
                    scrollStates[letter]?.right !== false ? "md:flex" : "md:hidden"
                  } animate-in fade-in zoom-in`}
                  title="Scroll Right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
