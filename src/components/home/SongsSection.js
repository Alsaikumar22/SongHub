"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Plus,
  Share2,
  Check,
  Heart,
  Download,
  VolumeX,
} from "lucide-react";
import SongCard from "./SongCard";
import SongArtwork from "../ui/SongArtwork";
import { useAudio } from "@/context/audio-context";
import CategoryPlaylistTable from "../categories/CategoryPlaylistTable";
import { useRouter } from "next/navigation";
import { SongsSectionSkeleton } from "../ui/SongSkeleton";
import { AnimatePresence, motion } from "framer-motion";

const TELUGU_ALPHABET_ORDER = [
  "అ",
  "ఆ",
  "ఇ",
  "ఈ",
  "ఉ",
  "ఊ",
  "ఋ",
  "ౠ",
  "ఎ",
  "ఏ",
  "ఐ",
  "ఒ",
  "ఓ",
  "ఔ",
  "అం",
  "అః",
  "క",
  "ఖ",
  "గ",
  "ఘ",
  "ఙ",
  "చ",
  "ఛ",
  "జ",
  "ఝ",
  "ఞ",
  "ట",
  "ఠ",
  "డ",
  "ఢ",
  "ణ",
  "త",
  "థ",
  "ద",
  "ధ",
  "న",
  "ప",
  "ఫ",
  "బ",
  "భ",
  "మ",
  "య",
  "ర",
  "ల",
  "వ",
  "శ",
  "ష",
  "స",
  "హ",
  "ళ",
  "క్ష",
  "ఱ",
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

const HINDI_ALPHABET_ORDER = [
  "अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः",
  "क", "ख", "ग", "घ", "ङ",
  "च", "छ", "ज", "झ", "ञ",
  "ट", "ठ", "ड", "ढ", "ण",
  "त", "थ", "द", "ध", "न",
  "प", "फ", "ब", "भ", "म",
  "य", "र", "ल", "व",
  "श", "ष", "स", "ह",
  "क्ष", "त्र", "ज्ञ"
];

function hindiSort(a, b) {
  const o = HINDI_ALPHABET_ORDER;
  const idxA = o.indexOf(a);
  const idxB = o.indexOf(b);

  if (idxA !== -1 && idxB !== -1) {
    return idxA - idxB;
  }
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;

  return a.localeCompare(b);
}

const TAMIL_ALPHABET_ORDER = [
  "அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
  "க", "ச", "ஜ", "ஞ", "ட", "த", "ந", "ப", "ம", "ய", "ர", "ற", "ல", "வ", "ஷ", "ஸ", "ஹ"
];

function tamilSort(a, b) {
  const o = TAMIL_ALPHABET_ORDER;
  const idxA = o.indexOf(a);
  const idxB = o.indexOf(b);

  if (idxA !== -1 && idxB !== -1) {
    return idxA - idxB;
  }
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;

  return a.localeCompare(b);
}

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
  "\u0C05": "from-amber-600 to-amber-900",
  "\u0C06": "from-orange-600 to-orange-900",
  "\u0C07": "from-yellow-600 to-yellow-900",
  "\u0C08": "from-lime-600 to-lime-900",
  "\u0C09": "from-green-600 to-green-900",
  "\u0C0A": "from-emerald-600 to-emerald-900",
  "\u0C0E": "from-teal-600 to-teal-900",
  "\u0C0F": "from-cyan-600 to-cyan-900",
  "\u0C10": "from-sky-600 to-sky-900",
  "\u0C12": "from-blue-600 to-blue-900",
  "\u0C13": "from-indigo-600 to-indigo-900",
  "\u0C15": "from-violet-600 to-violet-900",
  "\u0C16": "from-purple-600 to-purple-900",
  "\u0C17": "from-fuchsia-600 to-fuchsia-900",
  "\u0C18": "from-pink-600 to-pink-900",
  "\u0C1A": "from-rose-600 to-rose-900",
  "\u0C1C": "from-red-500 to-rose-900",
  "\u0C21": "from-orange-500 to-amber-900",
  "\u0C24": "from-yellow-500 to-lime-900",
  "\u0C26": "from-green-500 to-emerald-900",
  "\u0C27": "from-teal-500 to-cyan-900",
  "\u0C28": "from-sky-500 to-blue-900",
  "\u0C2A": "from-indigo-500 to-violet-900",
  "\u0C2B": "from-purple-500 to-fuchsia-900",
  "\u0C2C": "from-pink-500 to-rose-900",
  "\u0C2D": "from-red-600 to-red-900",
  "\u0C2E": "from-orange-600 to-orange-900",
  "\u0C2F": "from-amber-600 to-amber-900",
  "\u0C30": "from-yellow-600 to-yellow-900",
  "\u0C32": "from-lime-600 to-lime-900",
  "\u0C35": "from-green-600 to-green-900",
  "\u0C36": "from-emerald-600 to-emerald-900",
  "\u0C37": "from-teal-600 to-teal-900",
  "\u0C38": "from-cyan-600 to-cyan-900",
  "\u0C39": "from-sky-600 to-sky-900",
};

