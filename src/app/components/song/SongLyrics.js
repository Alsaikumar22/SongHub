"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

export function LanguageSegmented({ selected, onChange, hasDual }) {
  if (!hasDual) return null;

  const langs = [
    { id: "telugu", label: "తెలుగు" },
    { id: "english", label: "English" },
    { id: "side-by-side", label: "Line by Line" },
  ];

  return (
    <div className="flex h-9 md:h-11 bg-card-hover border border-line/60 rounded-full p-0.5 shadow-sm w-fit">
      {langs.map((lang) => {
        const isSelected = selected === lang.id;
        const isMobile = lang.id === "side-by-side";
        return (
          <button
            key={lang.id}
            onClick={() => onChange(lang.id)}
            className={`h-full px-2.5 md:px-4 text-[10px] md:text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-title text-card shadow-sm"
                : "bg-transparent text-muted hover:text-white"
            }`}
          >
            <span className="md:hidden">{isMobile ? "Line" : lang.label}</span>
            <span className="hidden md:inline">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LyricLine({ line, englishLine, isActive, mode, index }) {
  if (mode === "side-by-side" && englishLine !== undefined) {
    return (
      <div
        data-line-index={index}
        className={`grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 py-3.5 px-5 rounded-xl transition-all duration-300 ease-out border ${
          isActive
            ? "bg-white/5 border-l-4 border-l-white/80 border-y-white/5 border-r-white/5 shadow-md scale-[1.01]"
            : "border-transparent hover:bg-white/[0.02]"
        }`}
      >
        <p
          className={`text-right text-base md:text-lg font-medium leading-relaxed transition-colors duration-300 font-telugu ${
            isActive ? "text-white" : "text-white/70"
          }`}
        >
          {line}
        </p>
        <div className="w-px bg-line/40 self-stretch" />
        <p
          className={`text-left text-base md:text-lg leading-relaxed transition-colors duration-300 ${
            isActive ? "text-white/90" : "text-muted/60"
          }`}
        >
          {englishLine}
        </p>
      </div>
    );
  }

  return (
    <p
      data-line-index={index}
      className={`text-base md:text-lg leading-relaxed px-5 py-3 rounded-xl transition-all duration-300 ease-out cursor-default border ${
        isActive
          ? "text-white font-bold bg-white/5 border-l-4 border-l-white/80 border-y-white/5 border-r-white/5 shadow-md scale-[1.01]"
          : mode === "telugu"
            ? "text-white/60 font-medium font-telugu border-transparent hover:text-white hover:bg-white/[0.02]"
            : "text-muted/60 border-transparent hover:text-white hover:bg-white/[0.02]"
      } ${mode === "telugu" ? "font-telugu" : ""}`}
    >
      {line}
    </p>
  );
}

export default function SongLyrics({
  song,
  isUnified = false,
  isImmersive = false,
  selectedLanguage: propLanguage,
  setSelectedLanguage: propSetLanguage
}) {
  const [internalLanguage, setInternalLanguage] = useState("telugu");
  
  const selectedLanguage = propLanguage !== undefined ? propLanguage : internalLanguage;
  const setSelectedLanguage = propSetLanguage !== undefined ? propSetLanguage : setInternalLanguage;
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const containerRef = useRef(null);
  const lineRefs = useRef({});

  const hasDual = !!(
    Array.isArray(song.lyricsTelugu) &&
    Array.isArray(song.lyricsEnglish) &&
    song.lyricsTelugu.length > 0 &&
    song.lyricsEnglish.length > 0
  );

  const getLines = useCallback(() => {
    if (hasDual) {
      if (selectedLanguage === "telugu") return song.lyricsTelugu;
      if (selectedLanguage === "english") return song.lyricsEnglish;
      return song.lyricsTelugu;
    }

    const raw = song.lyrics || "Lyrics not available for this track.";
    return raw.split("\n").map((l) => l.replace(/\[\d{2}:\d{2}\]/g, "").trim()).filter(Boolean);
  }, [song, selectedLanguage, hasDual]);

  useEffect(() => {
    setTimeout(() => {
      setActiveLineIndex(-1);
    }, 0);
  }, [selectedLanguage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-line-index"), 10);
            if (!isNaN(idx)) {
              setActiveLineIndex(idx);
            }
          }
        }
      },
      { root: container, rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    const elements = Object.values(lineRefs.current).filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [selectedLanguage]);

  const lines = getLines();
  const isSideBySide = selectedLanguage === "side-by-side";

  if (isImmersive) {
    return (
      <div
        ref={containerRef}
        className="w-full flex-1 overflow-y-auto px-6 md:px-8 py-12 space-y-6 scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {isSideBySide && hasDual ? (
          <div className="space-y-8 pb-32">
            {song.lyricsTelugu.map((line, idx) => {
              const isActive = activeLineIndex === idx;
              return (
                <div
                  key={idx}
                  ref={(el) => {
                    lineRefs.current[idx] = el;
                  }}
                  data-line-index={idx}
                  className="py-2.5 space-y-2.5 transition-all duration-300 pl-4 border-l border-transparent"
                >
                  <p
                    className={`text-left text-3xl md:text-5xl lg:text-6xl font-black font-telugu tracking-tight leading-normal pl-2 transition-all duration-300 ${
                      isActive
                        ? "text-white scale-[1.01] drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
                        : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    {line}
                  </p>
                  {song.lyricsEnglish[idx] && (
                    <p
                      className={`text-left text-xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-normal pl-2 transition-all duration-300 ${
                        isActive
                          ? "text-white/70"
                          : "text-white/20 hover:text-white/40"
                      }`}
                    >
                      {song.lyricsEnglish[idx]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6 pb-32">
            {lines.map((line, idx) => {
              const isActive = activeLineIndex === idx;
              return (
                <div
                  key={idx}
                  ref={(el) => {
                    lineRefs.current[idx] = el;
                  }}
                  data-line-index={idx}
                  className="pl-4 border-l border-transparent"
                >
                  <p
                    className={`text-left text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-normal pl-2 transition-all duration-300 ${
                      isActive
                        ? "text-white scale-[1.01] drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
                        : "text-white/30 hover:text-white/60"
                    } ${selectedLanguage === "telugu" ? "font-telugu" : ""}`}
                  >
                    {line}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {lines.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-xl text-white/40">No lyrics available for this track.</p>
          </div>
        )}
      </div>
    );
  }

  const lyricsContent = (
    <div className="relative">
      {/* Scrolling Fade Overlays */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#121212]/60 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#121212]/60 to-transparent z-10 pointer-events-none" />

      <div
        ref={containerRef}
        className="relative max-h-[50vh] overflow-y-auto px-1 py-4 space-y-1.5 scroll-smooth no-scrollbar"
      >
        {isSideBySide && hasDual ? (
          <div className="space-y-2">
            {song.lyricsTelugu.map((line, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  lineRefs.current[idx] = el;
                }}
              >
                <LyricLine
                  line={line}
                  englishLine={song.lyricsEnglish[idx]}
                  isActive={activeLineIndex === idx}
                  mode="side-by-side"
                  index={idx}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {lines.map((line, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  lineRefs.current[idx] = el;
                }}
              >
                <LyricLine
                  line={line}
                  isActive={activeLineIndex === idx}
                  mode={selectedLanguage}
                  index={idx}
                />
              </div>
            ))}
          </div>
        )}

        {lines.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-muted">No lyrics available for this track.</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isUnified) {
    return lyricsContent;
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
          Lyrics
        </h3>
        <LanguageSegmented
          selected={selectedLanguage}
          onChange={setSelectedLanguage}
          hasDual={hasDual}
        />
      </div>
      {lyricsContent}
    </div>
  );
}
