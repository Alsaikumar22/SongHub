"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAudio } from "@/context/audio-context";
import { Play, Sparkles } from "lucide-react";
import useWeeklySongs from "@/hooks/useWeeklySongs";

export default function HeroCarousel() {
  const { songs, playSong } = useAudio();
  const { weeklySongs, weekNumber } = useWeeklySongs({ songs, count: 5 });
  const [currentSlide, setCurrentSlide] = useState(0);

  // Transform weekly songs into carousel slide format
  const carouselSlides = weeklySongs.map((song) => ({
    id: song.id,
    title: song.teluguTitle || song.title,
    subtitle: (song.title || song.teluguTitle || "").toUpperCase(),
    artist: typeof song?.artist === "object" && song?.artist !== null ? song.artist.name : song?.artist || "",
    label: "✨ Songs of the Week",
    bgUrl: song.coverUrl || song.imageUrl || "/worship_forest.png",
    isTelugu: !!song.teluguTitle,
    duration: song.duration || "0:00",
  }));

  // Reset carousel if weekly songs change
  useEffect(() => {
    setCurrentSlide(0);
  }, [carouselSlides.length]);

  useEffect(() => {
    if (carouselSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  if (carouselSlides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full min-h-[380px] md:h-[400px] rounded-2xl md:rounded-[32px] overflow-hidden bg-card border border-line/20 shadow-2xl flex items-center group">
      {/* Ambient Blurred Background using current slide cover */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-25 scale-110 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${carouselSlides[currentSlide].bgUrl})` }}
      />
      {/* Dark gradient mask */}
      <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/90 to-transparent pointer-events-none" />

      {/* Slide Content wrapper */}
      {carouselSlides.map((slide, idx) => {
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
              {/* Duration badge on artwork */}
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-md text-[11px] font-bold text-white/90 border border-white/10 shadow-sm">
                {slide.duration}
              </div>
            </div>

            {/* Right: Metadata & Action buttons */}
            <div className="flex-1 text-center md:text-left min-w-0 space-y-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-title/20 to-purple-500/20 border border-title/20 text-[10px] font-bold tracking-widest uppercase">
                  <Sparkles className="w-3 h-3" />
                  {slide.label} · Week {weekNumber}
                </span>
                <h2 className={`text-white text-2xl md:text-5xl font-black tracking-tight leading-tight truncate drop-shadow-md ${
                  slide.isTelugu ? "font-telugu" : "font-lato"
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
                    const song = songs.find((s) => s.id === slide.id);
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

      {/* Week indicator dot */}
      <div className="absolute bottom-4 left-4 z-20">
        <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider bg-black/30 px-2.5 py-1 rounded-full border border-white/5">
          Week {weekNumber} · {carouselSlides.length} songs
        </span>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 md:left-auto md:right-8 -translate-x-1/2 md:translate-x-0 z-20 flex gap-2">
        {carouselSlides.map((_, idx) => (
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