function getLetterGradient(letter) {
  return letterGradients[letter] || "from-slate-600 to-slate-900";
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
  const router = useRouter();
  const sectionRefs = useRef({});
  const scrollRefs = useRef({});
  const [activeLetter, setActiveLetter] = useState(selectedLetter || null);
  const [scriptLang, setScriptLang] = useState(() => {
    // Auto-detect script from initial selectedLetter
    if (selectedLetter) {
      if (/[\u0C00-\u0C7F]/.test(selectedLetter)) return "telugu";
      if (/[\u0900-\u097F]/.test(selectedLetter)) return "hindi";
    }
    // Default to Telugu so Telugu songs show first
    return "telugu";
  });
 
  // State hooks for Spotify-style letter detail views
  const {
    playlists,
    addSongToPlaylist,
    favorites,
    toggleFavorite,
    showFullHome,
    sections,
    sectionsLoading,
    initializeAlphabeticalSections,
    showAllSongsForLetter,
  } = useAudio();
 
  const [viewMode, setViewMode] = useState("playlist"); // "playlist" | "cards"
  const [isShared, setIsShared] = useState(false);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [scrollStates, setScrollStates] = useState({});
 
  useEffect(() => {
    if (!songsLoading) {
      initializeAlphabeticalSections(scriptLang);
    }
  }, [initializeAlphabeticalSections, scriptLang, songsLoading]);
 
  // Auto-switch scriptLang when a letter is clicked
  useEffect(() => {
    if (selectedLetter) {
      // Detect if the selected letter is Telugu, Hindi, or English
      if (/[\u0C00-\u0C7F]/.test(selectedLetter)) {
        setScriptLang("telugu");
      } else if (/[\u0900-\u097F]/.test(selectedLetter)) {
        setScriptLang("hindi");
      } else if (/[A-Z]/i.test(selectedLetter)) {
        setScriptLang("english");
      }
    }
  }, [selectedLetter]);

  useEffect(() => {
    if (selectedLetter && sections[selectedLetter] && !sections[selectedLetter].showAll && !sections[selectedLetter].loading) {
      showAllSongsForLetter(selectedLetter);
    }
  }, [selectedLetter, sections, showAllSongsForLetter]);
 
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
          right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10,
        },
      }));
    }
  };
 
  // Sections are already filtered by language in initializeAlphabeticalSections
  const getFilteredSongsForLetter = useCallback((letter) => {
    const letterSec = sections[letter];
    if (!letterSec || !letterSec.songs) return [];
    return letterSec.songs;
  }, [sections]);
 
  const detailSongs = useMemo(() => {
    return selectedLetter ? getFilteredSongsForLetter(selectedLetter) : [];
  }, [selectedLetter, getFilteredSongsForLetter]);
 
  const availableLetters = useMemo(() => {
    return Object.keys(sections).filter((letter) => {
      return getFilteredSongsForLetter(letter).length > 0;
    }).sort();
  }, [sections, getFilteredSongsForLetter]);
 
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
  }, [availableLetters]);
 
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
      navigator.clipboard.writeText(
        `${window.location.origin}/?tab=discover&letter=${selectedLetter}`,
      );
    }
    setTimeout(() => setIsShared(false), 2000);
  };
 
  const handlePlayAll = () => {
    const letterSongs = detailSongs;
    if (letterSongs.length > 0) {
      playSong(letterSongs[0], selectedLetter, 0, letterSongs);
    }
  };
 
  if (sectionsLoading && Object.keys(sections).length === 0) {
    return <SongsSectionSkeleton />;
  }

  return (
    <div className="space-y-4">
      {!selectedLetter && (
        <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-md -mt-4 pt-3.5 md:pt-4 -mx-4 px-3 md:px-4 pb-2.5 md:pb-3.5 border-b border-line/35 shadow-md mb-3 flex flex-col gap-3">
          {/* Immersive Script Selector */}
          <div className="flex bg-card-hover/60 p-0.5 rounded-xl border border-line self-start shadow-inner">
            <button
              onClick={() => setScriptLang("telugu")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                scriptLang === "telugu"
                  ? "bg-white text-black shadow-sm font-black"
                  : "text-muted hover:text-title"
              }`}
            >
              Telugu (తెలుగు)
            </button>
            <button
              onClick={() => setScriptLang("english")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                scriptLang === "english"
                  ? "bg-white text-black shadow-sm font-black"
                  : "text-muted hover:text-title"
              }`}
            >
              English (A-Z)
            </button>
            <button
              onClick={() => setScriptLang("hindi")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                scriptLang === "hindi"
                  ? "bg-white text-black shadow-sm font-black"
                  : "text-muted hover:text-title"
              }`}
            >
              Hindi (हिन्दी)
            </button>
          </div>

          {/* Letters Scroll List */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {availableLetters.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm md:text-base font-black transition-all shrink-0 cursor-pointer ${
                  /[A-Z]/.test(letter) ? "font-sans" : (typeof letter === "string" && /[\u0C00-\u0C7F]/.test(letter) ? "font-telugu" : "")
                } ${
                  activeLetter === letter
                    ? "bg-title text-canvas scale-105 shadow-sm"
                    : "bg-card-hover text-title/90 hover:bg-line/60"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {sectionsLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 text-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-title"></div>
          <span className="text-xs font-semibold">Loading alphabetical sections...</span>
        </div>
      ) : availableLetters.length === 0 ? (
        <div className="p-12 text-center text-muted">
          <span className="font-semibold block text-copy">No songs found</span>
          <span className="text-xs block mt-1">
            Try adjusting your search or browse a different category.
          </span>
        </div>
      ) : selectedLetter ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setSelectedLetter(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-title transition-all duration-150 cursor-pointer self-start"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to Browse
            </button>
          </div>

          {/* Dynamic Fading Color Banner (matched CategoryDetails) */}
          <div className="relative w-full pt-16 pb-6 px-6 md:px-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end select-none overflow-hidden bg-gradient-to-b from-[#312e81]/25 to-[#070707] rounded-2xl border border-line shadow-md">
            {/* Letter Cover Art Card */}
            <div className={`w-44 h-44 md:w-48 md:h-48 rounded-md bg-gradient-to-br ${getLetterGradient(selectedLetter)} flex items-center justify-center text-title font-bold text-5xl md:text-6xl tracking-tight select-none border border-line shadow-[0_8px_24px_rgba(0,0,0,0.5)] shrink-0`}>              
              {selectedLetter}
            </div>

            {/* Banner details */}
            <div className="flex-1 text-center md:text-left z-10 flex flex-col justify-end">
              <span className="text-[11px] font-bold text-title uppercase tracking-widest block mb-1">
                Alphabet Browser
              </span>
              <h1
                className={`text-title text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 drop-shadow-md ${/[A-Z]/.test(selectedLetter) ? "" : (typeof selectedLetter === "string" && /[\u0C00-\u0C7F]/.test(selectedLetter) ? "font-telugu" : "")}`}
              >
                Songs starting with &ldquo;{selectedLetter}&rdquo;
              </h1>
              <p className="text-xs md:text-sm text-muted max-w-xl mb-4 leading-relaxed font-medium">
                Browse Christian worship songs starting with the alphabet letter{" "}
                {selectedLetter}.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-title/90 font-bold">
                <span>YouWorship</span>
                <span className="text-muted/50">&bull;</span>
                <span className="text-muted font-medium">
                  {scriptLang === "telugu" ? "Telugu" : scriptLang === "hindi" ? "Hindi" : "English"}
                </span>
                <span className="text-muted/50">&bull;</span>
                <span>
                  {detailSongs.length} track
                  {detailSongs.length !== 1 && "s"}
                </span>
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
                  className="p-2 rounded-full transition-colors cursor-pointer text-muted hover:text-title"
                  title="Add Letter Songs to Playlist"
                >
                  <Plus className="w-6 h-6" />
                </button>

                {showPlaylistDropdown && (
                  <div className="absolute left-0 top-[110%] bg-dropdown border border-line rounded-xl shadow-2xl z-50 py-2 w-48 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider px-4 py-1.5 block border-b border-line mb-1">
                      Add to Playlist
                    </span>
                    {playlists.length === 0 ? (
                      <span className="text-xs text-muted px-4 py-2 block">
                        No playlists created
                      </span>
                    ) : (
                      playlists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => {
                            const letterSongs = detailSongs;
                            letterSongs.forEach((song) => {
                              if (!list.songIds.includes(song.id)) {
                                addSongToPlaylist(list.id, song.id);
                              }
                            });
                            setShowPlaylistDropdown(false);
                            alert(
                              `Added ${letterSongs.length} songs to "${list.name}"`,
                            );
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-title hover:bg-card-hover transition-colors cursor-pointer"
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
                  isShared ? "text-title" : "text-muted hover:text-title"
                }`}
                title="Copy link"
              >
                {isShared ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Share2 className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* View layout toggler */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setViewMode(viewMode === "playlist" ? "cards" : "playlist")
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-card-hover text-xs font-bold text-muted hover:text-title transition-colors cursor-pointer"
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
                  {detailSongs.map((song, index) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      currentSong={currentSong}
                      isPlaying={isPlaying}
                      playSong={(s) => playSong(s, selectedLetter, index, detailSongs)}
                      language={scriptLang}
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
                      nameEn: `Letter "${selectedLetter}"`,
                    }}
                    songs={detailSongs}
                    language={scriptLang}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className={showFullHome ? "space-y-6" : "space-y-8"}>
          {availableLetters.map((letter) => {
            const letterSec = sections[letter];
            if (!letterSec) return null;
            const letterSongs = getFilteredSongsForLetter(letter);
            if (letterSongs.length === 0) return null;

            return (
              <div
                key={letter}
                ref={(el) => {
                  sectionRefs.current[letter] = el;
                }}
                data-letter={letter}
                className="scroll-mt-24"
              >
                {showFullHome ? (
                  <>
                    {/* Original Simple Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-2xl font-bold text-title font-sans"
                        >
                          {letter}
                        </span>
                        <span className="text-xs text-muted/80 font-medium ml-1">
                          ({letterSongs.length})
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedLetter(letter)}
                        className="text-xs font-bold text-handle hover:text-title transition-colors cursor-pointer"
                      >
                        Show all
                      </button>
                    </div>

                    {/* Original Horizontal Scrolling Row */}
                    <div className="relative group/row flex flex-col">
                      {/* Left overlay arrow */}
                      <button
                        onClick={() => scrollRow(letter, "left")}
                        className={`absolute left-2 top-[96px] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 hover:bg-card-hover backdrop-blur-sm hover:scale-105 items-center justify-center text-title cursor-pointer opacity-0 group-hover/row:opacity-100 transition-all duration-200 border border-line shadow-xl hidden ${
                          scrollStates[letter]?.left ? "md:flex" : "md:hidden"
                        } animate-in fade-in zoom-in`}
                        title="Scroll Left"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div
                        ref={(el) => {
                          scrollRefs.current[letter] = el;
                        }}
                        onScroll={() => updateLetterScroll(letter)}
                        className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
                      >
                        {letterSongs.map((song, index) => (
                          <SongCard
                            key={song.id}
                            song={song}
                            currentSong={currentSong}
                            isPlaying={isPlaying}
                            playSong={(s) => playSong(s, letter, index, letterSongs)}
                            size="md"
                            language={scriptLang}
                          />
                        ))}
                      </div>

                      {/* Right overlay arrow */}
                      <button
                        onClick={() => scrollRow(letter, "right")}
                        className={`absolute right-2 top-[96px] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card/90 hover:bg-card-hover backdrop-blur-sm hover:scale-105 items-center justify-center text-title cursor-pointer opacity-0 group-hover/row:opacity-100 transition-all duration-200 border border-line shadow-xl hidden ${
                          scrollStates[letter]?.right !== false
                            ? "md:flex"
                            : "md:hidden"
                        } animate-in fade-in zoom-in`}
                        title="Scroll Right"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Show All Inline button under the row */}
                      {!letterSec.showAll && letterSec.hasMore && (
                        <button
                          onClick={() => showAllSongsForLetter(letter)}
                          className="self-start mt-2 px-4 py-1.5 bg-card hover:bg-card-hover border border-line/60 rounded-full text-xs font-bold text-title transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                          {letterSec.loading ? "Loading..." : "Show All"}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Linked Divider Header Row */}
                    <div className="flex items-center gap-4 mb-4 select-none px-1">
                      <div className="w-10 h-10 rounded-xl bg-card-hover border border-line flex items-center justify-center text-lg font-black text-title shadow-sm shrink-0">
                        {letter}
                      </div>
                      <div className="flex-1 h-px bg-line/35" />
                      <button
                        onClick={() => setSelectedLetter(letter)}
                        className="px-3.5 py-1.5 rounded-xl bg-card-hover border border-line text-xs font-black text-dim hover:text-title hover:border-line-muted transition-all shadow-sm shrink-0 select-none cursor-pointer"
                      >
                        {letterSongs.length}
                      </button>
                    </div>

                    {/* 2-Column Song List Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {letterSongs.map((song, index) => {
                        const isCurrent = currentSong?.id === song.id;
                        const isThisPlaying = isCurrent && isPlaying;
                        const isFavorite = favorites.includes(song.id);

                        return (
                          <div
                            key={song.id}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
                              isCurrent
                                ? "border-[#D4A32A]/40 bg-[#D4A32A]/5"
                                : "border-line/40 bg-card-hover/20 hover:bg-card-hover/40 hover:border-line-muted"
                            }`}
                            onClick={() => {
                              playSong(song, letter, index, letterSongs);
                              router.push(`/song/${encodeURIComponent(song.slug || song.id)}`);
                            }}
                          >
                            {/* Left: Toggle Favorite */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(song.id);
                              }}
                              className="p-1.5 text-dim hover:text-red-500 transition-all cursor-pointer mr-2.5 shrink-0"
                            >
                              <Heart
                                className={`w-4.5 h-4.5 transition-all ${
                                  isFavorite
                                    ? "text-red-500 fill-red-500 scale-105"
                                    : "text-muted hover:scale-110"
                                }`}
                              />
                            </button>

                            {/* Song Cover Artwork Image */}
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-line shrink-0 mr-3 shadow-sm bg-card-hover select-none">
                              <SongArtwork
                                song={song}
                                className="w-full h-full object-cover"
                                iconSize="w-4.5 h-4.5"
                              />
                            </div>

                            {/* Middle: Titles */}
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`font-semibold text-sm text-title truncate ${
                                    scriptLang !== "english" && /[\u0C00-\u0C7F]/.test(song.teluguTitle || song.title) ? "font-telugu text-base leading-snug" : ""
                                  }`}
                                >
                                  {scriptLang === "english" ? (song.titleEnglish || song.title) : (song.teluguTitle || song.title)}
                                </span>
                                {!(song.audioUrl || song.media?.audio || song.youtubeId) && (
                                  <span title="Audio not available" className="text-xs select-none shrink-0">🔇</span>
                                )}
                                {!(song.youtubeId || song.media?.video) && (
                                  <span title="Video not available" className="text-xs select-none shrink-0">🚫🎥</span>
                                )}
                              </div>
                              {((scriptLang === "english"
                                ? (song.teluguTitle && song.teluguTitle !== (song.titleEnglish || song.title) ? song.teluguTitle : null)
                                : (song.titleEnglish && song.titleEnglish !== (song.teluguTitle || song.title) ? song.titleEnglish : null))) && (
                                <span className="text-[11px] text-muted block truncate mt-0.5 font-medium">
                                  {scriptLang === "english" ? song.teluguTitle : song.titleEnglish}
                                </span>
                              )}
                            </div>

                            {/* Right: Controls */}
                            <div className="flex items-center gap-3 shrink-0 select-none">
                              {/* Play/Pause Button or Mute Icon */}
                              {song.audioUrl || song.media?.audio || song.youtubeId ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playSong(song, letter, index, letterSongs);
                                  }}
                                  className={`p-1.5 rounded-full transition-all hover:bg-card-hover ${
                                    isCurrent ? "text-[#D4A32A]" : "text-dim hover:text-copy"
                                  }`}
                                >
                                  {isThisPlaying ? (
                                    <Pause className="w-4 h-4 fill-current" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  )}
                                </button>
                              ) : (
                                <div className="p-1.5 text-red-500/60 cursor-not-allowed" title="Lyrics only — No audio available">
                                  <VolumeX className="w-4 h-4" />
                                </div>
                              )}

                              {/* Download link */}
                              {song.audioUrl && (
                                <a
                                  href={song.audioUrl}
                                  download
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 text-dim hover:text-copy hover:bg-card-hover rounded-full transition-all"
                                  title="Download Song"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}

                              {/* Chevron Arrow */}
                              <ChevronRight className="w-4 h-4 text-dim/50" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Show All Inline button under the grid */}
                    {!letterSec.showAll && letterSec.hasMore && (
                      <button
                        onClick={() => showAllSongsForLetter(letter)}
                        className="mt-4 px-4 py-2 bg-card hover:bg-card-hover border border-line/60 rounded-full text-xs font-bold text-title transition-all active:scale-95 cursor-pointer shadow-sm w-full md:w-auto"
                      >
                        {letterSec.loading ? "Loading..." : "Show All Songs"}
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
