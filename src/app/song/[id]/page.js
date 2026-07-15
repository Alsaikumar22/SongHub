"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAudio } from "../../context/audio-context";
import {
  ArrowLeft,
  Play,
  Pause,
  Heart,
  Plus,
  Music,
  Disc,
  Calendar,
  Layers,
  Activity,
  BarChart,
  ChevronRight,
  Sparkles,
  ListMusic
} from "lucide-react";

export default function SongPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    favorites,
    toggleFavorite,
    playlists,
    addSongToPlaylist,
    removeSongFromPlaylist
  } = useAudio();

  const [song, setSong] = useState(null);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);

  useEffect(() => {
    // Find the song details
    const foundSong = songs.find(s => s.id === id);
    if (foundSong) {
      setSong(foundSong);
    }
  }, [id, songs]);

  if (!song) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Music className="w-12 h-12 text-gray-300 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-700">Finding song...</h2>
        <Link href="/" className="mt-4 text-sm text-indigo-600 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const isCurrentSong = currentSong?.id === song.id;
  const isFavorited = favorites.includes(song.id);

  // Filter out the current song from recommended/up next list
  const getUpNext = () => {
    return songs.filter(s => s.id !== song.id).slice(0, 4);
  };

  const upNextList = getUpNext();

  // Generate random heights for static bars when not playing
  const visualizerBars = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    staticHeight: `${15 + (i * 7) % 50}%`,
    delay: `${(i * 0.04).toFixed(2)}s`,
    duration: `${(0.6 + (i * 0.15) % 0.8).toFixed(2)}s`
  }));

  const handlePlayClick = () => {
    playSong(song);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <span className="text-xs text-gray-400 font-medium">
            Now Playing Detail
          </span>
        </div>

        {/* Hero Section Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-stretch relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Left: Artwork Container */}
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-md border border-gray-150 relative group shrink-0">
            <img
              src={song.coverUrl}
              alt={song.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay Play Indicator */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handlePlayClick}
                className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 cursor-pointer"
              >
                {isCurrentSong && isPlaying ? (
                  <Pause className="w-5 h-5 text-gray-800 fill-current" />
                ) : (
                  <Play className="w-5 h-5 text-gray-800 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Right: Metadata and Visualizer */}
          <div className="flex-1 flex flex-col justify-between w-full min-w-0">
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight truncate">
                      {song.title}
                    </h1>
                    <span className="text-sm md:text-base font-medium text-gray-500 block truncate mt-1">
                      {song.artist}
                    </span>
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={() => toggleFavorite(song.id)}
                    className={`w-10 h-10 border rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95 hover:bg-gray-50 ${
                      isFavorited ? "bg-red-50/20 border-red-200" : "bg-white border-gray-200"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Grid of quick song stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                <div className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Album</span>
                    <span className="text-xs font-semibold text-gray-700 block truncate">{song.album}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Year</span>
                    <span className="text-xs font-semibold text-gray-700 block">{song.releaseYear}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Genre</span>
                    <span className="text-xs font-semibold text-gray-700 block">{song.genre}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">BPM</span>
                    <span className="text-xs font-semibold text-gray-700 block">{song.bpm}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Animated Visualizer */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Interactive Audio Stream
                </span>
                <span className="text-gray-400 text-[11px]">
                  {isCurrentSong && isPlaying ? "Active Playback Visualizer" : "Paused"}
                </span>
              </div>
              <div className="h-14 bg-gray-900 rounded-xl flex items-end justify-center gap-[3px] px-4 py-2 border border-gray-800 shadow-inner">
                {visualizerBars.map(bar => (
                  <div
                    key={bar.id}
                    className="w-1.5 bg-indigo-400/90 rounded-full origin-bottom"
                    style={{
                      height: isCurrentSong && isPlaying ? "35%" : bar.staticHeight,
                      animationDelay: bar.delay,
                      animationDuration: bar.duration,
                      animationName: isCurrentSong && isPlaying ? "bounce-bar" : "none",
                      animationIterationCount: "infinite",
                      animationTimingFunction: "ease-in-out"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Large Play and Add buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={handlePlayClick}
                className={`flex-1 min-w-[140px] h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-98 transition-all shadow-sm ${
                  isCurrentSong && isPlaying
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                {isCurrentSong && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Track</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play Track</span>
                  </>
                )}
              </button>

              <div className="relative flex-1 min-w-[140px]">
                <button
                  onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                  className="w-full h-11 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 active:scale-98 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                  <span>Add to Playlist</span>
                </button>

                {showPlaylistDropdown && (
                  <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-250 rounded-xl shadow-lg py-1 z-30 max-h-48 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      Select Playlist
                    </div>
                    {playlists.length > 0 ? (
                      playlists.map(list => {
                        const isInPlaylist = list.songIds.includes(song.id);
                        return (
                          <button
                            key={list.id}
                            onClick={() => {
                              if (isInPlaylist) {
                                removeSongFromPlaylist(list.id, song.id);
                              } else {
                                addSongToPlaylist(list.id, song.id);
                              }
                              setShowPlaylistDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 text-left flex items-center justify-between"
                          >
                            <span className="truncate">{list.name}</span>
                            {isInPlaylist ? (
                              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded font-semibold border border-indigo-100">
                                Added
                              </span>
                            ) : (
                              <Plus className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-xs text-gray-400 italic text-center">
                        No custom playlists
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lyrics & Next Up Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lyrics column */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm md:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Lyrics / Sync Script
            </h3>
            <div className="h-64 overflow-y-auto pr-2 text-sm text-gray-600 space-y-4 leading-relaxed font-mono text-center md:text-left bg-gray-50/50 p-4 rounded-xl border border-gray-150 scrollbar-thin scrollbar-thumb-gray-200">
              {song.lyrics ? (
                song.lyrics.split("\n").map((line, idx) => (
                  <p key={idx} className="transition-colors hover:text-gray-900">
                    {line}
                  </p>
                ))
              ) : (
                <p className="italic text-gray-400 text-center pt-24">
                  Lyrics are not available for this track.
                </p>
              )}
            </div>
          </div>

          {/* Up Next column */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Up Next / Suggestions
              </h3>
            </div>
            <div className="flex-1 space-y-3">
              {upNextList.map(item => (
                <div
                  key={item.id}
                  onClick={() => playSong(item)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg cursor-pointer transition-all duration-200"
                >
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-10 h-10 object-cover rounded border border-gray-150"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-xs text-gray-800 block truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate">
                      {item.artist}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    {currentSong?.id === item.id && isPlaying ? (
                      <Pause className="w-3.5 h-3.5 text-gray-700 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-gray-400 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
