"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

export function LanguageSegmented({ selected, onChange, hasDual = true }) {
  const langs = [
    { id: "telugu", label: "తెలుగు" },
    { id: "english", label: "English" },
  ];

  return (
    <div className="flex h-9 md:h-11 bg-card-hover border border-line/60 rounded-full p-0.5 shadow-sm w-fit">
      {langs.map((lang) => {
        const isSelected = selected === lang.id;
        return (
          <button
            key={lang.id}
            onClick={() => onChange(lang.id)}
            className={`h-full px-3.5 md:px-5 text-[10px] md:text-xs font-extrabold rounded-full transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-title text-card shadow-sm"
                : "bg-transparent text-muted hover:text-title"
            }`}
          >
            <span>{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function SongLyrics({
  song,
  isUnified = false,
  isImmersive = false,
  selectedLanguage: propLanguage,
  setSelectedLanguage: propSetLanguage,
}) {
  const [internalLanguage, setInternalLanguage] = useState("telugu");

  const selectedLanguage = propLanguage !== undefined ? propLanguage : internalLanguage;
  const setSelectedLanguage = propSetLanguage !== undefined ? propSetLanguage : setInternalLanguage;
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const containerRef = useRef(null);
  const lineRefs = useRef({});

  const hasDual = !!(
    song &&
    (song.lyricsTelugu || song.lyricsEnglish || song.lyrics)
  );

  // Extract stanzas & lines from song data
  const stanzas = useMemo(() => {
    let rawContent = "";

    if (selectedLanguage === "english" && song?.lyricsEnglish) {
      rawContent = Array.isArray(song.lyricsEnglish) ? song.lyricsEnglish.join("\n") : song.lyricsEnglish;
    } else if (song?.lyricsTelugu) {
      rawContent = Array.isArray(song.lyricsTelugu) ? song.lyricsTelugu.join("\n") : song.lyricsTelugu;
    } else if (typeof song?.lyrics === "string") {
      rawContent = song.lyrics;
    } else if (Array.isArray(song?.lyrics) && song.lyrics.length > 0) {
      const matched =
        song.lyrics.find((l) => l.language === (selectedLanguage === "english" ? "en" : "te")) ||
        song.lyrics[0];
      rawContent = matched?.content || matched?.text || "";
    }

    if (!rawContent || typeof rawContent !== "string") {
      return [];
    }

    // Split into stanzas by double newlines (\n\n)
    const blocks = rawContent.split(/\n\s*\n+/);

    return blocks
      .map((block) =>
        block
          .split("\n")
          .map((l) => l.replace(/\[\d{2}:\d{2}\]/g, "").trim())
          .filter(Boolean)
      )
      .filter((lines) => lines.length > 0);
  }, [song, selectedLanguage]);

  const flatLines = useMemo(() => stanzas.flat(), [stanzas]);

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
      { root: container, rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );

    const elements = Object.values(lineRefs.current).filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [selectedLanguage, stanzas]);

  let currentFlatIndex = 0;

  if (isImmersive) {
    return (
      <div
        ref={containerRef}
        className="w-full flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 py-12 space-y-10 scroll-smooth no-scrollbar select-text"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="max-w-2xl mx-auto text-center space-y-10 pb-32">
          {stanzas.map((stanzaLines, sIdx) => (
            <div key={`stanza-${sIdx}`} className="space-y-3 sm:space-y-4">
              {stanzaLines.map((line) => {
                const lineIdx = currentFlatIndex++;
                const isActive = activeLineIndex === lineIdx;

                return (
                  <div
                    key={`line-${lineIdx}`}
                    ref={(el) => {
                      lineRefs.current[lineIdx] = el;
                    }}
                    data-line-index={lineIdx}
                    className="py-1 transition-all duration-300"
                  >
                    <p
                      className={`text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-relaxed transition-all duration-300 ${
                        isActive
                          ? "text-title scale-[1.02] font-black"
                          : "text-copy font-bold hover:text-title cursor-pointer"
                      } ${selectedLanguage === "telugu" ? "font-telugu" : ""}`}
                    >
                      {line}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}

          {flatLines.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-lg text-muted font-medium">Lyrics not available for this track.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const lyricsContent = (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative max-h-[60vh] overflow-y-auto px-4 sm:px-8 py-6 space-y-8 scroll-smooth no-scrollbar"
      >
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {stanzas.map((stanzaLines, sIdx) => (
            <div key={`stanza-${sIdx}`} className="space-y-2.5 sm:space-y-3">
              {stanzaLines.map((line) => {
                const lineIdx = currentFlatIndex++;
                const isActive = activeLineIndex === lineIdx;

                return (
                  <div
                    key={`line-${lineIdx}`}
                    ref={(el) => {
                      lineRefs.current[lineIdx] = el;
                    }}
                    data-line-index={lineIdx}
                    className="py-0.5 transition-all duration-300"
                  >
                    <p
                      className={`text-center text-base sm:text-lg md:text-xl font-bold leading-relaxed transition-all duration-300 ${
                        isActive
                          ? "text-title scale-[1.01] font-black"
                          : "text-copy font-bold hover:text-title cursor-pointer"
                      } ${selectedLanguage === "telugu" ? "font-telugu" : ""}`}
                    >
                      {line}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}

          {flatLines.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted">Lyrics not available for this track.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isUnified) {
    return lyricsContent;
  }

  return (
    <div className="bg-card border border-line rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <h3 className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-title/70 animate-pulse" />
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
