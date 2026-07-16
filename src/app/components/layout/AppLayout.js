"use client";

import React, { useState, useEffect } from "react";
import { useAudio } from "../../context/audio-context";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import PlayerBar from "../player-bar";
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
    <div className="h-screen flex flex-col bg-canvas text-copy font-sans">
      <Header />
      <div className="flex flex-1 min-h-0 min-w-0 p-2 gap-2">
        {/* SIDEBAR — collapsible */}
        <aside
          className={`${sidebarCollapsed ? "w-20" : "w-72"} bg-card rounded-xl hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out gap-2`}
        >
          {/* Top Navigation */}
          <div className="bg-card/50 rounded-xl px-3 py-3 space-y-1">
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
              <SidebarNavItem
                icon={<Compass className="w-6 h-6" />}
                label="Browse"
                collapsed={sidebarCollapsed}
                active={isDiscover && activeTab === "discover"}
                onClick={() => {
                  setActiveTab("discover");
                  setActivePlaylistId(null);
                  setViewedSongId(null);
                  router.push("/");
                }}
              />
              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1.5 hover:bg-card-hover rounded-full text-dim hover:text-copy transition-colors cursor-pointer"
                  title="Collapse"
                >
                  <SquareChevronLeft className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Collection Section */}
          <div className="flex-1 flex flex-col bg-card/50 rounded-xl overflow-hidden">
            {/* Collection Header */}
            <div className={`px-4 py-3 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="flex items-center gap-3 text-muted hover:text-copy transition-colors group cursor-pointer"
                title={sidebarCollapsed ? "Expand Collection" : "Collapse Collection"}
              >
                {sidebarCollapsed ? (
                  <>
                    <Library className="w-6 h-6 group-hover:hidden transition-all" />
                    <SquareChevronRight className="w-6 h-6 hidden group-hover:block transition-all" />
                  </>
                ) : (
                  <Library className="w-6 h-6" />
                )}
                {!sidebarCollapsed && (
                  <span className="font-bold text-sm">Collection</span>
                )}
              </button>
              <div className="flex items-center gap-1">
                {!sidebarCollapsed && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-1.5 hover:bg-card-hover rounded-full text-dim hover:text-copy transition-colors cursor-pointer"
                    title="New Playlist"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Saved Items */}
            {!sidebarCollapsed && (
              <div className="px-2">
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
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-300 flex items-center justify-center shrink-0 shadow-md">
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-copy block truncate">Favorites</span>
                      <span className="text-xs text-muted block truncate">{favorites.length} songs</span>
                    </div>
                  </button>
                  {favorites.length > 0 && (
                    <button
                      onClick={() => {
                        favorites.forEach(id => toggleFavorite(id));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted hover:text-red-400 hover:bg-card-hover opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Clear all favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Playlists */}
            {!sidebarCollapsed && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-bold text-dim uppercase tracking-wider">Playlists</span>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
              {playlists.length === 0 && !sidebarCollapsed && (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-muted">No playlists yet</p>
                </div>
              )}
              {playlists.map((list) => (
                <div key={list.id} className="group relative">
                  <LibraryItem
                    icon={
                      <div className="w-10 h-10 rounded-lg bg-card-hover flex items-center justify-center shrink-0 shadow-sm text-dim">
                        <ListMusic className="w-5 h-5" />
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted hover:text-red-400 hover:bg-card-hover opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title={`Delete ${list.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 bg-card rounded-xl border border-line/30 overflow-hidden relative">
          {children}
        </main>

        {/* RIGHT PANEL — appears when a song is selected */}
        <aside
          className={`${
            currentSong ? "lg:flex" : "hidden"
          } flex-col w-80 shrink-0 bg-card rounded-xl border border-line/30 overflow-hidden transition-opacity duration-300`}
        >
          {currentSong && (
            <div className="flex flex-col h-full p-5 space-y-5">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-dim uppercase tracking-wider">
                  Now Playing
                </h3>
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-card-hover border border-line">
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
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

              <div className="flex-1 space-y-2.5 min-h-0">
                <h3 className="text-[10px] font-bold text-dim uppercase tracking-wider">
                  Up Next
                </h3>
                <div className="space-y-2 overflow-y-auto">
                  {songs
                    .filter((s) => s.id !== currentSong?.id)
                    .slice(0, 5)
                    .map((song) => (
                      <button
                        key={song.id}
                        onClick={() => playSong(song)}
                        className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-card-hover transition-colors text-left cursor-pointer"
                      >
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-8 h-8 object-cover rounded border border-line"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium text-copy block truncate">
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
          )}
        </aside>
      </div>

      <PlayerBar />

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
                  className="px-4 py-2 bg-card text-white rounded-lg text-xs font-semibold hover:bg-card-hover active:scale-98 transition-all shadow-sm"
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
      className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-semibold transition-all group relative cursor-pointer ${
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
        <div className="absolute left-full ml-2 px-2 py-1 bg-card text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
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
        <div className="absolute left-full ml-2 px-2 py-1 bg-card text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-xl border border-line">
          <div className="font-medium">{title}</div>
          <div className="text-[10px] text-muted">{subtitle}</div>
        </div>
      )}
    </button>
  );
}
