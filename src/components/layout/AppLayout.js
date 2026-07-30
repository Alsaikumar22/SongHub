"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAudio } from "@/context/audio-context";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import MobileNav from "./MobileNav";
import PlayerBar from "@/components/player-bar";
import AuthModal from "@/components/auth/AuthModal";
import TalkToUsDrawer from "./TalkToUsDrawer";
import { useAuth } from "@/context/auth-context";
import SongArtwork from "@/components/ui/SongArtwork";
import {
  Music,
  PlayCircle,
  LayoutGrid,
  Plus,
  ListMusic,
  SquareChevronLeft,
  SquareChevronRight,
  X,
  Library,
  Heart,
  Info,
  Trash2,
  MessageSquare,
  MessageCircle,
  Shield,
  Sparkles,
  HelpCircle,
  ChevronDown
} from "lucide-react";

export default function AppLayout({ children }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    favorites,
    playlists,
    createPlaylist,
    deletePlaylist,
    toggleFavorite,
    activeTab,
    setActiveTab,
    activePlaylistId,
    setActivePlaylistId,
    setViewedSongId,
    setShowFullHome
  } = useAudio();

  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, setReturnPath, returnPath } = useAuth();

  // After auth resolves (splash screen no longer showing), redirect to stored returnPath
  useEffect(() => {
    if (!authLoading && isAuthenticated && returnPath) {
      const path = returnPath;
      setReturnPath(null);
      router.push(path);
    }
  }, [authLoading, isAuthenticated, returnPath, router, setReturnPath]);

  // Detect ?auth= URL param (from shared song links) and open auth modal
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    if (authParam && !isAuthenticated) {
      setAuthMode(authParam); // "login" or "signup"
      setShowAuth(true);
      // Store redirect path if present
      const redirectParam = params.get("redirect");
      if (redirectParam) {
        setReturnPath(decodeURIComponent(redirectParam));
      }
      // Clean URL without triggering a re-render loop
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [pathname]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [showTalkToUs, setShowTalkToUs] = useState(false);
  const [talkToUsTab, setTalkToUsTab] = useState("request");
  const [talkToUsCategory, setTalkToUsCategory] = useState("Contact Us");
  const [queriesExpanded, setQueriesExpanded] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowCreateModal(false);
    }
  };

  const isDiscover = pathname === "/";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" || e.key === " ") {
        // Skip hotkey when typing in input, textarea, select, button, or contenteditable
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.tagName === "SELECT" ||
            active.tagName === "BUTTON" ||
            active.isContentEditable)
        ) {
          return;
        }

        // Prevent default spacebar scroll behavior
        e.preventDefault();

        // Toggle playback status
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay]);

  // ─── SPLASH SCREEN: shown while Firebase auth state is loading ───
  if (authLoading) {
    return (
      <div className="h-screen h-dvh flex flex-col bg-canvas text-copy font-sans items-center justify-center">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          {/* Logo */}
          <img
            src="/youlogo.png"
            alt="YouWorship"
            className="w-20 h-20 object-contain"
          />
          {/* App Name */}
          <h1 className="text-2xl font-black text-title tracking-tight">
            YouWorship
          </h1>
          {/* Loading Spinner */}
          <div className="w-6 h-6 border-2 border-[#D4A32A]/30 border-t-[#D4A32A] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ─── AUTH GATE: for non-authenticated users, show content but block interaction ───
  // The home page content is fully visible. An invisible overlay catches all clicks
  // and triggers the auth modal. This prevents ProtectedAction double-modals and
  // gives the user a clean "browse first, then authenticate" experience.

  return (
    <div className="h-screen h-dvh flex flex-col bg-canvas text-copy font-sans">
      <Header
        setShowAuth={setShowAuth}
        setAuthMode={setAuthMode}
      />
      <div
        className="flex flex-1 min-h-0 min-w-0 lg:p-2 p-0 lg:gap-2 gap-0"
        onClickCapture={!isAuthenticated && !showAuth ? (e) => {
          // Sidebar clicks: allow navigation to work (no stopPropagation)
          // Content clicks: stop propagation to prevent ProtectedAction double-modals
          const flexContainer = e.currentTarget;
          const sidebar = flexContainer?.querySelector('aside');
          if (sidebar?.contains(e.target)) {
            // Sidebar navigation — show auth but let event propagate
            setAuthMode("signup");
            setShowAuth(true);
            return;
          }
          e.stopPropagation();
          setAuthMode("signup");
          setShowAuth(true);
        } : undefined}
      >
        {/* SIDEBAR — production-grade navigation */}
        <aside
          className={`${sidebarCollapsed ? "w-20" : "w-72"} bg-card rounded-xl hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
        >
          {/* ─── Main Navigation ─── */}
          <div className="px-3 pt-3 pb-2 space-y-0.5">
            <SidebarNavItem
              icon={<Music className="w-5 h-5" />}
              label="Songs"
              collapsed={sidebarCollapsed}
              active={isDiscover && activeTab === "discover"}
              onClick={() => {
                setActiveTab("discover");
                setActivePlaylistId(null);
                setViewedSongId(null);
                setShowFullHome(false);
                router.push("/?tab=discover");
              }}
            />
            <SidebarNavItem
              icon={<PlayCircle className="w-5 h-5" />}
              label="Now Playing"
              collapsed={sidebarCollapsed}
              active={false}
              onClick={() => {
                if (currentSong) {
                  router.push(`/song/${encodeURIComponent(currentSong.slug || currentSong.id)}?view=lyrics`);
                } else {
                  setActivePlaylistId(null);
                  setViewedSongId(null);
                  router.push("/");
                }
              }}
            />
            <SidebarNavItem
              icon={<LayoutGrid className="w-5 h-5" />}
              label="Categories"
              collapsed={sidebarCollapsed}
              active={isDiscover && activeTab === "categories"}
              onClick={() => {
                setActivePlaylistId(null);
                setViewedSongId(null);
                router.push("/?tab=categories");
              }}
            />
          </div>

          {/* ─── Divider ─── */}
          <div className="mx-3 border-t border-line/10" />

          {/* ─── Your Library Section ─── */}
          <div className="flex-1 flex flex-col overflow-hidden px-3 pt-2 pb-1">
            {/* Library Header */}
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center px-3" : "justify-between px-1"} py-2`}>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold text-dim uppercase tracking-wider">
                  Your Library
                </span>
              )}
              {sidebarCollapsed ? (
                <Library className="w-5 h-5 text-dim" />
              ) : (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 hover:bg-card-hover rounded-md text-dim hover:text-copy transition-colors cursor-pointer"
                  title="New Playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Collection (Favorites) */}
            {!sidebarCollapsed && (
              <div className="px-1 mb-1">
                <div className="group relative">
                  <button
                    onClick={() => {
                      setActivePlaylistId(null);
                      setViewedSongId(null);
                      router.push("/?tab=favorites");
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left cursor-pointer ${
                      isDiscover && activeTab === "favorites" ? "bg-card-hover" : "hover:bg-card-hover"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-300 flex items-center justify-center shrink-0 shadow-sm">
                      <Heart className="w-4.5 h-4.5 text-title fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-copy block truncate">Collection</span>
                      <span className="text-xs text-muted block truncate">{favorites.length} songs</span>
                    </div>
                  </button>
                  {favorites.length > 0 && (
                    <button
                      onClick={() => favorites.forEach(id => toggleFavorite(id))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted hover:text-red-400 hover:bg-card-hover opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Clear all favorites"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Playlists label */}
            {!sidebarCollapsed && (
              <div className="px-1 pt-2 pb-1">
                <span className="text-[10px] font-bold text-dim uppercase tracking-wider">
                  Playlists
                </span>
              </div>
            )}

            {/* Playlist items */}
            <div className={`flex-1 ${sidebarCollapsed ? "" : "overflow-y-auto"} space-y-0.5 px-1 py-0.5`}>
              {playlists.length === 0 && !sidebarCollapsed && (
                <div className="px-2 py-6 text-center">
                  <p className="text-xs text-muted">No playlists yet</p>
                </div>
              )}
              {playlists.map((list) => (
                <div key={list.id} className="group relative">
                  <LibraryItem
                    icon={
                      <div className="w-9 h-9 rounded-lg bg-card-hover flex items-center justify-center shrink-0 shadow-sm text-dim">
                        <ListMusic className="w-4.5 h-4.5" />
                      </div>
                    }
                    title={list.name}
                    subtitle={`${list.songIds.length} songs`}
                    collapsed={sidebarCollapsed}
                    active={isDiscover && activeTab === "playlist" && activePlaylistId === list.id}
                    onClick={() => {
                      setActiveTab("playlist");
                      setActivePlaylistId(list.id);
                      setViewedSongId(null);
                      router.push(`/?tab=playlist&playlistId=${list.id}`);
                    }}
                  />
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => deletePlaylist(list.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted hover:text-red-400 hover:bg-card-hover opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title={`Delete ${list.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Divider ─── */}
          <div className="mx-3 border-t border-line/10" />

          {/* ─── Queries Dropdown Section ─── */}
          <div className="px-3 pt-1.5 pb-2 space-y-0.5">
            <button
              onClick={() => {
                if (sidebarCollapsed) {
                  setSidebarCollapsed(false);
                  setQueriesExpanded(true);
                } else {
                  setQueriesExpanded((v) => !v);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                queriesExpanded && !sidebarCollapsed
                  ? "text-copy bg-card-hover/40"
                  : "text-muted hover:text-copy hover:bg-card-hover/20"
              }`}
              title="Queries & Support"
            >
              <div className="flex items-center gap-4">
                <HelpCircle className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>Queries</span>}
              </div>
              {!sidebarCollapsed && (
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${
                    queriesExpanded ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Dropdown Options */}
            {queriesExpanded && !sidebarCollapsed && (
              <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-line/25 ml-5.5 animate-in slide-in-from-top-2 duration-150">
                <SidebarNavItem
                  icon={<Shield className="w-4 h-4 text-indigo-400 shrink-0" />}
                  label="Account & Login Issues"
                  collapsed={false}
                  active={showTalkToUs && talkToUsTab === "feedback" && talkToUsCategory === "Account & Login"}
                  onClick={() => {
                    setTalkToUsTab("feedback");
                    setTalkToUsCategory("Account & Login");
                    setShowTalkToUs(true);
                  }}
                  isSubItem={true}
                />
                <SidebarNavItem
                  icon={<Sparkles className="w-4 h-4 text-[#D4A32A] shrink-0" />}
                  label="Feature Requests"
                  collapsed={false}
                  active={showTalkToUs && talkToUsTab === "feedback" && talkToUsCategory === "Feature Request"}
                  onClick={() => {
                    setTalkToUsTab("feedback");
                    setTalkToUsCategory("Feature Request");
                    setShowTalkToUs(true);
                  }}
                  isSubItem={true}
                />
                <SidebarNavItem
                  icon={<MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />}
                  label="Contact Us"
                  collapsed={false}
                  active={showTalkToUs && talkToUsTab === "feedback" && talkToUsCategory === "Contact Us"}
                  onClick={() => {
                    setTalkToUsTab("feedback");
                    setTalkToUsCategory("Contact Us");
                    setShowTalkToUs(true);
                  }}
                  isSubItem={true}
                />
              </div>
            )}

            <SidebarNavItem
              icon={<Info className="w-5 h-5 text-sky-400" />}
              label="About"
              collapsed={sidebarCollapsed}
              active={showAboutModal}
              onClick={() => setShowAboutModal(true)}
            />
          </div>

          {/* ─── Bottom Collapse Toggle ─── */}
          <div className={`px-3 pb-3 pt-1 ${sidebarCollapsed ? "flex justify-center" : "flex justify-end"}`}>
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="p-1.5 hover:bg-card-hover rounded-full text-dim hover:text-copy transition-colors cursor-pointer"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <SquareChevronLeft
                className={`w-5 h-5 transition-transform duration-300 ${
                  sidebarCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main 
          className="flex-1 flex flex-col min-w-0 bg-card lg:rounded-xl lg:border lg:border-line/30 overflow-hidden relative pb-[116px] lg:pb-0"
        >
          {children}
        </main>

        {/* RIGHT PANEL — Now Playing & Up Next (collapsible) */}
        <aside
          className={`${
            currentSong ? "hidden lg:flex" : "hidden"
          } flex-col shrink-0 bg-card rounded-xl border border-line/30 overflow-hidden transition-all duration-300 ease-in-out ${
            rightPanelCollapsed ? "w-12" : "w-80"
          }`}
        >
          {currentSong && rightPanelCollapsed ? (
            /* Collapsed: thin strip with expand button */
            <div className="flex flex-col items-center pt-3 h-full">
              <button
                onClick={() => setRightPanelCollapsed(false)}
                className="p-1.5 hover:bg-card-hover rounded-full text-dim hover:text-copy transition-colors cursor-pointer"
                title="Expand now playing"
              >
                <SquareChevronLeft className="w-5 h-5 rotate-180" />
              </button>
              {/* Mini album art indicator */}
              <div className="mt-4 w-8 h-8 rounded-md overflow-hidden border border-line opacity-60">
                <SongArtwork
                  song={currentSong}
                  className="w-full h-full object-cover"
                  iconSize="w-3 h-3"
                />
              </div>
            </div>
          ) : currentSong ? (
            /* Expanded: full content - entire right panel scrolls */
            <div className="flex flex-col h-full p-5 space-y-5 overflow-y-auto">
              {/* Header with collapse button - sticky so collapse button stays accessible */}
              <div className="flex items-center justify-between sticky top-0 bg-card z-10 py-1 -mt-1">
                <h3 className="text-[10px] font-bold text-dim uppercase tracking-wider">
                  Now Playing
                </h3>
                <button
                  onClick={() => setRightPanelCollapsed(true)}
                  className="p-1.5 hover:bg-card-hover rounded-full text-dim hover:text-copy transition-colors cursor-pointer"
                  title="Collapse panel"
                >
                  <SquareChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 shrink-0">
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-card-hover border border-line">
                  <SongArtwork
                    song={currentSong}
                    className="w-full h-full object-cover"
                    iconSize="w-10 h-10"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-sm text-title block truncate">
                    {currentSong.title}
                  </span>
                  <span className="text-xs text-muted block truncate">
                    {currentSong.artist}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-dim uppercase tracking-wider">
                    Up Next ({songs.filter((s) => s.id !== currentSong?.id).length})
                  </h3>
                </div>
                <div className="space-y-1.5 pr-1">
                  {songs
                    .filter((s) => s.id !== currentSong?.id)
                    .map((song) => (
                      <button
                        key={song.id}
                        onClick={() => playSong(song)}
                        className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-card-hover transition-colors text-left cursor-pointer group"
                      >
                        <SongArtwork
                          song={song}
                          className="w-8 h-8 object-cover rounded border border-line shrink-0"
                          iconSize="w-3 h-3"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium text-copy group-hover:text-title block truncate">
                            {song.teluguTitle || song.title}
                          </span>
                          <span className="text-[10px] text-dim block truncate">
                            {song.titleEnglish}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {/* PERSISTENT AUDIO PLAYER */}
      <Suspense fallback={null}>
        <PlayerBar />
      </Suspense>

      {/* MOBILE BOTTOM NAV — fixed at bottom on mobile, hidden on md+ */}
      <MobileNav
        isAuthenticated={isAuthenticated}
        setShowAuth={setShowAuth}
        setAuthMode={setAuthMode}
        setShowTalkToUs={setShowTalkToUs}
        setShowAboutModal={setShowAboutModal}
      />

      {/* CREATE PLAYLIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-line rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line-muted">
              <span className="font-semibold text-title text-sm">
                Create New Playlist
              </span>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-card-hover rounded-full text-dim hover:text-handle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-dim uppercase tracking-wider block mb-1">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Focus Session, Pop Vibes"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-dim/30 focus:border-dim text-copy bg-card-hover"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-line rounded-lg text-xs font-semibold text-muted hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-card text-title rounded-lg text-xs font-semibold hover:bg-card-hover active:scale-98 transition-all shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTH MODAL — rendered as overlay on top of page content when triggered */}
      {showAuth && !isAuthenticated && (
        <AuthModal
          initialStep={authMode}
          closable={true}
          onClose={() => {
            setShowAuth(false);
            setReturnPath(null);
          }}
          onSuccess={() => {
            setShowAuth(false);
            // After auth success, redirect to stored return path if set
            if (returnPath) {
              setTimeout(() => {
                router.push(returnPath);
                setReturnPath(null);
              }, 100);
            }
          }}
        />
      )}

      {/* ABOUT MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-line rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line-muted">
              <span className="font-semibold text-title text-sm">
                About
              </span>
              <button
                onClick={() => setShowAboutModal(false)}
                className="p-1 hover:bg-card-hover rounded-full text-dim hover:text-handle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 pb-3 border-b border-line">
                <img
                  src="/youlogo.png"
                  alt="You Worship"
                  className="w-14 h-14 object-contain"
                />
                <div>
                  <h2 className="text-lg font-bold text-title">You Worship</h2>
                  <p className="text-xs text-muted">🎸Anywhere🎸</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted leading-relaxed">
                  A worship song collection app designed to help you explore, search, and
                  immerse yourself in devotional music. Featuring a curated library of songs
                  with lyrics in Telugu and English, video playback, and personalized playlists.
                </p>
              </div>

              <div className="bg-card-hover rounded-lg p-3 border border-line space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Song Collection</span>
                  <span className="text-title font-semibold">{songs.length} tracks</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Categories</span>
                  <span className="text-title font-semibold">Multiple genres</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Languages</span>
                  <span className="text-title font-semibold">Telugu, English</span>
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <button
                  onClick={() => setShowAboutModal(false)}
                  className="px-6 py-2 bg-card-hover border border-line rounded-lg text-xs font-semibold text-copy hover:bg-line transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating "Talk to us" circular button — hidden on mobile */}
      <button
        onClick={() => setShowTalkToUs(true)}
        className="hidden lg:flex fixed right-4 lg:right-6 bottom-32 lg:bottom-24 z-40 w-12.5 h-12.5 lg:w-14 lg:h-14 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-black shadow-[0_8px_32px_rgba(212,163,42,0.35)] rounded-full items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_rgba(212,163,42,0.5)] active:scale-95 shrink-0 select-none animate-in fade-in slide-in-from-right-4 duration-300 group border border-white/20"
        title="Talk to us"
        aria-label="Open Talk to us drawer"
      >
        <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 text-black fill-black/15 transition-transform duration-300 group-hover:rotate-12" />
        {/* Tooltip on hover */}
        <span className="absolute right-full mr-3 px-2.5 py-1.5 bg-card/95 backdrop-blur-md text-title text-xs font-bold rounded-lg shadow-xl border border-line opacity-0 scale-95 origin-right group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
          Talk to us
        </span>
      </button>

      {/* TALK TO US DRAWER */}
      <TalkToUsDrawer
        isOpen={showTalkToUs}
        onClose={() => setShowTalkToUs(false)}
        initialTab={talkToUsTab}
        initialCategory={talkToUsCategory}
      />
    </div>
  );
}

function SidebarNavItem({ icon, label, collapsed, active, onClick, isSubItem = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} ${
        isSubItem ? "px-2 py-2 text-xs" : "px-3 py-3 text-sm"
      } rounded-lg font-semibold transition-all group relative cursor-pointer ${
        active
          ? "text-copy bg-card-hover/20"
          : "text-muted hover:text-copy hover:bg-card-hover/10"
      }`}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && (
        <span className={`truncate ${active ? "text-title" : "text-muted group-hover:text-title"}`}>
          {label}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-card text-title text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-xl border border-line">
          {label}
        </div>
      )}
    </button>
  );
}

function LibraryItem({ icon, title, subtitle, collapsed, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-md transition-all text-left group relative cursor-pointer ${
        active ? "bg-card-hover" : "hover:bg-card-hover"
      }`}
      title={collapsed ? title : undefined}
    >
      {icon}
      {!collapsed && (
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <span className={`text-sm font-medium truncate ${active ? "text-title" : "text-copy"}`}>
            {title}
          </span>
          <span className="text-[11px] text-muted truncate">
            {subtitle}
          </span>
        </div>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-card text-title text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-xl border border-line">
          <div className="font-medium">{title}</div>
          <div className="text-[10px] text-muted">{subtitle}</div>
        </div>
      )}
    </button>
  );
}
