"use client";

import React from "react";
import { Music } from "lucide-react";

/**
 * Reusable Loading Spinner & Skeleton UI component
 */
export default function Loading({ message = "Loading songs..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-center w-full">
      <div className="w-12 h-12 rounded-2xl bg-card-hover border border-line flex items-center justify-center mb-4 shadow-md animate-pulse">
        <Music className="w-6 h-6 text-white animate-spin" />
      </div>
      <p className="text-sm font-semibold text-title tracking-tight">{message}</p>
      <p className="text-xs text-muted mt-1">Connecting to Firestore...</p>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full mt-8 max-w-5xl">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="h-44 rounded-xl bg-card-hover/40 border border-line/30 animate-pulse p-3 flex flex-col justify-between"
          >
            <div className="w-full h-24 rounded-lg bg-white/5" />
            <div className="space-y-2">
              <div className="w-3/4 h-3 rounded bg-white/10" />
              <div className="w-1/2 h-2.5 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
