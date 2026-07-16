"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAudio } from "./context/audio-context";
import { useSearch } from "./context/search-context";
import SongsSection from "./components/home/SongsSection";
import SongCard from "./components/home/SongCard";
import HeroCarousel from "./components/home/HeroCarousel";
import VerseOfTheWeek from "./components/home/VerseOfTheWeek";
import RecentlyPlayed from "./components/home/RecentlyPlayed";
import CategoryExplorer from "./components/categories/CategoryExplorer";

import {
  TrendingUp,
  FolderHeart,
  ListMusic,
  Clock
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
  } = useAudio();

  const { searchQuery } = useSearch();

  const [selectedLetter, setSelectedLetter] = useState(null);

  useEffect(() => {
    setSelectedLetter(null);
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
    if (trimmedQuery) {
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

  return (
    <div className="flex-1 overflow-y-auto space-y-8 p-4">
      {/* MOBILE NAV */}
      <div className="md:hidden flex flex-wrap gap-2 pb-2 border-b border-line/80">
        {["discover", "favorites"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setActivePlaylistId(null);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              activeTab === tab
                ? "bg-title text-card"
                : "bg-card-hover border border-line text-muted hover:text-white"
            }`}
          >
            {tab === "discover" ? "Browse" : `Favorites (${favorites.length})`}
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
                ? "bg-title text-card"
                : "bg-card-hover border border-line text-muted hover:text-white"
            }`}
          >
            {list.name}
          </button>
        ))}
      </div>

      {/* Box 1 — Hero Banner & Box 2 — Verse Card */}
      {activeTab === "discover" && !searchQuery && !selectedLetter && (
        <>
          {/* Box 1 — Hero Banner */}
          <HeroCarousel />

          {/* Box 2 — Verse Card */}
          <VerseOfTheWeek />
        </>
      )}

      {/* Category Explorer View */}
      {activeTab === "categories" && !searchQuery && (
        <CategoryExplorer />
      )}

      {/* VIEW HEADER */}
      {(!activeTab || activeTab !== "discover" || searchQuery) && !selectedLetter && activeTab !== "categories" && (
        <div>
          {activeTab === "discover" && searchQuery && (
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-muted" />
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

      {/* Box 3 — Recently Played */}
      {activeTab === "discover" && !searchQuery && !selectedLetter && (
        <RecentlyPlayed />
      )}

      {/* Songs Section */}
      {(activeTab !== "categories" || searchQuery) && (
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
  );
}
