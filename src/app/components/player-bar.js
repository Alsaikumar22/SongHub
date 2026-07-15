"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAudio } from "../context/audio-context";
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
  ListMusic
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
      <path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12" />
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
    toggleFavorite,
    setViewedSongId
  } = useAudio();

  const pathname = usePathname();
  const [sliderVal, setSliderVal] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const isLyricsPage = currentSong && pathname === `/song/${currentSong.id}`;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setSliderVal(progress);
  }, [progress]);

  if (!isClient) return null;

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setSliderVal(newProgress);
    seekTo(newProgress);
  };

  const isFavorited = currentSong && favorites.includes(currentSong.id);

  return (
    <div className="h-22 bg-canvas/95 backdrop-blur-md border-t border-line-muted px-4 md:px-8 flex items-center justify-between shrink-0 transition-all duration-300">
      {/* Left section: Song Details */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
        {currentSong ? (
          <>
            <Link
              href={`/song/${currentSong.id}`}
              className="group relative block overflow-hidden rounded-md border border-line flex-shrink-0 cursor-pointer"
            >
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-12 h-12 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
            <div className="overflow-hidden">
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
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-[600px]">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isShuffled ? "text-title bg-card-hover font-semibold" : "text-dim hover:text-handle"
            }`}
            title="Shuffle"
            disabled={!currentSong}
          >
            <Shuffle className="w-4 h-4" />
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
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer ${
              isPlaying
                ? "bg-card text-white hover:bg-card-hover"
                : "bg-card-hover text-title hover:bg-line border border-line"
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
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
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] text-muted tabular-nums w-8 text-right">
            {formatTime(sliderVal)}
          </span>
          <div className="relative flex-1 group py-2 cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={sliderVal}
              onChange={handleProgressChange}
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
              className="absolute w-2.5 h-2.5 bg-handle border border-canvas rounded-full top-1/2 -mt-1.25 opacity-0 group-hover:opacity-100 transition-opacity z-20"
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
      <div className="flex items-center gap-3 w-1/4 justify-end min-w-[150px]">
        {currentSong ? (
          <Link
            href={isLyricsPage ? "/" : `/song/${currentSong.id}`}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isLyricsPage
                ? "text-title bg-card-hover font-semibold"
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

        <div className="relative group w-20 py-2 cursor-pointer">
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
  );
}
