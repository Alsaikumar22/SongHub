"use client";

import React from "react";
import Link from "next/link";
import { Play, Music, Clock, VolumeX } from "lucide-react";
import SongArtwork from "./ui/SongArtwork";

/**
 * Reusable SongCard component to display individual song details
 */
export default function SongCard({ song, onPlay }) {
  if (!song) return null;

  const hasAudio = !!(song.audioUrl || song.media?.audio || song.youtubeId);

  return (
    <div
      onClick={() => {
        if (hasAudio && onPlay) {
          onPlay(song);
        }
      }}
      className="group relative bg-card border border-line/40 hover:border-line rounded-xl p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-card-hover mb-3 border border-line/30">
        <SongArtwork
          song={song}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          iconSize="w-8 h-8"
        />

        {/* Floating Play Button — always visible on mobile, hover on desktop */}
        {hasAudio && onPlay && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPlay(song);
            }}
            className="absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl md:opacity-0 md:group-hover:opacity-100 md:group-hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer z-10"
            title={`Play ${song.title}`}
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        )}

        {/* Muted/Lyrics-Only Badge */}
        {!hasAudio && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-sm text-red-400 rounded-md flex items-center gap-1 text-[9px] font-black uppercase tracking-wider z-10 border border-red-500/20 shadow-sm" title="No audio available">
            <VolumeX className="w-3 h-3 text-red-400" />
            <span>Lyrics Only</span>
          </div>
        )}
      </div>

      {/* Info Header */}
      <div className="space-y-1 min-w-0">
        <Link
          href={`/song/${encodeURIComponent(song.slug || song.id)}`}
          className="font-bold text-sm text-title hover:text-title block truncate tracking-tight"
        >
          {song.title}
        </Link>
        {song.titleEnglish && (
          <span className="text-[11px] text-muted block truncate italic">
            {song.titleEnglish}
          </span>
        )}
        <span className="text-xs text-dim block truncate">
          {typeof song?.artist === "object" && song?.artist !== null ? song.artist.name : song?.artist || "Unknown Artist"}
        </span>
      </div>

      {/* Card Footer Metadata */}
      <div className="mt-3 pt-2 border-t border-line/20 flex items-center justify-between text-[10px] text-muted font-medium">
        <span className="truncate max-w-[60%] px-1.5 py-0.5 rounded bg-card-hover border border-line">
          {Array.isArray(song?.category) ? song.category[0] : (song?.category || "General")}
        </span>
        {song.duration && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 opacity-60" />
            {song.duration}
          </span>
        )}
      </div>
    </div>
  );
}
