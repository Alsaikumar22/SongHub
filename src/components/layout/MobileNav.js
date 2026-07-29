"use client";

import React, { useState } from "react";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Compass,
  Search,
  Heart,
  ListMusic,
  LogIn,
  User,
  X,
} from "lucide-react";
import {
  Compass,
  Search,
  Heart,
  ListMusic,
  Ellipsis,
} from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useSearch } from "@/context/search-context";
import { useAuth } from "@/context/auth-context";
import LogoutConfirm from "@/components/auth/LogoutConfirm";
import MobileMoreSheet from "./MobileMoreSheet";

export default function MobileNav({ setShowAuth }) {
export default function MobileNav({ setShowTalkToUs, setShowAboutModal }) {
  const {
    activeTab,
    setActiveTab,
    activePlaylistId,
    setActivePlaylistId,
    setViewedSongId,
    setShowFullHome,
    setShowFullHome,
  } = useAudio();

  const { setShowFullResults } = useSearch();
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const isOnSongPage = pathname?.startsWith("/song/");

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      setShowLogoutModal(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

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

          {/* ─── Profile / Sign In Tab ─── */}
          {!loading && (
            <>
              {isAuthenticated && user ? (
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer text-title"
                  title={user.displayName || "User"}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-line flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 text-muted" />
                    </div>
                  )}
                  <span className="text-[9px] font-semibold tracking-tight text-copy truncate max-w-[64px]">
                    {user.displayName || "User"}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer text-dim hover:text-copy"
                  title="Sign In"
                >
                  <LogIn className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
      </nav>

      {/* ─── Logout Confirmation Dialog ─── */}
      {showLogoutModal && (
        <div className="lg:hidden fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !loggingOut && setShowLogoutModal(false)}
          />
          {/* Dialog */}
          <div className="relative bg-card border border-line rounded-2xl shadow-xl w-full max-w-xs overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <h3 className="text-base font-bold text-title">Logout</h3>
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="p-1.5 rounded-full text-dim hover:text-copy hover:bg-card-hover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="px-5 pb-6">
              <p className="text-sm text-muted leading-relaxed">
                Are you sure you want to logout?
              </p>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 px-5 pb-5">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl border border-line text-sm font-semibold text-copy hover:bg-card-hover transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loggingOut ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <span>Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
