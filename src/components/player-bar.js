"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAudio } from "@/context/audio-context";
import SongArtwork from "@/components/ui/SongArtwork";
import { extractDominantColor } from "@/utils/extract-color";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  Maximize2,
  ListMusic,
  ChevronDown,
  Music,
  Video,
  X
} from "lucide-react";

// Inline MicVocal SVG to bypass Turbopack / lucide caching errors
function MicIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 .314.087L15.09 12" />
      <path d="M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5" />
      <circle cx="16" cy="7" r="5" />
    </svg>
  );
}

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isLooping,
    isShuffled,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    adjustVolume,
    toggleMute,
    setIsLooping,
    setIsShuffled,
    favorites,
    toggleFavorite
  } = useAudio();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sliderVal, setSliderVal] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ambientColor, setAmbientColor] = useState({ r: 18, g: 18, b: 18 });

  const isLyricsPage = isClient && currentSong && pathname === `/song/${currentSong.id}` && searchParams?.get("view") === "lyrics";

  useEffect(() => {
    setTimeout(() => {
      setIsClient(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!isDragging) {
      setSliderVal(progress);
    }
  }, [progress, isDragging]);

  useEffect(() => {
    if (currentSong?.coverUrl) {
      extractDominantColor(currentSong.coverUrl).then((color) => {
        setTimeout(() => {
          setAmbientColor(color);
        }, 0);
      });
    } else {
      setTimeout(() => {
        setAmbientColor({ r: 18, g: 18, b: 18 });
      }, 0);
    }
  }, [currentSong]);

  if (!isClient) return null;

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressInput = (e) => {
    const newProgress = parseFloat(e.target.value);
    setSliderVal(newProgress);
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setSliderVal(newProgress);
    seekTo(newProgress);
    setIsDragging(false);
  };

  const handleContainerClick = (e) => {
    // Prevent expansion when clicking action buttons
    if (e.target.closest('button') || e.target.closest('a')) return;
    setIsExpanded(true);
  };

  const handleLyricsClick = () => {
    setIsExpanded(false);
    if (currentSong) {
      router.push(`/song/${currentSong.id}?view=lyrics`);
    }
  };

  const isFavorited = currentSong && favorites.includes(currentSong.id);
  const { r, g, b } = ambientColor;

  return (
    <>
      {/* ─── MOBILE MINI PLAYER — fixed above MobileNav ─── */}
      {currentSong && !isExpanded && (
        <div
          className="lg:hidden fixed left-0 right-0 z-40 bg-card border-t border-line-muted select-none pb-2"
          style={{ bottom: `calc(60px + env(safe-area-inset-bottom, 0px))` }}
        >
          {/* Seek Bar */}
          <div
            className="shrink-0 h-2 group cursor-pointer touch-pan-y"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const pct = x / rect.width;
              const targetTime = pct * (duration || 100);
              setSliderVal(targetTime);
              seekTo(targetTime);
            }}
          >
            <div className="relative w-full h-full bg-line">
                <div
                  className="absolute inset-y-0 left-0 bg-title/70 group-active:bg-title transition-all duration-75"
                  style={{ width: `${(sliderVal / (duration || 100)) * 100}%` }}
                />
                {/* Moving cursor/thumb — follows the playhead position */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-title rounded-full shadow-md transition-opacity duration-75 ${
                    sliderVal > 0 && duration > 0
                      ? "opacity-50 group-active:opacity-100 group-hover:opacity-80"
                      : "opacity-0"
                  }`}
                  style={{ left: `calc(${(sliderVal / (duration || 100)) * 100}% - 7px)` }}
                />
              </div>
            </div>

            {/* Content row */}
            <div
              onClick={handleContainerClick}
              className="flex-1 flex items-center justify-between px-4 pt-3 min-h-[56px] cursor-pointer"
            >

            {/* Left: Artwork + Titles */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <SongArtwork
                song={currentSong}
                className="w-9 h-9 object-cover rounded-md border border-line shrink-0"
                iconSize="w-4.5 h-4.5"
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-title block truncate leading-tight">
                  {currentSong.teluguTitle || currentSong.title}
                </span>
                <span className="text-[10px] text-muted block truncate leading-tight mt-0.5">
                  {currentSong.artist}
                </span>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3.5 shrink-0">
              {currentSong?.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/song/${encodeURIComponent(currentSong.id)}?view=video`);
                  }}
                  className="p-1 hover:bg-card-hover rounded-full active:scale-90 transition-transform cursor-pointer text-muted hover:text-title"
                  aria-label="Watch Video"
                  title="Watch Video"
                >
                  <Video className="w-4.5 h-4.5 text-red-400" />
                </button>
              )}
              <button
                onClick={() => toggleFavorite(currentSong.id)}
                className="p-1 hover:bg-white/5 rounded-full active:scale-90 transition-transform cursor-pointer"
                aria-label="Add to favorites"
              >
                <Heart
                  className={`w-4.5 h-4.5 ${
                    isFavorited
                      ? "fill-red-500 text-red-500"
                      : "text-dim hover:text-title"
                  }`}
                />
              </button>
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center active:scale-90 transition-transform shadow-md cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>
          </div>
        )}

        {/* ─── DESKTOP PLAYER BAR (lg+) ─── */}
        <div className="hidden lg:flex items-center justify-between w-full h-20 shrink-0 px-8 border-t border-line-muted bg-canvas/95">
          {/* Left section: Song Details */}
          <div className="flex items-center gap-3 w-[30%] min-w-0">
            {currentSong ? (
              <>
                <Link
                  href={`/song/${currentSong.id}`}
                  className="group relative block overflow-hidden rounded-md border border-line flex-shrink-0 cursor-pointer"
                >
                  <SongArtwork
                    song={currentSong}
                    className="w-12 h-12 object-cover transition-transform duration-500 group-hover:scale-105"
                    iconSize="w-5 h-5"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </Link>
                <div className="overflow-hidden min-w-0">
                  <Link
                    href={`/song/${currentSong.id}`}
                    className={`font-medium text-sm text-title hover:text-handle block truncate hover:underline text-left cursor-pointer ${
                      currentSong.teluguTitle ? "font-telugu" : ""
                    }`}
                  >
                    {currentSong.teluguTitle || currentSong.title}
                  </Link>
                  <span className="text-xs text-muted block truncate">
                    {currentSong.artist}
                  </span>
                </div>
                <button
                  onClick={() => toggleFavorite(currentSong.id)}
                  className="p-1 hover:bg-card-hover rounded-full group transition-colors flex-shrink-0 cursor-pointer"
                  aria-label="Add to favorites"
                >
                  <Heart
                    className={`w-4 h-4 transition-transform group-active:scale-90 ${
                      isFavorited
                        ? "fill-red-500 text-red-500"
                        : "text-dim hover:text-handle"
                    }`}
                  />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-card-hover border border-line flex items-center justify-center text-dim">
                  <ListMusic className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-medium text-dim block">
                    No Track Selected
                  </span>
                  <span className="text-xs text-dim block">
                    Select a song to start
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Middle section: Playback Controls */}
          <div className="flex flex-col items-center gap-1 w-[40%] max-w-[500px]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  isShuffled ? "text-title bg-card-hover font-semibold" : "text-dim hover:text-handle"
                }`}
                title="Shuffle"
                disabled={!currentSong}
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={prevSong}
                className="p-1.5 rounded-full text-muted hover:text-copy hover:bg-card-hover transition-colors active:scale-95 cursor-pointer"
                title="Previous Song"
                disabled={!currentSong}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer ${
                  isPlaying
                    ? "bg-card text-title hover:bg-card-hover"
                    : "bg-card-hover text-title hover:bg-line border border-line"
                }`}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="p-1.5 rounded-full text-muted hover:text-copy hover:bg-card-hover transition-colors active:scale-95 cursor-pointer"
                title="Next Song"
                disabled={!currentSong}
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  isLooping ? "text-title bg-card-hover font-semibold" : "text-dim hover:text-handle"
                }`}
                title="Loop"
                disabled={!currentSong}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timeline Slider */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[10px] text-muted tabular-nums w-8 text-right">
                {formatTime(sliderVal)}
              </span>
              <div className="relative flex-1 group py-1.5 cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={sliderVal}
                  onInput={handleProgressInput}
                  onChange={handleProgressChange}
                  onMouseDown={() => setIsDragging(true)}
                  onTouchStart={() => setIsDragging(true)}
                  disabled={!currentSong}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="h-1 w-full bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-dim group-hover:bg-handle rounded-full transition-all duration-75"
                    style={{
                      width: `${(sliderVal / (duration || 100)) * 100}%`
                    }}
                  />
                </div>
                <div
                  className={`absolute w-2.5 h-2.5 bg-handle border border-canvas rounded-full top-1/2 -mt-1.25 transition-opacity duration-75 z-20 ${
                    sliderVal > 0 && duration > 0
                      ? "opacity-60 group-hover:opacity-100"
                      : "opacity-0"
                  }`}
                  style={{
                    left: `calc(${(sliderVal / (duration || 100)) * 100}% - 5px)`
                  }}
                />
              </div>
              <span className="text-[10px] text-muted tabular-nums w-8">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right section: Volume & Options */}
          <div className="flex items-center gap-2 w-[30%] justify-end min-w-0">
            {currentSong?.id && (
              <button
                onClick={() => router.push(`/song/${encodeURIComponent(currentSong.id)}?view=video`)}
                className="p-1.5 rounded-full transition-all cursor-pointer text-muted hover:text-title hover:bg-card-hover"
                title="Watch Video"
              >
                <Video className="w-4 h-4 text-red-400" />
              </button>
            )}

            {currentSong ? (
              <Link
                href={isLyricsPage ? `/song/${currentSong.id}` : `/song/${currentSong.id}?view=lyrics`}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  isLyricsPage
                    ? "text-accent bg-card-hover font-semibold shadow-[0_0_15px_rgba(29,185,84,0.15)] scale-105"
                    : "text-muted hover:text-copy hover:bg-card-hover"
                }`}
                title={isLyricsPage ? "Close Lyrics" : "Lyrics"}
              >
                <MicIcon className="w-4 h-4" />
              </Link>
            ) : (
              <span className="p-1.5 text-muted">
                <MicIcon className="w-4 h-4" />
              </span>
            )}

            <button
              onClick={toggleMute}
              className="p-1.5 text-muted hover:text-copy rounded-full hover:bg-card-hover cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <div className="relative group w-16 lg:w-20 py-2 cursor-pointer">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="h-1 w-full bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-muted group-hover:bg-handle rounded-full"
                  style={{
                    width: `${(isMuted ? 0 : volume) * 100}%`
                  }}
                />
              </div>
              <div
                className="absolute w-2.5 h-2.5 bg-handle border border-canvas rounded-full top-1/2 -mt-1.25 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                style={{
                  left: `calc(${(isMuted ? 0 : volume) * 100}% - 5px)`
                }}
              />
            </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* ─── FULL-SCREEN MOBILE IMMERSIVE EXPANDED PLAYER ─── */}
      {/* ──────────────────────────────────────────────────────── */}
      {currentSong && isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-canvas flex flex-col justify-between p-6 select-none animate-in slide-in-from-bottom duration-300"
          style={{
            backgroundColor: "#070707",
            backgroundImage: `radial-gradient(130% 100% at 50% 0%, rgba(${r},${g},${b},0.3) 0%, rgba(${Math.max(0, r-35)},${Math.max(0, g-35)},${Math.max(0, b-35)},0.08) 50%, #070707 100%)`,
          }}
        >
          {/* Top Navigation Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 -ml-2 text-white/70 hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Close player"
            >
              <ChevronDown className="w-7 h-7" />
            </button>
            <div className="text-center">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">
                Playing From
              </span>
              <span className="text-xs font-bold text-white block mt-0.5 truncate max-w-[200px]">
                {pathname === "/" ? "Home Catalog" : "Details Page"}
              </span>
            </div>
            <button
              onClick={handleLyricsClick}
              className="p-2 -mr-2 text-white/70 hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="View lyrics"
            >
              <MicIcon className="w-5.5 h-5.5" />
            </button>
          </div>

          {/* Album Artwork Section */}
          <div className="my-auto flex items-center justify-center">
            <div 
              className={`w-72 h-72 rounded-2xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.7)] border border-white/10 transition-transform duration-500 ease-out ${
                isPlaying ? "scale-100" : "scale-[0.93] opacity-80"
              }`}
            >
              <SongArtwork
                song={currentSong}
                className="w-full h-full object-cover"
                iconSize="w-16 h-16"
              />
            </div>
          </div>

          {/* Details & Controls Stack */}
          <div className="space-y-6 pb-4">
            
            {/* Title, Artist, & Favorite Button */}
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className={`text-2xl font-black text-white truncate text-left tracking-tight ${
                  currentSong.teluguTitle ? "font-telugu" : ""
                }`}>
                  {currentSong.teluguTitle || currentSong.title}
                </h2>
                <span className="text-sm font-medium text-muted block text-left mt-1 truncate">
                  {currentSong.artist}
                </span>
              </div>
              <button
                onClick={() => toggleFavorite(currentSong.id)}
                className="p-2 rounded-full hover:bg-white/5 shrink-0 cursor-pointer active:scale-95 transition-transform"
              >
                <Heart
                  className={`w-6.5 h-6.5 ${
                    isFavorited
                      ? "fill-red-500 text-red-500 animate-in zoom-in duration-200"
                      : "text-dim hover:text-white"
                  }`}
                />
              </button>
            </div>

            {/* Timeline Progress Scrubber */}
            <div className="space-y-2">
              <div className="relative group py-1.5 cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={sliderVal}
                  onChange={handleProgressChange}
                  className="w-full h-1 bg-line rounded-full appearance-none cursor-pointer accent-white focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #fff 0%, #fff ${(sliderVal / (duration || 100)) * 100}%, rgba(255,255,255,0.1) ${(sliderVal / (duration || 100)) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-muted/80 tabular-nums">
                <span>{formatTime(sliderVal)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Core Media Transport Controls */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`p-2.5 rounded-full transition-colors cursor-pointer active:scale-90 ${
                  isShuffled ? "text-accent" : "text-white/40 hover:text-white"
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={prevSong}
                className="p-2.5 rounded-full text-white/80 hover:text-white active:scale-90 transition-colors cursor-pointer"
                title="Previous track"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center active:scale-90 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.25)] cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current text-black" />
                ) : (
                  <Play className="w-6 h-6 fill-current text-black ml-1" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="p-2.5 rounded-full text-white/80 hover:text-white active:scale-90 transition-colors cursor-pointer"
                title="Next track"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2.5 rounded-full transition-colors cursor-pointer active:scale-90 ${
                  isLooping ? "text-accent" : "text-white/40 hover:text-white"
                }`}
                title="Repeat"
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control Slider */}
            <div className="flex items-center gap-3 px-1.5 pt-2">
              <button
                onClick={toggleMute}
                className="text-white/40 hover:text-white cursor-pointer active:scale-90 transition-transform"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4.5 h-4.5" />
                ) : (
                  <Volume2 className="w-4.5 h-4.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-line rounded-full appearance-none cursor-pointer accent-white focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #b3b3b3 0%, #b3b3b3 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>

          </div>
        </div>
      )}

    </>
  );
}
