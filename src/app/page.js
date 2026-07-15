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
  X,
} from "lucide-react";

const GENRES = ["All", "Lo-Fi", "Synthwave", "Pop", "Rock"];

const CAROUSEL_SLIDES = [
  {
    id: "adavi-chetla-naduma",
    title: "అడవి చెట్ల నడుమ",
    subtitle: "ADAVI CHETLA NADUMA",
    artist: "O Yaathrikudaa",
    label: "✨ SONGS OF THE WEEK",
    bgUrl: "/worship_forest.png",
  },
  {
    id: "1",
    title: "Ambient Gold",
    subtitle: "AMBIENT GOLD",
    artist: "Lofi Dreamer",
    label: "✨ SONG OF THE WEEK",
    bgUrl:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1000&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    title: "Synthwave Breeze",
    subtitle: "SYNTHWAVE BREEZE",
    artist: "Retro Horizon",
    label: "✨ SONG OF THE WEEK",
    bgUrl:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1000&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    title: "Pop Neon",
    subtitle: "POP NEON",
    artist: "Starlight",
    label: "✨ SONG OF THE WEEK",
    bgUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    title: "Melancholy Rock",
    subtitle: "MELANCHOLY ROCK",
    artist: "Dark Antlers",
    label: "✨ SONG OF THE WEEK",
    bgUrl:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1000&auto=format&fit=crop&q=80",
  },
  {
    id: "5",
    title: "Chilled Beats",
    subtitle: "CHILLED BEATS",
    artist: "Summer Chill",
    label: "✨ SONG OF THE WEEK",
    bgUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
  },
  {
    id: "6",
    title: "Cyberpunk Drive",
    subtitle: "CYBERPUNK DRIVE",
    artist: "Future City",
    label: "✨ SONG OF THE WEEK",
    bgUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80",
  },
];

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
    recentlyPlayed,
  } = useAudio();

  const { searchQuery } = useSearch();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filtering logic
  const getFilteredSongs = () => {
    const safeSongs = Array.isArray(songs) ? songs : [];
    let list = [...safeSongs];
    if (activeTab === "favorites") {
      list = list.filter((song) => favorites.includes(song.id));
    } else if (activeTab === "playlist" && activePlaylistId) {
      const pl = playlists.find((p) => p.id === activePlaylistId);
      if (pl) list = list.filter((song) => pl.songIds.includes(song.id));
      else list = [];
    } else if (activeTab === "recently-played") {
      list = recentlyPlayed
        .map((id) => songs.find((s) => s.id === id))
        .filter(Boolean);
    }
    if (selectedGenre !== "All") {
      list = list.filter((song) => song.genre === selectedGenre);
    }
    const trimmedQuery = (searchQuery || "").toString().trim();
    if (trimmedQuery) {
      const q = trimmedQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q),
      );
    }
    return list;
  };

  const filteredSongs = getFilteredSongs();
  const recentlyPlayedList = recentlyPlayed
    .map((id) => songs.find((s) => s.id === id))
    .filter(Boolean);
  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);

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
        <aside
          className={`${sidebarCollapsed ? "w-16" : "w-60"} bg-gray-900 rounded-xl border border-gray-700/80 hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
        >
          {/* Toggle row */}
          <div className="h-14 flex items-center shrink-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-300 transition-colors mx-auto cursor-pointer"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Navigation */}
            <div className="space-y-1 px-2">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 block mb-2">
                  Discover
                </span>
              )}
              <SidebarItem
                icon={<Compass className="w-4 h-4" />}
                label="Browse Songs"
                collapsed={sidebarCollapsed}
                active={activeTab === "discover"}
                onClick={() => {
                  setActiveTab("discover");
                  setActivePlaylistId(null);
                }}
              />
              <SidebarItem
                icon={<FolderHeart className="w-4 h-4" />}
                label="Favorites"
                collapsed={sidebarCollapsed}
                active={activeTab === "favorites"}
                badge={favorites.length > 0 ? favorites.length : null}
                onClick={() => {
                  setActiveTab("favorites");
                  setActivePlaylistId(null);
                }}
              />
            </div>

            {/* Playlists */}
            <div className="space-y-1 px-2">
              <div
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} px-2 mb-2`}
              >
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Playlists
                  </span>
                )}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 hover:bg-gray-800 rounded-md text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  title="Create Playlist"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {playlists.map((list) => (
                <SidebarItem
                  key={list.id}
                  icon={<ListMusic className="w-4 h-4" />}
                  label={list.name}
                  collapsed={sidebarCollapsed}
                  active={
                    activeTab === "playlist" && activePlaylistId === list.id
                  }
                  badge={list.songIds.length > 0 ? list.songIds.length : null}
                  onClick={() => {
                    setActiveTab("playlist");
                    setActivePlaylistId(list.id);
                  }}
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
        <main className="flex-1 flex flex-col min-w-0 bg-[#0B0F18] rounded-xl border border-[rgba(212,163,42,0.18)]">
          <div className="flex-1 overflow-y-auto space-y-8 p-6">
            {/* MOBILE NAV */}
            <div className="md:hidden flex flex-wrap gap-2 pb-2 border-b border-[rgba(212,163,42,0.18)]">
              {["discover", "favorites"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActivePlaylistId(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    activeTab === tab
                      ? "bg-[#D4A32A] text-black shadow-[0_0_10px_rgba(212,163,42,0.3)]"
                      : "bg-[#151B28] border border-[rgba(212,163,42,0.18)] text-[#B8BEC9] hover:text-white"
                  }`}
                >
                  {tab === "discover"
                    ? "Browse"
                    : `Favorites (${favorites.length})`}
                </button>
              ))}
              {playlists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => {
                    setActiveTab("playlist");
                    setActivePlaylistId(list.id);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    activeTab === "playlist" && activePlaylistId === list.id
                      ? "bg-[#D4A32A] text-black shadow-[0_0_10px_rgba(212,163,42,0.3)]"
                      : "bg-[#151B28] border border-[rgba(212,163,42,0.18)] text-[#B8BEC9] hover:text-white"
                  }`}
                >
                  {list.name}
                </button>
              ))}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-2.5 py-1.5 rounded-full text-xs bg-[#121826] border border-[#D4A32A]/30 text-[#D4A32A] flex items-center gap-1 font-bold hover:bg-[#D4A32A]/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            {/* Box 1 — Hero Banner ("Songs of the Week") & Box 2 — Verse of the Week Card */}
            {activeTab === "discover" && !searchQuery && (
              <>
                {/* Box 1 — Hero Banner */}
                <div className="relative w-full h-[440px] rounded-[28px] overflow-hidden bg-[#121826] border border-[rgba(212,163,42,0.18)] shadow-lg">
                  {CAROUSEL_SLIDES.map((slide, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                          isActive
                            ? "opacity-100 z-10 pointer-events-auto"
                            : "opacity-0 z-0 pointer-events-none"
                        }`}
                        style={{
                          backgroundImage: `url(${slide.bgUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F18] via-[#0B0F18]/80 to-transparent flex flex-col justify-center p-12">
                          <div className="max-w-xl space-y-1">
                            <span className="text-[#D4A32A] text-xs font-bold tracking-widest uppercase mb-3 block">
                              {slide.label}
                            </span>
                            <h2 className="text-white font-extrabold tracking-tight leading-tight mb-2 text-[52px]">
                              {slide.title}
                            </h2>
                            <p className="text-[#B8BEC9] font-semibold text-lg tracking-wide uppercase mb-1">
                              {slide.subtitle}
                            </p>
                            <p className="text-[#B8BEC9] font-medium text-base mb-6">
                              {slide.artist}
                            </p>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => {
                                  const song =
                                    songs.find((s) => s.id === slide.id) ||
                                    songs.find(
                                      (s) => s.id === "adavi-chetla-naduma",
                                    );
                                  if (song) playSong(song);
                                }}
                                className="px-6 py-2.5 bg-gradient-to-r from-[#D4A32A] to-[#F39C12] text-black font-semibold rounded-full hover:shadow-[0_0_15px_rgba(212,163,42,0.4)] transition-all hover:scale-105 active:scale-95 duration-200 flex items-center gap-2 cursor-pointer"
                              >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Play Now</span>
                              </button>
                              <Link
                                href={`/song/${slide.id}`}
                                className="px-6 py-2.5 border border-[#D4A32A]/50 hover:border-[#D4A32A] hover:bg-[#D4A32A]/10 text-white font-semibold rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                              >
                                <span>📖 Lyrics</span>
                                <span className="text-xs">↗</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Centered Pagination dots */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {CAROUSEL_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          idx === currentSlide
                            ? "bg-[#D4A32A] scale-125"
                            : "bg-gray-500/50 hover:bg-gray-400"
                        }`}
                        title={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Box 2 — Verse of the Week Card */}
                <div className="w-full bg-[#121826]/60 backdrop-blur-md border border-[rgba(212,163,42,0.18)] rounded-2xl p-6 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#D4A32A] text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <span>📖</span> VERSE OF THE WEEK
                    </span>
                    <span className="text-[#B8BEC9] text-xs font-semibold">
                      2 Timothy 1:7
                    </span>
                  </div>
                  <div className="text-center py-2 space-y-3">
                    <p className="text-white text-2xl font-serif leading-relaxed">
                      "దేవుడు మనకు శక్తియు ప్రేమయు స్వస్థబుద్ధియుగల ఆత్మనే
                      యిచ్చెను గాని పిరికితనముగల ఆత్మనియ్యలేదు."
                    </p>
                    <p className="text-[#B8BEC9] text-sm italic font-sans">
                      "For God has not given us a spirit of fear, but of power
                      and of love and of a sound mind."
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* VIEW HEADER (For search/favorites/playlists tab labels) */}
            {(!activeTab || activeTab !== "discover" || searchQuery) && (
              <div>
                {activeTab === "discover" && searchQuery && (
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#D4A32A]" />
                      Search Results
                    </h1>
                  </div>
                )}
                {activeTab === "favorites" && (
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <FolderHeart className="w-5 h-5 text-red-500" />
                      My Favorites
                    </h1>
                    <p className="text-xs text-[#B8BEC9] mt-1">
                      Your curated collection of loved songs.
                    </p>
                  </div>
                )}
                {activeTab === "playlist" && activePlaylist && (
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <ListMusic className="w-5 h-5 text-[#D4A32A]" />
                      {activePlaylist.name}
                    </h1>
                    <p className="text-xs text-[#B8BEC9] mt-1">
                      Playlist containing {activePlaylist.songIds.length} track
                      {activePlaylist.songIds.length !== 1 && "s"}.
                    </p>
                  </div>
                )}
                {activeTab === "recently-played" && (
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#D4A32A]" />
                      Recently Played
                    </h1>
                    <p className="text-xs text-[#B8BEC9] mt-1">
                      Your recently listened tracks.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Box 3 — Recently Played */}
            {activeTab === "discover" &&
              recentlyPlayedList.length > 0 &&
              !searchQuery && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-[#B8BEC9] uppercase tracking-wider">
                      Recently Played
                    </h2>
                    <button
                      onClick={() => {
                        setActiveTab("recently-played");
                        setActivePlaylistId(null);
                      }}
                      className="text-xs font-bold text-[#D4A32A] hover:text-white transition-colors cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {recentlyPlayedList.map((song) => (
                      <div
                        key={`recent-${song.id}`}
                        onClick={() => playSong(song)}
                        className="flex-shrink-0 w-32 group cursor-pointer"
                      >
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[rgba(212,163,42,0.18)] shadow-sm bg-[#121826] mb-2">
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-[#D4A32A] text-black flex items-center justify-center shadow-md scale-90 group-hover:scale-100 transition-transform">
                              {currentSong?.id === song.id && isPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold text-xs text-white block truncate group-hover:text-[#D4A32A] transition-colors">
                          {song.title}
                        </span>
                        <span className="text-[10px] text-[#B8BEC9] block truncate">
                          {song.artist}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Box 4 — Genre Tabs */}
            <div className="flex gap-1.5 border-b border-[rgba(212,163,42,0.18)] pb-0.5">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition-all -mb-px cursor-pointer ${
                    selectedGenre === genre
                      ? "border-[#D4A32A] text-[#D4A32A]"
                      : "border-transparent text-[#B8BEC9] hover:text-white hover:border-[#D4A32A]/30"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Box 5 — Songs Table */}
            <div className="bg-[#121826] rounded-2xl border border-[rgba(212,163,42,0.18)] shadow-md overflow-hidden">
              {filteredSongs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[rgba(212,163,42,0.18)] text-[10px] font-bold uppercase tracking-wider text-[#B8BEC9] bg-[#151B28]/80">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4 hidden sm:table-cell">
                          Album
                        </th>
                        <th className="py-3 px-4 hidden md:table-cell">
                          Plays
                        </th>
                        <th className="py-3 px-4 w-16 text-center">
                          <Clock className="w-3.5 h-3.5 mx-auto" />
                        </th>
                        <th className="py-3 px-4 w-20 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSongs.map((song, index) => {
                        const isCurrent = currentSong?.id === song.id;
                        const isFav = favorites.includes(song.id);
                        return (
                          <tr
                            key={song.id}
                            className={`border-b border-white/5 hover:bg-[#151B28]/50 transition-colors group cursor-pointer ${isCurrent ? "bg-[#D4A32A]/10 text-white" : ""}`}
                            onClick={() => playSong(song)}
                          >
                            <td className="py-3 px-4 text-center text-xs font-medium text-[#B8BEC9]">
                              <span className="group-hover:hidden">
                                {index + 1}
                              </span>
                              <span className="hidden group-hover:inline-block">
                                {isCurrent && isPlaying ? (
                                  <Pause className="w-3 h-3 text-[#D4A32A] fill-current" />
                                ) : (
                                  <Play className="w-3 h-3 text-[#D4A32A] fill-current" />
                                )}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={song.coverUrl}
                                  alt={song.title}
                                  className="w-9 h-9 object-cover rounded border border-white/10"
                                />
                                <div className="min-w-0">
                                  <span
                                    className={`font-semibold block truncate ${isCurrent ? "text-[#D4A32A]" : "text-white"}`}
                                  >
                                    {song.title}
                                  </span>
                                  <span className="text-xs text-[#B8BEC9] block truncate">
                                    {song.artist}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden sm:table-cell text-xs text-[#B8BEC9]">
                              {song.album}
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell text-xs text-[#B8BEC9] tabular-nums">
                              {song.plays.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4 text-center text-xs text-[#B8BEC9] tabular-nums">
                              {song.duration}
                            </td>
                            <td
                              className="py-3 px-4 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => toggleFavorite(song.id)}
                                  className="p-1 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                                  title={
                                    isFav
                                      ? "Remove from favorites"
                                      : "Add to favorites"
                                  }
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-[#B8BEC9] hover:text-white"}`}
                                  />
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={(e) => toggleSongMenu(e, song.id)}
                                    className="p-1 hover:bg-white/5 rounded-full transition-colors text-[#B8BEC9] hover:text-[#D4A32A] cursor-pointer"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                  {activeMenuSongId === song.id && (
                                    <div className="absolute right-0 mt-1 w-48 bg-[#121826] border border-[rgba(212,163,42,0.18)] rounded-lg shadow-lg py-1 z-30 text-left">
                                      <div className="px-3 py-1.5 text-[10px] font-bold text-[#B8BEC9] uppercase tracking-wider border-b border-white/10">
                                        Add to Playlist
                                      </div>
                                      {playlists.length > 0 ? (
                                        playlists.map((list) => {
                                          const inPl = list.songIds.includes(
                                            song.id,
                                          );
                                          return (
                                            <button
                                              key={`drop-${list.id}`}
                                              onClick={() => {
                                                inPl
                                                  ? removeSongFromPlaylist(
                                                      list.id,
                                                      song.id,
                                                    )
                                                  : addSongToPlaylist(
                                                      list.id,
                                                      song.id,
                                                    );
                                                setActiveMenuSongId(null);
                                              }}
                                              className="w-full px-3 py-1.5 text-xs text-white hover:bg-white/5 flex items-center justify-between"
                                            >
                                              <span className="truncate">
                                                {list.name}
                                              </span>
                                              {inPl ? (
                                                <span className="text-[10px] bg-[#D4A32A]/25 text-[#D4A32A] px-1 py-0.2 rounded font-semibold border border-[#D4A32A]/40 flex-shrink-0">
                                                  Added
                                                </span>
                                              ) : (
                                                <Plus className="w-3 h-3 text-[#B8BEC9]" />
                                              )}
                                            </button>
                                          );
                                        })
                                      ) : (
                                        <div className="px-3 py-2 text-xs text-[#B8BEC9] italic">
                                          No custom playlists
                                        </div>
                                      )}
                                      {activeTab === "playlist" &&
                                        activePlaylistId && (
                                          <div className="border-t border-white/10 mt-1">
                                            <button
                                              onClick={() => {
                                                removeSongFromPlaylist(
                                                  activePlaylistId,
                                                  song.id,
                                                );
                                                setActiveMenuSongId(null);
                                              }}
                                              className="w-full px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/30 text-left font-medium"
                                            >
                                              Remove from this playlist
                                            </button>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                                <Link
                                  href={`/song/${song.id}`}
                                  className="p-1 hover:bg-white/5 rounded-full transition-colors text-[#B8BEC9] hover:text-[#D4A32A] flex items-center justify-center cursor-pointer"
                                  title="View Details"
                                >
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
                <div className="p-12 text-center text-[#B8BEC9]">
                  <Music className="w-8 h-8 mx-auto text-gray-600 mb-3 animate-pulse" />
                  <span className="font-semibold block text-white">
                    No songs found
                  </span>
                  <span className="text-xs block mt-1">
                    Try adjusting your search query, genre filter, or playlist.
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT PANEL — appears when a song is selected */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 bg-gray-900 rounded-xl border border-gray-700/80 overflow-hidden transition-all duration-300 ease-in-out ${
            currentSong
              ? "w-80 opacity-100"
              : "w-0 opacity-0 border-0 overflow-hidden p-0"
          }`}
        >
          <div className="flex flex-col h-full p-5 space-y-5">
            {/* Mini Now Playing */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Now Playing
              </h3>
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                {currentSong ? (
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Music className="w-10 h-10" />
                  </div>
                )}
              </div>
              {currentSong && (
                <div className="min-w-0">
                  <span className="font-semibold text-sm text-gray-100 block truncate">
                    {currentSong.title}
                  </span>
                  <span className="text-xs text-gray-400 block truncate">
                    {currentSong.artist}
                  </span>
                </div>
              )}
            </div>

            {/* Queue / Up Next */}
            <div className="flex-1 space-y-2.5 min-h-0">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
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
                      className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-left cursor-pointer"
                    >
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-8 h-8 object-cover rounded border border-gray-700"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-gray-200 block truncate">
                          {song.title}
                        </span>
                        <span className="text-[10px] text-gray-500 block truncate">
                          {song.artist}
                        </span>
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
              <span className="font-semibold text-gray-100 text-sm">
                Create New Playlist
              </span>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-800 rounded-full text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Focus Session, Pop Vibes"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-200 bg-gray-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-700 rounded-lg text-xs font-semibold text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
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
            <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full font-bold">
              {badge}
            </span>
          )}
        </>
      )}
      {collapsed && badge != null && (
        <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-gray-700 text-gray-300 w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </button>
  );
}
