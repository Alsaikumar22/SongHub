"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Heart, Plus, Share2, Check } from "lucide-react";
import { extractDominantColor } from "@/utils/extract-color";
import SongArtwork from "../ui/SongArtwork";

export default function SongHero({
  song,
  currentSong,
  isPlaying,
  playSong,
  isFavorited,
  toggleFavorite,
  playlists,
  addSongToPlaylist,
  removeSongFromPlaylist,
}) {
  const [gradientColor, setGradientColor] = useState({ r: 18, g: 18, b: 18 });
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [shareNotification, setShareNotification] = useState(false);

  useEffect(() => {
    extractDominantColor(song.coverUrl).then(setGradientColor);
  }, [song.coverUrl]);

  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayClick = () => {
    playSong(song);
  };

  const handleShareClick = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShareNotification(true);
      setTimeout(() => setShareNotification(false), 2000);
    }
  };

  const { r, g, b } = gradientColor;

  return (
    <div className="w-full space-y-6">
      {/* 1. Immersive Gradient Hero Banner */}
      <div
        className="relative -mx-6 md:-mx-8 -mt-[60px] px-6 md:px-8 pt-24 pb-8 md:pb-10 rounded-b-2xl overflow-hidden border-b border-line/10 transition-all duration-300"
        style={{
          background: `linear-gradient(180deg, rgba(${r},${g},${b},0.6) 0%, rgba(${r},${g},${b},0.2) 65%, rgba(7,7,7,0.4) 90%, transparent 100%)`,
        }}
      >
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
          {/* Cover Art */}
          <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-white/10 shrink-0 relative group hover:scale-[1.03] transition-transform duration-300 ease-out cursor-pointer">
            <SongArtwork
              song={song}
              className="w-full h-full object-cover"
              iconSize="w-14 h-14"
            />
          </div>

          {/* Info Details */}
          <div className="flex-1 min-w-0 text-center md:text-left space-y-3">
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.25em]">
              Song
            </span>

            <h1
              className={`text-white text-2xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight select-all drop-shadow-sm ${
                song.teluguTitle ? "font-telugu" : ""
              }`}
            >
              {song.teluguTitle || song.title}
            </h1>

            {song.teluguTitle && song.title !== song.teluguTitle && (
              <p className="text-lg md:text-xl text-white/70 font-semibold tracking-wide">
                {song.title}
              </p>
            )}

             <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-sm text-white/60 pt-1 font-medium">
              <span className="font-bold text-white hover:text-white/80 hover:underline cursor-pointer transition-colors">
                {song.artist}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Separated Action Row (Spotify-Style Placement) */}
      <div className="flex items-center justify-start gap-3 md:gap-4 py-2 border-b border-line/10 pb-6">
        <button
          onClick={handlePlayClick}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-106 active:scale-95 transition-all shadow-lg hover:shadow-white/15 cursor-pointer"
          title={isCurrentSong && isPlaying ? "Pause" : "Play"}
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" />
          ) : (
            <Play className="w-5 h-5 md:w-6 md:h-6 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={toggleFavorite}
          className={`w-9 h-9 md:w-11 md:h-11 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isFavorited
              ? "border-red-500/30 text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-[pulse_1.5s_infinite]"
              : "border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/30"
          }`}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorited ? "fill-current" : ""}`} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
            className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Add to playlist"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {showPlaylistDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowPlaylistDropdown(false)}
              />
              <div className="absolute left-0 top-full mt-2 bg-card border border-line rounded-2xl shadow-xl py-1.5 z-50 w-48 max-h-48 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-line">
                  Select Playlist
                </div>
                {playlists.length > 0 ? (
                  playlists.map((list) => {
                    const isInPlaylist = list.songIds.includes(song.id);
                    return (
                      <button
                        key={list.id}
                        onClick={() => {
                          if (isInPlaylist) {
                            removeSongFromPlaylist(list.id, song.id);
                          } else {
                            addSongToPlaylist(list.id, song.id);
                          }
                          setShowPlaylistDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-xs text-white hover:bg-card-hover text-left flex items-center justify-between"
                      >
                        <span className="truncate">{list.name}</span>
                        {isInPlaylist ? (
                          <span className="text-[10px] bg-line text-handle px-1.5 py-0.5 rounded font-semibold border border-dim flex-shrink-0">
                            Added
                          </span>
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-muted" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-xs text-muted italic text-center">
                    No custom playlists
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleShareClick}
          className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Share"
        >
          <Share2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
        </button>
      </div>

      {shareNotification && (
        <div className="fixed bottom-24 right-8 bg-card border border-dim text-handle px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 z-50">
          <Check className="w-3.5 h-3.5 text-handle" />
          <span>Link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
