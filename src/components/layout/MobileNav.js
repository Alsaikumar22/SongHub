"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Compass,
  Search,
  Heart,
  ListMusic,
  Ellipsis,
} from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useSearch } from "@/context/search-context";
import MobileMoreSheet from "./MobileMoreSheet";

export default function MobileNav({ setShowTalkToUs, setShowAboutModal }) {
  const {
    activeTab,
    setActiveTab,
    activePlaylistId,
    setActivePlaylistId,
    setViewedSongId,
    setShowFullHome,
  } = useAudio();

  const { setShowFullResults } = useSearch();
  const router = useRouter();
  const pathname = usePathname();
  const [showMoreSheet, setShowMoreSheet] = useState(false);

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
        setShowFullHome(true);
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
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-line z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {/* ─── Tab Buttons (including Profile / Sign In) ─── */}
        <div className="flex items-center justify-around px-2 pt-1 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]">
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

          {/* ─── More Tab ─── */}
          <button
            onClick={() => setShowMoreSheet(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer text-dim hover:text-copy"
            title="More"
          >
            <Ellipsis className="w-5 h-5" />
            <span className="text-[9px] font-semibold tracking-tight opacity-70">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ─── More Bottom Sheet ─── */}
      <MobileMoreSheet
        isOpen={showMoreSheet}
        onClose={() => setShowMoreSheet(false)}
        onOpenTalkToUs={() => setShowTalkToUs?.(true)}
        onOpenAbout={() => setShowAboutModal?.(true)}
      />
    </>
  );
}
