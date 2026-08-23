"use client";

import React, { Suspense } from "react";
import { useAudio } from "@/context/audio-context";
import { useSongs } from "@/hooks/useSongs";
import SongGrid from "@/components/SongGrid";
import { SongsSectionSkeleton } from "@/components/ui/SongSkeleton";
import { Music } from "lucide-react";

function SongsPageContent() {
  const { playSong } = useAudio();
  const {
    songs,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useSongs();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center shadow-lg">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-title tracking-tight">
              All Songs
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Browse the complete collection with infinite scroll
            </p>
          </div>
        </div>
      </div>

      {/* Song Grid with Infinite Scroll */}
      <SongGrid
        songs={songs}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onPlaySong={playSong}
        onRetry={refetch}
      />
    </div>
  );
}

export default function SongsPage() {
  return (
    <Suspense fallback={<SongsSectionSkeleton />}>
      <SongsPageContent />
    </Suspense>
  );
}
