"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAudio } from "../../context/audio-context";
import { Play } from "lucide-react";
import { CAROUSEL_SLIDES } from "@/data/carousel";

export default function HeroCarousel() {
  const { songs, playSong } = useAudio();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full min-h-[380px] md:h-[400px] rounded-2xl md:rounded-[32px] overflow-hidden bg-card border border-line/20 shadow-2xl flex items-center group">
      {/* Ambient Blurred Background using current slide cover */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-25 scale-110 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${CAROUSEL_SLIDES[currentSlide].bgUrl})` }}
      />
      {/* Dark gradient mask */}
      <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/90 to-transparent pointer-events-none" />

      {/* Slide Content wrapper */}
      {CAROUSEL_SLIDES.map((slide, idx) => {
        const isActive = idx === currentSlide;
        if (!isActive) return null;

        return (
          <div
            key={slide.id}
            className="relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-12 px-5 md:px-12 pt-6 pb-12 md:py-0 w-full animate-in fade-in slide-in-from-right-4 duration-500"
          >
            {/* Left: Artwork */}
            <div className="w-32 h-32 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-line flex-shrink-0 relative group/art select-none">
              <img
                src={slide.bgUrl}
                alt={slide.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/art:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/art:opacity-100 transition-opacity" />
            </div>

            {/* Right: Metadata & Action buttons */}
            <div className="flex-1 text-center md:text-left min-w-0 space-y-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-title/15 text-title text-[10px] font-bold tracking-widest uppercase">
                  {slide.label}
                </span>
                <h2 className={`text-white text-2xl md:text-5xl font-black tracking-tight leading-tight truncate drop-shadow-md ${
                  slide.id === "adavi-chetla-naduma" ? "font-telugu" : "font-lato"
                }`}>
                  {slide.title}
                </h2>
                <p className="text-muted text-sm font-semibold tracking-wide uppercase">
                  {slide.subtitle} • <span className="text-dim">{slide.artist}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={() => {
                    const song =
                      songs.find((s) => s.id === slide.id) ||
                      songs.find((s) => s.id === "adavi-chetla-naduma");
                    if (song) playSong(song);
                  }}
                  className="px-6 h-11 bg-title text-card font-bold rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Play className="w-4 h-4 fill-current text-card" />
                  <span>Play Now</span>
                </button>
                <Link
                  href={`/song/${slide.id}`}
                  className="px-6 h-11 border border-line hover:border-title bg-transparent hover:bg-card-hover text-white font-bold rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer shadow-sm"
                >
                  <span>📖 Lyrics</span>
                  <span className="text-xs text-muted">↗</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Pagination dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 md:left-auto md:right-8 -translate-x-1/2 md:translate-x-0 z-20 flex gap-2">
        {CAROUSEL_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
              idx === currentSlide ? "bg-title w-6" : "bg-dim/50 hover:bg-dim"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
