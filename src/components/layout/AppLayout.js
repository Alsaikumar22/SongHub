"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAudio } from "@/context/audio-context";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import MobileNav from "./MobileNav";
import PlayerBar from "@/components/player-bar";
import SongArtwork from "@/components/ui/SongArtwork";
import {
  Compass,
  Plus,
  ListMusic,
  SquareChevronLeft,
  SquareChevronRight,
  X,
  Library,
  Search,
  Heart,
  Trash2
} from "lucide-react";

export default function AppLayout({ children }) {
  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    favorites,
    playlists,
    createPlaylist,
    deletePlaylist,
    toggleFavorite,
    activeTab,
    setActiveTab,
    activePlaylistId,
    setActivePlaylistId,
    setViewedSongId
  } = useAudio();

  const pathname = usePathname();
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowCreateModal(false);
    }
  };

  const isDiscover = pathname === "/";

  return (
    <div className="h-screen h-dvh flex flex-col bg-canvas text-copy font-sans">
      <Header />
      <div className="flex flex-1 min-h-0 min-w-0 lg:p-2 p-0 lg:gap-2 gap-0">
        {/* SIDEBAR — with clean unified structure */}
        <aside
          className={`${sidebarCollapsed ? "w-20" : "w-72"} bg-card rounded-xl hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
        >
          {/* ─── Top Nav ─── */}
          <div className="px-3 pt-3 pb-2 space-y-0.5">
            <SidebarNavItem
              icon={<Compass className="w-5 h-5" />}
              label="Browse"
              collapsed={sidebarCollapsed}
              active={isDiscover && (activeTab === "discover" || activeTab === "categories")}
              onClick={() => {
                setActiveTab("discover");
                setActivePlaylistId(null);
                setViewedSongId(null);
                router.push("/");
              }}
            />
          </div>

          {/* ─── Divider ─── */}
          <div className="mx-3 border-t border-line/10" />

          {/* ─── Collection Section ─── */}
          <div className="flex-1 flex flex-col overflow-hidden px-3 pt-2 pb-1">
            {/* Collection Header */}
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center px-3" : "justify-between px-1"} py-2`}>
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold text-dim uppercase tracking-wider">
                  Collection
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

            {/* Favorites */}
            {!sidebarCollapsed && (
              <div className="px-1 mb-1">
                <div className="group relative">
                  <button
                    onClick={() => {
                      setActiveTab("favorites");
                      setActivePlaylistId(null);
                      setViewedSongId(null);
                      router.push("/");
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left cursor-pointer ${
                      isDiscover && activeTab === "favorites" ? "bg-card-hover" : "hover:bg-card-hover"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-300 flex items-center justify-center shrink-0 shadow-sm">
                      <Heart className="w-4.5 h-4.5 text-title fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-copy block truncate">Favorites</span>
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
                      router.push("/");
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
        {/* pb-[116px] on mobile reserves space for fixed PlayerBar (~56px) + MobileNav (~60px) */}
        <main className="flex-1 flex flex-col min-w-0 bg-card lg:rounded-xl lg:border lg:border-line/30 overflow-hidden relative pb-[116px] lg:pb-0">
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
                            {song.title}
                          </span>
                          <span className="text-[10px] text-dim block truncate">
                            {song.artist}
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
      <MobileNav />

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
    </div>
  );
}

function SidebarNavItem({ icon, label, collapsed, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-4"} px-3 py-3 rounded-lg text-sm font-semibold transition-all group relative cursor-pointer ${
        active
          ? "text-copy"
          : "text-muted hover:text-copy"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className="shrink-0 group-hover:scale-105 transition-transform">{icon}</span>
      {!collapsed && (
        <span className="truncate flex-1 text-left">{label}</span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-card text-title text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-xl border border-line">
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
