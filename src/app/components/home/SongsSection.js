"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import SongCard from "./SongCard";

const TELUGU_ALPHABET_ORDER = [
  "అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఋ", "ౠ", "ఎ", "ఏ", "ఐ", "ఒ", "ఓ", "ఔ", "అం", "అః",
  "క", "ఖ", "గ", "ఘ", "ఙ", "చ", "ఛ", "జ", "ఝ", "ఞ", "ట", "ఠ", "డ", "ఢ", "ణ",
  "త", "థ", "ద", "ధ", "న", "ప", "ఫ", "బ", "భ", "మ", "య", "ర", "ల", "వ",
  "శ", "ష", "స", "హ", "ళ", "క్ష", "ఱ",
];

function teluguSort(a, b) {
  const o = TELUGU_ALPHABET_ORDER;
  return (o.indexOf(a) === -1 ? 999 : o.indexOf(a)) - (o.indexOf(b) === -1 ? 999 : o.indexOf(b));
}

export default function SongsSection({
  songs,
  currentSong,
  isPlaying,
  playSong,
  selectedLetter,
  setSelectedLetter,
}) {
  const sectionRefs = useRef({});
  const scrollRefs = useRef({});
  const [activeLetter, setActiveLetter] = useState(selectedLetter || null);

  const letterGroups = useMemo(() => {
    const groups = {};
    const safeSongs = Array.isArray(songs) ? songs : [];
    safeSongs.forEach((song) => {
      const letter = song.teluguFirstLetter;
      if (!letter) return;
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(song);
    });
    return groups;
  }, [songs]);

  const availableLetters = useMemo(() => Object.keys(letterGroups).sort(teluguSort), [letterGroups]);

  const scrollRow = (letter, direction) => {
    const el = scrollRefs.current[letter];
    if (el) {
      const scrollAmount = 400;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (selectedLetter) {
      setActiveLetter(selectedLetter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLetter(entry.target.getAttribute("data-letter"));
          }
        });
      },
      {
        root: null,
        rootMargin: "160px 0px -75% 0px",
        threshold: 0,
      }
    );

    const elements = Object.values(sectionRefs.current).filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [availableLetters, selectedLetter]);

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
      <div className="sticky top-0 z-20 bg-card -mt-4 pt-4 -mx-4 px-4 pb-3 border-b border-line/30 shadow-sm mb-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {availableLetters.map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all shrink-0 cursor-pointer font-telugu ${
                activeLetter === letter
                  ? "bg-title text-canvas"
                  : "bg-card-hover text-white hover:bg-line/60"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

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
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-card-hover flex items-center justify-center border border-line/45 text-white font-bold text-4xl shadow-md font-telugu select-none shrink-0">
                {selectedLetter}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-dim uppercase tracking-widest block mb-1">
                  Alphabet Browser
                </span>
                <h1 className="text-white text-2xl font-extrabold tracking-tight truncate">
                  Songs starting with "{selectedLetter}"
                </h1>
                <p className="text-xs text-muted mt-1">
                  {letterGroups[selectedLetter]?.length || 0} track{letterGroups[selectedLetter]?.length !== 1 && "s"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 border-b border-line/20 text-[10px] font-bold text-dim uppercase tracking-wider">
              <div className="w-6 text-center">#</div>
              <div>Title</div>
              <div className="w-12 text-right pr-2">Duration</div>
            </div>

            <div className="space-y-0.5">
              {letterGroups[selectedLetter]?.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song)}
                    className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2 rounded-xl cursor-pointer transition-colors group ${
                      isCurrent ? "bg-card-hover" : "hover:bg-card-hover/40"
                    }`}
                  >
                    {/* Column 1: Index / Play Icon */}
                    <div className="w-6 flex items-center justify-center">
                      <span className={`text-xs font-semibold tabular-nums text-muted group-hover:hidden ${
                        isCurrent && isPlaying ? "text-title" : ""
                      }`}>
                        {index + 1}
                      </span>
                      <span className="hidden group-hover:inline text-white">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </span>
                    </div>

                    {/* Column 2: Cover Art, Title, Artist */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-10 h-10 object-cover rounded-lg border border-line/30 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className={`font-semibold text-sm block truncate ${
                          isCurrent ? "text-title" : "text-white"
                        } ${song.teluguTitle ? "font-telugu" : ""}`}>
                          {song.teluguTitle || song.title}
                        </span>
                        <span className="text-xs text-muted block truncate mt-0.5">
                          {song.artist}
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Duration */}
                    <div className="w-12 text-right pr-2 text-xs text-muted tabular-nums">
                      {song.duration}
                    </div>
                  </div>
                );
              })}
            </div>
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
                  <span className="text-2xl font-bold text-white font-telugu">{letter}</span>
                  <span className="text-xs text-muted/80 font-medium ml-1">({letterGroups[letter].length})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => scrollRow(letter, "left")}
                      className="w-8 h-8 rounded-full bg-card-hover hover:bg-line/40 border border-line/55 flex items-center justify-center text-white hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                      title="Scroll Left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollRow(letter, "right")}
                      className="w-8 h-8 rounded-full bg-card-hover hover:bg-line/40 border border-line/55 flex items-center justify-center text-white hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                      title="Scroll Right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedLetter(letter)}
                    className="text-sm font-semibold text-white/95 hover:text-white hover:underline transition-all cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
              </div>
              <div
                ref={(el) => { scrollRefs.current[letter] = el; }}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
