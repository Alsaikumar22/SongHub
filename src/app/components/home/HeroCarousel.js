"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAudio } from "../../context/audio-context";
import { Play } from "lucide-react";

const CAROUSEL_SLIDES = [
  {
    id: "adavi-chetla-naduma",
    title: "అడవి చెట్ల నడుమ",
    subtitle: "ADAVI CHETLA NADUMA",
    artist: "O Yaathrikudaa",
    label: "✨ SONGS OF THE WEEK",
    bgUrl: "/worship_forest.png",
  },
  {
    id: "1",
    title: "Ambient Gold",
    subtitle: "AMBIENT GOLD",
    artist: "Lofi Dreamer",
    label: "✨ SONG OF THE WEEK",
    bgUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1000&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    title: "Synthwave Breeze",
    subtitle: "SYNTHWAVE BREEZE",
    artist: "Retro Horizon",
    label: "✨ SONG OF THE WEEK",
    bgUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1000&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    title: "Pop Neon",
    subtitle: "POP NEON",
    artist: "Starlight",
    label: "✨ SONG OF THE WEEK",
    bgUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    title: "Melancholy Rock",
    subtitle: "MELANCHOLY ROCK",
    artist: "Dark Antlers",
    label: "✨ SONG OF THE WEEK",
    bgUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1000&auto=format&fit=crop&q=80",
  },
  {
    id: "5",
    title: "Chilled Beats",
    subtitle: "CHILLED BEATS",
    artist: "Summer Chill",
    label: "✨ SONG OF THE WEEK",
    bgUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
  },
];

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
    <div className="relative w-full h-[400px] rounded-[32px] overflow-hidden bg-card border border-line/20 shadow-2xl flex items-center group">
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
            className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 px-8 md:px-12 w-full animate-in fade-in slide-in-from-right-4 duration-500"
          >
            {/* Left: Artwork */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-line flex-shrink-0 relative group/art select-none">
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
                <h2 className={`text-white text-3xl md:text-5xl font-black tracking-tight leading-tight truncate drop-shadow-md ${
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
      <div className="absolute bottom-6 right-8 z-20 flex gap-2">
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
