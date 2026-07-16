"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAudio } from "./context/audio-context";
import { useSearch } from "./context/search-context";
import SongsSection from "./components/home/SongsSection";
import SongCard from "./components/home/SongCard";
import HeroCarousel from "./components/home/HeroCarousel";
import VerseOfTheWeek from "./components/home/VerseOfTheWeek";
import RecentlyPlayed from "./components/home/RecentlyPlayed";
import SearchResults from "./components/search/SearchResults";
import SongArtwork from "./components/ui/SongArtwork";
import {
  FolderHeart,
  ListMusic,
  Clock,
  Plus,
  Search,
  Heart,
  Trash2,
  ChevronLeft,
  Play,
  Pause,
  ArrowLeft,
  Library,
  Music,
  ChevronRight,
  FolderOpen
} from "lucide-react";

export default function HomePage() {
  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    favorites,
    playlists,
    recentlyPlayed,
    activeTab,
    setActiveTab,
    activePlaylistId,
    setActivePlaylistId,
    createPlaylist,
    deletePlaylist,
    removeSongFromPlaylist
  } = useAudio();

  const { searchQuery, setSearchQuery, showFullResults, setShowFullResults } = useSearch();

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setSelectedLetter(null);
    }, 0);
  }, [activeTab, activePlaylistId, searchQuery]);

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
    const trimmedQuery = (searchQuery || "").toString().trim();
    if (trimmedQuery && showFullResults) {
      const q = trimmedQuery.toLowerCase();
      list = list.filter(
        (s) =>
          (s.teluguTitle || s.title).toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q),
      );
    }
    return list;
  };

  const filteredSongs = getFilteredSongs();
  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);

  // Mobile specific search results
  const mobileSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return songs.filter(
      (s) =>
        (s.teluguTitle || s.title).toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [songs, searchQuery]);

  const handleCreatePlaylistMobile = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setIsCreatingPlaylist(false);
    }
  };

  // Genre Categories for mobile search screen
  const genres = [
    { name: "Lo-Fi", label: "Lofi Sunset", color: "from-amber-500 to-rose-600" },
    { name: "Synthwave", label: "Synthwave Nights", color: "from-pink-500 to-purple-800" },
    { name: "Rock", label: "Rock & Worship", color: "from-teal-500 to-emerald-800" },
    { name: "Pop", label: "Pop Anthems", color: "from-blue-500 to-indigo-800" }
  ];

  return (
    <div className={`flex-1 flex flex-col min-h-0 overflow-y-auto`}>
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* ─── DESKTOP VIEW ─── */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-8 p-4">
        {/* VIEW HEADER */}
        {activeTab && activeTab !== "discover" && !selectedLetter && (
          <div>
            {activeTab === "favorites" && (
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <FolderHeart className="w-5 h-5 text-red-500" />
                  My Favorites
                </h1>
                <p className="text-xs text-muted mt-1">Your curated collection of loved songs.</p>
              </div>
            )}
            {activeTab === "playlist" && activePlaylist && (
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-muted" />
                  {activePlaylist.name}
                </h1>
                <p className="text-xs text-muted mt-1">
                  Playlist containing {activePlaylist.songIds.length} track
                  {activePlaylist.songIds.length !== 1 && "s"}.
                </p>
              </div>
            )}
            {activeTab === "recently-played" && (
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted" />
                  Recently Played
                </h1>
                <p className="text-xs text-muted mt-1">Your recently listened tracks.</p>
              </div>
            )}
          </div>
        )}

        {/* Box 1 & 2 — Carousel & Verse (Browse tab only) */}
        {activeTab === "discover" && !(searchQuery && showFullResults) && !selectedLetter && (
          <>
            <HeroCarousel />
            <VerseOfTheWeek />
          </>
        )}

        {/* Box 3 — Recently Played */}
        {activeTab === "discover" && !(searchQuery && showFullResults) && !selectedLetter && (
          <RecentlyPlayed />
        )}

        {/* Songs List Section */}
        {searchQuery && showFullResults ? (
          <div className="flex-1 flex flex-col min-h-0">
            <SearchResults
              results={filteredSongs}
              query={searchQuery}
              currentSong={currentSong}
              isPlaying={isPlaying}
              playSong={playSong}
            />
          </div>
        ) : (
          <SongsSection
            songs={filteredSongs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            playSong={playSong}
            selectedLetter={selectedLetter}
            setSelectedLetter={setSelectedLetter}
          />
        )}
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* ─── MOBILE VIEW ─── */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="block md:hidden p-4 space-y-6">
        
        {/* 1. BROWSE TAB */}
        {activeTab === "discover" && (
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Good day</span>
              <h1 className="text-2xl font-black text-white tracking-tight">Explore Music</h1>
            </div>
            
            {!selectedLetter && (
              <>
                <HeroCarousel />
                <VerseOfTheWeek />
                <RecentlyPlayed />
              </>
            )}

            <SongsSection
              songs={filteredSongs}
              currentSong={currentSong}
              isPlaying={isPlaying}
              playSong={playSong}
              selectedLetter={selectedLetter}
              setSelectedLetter={setSelectedLetter}
            />
          </div>
        )}

        {/* 2. SEARCH TAB */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-tight">Search</h1>
            </div>

            {/* Immersive Search Box */}
            <div className="relative group">
              <Search className="w-5 h-5 text-dim absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-white" />
              <input
                type="text"
                placeholder="Songs, artists, genres..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowFullResults(true);
                }}
                className="w-full h-12 pl-12 pr-10 text-sm bg-card border border-white/5 rounded-xl focus:outline-none focus:border-white/20 focus:bg-[#181818] transition-all duration-200 text-white placeholder-muted/50"
              />
            </div>

            {searchQuery.trim() === "" ? (
              /* Search Hub default: Browse Categories */
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Browse Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre.name}
                      onClick={() => {
                        setSearchQuery(genre.name);
                        setShowFullResults(true);
                      }}
                      className={`relative aspect-[3/2] rounded-xl overflow-hidden bg-gradient-to-br ${genre.color} p-4 text-left font-bold text-white shadow-md active:scale-95 transition-transform cursor-pointer`}
                    >
                      <span className="text-sm block">{genre.label}</span>
                      <Music className="absolute bottom-2 right-2 w-8 h-8 opacity-20 transform rotate-12" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Inline Search Results */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Results</span>
                  <span className="text-xs text-dim">{mobileSearchResults.length} found</span>
                </div>
                {mobileSearchResults.length === 0 ? (
                  <div className="text-center py-12 text-muted">
                    <p className="font-semibold text-sm">No matches found</p>
                    <p className="text-xs mt-1 text-dim">Try another spelling or word</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {mobileSearchResults.map((song) => {
                      const isCurrent = currentSong?.id === song.id;
                      return (
                        <div
                          key={song.id}
                          onClick={() => playSong(song)}
                          className={`flex items-center gap-3 p-2 rounded-xl active:bg-card-hover transition-colors cursor-pointer ${
                            isCurrent ? "bg-card-hover border border-white/5" : ""
                          }`}
                        >
                          <div className="w-11 h-11 rounded-lg overflow-hidden border border-line shrink-0">
                            <SongArtwork song={song} className="w-full h-full object-cover" iconSize="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-semibold block truncate ${
                              isCurrent ? "text-title" : "text-white"
                            } ${song.teluguTitle ? "font-telugu" : ""}`}>
                              {song.teluguTitle || song.title}
                            </span>
                            <span className="text-xs text-muted block truncate mt-0.5">{song.artist}</span>
                          </div>
                          <div className="shrink-0 text-xs text-dim pr-1">
                            {isCurrent && isPlaying ? (
                              <div className="flex items-end gap-[2px] h-3">
                                <span className="w-[2px] bg-white rounded-full h-3 animate-music-bar-1" />
                                <span className="w-[2px] bg-white rounded-full h-2 animate-music-bar-2" />
                                <span className="w-[2px] bg-white rounded-full h-2.5 animate-music-bar-3" />
                              </div>
                            ) : (
                              song.duration
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. FAVORITES TAB */}
        {activeTab === "favorites" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Visual Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-indigo-950 p-6 shadow-xl border border-white/5">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-md">
                  <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tight">Favorites</h1>
                  <p className="text-xs text-white/70 mt-1">{filteredSongs.length} track{filteredSongs.length !== 1 && "s"} liked by you</p>
                </div>

                {filteredSongs.length > 0 && (
                  <button
                    onClick={() => {
                      // Shuffle play favorites
                      const randomIndex = Math.floor(Math.random() * filteredSongs.length);
                      playSong(filteredSongs[randomIndex]);
                    }}
                    className="self-start px-5 py-2.5 bg-white text-black font-bold text-xs rounded-full shadow-md active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Shuffle Play</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of liked songs */}
            <div className="space-y-2">
              {filteredSongs.length === 0 ? (
                <div className="text-center py-16 text-muted border border-dashed border-line rounded-2xl">
                  <Heart className="w-8 h-8 text-dim mx-auto mb-3 opacity-40" />
                  <p className="font-semibold text-sm">No liked songs yet</p>
                  <p className="text-xs text-dim mt-1 max-w-xs mx-auto px-4">Tap the heart icon on any song to save it in your favorites collection.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredSongs.map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        className={`flex items-center gap-3 p-2 rounded-xl active:bg-card-hover transition-colors cursor-pointer ${
                          isCurrent ? "bg-card-hover border border-white/5" : ""
                        }`}
                      >
                        <div onClick={() => playSong(song)} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-lg overflow-hidden border border-line shrink-0">
                            <SongArtwork song={song} className="w-full h-full object-cover" iconSize="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-semibold block truncate ${
                              isCurrent ? "text-title" : "text-white"
                            } ${song.teluguTitle ? "font-telugu" : ""}`}>
                              {song.teluguTitle || song.title}
                            </span>
                            <span className="text-xs text-muted block truncate mt-0.5">{song.artist}</span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-3 pr-1">
                          <button
                            onClick={() => toggleFavorite(song.id)}
                            className="p-2 hover:bg-card-hover rounded-full text-red-500 cursor-pointer"
                          >
                            <Heart className="w-4.5 h-4.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. PLAYLISTS TAB */}
        {activeTab === "playlist" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* 4a. PLAYLIST DETAIL SCREEN */}
            {activePlaylistId && activePlaylist ? (
              <div className="space-y-6">
                <button
                  onClick={() => setActivePlaylistId(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Playlists</span>
                </button>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-800 to-slate-950 p-6 shadow-xl border border-white/5">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-md">
                      <ListMusic className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-white tracking-tight">{activePlaylist.name}</h1>
                      <p className="text-xs text-white/70 mt-1">{filteredSongs.length} track{filteredSongs.length !== 1 && "s"}</p>
                    </div>

                    {filteredSongs.length > 0 && (
                      <button
                        onClick={() => playSong(filteredSongs[0])}
                        className="self-start px-5 py-2.5 bg-white text-black font-bold text-xs rounded-full shadow-md active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Now</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Playlist Tracks List */}
                <div className="space-y-2">
                  {filteredSongs.length === 0 ? (
                    <div className="text-center py-16 text-muted border border-dashed border-line rounded-2xl">
                      <Music className="w-8 h-8 text-dim mx-auto mb-3 opacity-40" />
                      <p className="font-semibold text-sm">No songs in playlist</p>
                      <p className="text-xs text-dim mt-1 max-w-xs mx-auto px-4">Browse music and add songs to this playlist from song lyric detail pages.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredSongs.map((song) => {
                        const isCurrent = currentSong?.id === song.id;
                        return (
                          <div
                            key={song.id}
                            className={`flex items-center gap-3 p-2 rounded-xl active:bg-card-hover transition-colors cursor-pointer ${
                              isCurrent ? "bg-card-hover border border-white/5" : ""
                            }`}
                          >
                            <div onClick={() => playSong(song)} className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-11 h-11 rounded-lg overflow-hidden border border-line shrink-0">
                                <SongArtwork song={song} className="w-full h-full object-cover" iconSize="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm font-semibold block truncate ${
                                  isCurrent ? "text-title" : "text-white"
                                } ${song.teluguTitle ? "font-telugu" : ""}`}>
                                  {song.teluguTitle || song.title}
                                </span>
                                <span className="text-xs text-muted block truncate mt-0.5">{song.artist}</span>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-3 pr-1">
                              <button
                                onClick={() => removeSongFromPlaylist(activePlaylist.id, song.id)}
                                className="p-2 hover:bg-card-hover rounded-full text-dim hover:text-red-400 cursor-pointer"
                                title="Remove from playlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 4b. PLAYLISTS HUB (LIST OF PLAYLISTS) */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-black text-white tracking-tight">Playlists</h1>
                  <button
                    onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-card-hover border border-line rounded-lg text-xs font-bold text-white cursor-pointer active:scale-95 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create</span>
                  </button>
                </div>

                {/* Inline Creation Form */}
                {isCreatingPlaylist && (
                  <form onSubmit={handleCreatePlaylistMobile} className="p-4 bg-card-hover border border-line rounded-xl space-y-3 animate-in slide-in-from-top-4 duration-200">
                    <span className="text-[10px] font-bold text-dim uppercase tracking-wider block">New Playlist Name</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gospel, Devotional Vibes"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-lg text-xs focus:outline-none focus:border-dim text-white bg-card"
                    />
                    <div className="flex justify-end gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setIsCreatingPlaylist(false)}
                        className="px-3 py-1.5 border border-line rounded-lg text-[10px] font-bold text-muted hover:bg-card"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-white text-black rounded-lg text-[10px] font-bold shadow-sm"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}

                {/* Playlist Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {playlists.length === 0 ? (
                    <div className="text-center py-16 text-muted border border-dashed border-line rounded-2xl">
                      <Library className="w-8 h-8 text-dim mx-auto mb-3 opacity-40" />
                      <p className="font-semibold text-sm">No playlists created</p>
                      <p className="text-xs text-dim mt-1 max-w-xs mx-auto px-4">Create your first playlist and start organizing your favorite songs.</p>
                    </div>
                  ) : (
                    playlists.map((list) => {
                      const isDefaultFav = list.id === "fav-list";
                      return (
                        <div
                          key={list.id}
                          className="group relative flex items-center justify-between p-3.5 bg-card border border-line/65 rounded-xl hover:border-white/20 active:bg-card-hover transition-colors"
                        >
                          <div
                            onClick={() => setActivePlaylistId(list.id)}
                            className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                              isDefaultFav 
                                ? "bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-300 text-white" 
                                : "bg-card-hover border border-line text-dim"
                            }`}>
                              {isDefaultFav ? (
                                <Heart className="w-5.5 h-5.5 fill-white text-white" />
                              ) : (
                                <ListMusic className="w-5.5 h-5.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-white block truncate">{list.name}</span>
                              <span className="text-xs text-muted block mt-0.5">{list.songIds.length} song{list.songIds.length !== 1 && "s"}</span>
                            </div>
                          </div>
                          <div className="shrink-0 pl-2">
                            {!isDefaultFav ? (
                              <button
                                onClick={() => deletePlaylist(list.id)}
                                className="p-2 text-dim hover:text-red-400 rounded-full cursor-pointer"
                                title="Delete playlist"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-dim" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
