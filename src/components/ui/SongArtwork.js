"use client";

import React, { useState } from "react";
import { Music } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

const gradients = [
  "from-amber-800 to-amber-950",
  "from-emerald-800 to-emerald-950",
  "from-sky-800 to-sky-950",
  "from-rose-800 to-rose-950",
  "from-violet-800 to-violet-950",
  "from-teal-800 to-teal-950",
  "from-orange-800 to-orange-950",
  "from-cyan-800 to-cyan-950",
  "from-pink-800 to-pink-950",
  "from-indigo-800 to-indigo-950",
];

function getGradient(id) {
  const num = parseInt(id, 10) || (id ? id.charCodeAt(0) : 0);
  return gradients[num % gradients.length];
}

export default function SongArtwork({ song, className = "w-full h-full object-cover", iconSize = "w-6 h-6" }) {
  const [hasError, setHasError] = useState(false);

  const gradient = getGradient(song.id);

  if (hasError || !song.coverUrl) {
    return (
      <div className={`bg-gradient-to-br ${gradient} flex items-center justify-center ${className}`}>
        <Music className={`text-white/20 ${iconSize}`} />
      </div>
    );
  }

  return (
    <ImageWithFallback
      src={song.coverUrl}
      alt={song.teluguTitle || song.title}
      width={160}
      height={160}
      className={className}
      sizes="(max-width: 768px) 100vw, 160px"
    />
  );
}
