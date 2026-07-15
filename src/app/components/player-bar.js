"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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

  const [sliderVal, setSliderVal] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Sync client side to avoid SSR mismatch on initial mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update slider position as song plays
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
    <div className="h-22 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 px-4 md:px-8 flex items-center justify-between shrink-0 transition-all duration-300">
      {/* Left section: Song Details */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
        {currentSong ? (
          <>
            <Link href={`/song/${currentSong.id}`} className="group relative block overflow-hidden rounded-md border border-gray-700 flex-shrink-0">
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
                className="font-medium text-sm text-gray-100 hover:text-gray-300 block truncate hover:underline"
              >
                {currentSong.title}
              </Link>
              <span className="text-xs text-gray-400 block truncate">
                {currentSong.artist}
              </span>
            </div>
            <button
              onClick={() => toggleFavorite(currentSong.id)}
              className="p-1 hover:bg-gray-800 rounded-full group transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Add to favorites"
            >
              <Heart
                className={`w-4 h-4 transition-transform group-active:scale-90 ${
                  isFavorited
                    ? "fill-red-500 text-red-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 block">
                No Track Selected
              </span>
              <span className="text-xs text-gray-500 block">
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
              isShuffled ? "text-indigo-400 bg-indigo-950/50 font-semibold" : "text-gray-500 hover:text-gray-300"
            }`}
            title="Shuffle"
            disabled={!currentSong}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevSong}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors active:scale-95 cursor-pointer"
            title="Previous Song"
            disabled={!currentSong}
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer ${
              isPlaying
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700"
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
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors active:scale-95 cursor-pointer"
            title="Next Song"
            disabled={!currentSong}
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isLooping ? "text-indigo-400 bg-indigo-950/50 font-semibold" : "text-gray-500 hover:text-gray-300"
            }`}
            title="Loop"
            disabled={!currentSong}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] text-gray-400 tabular-nums w-8 text-right">
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
            {/* Custom Track */}
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-500 group-hover:bg-indigo-600 rounded-full transition-all duration-75"
                style={{
                  width: `${(sliderVal / (duration || 100)) * 100}%`
                }}
              />
            </div>
            {/* Custom Handle */}
            <div
              className="absolute w-2.5 h-2.5 bg-gray-200 border border-gray-900 rounded-full top-1/2 -mt-1.25 opacity-0 group-hover:opacity-100 transition-opacity z-20"
              style={{
                left: `calc(${(sliderVal / (duration || 100)) * 100}% - 5px)`
              }}
            />
          </div>
          <span className="text-[10px] text-gray-400 tabular-nums w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right section: Volume & Options */}
      <div className="flex items-center gap-3 w-1/4 justify-end min-w-[150px]">
        <button
          onClick={toggleMute}
          className="p-1.5 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-800 cursor-pointer"
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
          {/* Custom Volume Track */}
          <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 group-hover:bg-indigo-600 rounded-full"
              style={{
                width: `${(isMuted ? 0 : volume) * 100}%`
              }}
            />
          </div>
          {/* Custom Volume Handle */}
          <div
            className="absolute w-2.5 h-2.5 bg-gray-300 border border-gray-900 rounded-full top-1/2 -mt-1.25 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            style={{
              left: `calc(${(isMuted ? 0 : volume) * 100}% - 5px)`
            }}
          />
        </div>
      </div>
    </div>
  );
}
