"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

export function LanguageSegmented({ selected, onChange }) {
  const langs = [];
  langs.push({ id: "telugu", label: "తెలుగు" });
  langs.push({ id: "english", label: "English" });

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
  fontSizeMultiplier = 1.0,
}) {
  const [internalLanguage, setInternalLanguage] = useState("telugu");

  const selectedLanguage = propLanguage !== undefined ? propLanguage : internalLanguage;
  const setSelectedLanguage = propSetLanguage !== undefined ? propSetLanguage : setInternalLanguage;
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const containerRef = useRef(null);
  const lineRefs = useRef({});

  // Extract stanzas for Telugu and English
  const stanzasTelugu = useMemo(() => {
    let raw = Array.isArray(song?.lyricsTelugu) ? song.lyricsTelugu.join("\n") : (song?.lyricsTelugu || "");
    if (!raw && typeof song?.lyrics === "string") {
      raw = song.lyrics;
    } else if (!raw && Array.isArray(song?.lyrics) && song.lyrics.length > 0) {
      const matched = song.lyrics.find((l) => l.language === "te" || l.isDefault) || song.lyrics[0];
      raw = matched?.content || matched?.text || "";
    }
    if (!raw || typeof raw !== "string") return [];
    return raw
      .split(/\n\s*\n+/)
      .map((block) =>
        block
          .split("\n")
          .map((l) => l.replace(/\[\d{2}:\d{2}\]/g, "").trim())
          .filter(Boolean)
      )
      .filter((b) => b.length > 0);
  }, [song]);

  const stanzasEnglish = useMemo(() => {
    let raw = Array.isArray(song?.lyricsEnglish) ? song.lyricsEnglish.join("\n") : (song?.lyricsEnglish || "");
    if (!raw && Array.isArray(song?.lyrics) && song.lyrics.length > 0) {
      const matched = song.lyrics.find((l) => l.language === "en");
      raw = matched?.content || matched?.text || "";
    }
    if (!raw || typeof raw !== "string") return [];
    return raw
      .split(/\n\s*\n+/)
      .map((block) =>
        block
          .split("\n")
          .map((l) => l.replace(/\[\d{2}:\d{2}\]/g, "").trim())
          .filter(Boolean)
      )
      .filter((b) => b.length > 0);
  }, [song]);

  useEffect(() => {
    if (song) {
      const hasTelugu = !!(
        song.lyricsTelugu ||
        (Array.isArray(song.lyrics) && song.lyrics.some((l) => l.language === "te" || l.isDefault))
      );
      setInternalLanguage(hasTelugu ? "telugu" : "english");
    }
  }, [song]);

  const stanzas = useMemo(() => {
    if (selectedLanguage === "english") {
      return stanzasEnglish.length > 0 ? stanzasEnglish : stanzasTelugu;
    }
    return stanzasTelugu;
  }, [selectedLanguage, stanzasTelugu, stanzasEnglish]);

  const dualStanzas = useMemo(() => {
    if (selectedLanguage !== "dual") return [];
    const maxStanzas = Math.max(stanzasTelugu.length, stanzasEnglish.length);
    const combined = [];
    for (let i = 0; i < maxStanzas; i++) {
      combined.push({
        telugu: stanzasTelugu[i] || [],
        english: stanzasEnglish[i] || [],
      });
    }
    return combined;
  }, [selectedLanguage, stanzasTelugu, stanzasEnglish]);

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
  }, [selectedLanguage, stanzas, dualStanzas]);
  let currentFlatIndex = 0;

  if (isImmersive) {
    return (
      <div
        ref={containerRef}
        className="w-full flex-1 overflow-y-auto overscroll-contain px-6 sm:px-12 md:px-16 py-12 select-text bg-card"
        style={{ fontSize: `${fontSizeMultiplier * 100}%` }}
      >
        <div className="max-w-5xl mx-auto pb-32 min-h-full flex flex-col justify-center">
          {selectedLanguage === "dual" ? (
            /* Widescreen 2-Column Side-by-Side Grid, falling back to stack on Mobile */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              {/* Left Column: Telugu */}
              <div className="space-y-10 text-center">
                <h4 className="text-[10px] font-bold text-muted uppercase tracking-[0.25em] mb-6 border-b border-line pb-2 max-w-xs mx-auto">
                  తెలుగు లిరిక్స్
                </h4>
                {stanzasTelugu.map((stanzaLines, sIdx) => (
                  <div key={`te-stanza-${sIdx}`} className="space-y-3 sm:space-y-4">
                    {stanzaLines.map((line, lIdx) => (
                      <p
                        key={`te-line-${sIdx}-${lIdx}`}
                        className="text-center text-[1.25em] sm:text-[1.5em] md:text-[1.875em] font-extrabold tracking-tight leading-relaxed text-title font-telugu select-text"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Right Column: English */}
              <div className="space-y-10 text-center border-t border-line/20 pt-8 md:border-t-0 md:pt-0 md:border-l md:border-line/20 md:pl-16">
                <h4 className="text-[10px] font-bold text-muted uppercase tracking-[0.25em] mb-6 border-b border-line pb-2 max-w-xs mx-auto">
                  English / Romanized
                </h4>
                {stanzasEnglish.map((stanzaLines, sIdx) => (
                  <div key={`en-stanza-${sIdx}`} className="space-y-3 sm:space-y-4">
                    {stanzaLines.map((line, lIdx) => (
                      <p
                        key={`en-line-${sIdx}-${lIdx}`}
                        className="text-center text-[1.125em] sm:text-[1.25em] md:text-[1.5em] font-bold tracking-wide leading-relaxed text-muted select-text"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Single Language Mode */
            <div className="max-w-2xl mx-auto text-center space-y-10">
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
                          className={`text-center text-[1.25em] sm:text-[1.5em] md:text-[1.875em] lg:text-[2.25em] font-extrabold tracking-tight leading-relaxed transition-all duration-300 ${
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
            </div>
          )}

          {selectedLanguage === "dual" && stanzasTelugu.length === 0 && stanzasEnglish.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-lg text-muted font-medium">Lyrics not available for this track.</p>
            </div>
          )}

          {selectedLanguage !== "dual" && flatLines.length === 0 && (
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
        className="relative px-4 sm:px-8 py-6 space-y-8"
        style={{ fontSize: `${fontSizeMultiplier * 100}%` }}
      >
        <div className="max-w-2xl mx-auto space-y-8">
          {selectedLanguage === "dual" ? (
            dualStanzas.map((stanza, sIdx) => (
              <div key={`dual-stanza-${sIdx}`} className="space-y-4 py-3.5 border-b border-line/10 last:border-0">
                <div className="space-y-2">
                  {stanza.telugu.map((line, lIdx) => (
                    <p
                      key={`te-${sIdx}-${lIdx}`}
                      className="text-center text-base sm:text-lg md:text-xl font-bold leading-relaxed text-title font-telugu"
                    >
                      {line}
                    </p>
                  ))}
                </div>
                {stanza.english.length > 0 && (
                  <div className="space-y-1.5 pt-2 opacity-80 border-t border-dashed border-line/15">
                    {stanza.english.map((line, lIdx) => (
                      <p
                        key={`en-${sIdx}-${lIdx}`}
                        className="text-center text-xs sm:text-sm md:text-base font-semibold leading-relaxed text-muted"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            stanzas.map((stanzaLines, sIdx) => (
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
                        className={`text-center text-[1em] sm:text-[1.125em] md:text-[1.25em] font-bold leading-relaxed transition-all duration-300 ${
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
            ))
          )}

          {selectedLanguage === "dual" && dualStanzas.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted">Lyrics not available for this track.</p>
            </div>
          )}

          {selectedLanguage !== "dual" && flatLines.length === 0 && (
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
        />
      </div>
      {lyricsContent}
    </div>
  );
}
