"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAudio } from "../../context/audio-context";
import {
  Heart,
  ListMusic,
  Plus,
  Play,
  Pause,
  Clock,
  ChevronRight,
  TrendingUp,
  FolderHeart,
  Music,
  MoreVertical,
  X
} from "lucide-react";

export default function HomeContent({
  activeTab,
  activePlaylistId,
  searchQuery,
  selectedGenre,
  showCreateModal,
  newPlaylistName,
  activeMenuSongId,
  setActiveTab,
  setActivePlaylistId,
  setSelectedGenre,
  setShowCreateModal,
  setNewPlaylistName,
  setActiveMenuSongId,
  handleCreatePlaylist,
  toggleSongMenu
}) {
  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    favorites,
    toggleFavorite,
    playlists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    recentlyPlayed
  } = useAudio();

  const genres = ["All", "Lo-Fi", "Synthwave", "Pop", "Rock"];

  const getFilteredSongs = () => {
    let list = [...songs];
    if (activeTab === "favorites") {
      list = list.filter(song => favorites.includes(song.id));
    } else if (activeTab === "playlist" && activePlaylistId) {
      const playlist = playlists.find(p => p.id === activePlaylistId);
      if (playlist) {
        list = list.filter(song => playlist.songIds.includes(song.id));
      } else {
        list = [];
      }
    }
    if (selectedGenre !== "All") {
      list = list.filter(song => song.genre === selectedGenre);
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        song =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query)
      );
    }
    return list;
  };

  const filteredSongs = getFilteredSongs();

  const getRecentlyPlayedSongs = () => {
    return recentlyPlayed
      .map(id => songs.find(s => s.id === id))
      .filter(Boolean);
  };

  const recentlyPlayedList = getRecentlyPlayedSongs();
  const activePlaylist = playlists.find(p => p.id === activePlaylistId);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuSongId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [setActiveMenuSongId]);

  return (
    <>
      {/* MOBILE NAVIGATION BAR */}
      <div className="md:hidden flex flex-wrap gap-2 pb-2 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab("discover"); setActivePlaylistId(null); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            activeTab === "discover" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => { setActiveTab("favorites"); setActivePlaylistId(null); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            activeTab === "favorites" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          Favorites ({favorites.length})
        </button>
        {playlists.map(list => (
          <button
            key={list.id}
            onClick={() => { setActiveTab("playlist"); setActivePlaylistId(list.id); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              activeTab === "playlist" && activePlaylistId === list.id
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {list.name}
          </button>
        ))}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-2.5 py-1.5 rounded-full text-xs bg-indigo-50 border border-indigo-150 text-indigo-700 flex items-center gap-1 font-semibold"
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      {/* VIEW HEADER */}
      <div>
        {activeTab === "discover" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Trending Music
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Explore the hand-picked ambient, pop, and rock tracks.
            </p>
          </div>
        )}
        {activeTab === "favorites" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-red-500" />
              My Favorites
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Your curated collection of loved songs.
            </p>
          </div>
        )}
        {activeTab === "playlist" && activePlaylist && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-indigo-500" />
              {activePlaylist.name}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Playlist containing {activePlaylist.songIds.length} track
              {activePlaylist.songIds.length !== 1 && "s"}.
            </p>
          </div>
        )}
      </div>

      {/* RECENTLY PLAYED */}
      {activeTab === "discover" && recentlyPlayedList.length > 0 && !searchQuery && (
        <div className="space-y-3.5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Recently Played
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentlyPlayedList.map(song => (
              <div
                key={`recent-${song.id}`}
                onClick={() => playSong(song)}
                className="flex-shrink-0 w-32 group cursor-pointer"
              >
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-gray-200/60 shadow-sm bg-white mb-2">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md scale-90 group-hover:scale-100 transition-transform">
                      {currentSong?.id === song.id && isPlaying ? (
                        <Pause className="w-4 h-4 text-gray-800 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 text-gray-800 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-medium text-xs text-gray-800 block truncate group-hover:underline">
                  {song.title}
                </span>
                <span className="text-[10px] text-gray-400 block truncate">
                  {song.artist}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GENRE FILTER TABS */}
      <div className="flex gap-1.5 border-b border-gray-200/80 pb-0.5">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 border-b-2 text-xs font-semibold tracking-wide transition-all -mb-px ${
              selectedGenre === genre
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* SONGS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        {filteredSongs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-150 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Album</th>
                  <th className="py-3 px-4 hidden md:table-cell">Plays</th>
                  <th className="py-3 px-4 w-16 text-center">
                    <Clock className="w-3.5 h-3.5 mx-auto" />
                  </th>
                  <th className="py-3 px-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map((song, index) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isFavorite = favorites.includes(song.id);
                  return (
                    <tr
                      key={song.id}
                      className={`border-b border-gray-100 hover:bg-gray-50/70 transition-colors group cursor-pointer ${
                        isCurrent ? "bg-indigo-50/20" : ""
                      }`}
                      onClick={() => playSong(song)}
                    >
                      <td className="py-3 px-4 text-center text-xs font-medium text-gray-400">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <span className="hidden group-hover:inline-block">
                          {isCurrent && isPlaying ? (
                            <Pause className="w-3 h-3 text-gray-700 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 text-gray-700 fill-current" />
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            className="w-9 h-9 object-cover rounded border border-gray-100"
                          />
                          <div className="min-w-0">
                            <span className={`font-medium block truncate ${isCurrent ? "text-indigo-600" : "text-gray-800"}`}>
                              {song.title}
                            </span>
                            <span className="text-xs text-gray-400 block truncate">
                              {song.artist}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 hidden sm:table-cell text-xs text-gray-500">
                        {song.album}
                      </td>

                      <td className="py-3 px-4 hidden md:table-cell text-xs text-gray-500 tabular-nums">
                        {song.plays.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center text-xs text-gray-500 tabular-nums">
                        {song.duration}
                      </td>

                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => toggleFavorite(song.id)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title={isFavorite ? "Remove favorite" : "Mark favorite"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"}`} />
                          </button>

                          <div className="relative">
                            <button
                              onClick={(e) => toggleSongMenu(e, song.id)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                              title="Add/Remove from playlists"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeMenuSongId === song.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-left">
                                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                  Add to Playlist
                                </div>
                                {playlists.length > 0 ? (
                                  playlists.map(list => {
                                    const isInPlaylist = list.songIds.includes(song.id);
                                    return (
                                      <button
                                        key={`drop-${list.id}`}
                                        onClick={() => {
                                          if (isInPlaylist) {
                                            removeSongFromPlaylist(list.id, song.id);
                                          } else {
                                            addSongToPlaylist(list.id, song.id);
                                          }
                                          setActiveMenuSongId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                                      >
                                        <span className="truncate">{list.name}</span>
                                        {isInPlaylist ? (
                                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded font-semibold border border-indigo-100 flex-shrink-0">
                                            Added
                                          </span>
                                        ) : (
                                          <Plus className="w-3 h-3 text-gray-400" />
                                        )}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="px-3 py-2 text-xs text-gray-400 italic">
                                    No custom playlists
                                  </div>
                                )}
                                {activeTab === "playlist" && activePlaylistId && (
                                  <div className="border-t border-gray-100 mt-1">
                                    <button
                                      onClick={() => {
                                        removeSongFromPlaylist(activePlaylistId, song.id);
                                        setActiveMenuSongId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 text-left font-medium"
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
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 flex items-center justify-center"
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
          <div className="p-12 text-center text-gray-400">
            <Music className="w-8 h-8 mx-auto text-gray-300 mb-3" />
            <span className="font-medium block text-gray-500">No songs found</span>
            <span className="text-xs block mt-1">
              Try adjusting your search query, genre filter, or playlist.
            </span>
          </div>
        )}
      </div>

      {/* CREATE PLAYLIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-semibold text-gray-800 text-sm">Create New Playlist</span>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Focus Session, Pop Vibes"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 text-gray-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-250 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50"
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
    </>
  );
}
