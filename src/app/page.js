"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAudio } from "./context/audio-context";
import { useSearch } from "./context/search-context";
import {
  ChevronLeft,
  Compass,
  FolderHeart,
  ListMusic,
  Plus,
  Music,
  Heart,
  Play,
  Pause,
  Clock,
  ChevronRight,
  TrendingUp,
  MoreVertical,
  X
} from "lucide-react";

const GENRES = ["All", "Lo-Fi", "Synthwave", "Pop", "Rock"];

export default function HomePage() {
  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    favorites,
    toggleFavorite,
    playlists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    recentlyPlayed
  } = useAudio();

  const { searchQuery } = useSearch();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);

  // Filtering logic
  const getFilteredSongs = () => {
    let list = [...songs];
    if (activeTab === "favorites") {
      list = list.filter(song => favorites.includes(song.id));
    } else if (activeTab === "playlist" && activePlaylistId) {
      const pl = playlists.find(p => p.id === activePlaylistId);
      if (pl) list = list.filter(song => pl.songIds.includes(song.id));
      else list = [];
    }
    if (selectedGenre !== "All") {
      list = list.filter(song => song.genre === selectedGenre);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q));
    }
    return list;
  };

  const filteredSongs = getFilteredSongs();
  const recentlyPlayedList = recentlyPlayed.map(id => songs.find(s => s.id === id)).filter(Boolean);
  const activePlaylist = playlists.find(p => p.id === activePlaylistId);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName("");
      setShowCreateModal(false);
    }
  };

  const toggleSongMenu = (e, songId) => {
    e.stopPropagation();
    setActiveMenuSongId(activeMenuSongId === songId ? null : songId);
  };

  useEffect(() => {
    const handleClick = () => setActiveMenuSongId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="flex flex-1 bg-gray-950 min-h-0">
      {/* MIDDLE CONTAINER */}
      <div className="flex flex-1 min-h-0 gap-px bg-gray-800 overflow-hidden">

        {/* SIDEBAR — collapsible */}
        <aside className={`${sidebarCollapsed ? "w-16" : "w-60"} bg-gray-900 rounded-xl border border-gray-700/80 hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out`}>
          {/* Toggle row */}
          <div className="h-14 flex items-center shrink-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-300 transition-colors mx-auto cursor-pointer"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Navigation */}
            <div className="space-y-1 px-2">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 block mb-2">Discover</span>
              )}
              <SidebarItem
                icon={<Compass className="w-4 h-4" />}
                label="Browse Songs"
                collapsed={sidebarCollapsed}
                active={activeTab === "discover"}
                onClick={() => { setActiveTab("discover"); setActivePlaylistId(null); }}
              />
              <SidebarItem
                icon={<FolderHeart className="w-4 h-4" />}
                label="Favorites"
                collapsed={sidebarCollapsed}
                active={activeTab === "favorites"}
                badge={favorites.length > 0 ? favorites.length : null}
                onClick={() => { setActiveTab("favorites"); setActivePlaylistId(null); }}
              />
            </div>

            {/* Playlists */}
            <div className="space-y-1 px-2">
              <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} px-2 mb-2`}>
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Playlists</span>
                )}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 hover:bg-gray-800 rounded-md text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  title="Create Playlist"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {playlists.map(list => (
                <SidebarItem
                  key={list.id}
                  icon={<ListMusic className="w-4 h-4" />}
                  label={list.name}
                  collapsed={sidebarCollapsed}
                  active={activeTab === "playlist" && activePlaylistId === list.id}
                  badge={list.songIds.length > 0 ? list.songIds.length : null}
                  onClick={() => { setActiveTab("playlist"); setActivePlaylistId(list.id); }}
                />
              ))}
            </div>
          </div>

          {!sidebarCollapsed && (
            <div className="p-3 border-t border-gray-800 text-[10px] text-gray-500 text-center shrink-0">
              <span>&copy; 2026 SongHub</span>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-900 rounded-xl border border-gray-700/80">
          <div className="flex-1 overflow-y-auto space-y-8 p-6">

            {/* MOBILE NAV */}
            <div className="md:hidden flex flex-wrap gap-2 pb-2 border-b border-gray-700">
              {["discover", "favorites"].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setActivePlaylistId(null); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    activeTab === tab ? "bg-gray-900 text-white" : "bg-transparent border border-gray-700 text-gray-400"
                  }`}
                >
                  {tab === "discover" ? "Browse" : `Favorites (${favorites.length})`}
                </button>
              ))}
              {playlists.map(list => (
                <button
                  key={list.id}
                  onClick={() => { setActiveTab("playlist"); setActivePlaylistId(list.id); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    activeTab === "playlist" && activePlaylistId === list.id ? "bg-gray-900 text-white" : "bg-transparent border border-gray-700 text-gray-400"
                  }`}
                >
                  {list.name}
                </button>
              ))}
              <button onClick={() => setShowCreateModal(true)}
                className="px-2.5 py-1.5 rounded-full text-xs bg-indigo-950/50 border border-indigo-800 text-indigo-400 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </div>

            {/* VIEW HEADER */}
            <div>
              {activeTab === "discover" && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Trending Music
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">Explore the hand-picked ambient, pop, and rock tracks.</p>
                </div>
              )}
              {activeTab === "favorites" && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-2">
                    <FolderHeart className="w-5 h-5 text-red-400" />
                    My Favorites
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">Your curated collection of loved songs.</p>
                </div>
              )}
              {activeTab === "playlist" && activePlaylist && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-2">
                    <ListMusic className="w-5 h-5 text-indigo-400" />
                    {activePlaylist.name}
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Playlist containing {activePlaylist.songIds.length} track{activePlaylist.songIds.length !== 1 && "s"}.
                  </p>
                </div>
              )}
            </div>

            {/* RECENTLY PLAYED */}
            {activeTab === "discover" && recentlyPlayedList.length > 0 && !searchQuery && (
              <div className="space-y-3.5">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recently Played</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {recentlyPlayedList.map(song => (
                    <div key={`recent-${song.id}`} onClick={() => playSong(song)} className="flex-shrink-0 w-32 group cursor-pointer">
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-gray-700 shadow-sm bg-gray-800 mb-2">
                        <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center shadow-md scale-90 group-hover:scale-100 transition-transform">
                            {currentSong?.id === song.id && isPlaying ? (
                              <Pause className="w-4 h-4 text-gray-200 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 text-gray-200 fill-current ml-0.5" />
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="font-medium text-xs text-gray-100 block truncate group-hover:underline">{song.title}</span>
                      <span className="text-[10px] text-gray-500 block truncate">{song.artist}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GENRE TABS */}
            <div className="flex gap-1.5 border-b border-gray-700/80 pb-0.5">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition-all -mb-px cursor-pointer ${
                    selectedGenre === genre ? "border-gray-100 text-gray-100" : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* SONGS TABLE */}
            <div className="bg-gray-900 rounded-xl border border-gray-700/80 shadow-sm overflow-hidden">
              {filteredSongs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-800/50">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4 hidden sm:table-cell">Album</th>
                        <th className="py-3 px-4 hidden md:table-cell">Plays</th>
                        <th className="py-3 px-4 w-16 text-center"><Clock className="w-3.5 h-3.5 mx-auto" /></th>
                        <th className="py-3 px-4 w-20 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSongs.map((song, index) => {
                        const isCurrent = currentSong?.id === song.id;
                        const isFav = favorites.includes(song.id);
                        return (
                          <tr key={song.id}
                            className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors group cursor-pointer ${isCurrent ? "bg-indigo-950/20" : ""}`}
                            onClick={() => playSong(song)}
                          >
                            <td className="py-3 px-4 text-center text-xs font-medium text-gray-500">
                              <span className="group-hover:hidden">{index + 1}</span>
                              <span className="hidden group-hover:inline-block">
                                {isCurrent && isPlaying ? <Pause className="w-3 h-3 text-gray-300 fill-current" /> : <Play className="w-3 h-3 text-gray-300 fill-current" />}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img src={song.coverUrl} alt={song.title} className="w-9 h-9 object-cover rounded border border-gray-700" />
                                <div className="min-w-0">
                                  <span className={`font-medium block truncate ${isCurrent ? "text-indigo-400" : "text-gray-100"}`}>{song.title}</span>
                                  <span className="text-xs text-gray-500 block truncate">{song.artist}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden sm:table-cell text-xs text-gray-400">{song.album}</td>
                            <td className="py-3 px-4 hidden md:table-cell text-xs text-gray-400 tabular-nums">{song.plays.toLocaleString()}</td>
                            <td className="py-3 px-4 text-center text-xs text-gray-400 tabular-nums">{song.duration}</td>
                            <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => toggleFavorite(song.id)} className="p-1 hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
                                  <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-gray-300"}`} />
                                </button>
                                <div className="relative">
                                  <button onClick={(e) => toggleSongMenu(e, song.id)} className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-300 cursor-pointer">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                  {activeMenuSongId === song.id && (
                                    <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-30 text-left">
                                      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-700">Add to Playlist</div>
                                      {playlists.length > 0 ? playlists.map(list => {
                                        const inPl = list.songIds.includes(song.id);
                                        return (
                                          <button key={`drop-${list.id}`}
                                            onClick={() => { inPl ? removeSongFromPlaylist(list.id, song.id) : addSongToPlaylist(list.id, song.id); setActiveMenuSongId(null); }}
                                            className="w-full px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 flex items-center justify-between"
                                          >
                                            <span className="truncate">{list.name}</span>
                                            {inPl ? <span className="text-[10px] bg-indigo-950/50 text-indigo-400 px-1 py-0.2 rounded font-semibold border border-indigo-800 flex-shrink-0">Added</span> : <Plus className="w-3 h-3 text-gray-500" />}
                                          </button>
                                        );
                                      }) : <div className="px-3 py-2 text-xs text-gray-500 italic">No custom playlists</div>}
                                      {activeTab === "playlist" && activePlaylistId && (
                                        <div className="border-t border-gray-700 mt-1">
                                          <button onClick={() => { removeSongFromPlaylist(activePlaylistId, song.id); setActiveMenuSongId(null); }}
                                            className="w-full px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/30 text-left font-medium"
                                          >
                                            Remove from this playlist
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <Link href={`/song/${song.id}`} className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-gray-300 flex items-center justify-center cursor-pointer">
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <Music className="w-8 h-8 mx-auto text-gray-600 mb-3" />
                  <span className="font-medium block text-gray-400">No songs found</span>
                  <span className="text-xs block mt-1">Try adjusting your search query, genre filter, or playlist.</span>
                </div>
              )}
            </div>

          </div>
        </main>

        {/* RIGHT PANEL — appears when a song is selected */}
        <aside className={`hidden lg:flex flex-col shrink-0 bg-gray-900 rounded-xl border border-gray-700/80 overflow-hidden transition-all duration-300 ease-in-out ${
          currentSong ? "w-80 opacity-100" : "w-0 opacity-0 border-0 overflow-hidden p-0"
        }`}>
          <div className="flex flex-col h-full p-5 space-y-5">
            {/* Mini Now Playing */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Now Playing</h3>
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                {currentSong ? (
                  <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Music className="w-10 h-10" />
                  </div>
                )}
              </div>
              {currentSong && (
                <div className="min-w-0">
                  <span className="font-semibold text-sm text-gray-100 block truncate">{currentSong.title}</span>
                  <span className="text-xs text-gray-400 block truncate">{currentSong.artist}</span>
                </div>
              )}
            </div>

            {/* Queue / Up Next */}
            <div className="flex-1 space-y-2.5 min-h-0">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Up Next</h3>
              <div className="space-y-2 overflow-y-auto">
                {songs.filter(s => s.id !== currentSong?.id).slice(0, 5).map(song => (
                  <button key={song.id} onClick={() => playSong(song)}
                    className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-left cursor-pointer"
                  >
                    <img src={song.coverUrl} alt={song.title} className="w-8 h-8 object-cover rounded border border-gray-700" />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-gray-200 block truncate">{song.title}</span>
                      <span className="text-[10px] text-gray-500 block truncate">{song.artist}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* CREATE PLAYLIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <span className="font-semibold text-gray-100 text-sm">Create New Playlist</span>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-800 rounded-full text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Playlist Name</label>
                <input type="text" required placeholder="e.g. Focus Session, Pop Vibes" value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-200 bg-gray-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-xs font-semibold text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 active:scale-98 transition-all shadow-sm"
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

function SidebarItem({ icon, label, collapsed, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all truncate text-left group relative cursor-pointer ${
        active
          ? "bg-gray-800 text-gray-100 font-semibold"
          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && (
        <>
          <span className="truncate flex-1">{label}</span>
          {badge != null && (
            <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full font-bold">{badge}</span>
          )}
        </>
      )}
      {collapsed && badge != null && (
        <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-gray-700 text-gray-300 w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{badge}</span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </button>
  );
}
