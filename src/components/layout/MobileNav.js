"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Compass, Search, Heart, ListMusic } from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useSearch } from "@/context/search-context";

export default function MobileNav() {
  const {
    activeTab,
    setActiveTab,
    activePlaylistId,
    setActivePlaylistId,
    setViewedSongId,
  } = useAudio();

  const { setShowFullResults } = useSearch();
  const router = useRouter();
  const pathname = usePathname();

  const isOnSongPage = pathname?.startsWith("/song/");

  const tabs = [
    {
      id: "discover",
      label: "Browse",
      icon: <Compass className="w-5 h-5" />,
      onClick: () => {
        setActiveTab("discover");
        setActivePlaylistId(null);
        setViewedSongId(null);
        setShowFullResults(false);
        if (isOnSongPage) router.push("/");
      },
    },
    {
      id: "search",
      label: "Search",
      icon: <Search className="w-5 h-5" />,
      onClick: () => {
        setActiveTab("search");
        setActivePlaylistId(null);
        setViewedSongId(null);
        setShowFullResults(false);
        if (isOnSongPage) router.push("/");
      },
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart className="w-5 h-5" />,
      onClick: () => {
        setActiveTab("favorites");
        setActivePlaylistId(null);
        setViewedSongId(null);
        if (isOnSongPage) router.push("/");
      },
    },
    {
      id: "playlist",
      label: "Playlists",
      icon: <ListMusic className="w-5 h-5" />,
      onClick: () => {
        setActiveTab("playlist");
        setActivePlaylistId(null);
        setViewedSongId(null);
        if (isOnSongPage) router.push("/");
      },
    },
  ];

  return (
    <nav className="md:hidden flex items-center justify-around bg-canvas/95 backdrop-blur-md border-t border-line-muted px-2 py-1.5 shrink-0 z-40">
      {tabs.map((tab) => {
        const isActive = !isOnSongPage && activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={tab.onClick}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? "text-title"
                : "text-dim hover:text-copy"
            }`}
          >
            <span className={isActive ? "scale-105" : ""}>{tab.icon}</span>
            <span className={`text-[9px] font-semibold tracking-tight ${
              isActive ? "opacity-100" : "opacity-70"
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
