"use client";

import React from "react";
import { Play, Pause, Search, Music, Clock } from "lucide-react";
import SongArtwork from "../ui/SongArtwork";
import ProtectedAction from "@/components/auth/ProtectedAction";

export default function SearchResults({
  results,
  query,
  currentSong,
  isPlaying,
  playSong,
}) {
  if (!query || !query.trim()) return null;

  const trimmed = query.trim();
  const count = results.length;

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-card-hover border border-white/[0.06] flex items-center justify-center mb-5 shadow-sm">
          <Search className="w-6 h-6 text-dim" />
        </div>
        <h2 className="text-lg font-semibold text-title tracking-tight">No results found</h2>
        <p className="text-sm text-muted mt-1.5 max-w-xs leading-relaxed">
          We couldn&apos;t find anything for &ldquo;{trimmed}&rdquo;. Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Fixed Header */}
      <div className="flex items-center gap-4 px-1 pb-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-card-hover border border-white/[0.06] flex items-center justify-center">
          <Search className="w-4 h-4 text-muted" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-title tracking-tight">
            Search Results
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {count} result{count !== 1 && "s"} for &ldquo;{trimmed}&rdquo;
          </p>
        </div>
      </div>

      {/* Scrollable Results */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        <div className="grid grid-cols-[28px_1fr_48px] gap-4 px-4 py-2.5 border-b border-white/[0.05] text-[10px] font-bold text-dim uppercase tracking-[0.15em] shrink-0">
          <div className="text-center">#</div>
          <div>Title</div>
          <div className="text-right">
            <Clock className="w-3 h-3 inline-block opacity-60" />
          </div>
        </div>

        <div className="space-y-0.5">
          {results.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <ProtectedAction action={() => playSong(song)}>
              <div
                key={song.id}
                className="grid grid-cols-[28px_1fr_48px] items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group hover:bg-white/[0.03] active:bg-white/[0.05]"
              >
                {/* Index / Play indicator */}
                <div className="flex items-center justify-center h-full">
                  <span
                    className={`text-xs font-medium tabular-nums group-hover:hidden ${
                      isCurrent ? "text-title" : "text-muted"
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end gap-[2px] h-3">
                        <span className="w-[2px] bg-white/70 rounded-full animate-music-bar-1" />
                        <span className="w-[2px] bg-white/50 rounded-full animate-music-bar-2" />
                        <span className="w-[2px] bg-white/60 rounded-full animate-music-bar-3" />
                      </div>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="hidden group-hover:block">
                    {isCurrent && isPlaying ? (
                      <Pause className="w-3 h-3 fill-current text-title" />
                    ) : (
                      <Play className="w-3 h-3 fill-current text-title ml-0.5" />
                    )}
                  </span>
                </div>

                {/* Song info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/[0.06] shrink-0 bg-card-hover shadow-sm">
                    <SongArtwork
                      song={song}
                      className="w-full h-full object-cover"
                      iconSize="w-3.5 h-3.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm font-medium block truncate leading-tight transition-colors ${
                        isCurrent
                          ? "text-title"
                          : "text-title group-hover:text-title/90"
                      } ${song.teluguTitle ? "font-telugu" : ""}`}
                    >
                      {song.teluguTitle || song.title}
                    </span>
                    <span className="text-xs text-muted block truncate mt-0.5 leading-tight">
                      {song.artist}
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <div className="text-right text-xs text-dim tabular-nums font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                  {song.duration}
                </div>
              </div>
              </ProtectedAction>
            );
          })}
        </div>
      </div>
    </div>
  );
}
