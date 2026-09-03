"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Folder,
  Music2,
  Search,
  Heart,
  Ellipsis,
} from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useSearch } from "@/context/search-context";
import { useWelcomeModal } from "@/context/welcome-modal-context";
import MobileMoreSheet from "./MobileMoreSheet";

export default function MobileNav({ isAuthenticated, setShowAuth, setAuthMode, setShowTalkToUs, setShowAboutModal }) {
  const {
    activeTab,
    setActiveTab,
    setActivePlaylistId,
    setViewedSongId,
    showFullHome,
    setShowFullHome,
  } = useAudio();

  const { setSearchQuery, setShowFullResults } = useSearch();
  const router = useRouter();
  const pathname = usePathname();
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const isOnSongPage = pathname?.startsWith("/song/");

  const { requireAuth: triggerWelcomeNudge } = useWelcomeModal();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const scrollContainers = document.querySelectorAll(
        ".overflow-y-auto, [class*='overflow-y-auto']",
      );
      scrollContainers.forEach((el) => {
        el.scrollTop = 0;
      });
      const mainEl = document.querySelector("main");
      if (mainEl) {
        mainEl.scrollTo(0, 0);
      }
    }
  };

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="w-5 h-5" />,
      onClick: () => {
        scrollToTop();
        setSearchQuery("");
        setShowFullResults(false);
        setActiveTab("discover");
        setActivePlaylistId(null);
        setViewedSongId(null);
        setShowFullHome(true);
        router.push("/home?tab=discover");
      },
    },
    {
      id: "categories",
      label: "Categories",
      icon: <Folder className="w-5 h-5" />,
      onClick: () => {
        scrollToTop();
        setSearchQuery("");
        setShowFullResults(false);
        setActiveTab("categories");
        setActivePlaylistId(null);
        setViewedSongId(null);
        router.push("/home?tab=categories");
      },
    },
    {
      id: "songs",
      label: "Songs",
      icon: <Music2 className="w-5 h-5" />,
      onClick: () => {
        scrollToTop();
        setSearchQuery("");
        setShowFullResults(false);
        setActiveTab("discover");
        setActivePlaylistId(null);
        setViewedSongId(null);
        setShowFullHome(false);
        router.push("/home?tab=songs");
      },
    },
    {
      id: "search",
      label: "Search",
      icon: <Search className="w-5 h-5" />,
      onClick: () => {
        scrollToTop();
        setActiveTab("search");
        setActivePlaylistId(null);
        setViewedSongId(null);
        router.push("/home?tab=search");
      },
    },
    {
      id: "favorites",
      label: "Likes",
      icon: <Heart className="w-5 h-5" />,
      onClick: () => triggerWelcomeNudge(() => {
        scrollToTop();
        setSearchQuery("");
        setShowFullResults(false);
        setActiveTab("favorites");
        setActivePlaylistId(null);
        setViewedSongId(null);
        router.push("/home?tab=favorites");
      }),
    },
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-line z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {/* ─── Tab Buttons ─── */}
        <div className="flex items-center justify-around px-2 pt-0 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]">
          {tabs.map((tab) => {
            const isActive = !isOnSongPage && (
              activeTab === tab.id ||
              (tab.id === "home" && activeTab === "discover" && showFullHome) ||
              (tab.id === "songs" && activeTab === "discover" && !showFullHome)
            );
            return (
              <button
                key={tab.id}
                id={
                  tab.id === "home"
                    ? "tour-mobile-home"
                    : tab.id === "categories"
                    ? "tour-mobile-categories"
                    : tab.id === "songs"
                    ? "tour-mobile-songs"
                    : tab.id === "search"
                    ? "tour-mobile-search"
                    : tab.id === "favorites"
                    ? "tour-mobile-favorites"
                    : undefined
                }
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
