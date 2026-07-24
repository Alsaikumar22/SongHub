"use client";

import React from "react";
import SongCard from "./SongCard";
import { SongsSectionSkeleton } from "./ui/SongSkeleton";

/**
 * Reusable SongGrid component handling loading, empty, error, and list states.
 */
export default function SongGrid({
  songs = [],
  loading = false,
  error = null,
  onPlaySong,
  onRetry
}) {
  if (loading) {
    return <SongsSectionSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to Load Songs"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <EmptyState
        title="No Songs Available"
        message="No documents were found in the Youworship_songs collection."
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} onPlay={onPlaySong} />
      ))}
    </div>
  );
}
