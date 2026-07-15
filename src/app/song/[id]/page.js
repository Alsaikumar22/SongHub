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
  Share2,
  Sparkles,
  ListMusic,
  Check
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
  const [activeTab, setActiveTab] = useState("lyrics"); // lyrics | video | about
  const [selectedLanguage, setSelectedLanguage] = useState("తెలుగు"); // తెలుగు | English | Line by Line
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareNotification, setShareNotification] = useState(false);

  useEffect(() => {
    // Find the song details
    const foundSong = songs.find(s => s.id === id);
    if (foundSong) {
      setSong(foundSong);
    }
  }, [id, songs]);

  if (!song) {
    return (
      <div className="min-h-screen bg-[#0B0F18] flex flex-col items-center justify-center p-6 text-center">
        <Music className="w-12 h-12 text-[#D4A32A] mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white">Finding song...</h2>
        <Link href="/" className="mt-4 text-sm text-[#D4A32A] hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const isCurrentSong = currentSong?.id === song.id;
  const isFavorited = favorites.includes(song.id);

  const handlePlayClick = () => {
    playSong(song);
  };

  const handleShareClick = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShareNotification(true);
      setTimeout(() => setShareNotification(false), 2000);
    }
  };

  const renderLyrics = () => {
    if (song.lyricsTelugu && song.lyricsEnglish) {
      if (selectedLanguage === "తెలుగు") {
        return (
          <div className="space-y-4 text-center md:text-left transition-all duration-300">
            {song.lyricsTelugu.map((line, idx) => (
              <p key={idx} className="text-white text-[22px] font-semibold leading-[1.9] transition-all hover:text-[#D4A32A]">
                {line}
              </p>
            ))}
          </div>
        );
      } else if (selectedLanguage === "English") {
        return (
          <div className="space-y-4 text-center md:text-left transition-all duration-300">
            {song.lyricsEnglish.map((line, idx) => (
              <p key={idx} className="text-[#B8BEC9] text-[22px] font-semibold leading-[1.9] transition-all hover:text-[#D4A32A]">
                {line}
              </p>
            ))}
          </div>
        );
      } else {
        // Line by Line (row-aligned table/grid)
        return (
          <div className="space-y-4 w-full transition-all duration-300">
            {song.lyricsTelugu.map((line, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-8 py-3 border-b border-[rgba(212,163,42,0.06)] hover:bg-[#121826]/40 px-4 rounded-xl transition-all">
                <div className="text-right text-white text-[22px] font-semibold leading-[1.9] pr-4">{line}</div>
                <div className="text-left text-[#B8BEC9] text-[22px] font-semibold leading-[1.9] pl-4">{song.lyricsEnglish[idx]}</div>
              </div>
            ))}
          </div>
        );
      }
    } else {
      // Fallback for standard mock songs
      const lines = song.lyrics ? song.lyrics.split("\n") : ["Lyrics are not available for this track."];
      return (
        <div className="space-y-4 text-center md:text-left transition-all duration-300">
          {lines.map((line, idx) => (
            <p key={idx} className="text-white text-[22px] font-semibold leading-[1.9] transition-all hover:text-[#D4A32A]">
              {line.replace(/\[\d{2}:\d{2}\]/g, "").trim()}
            </p>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F18] py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#121826] border border-[rgba(212,163,42,0.18)] hover:border-[#D4A32A] rounded-xl text-xs font-semibold text-[#B8BEC9] hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <span className="text-xs text-[#B8BEC9] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A32A]" />
            Now Playing Detail
          </span>
        </div>

        {/* Hero Section Card */}
        <div className="bg-[#121826] border border-[rgba(212,163,42,0.18)] rounded-[28px] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden shadow-xl">
          {/* Subtle cover background glow */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-15 pointer-events-none"
            style={{ backgroundImage: `url(${song.coverUrl})` }}
          />

          {/* Left: Artwork Container */}
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl border border-[rgba(212,163,42,0.18)] relative group shrink-0 z-10">
            <img
              src={song.coverUrl}
              alt={song.title}
              className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
            />
            {/* Overlay Play Indicator */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handlePlayClick}
                className="w-14 h-14 rounded-full bg-[#D4A32A] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 cursor-pointer"
              >
                {isCurrentSong && isPlaying ? (
                  <Pause className="w-6 h-6 text-black fill-current" />
                ) : (
                  <Play className="w-6 h-6 text-black fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Right: Metadata and Actions */}
          <div className="flex-1 flex flex-col justify-between w-full min-w-0 z-10">
            <div className="space-y-4">
              <div>
                <h1 className="text-white font-extrabold tracking-tight leading-tight mb-2 text-[52px] truncate">
                  {song.title}
                </h1>
                <span className="text-[#B8BEC9] text-base font-semibold block truncate mt-1">
                  {song.artist}
                </span>
              </div>
            </div>

            {/* Banner Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={handlePlayClick}
                className="px-6 h-11 bg-gradient-to-r from-[#D4A32A] to-[#F39C12] text-black font-bold rounded-full hover:shadow-[0_0_15px_rgba(212,163,42,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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

              <button
                onClick={() => toggleFavorite(song.id)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isFavorited
                    ? "bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    : "bg-transparent border-[rgba(212,163,42,0.18)] text-[#B8BEC9] hover:text-white"
                }`}
                title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
              </button>

              <button
                onClick={handleShareClick}
                className="w-11 h-11 rounded-full border border-[rgba(212,163,42,0.18)] text-[#B8BEC9] hover:text-white hover:bg-white/5 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Share Song Link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Playlist dropdown wrapper */}
              <div className="relative">
                <button
                  onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                  className="h-11 px-5 border border-[rgba(212,163,42,0.18)] hover:border-[#D4A32A] bg-transparent hover:bg-white/5 rounded-full flex items-center gap-2 text-sm font-semibold text-[#B8BEC9] hover:text-white active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Playlist</span>
                </button>

                {showPlaylistDropdown && (
                  <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#121826] border border-[rgba(212,163,42,0.18)] rounded-2xl shadow-xl py-1.5 z-30 max-h-48 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-[#B8BEC9] uppercase tracking-wider border-b border-white/5">
                      Select Playlist
                    </div>
                    {playlists.length > 0 ? (
                      playlists.map((list) => {
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
                            className="w-full px-3 py-2 text-xs text-white hover:bg-white/5 text-left flex items-center justify-between"
                          >
                            <span className="truncate">{list.name}</span>
                            {isInPlaylist ? (
                              <span className="text-[10px] bg-[#D4A32A]/25 text-[#D4A32A] px-1.5 py-0.2 rounded font-semibold border border-[#D4A32A]/40 flex-shrink-0">
                                Added
                              </span>
                            ) : (
                              <Plus className="w-3.5 h-3.5 text-[#B8BEC9]" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-xs text-[#B8BEC9] italic text-center">
                        No custom playlists
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Only Lyrics | Video | About) */}
        <div className="flex border-b border-[rgba(212,163,42,0.18)] gap-8 mt-8">
          {["lyrics", "video", "about"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-xs font-bold tracking-widest uppercase transition-all relative cursor-pointer ${
                  isActive ? "text-[#D4A32A]" : "text-[#B8BEC9] hover:text-white"
                }`}
              >
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4A32A]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="pt-2">
          {activeTab === "lyrics" && (
            <div className="space-y-6">
              {/* Lyrics Header & Language Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Song Lyrics
                </h3>

                {/* Segmented language control (Height 48px, background #151B28) */}
                {song.lyricsTelugu && song.lyricsEnglish && (
                  <div className="flex h-12 bg-[#151B28] border border-[rgba(212,163,42,0.18)] rounded-full p-1 shadow-md w-fit">
                    {["తెలుగు", "English", "Line by Line"].map((lang) => {
                      const isSelected = selectedLanguage === lang;
                      return (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`h-full px-5 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "bg-[#D4A32A] text-black shadow-[0_0_10px_rgba(212,163,42,0.3)]"
                              : "bg-transparent text-[#B8BEC9] hover:text-white hover:shadow-[0_0_5px_rgba(212,163,42,0.1)]"
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Lyrics Content Container (Height expandable/collapsible, shows first 8 lines initially) */}
              <div className="relative">
                <div
                  className="transition-[max-height] duration-700 ease-in-out overflow-hidden relative"
                  style={{ maxHeight: isExpanded ? "2500px" : "360px" }}
                >
                  {renderLyrics()}
                  
                  {/* Bottom fade mask when collapsed */}
                  {!isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0B0F18] to-transparent pointer-events-none z-10" />
                  )}
                </div>

                {/* Expand / Collapse Control Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#121826] border border-[rgba(212,163,42,0.18)] hover:border-[#D4A32A] text-[#D4A32A] hover:text-white rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer shadow-md"
                  >
                    {isExpanded ? "▲ Show Less" : "▼ Show Full Lyrics"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "video" && (
            <div className="space-y-4">
              {song.id === "adavi-chetla-naduma" ? (
                <div className="w-full aspect-video rounded-3xl overflow-hidden border border-[rgba(212,163,42,0.18)] bg-[#121826] shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/gLgT9dMvF9M"
                    title="Adavi Chetla Naduma Worship Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-3xl overflow-hidden border border-[rgba(212,163,42,0.18)] bg-[#121826] flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-[#D4A32A]/10 border border-[#D4A32A]/30 flex items-center justify-center text-[#D4A32A]">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Cinematic Visualizer Stream</h4>
                  <p className="text-sm text-[#B8BEC9] max-w-md">Video stream is currently loading. Enjoy the premium high-fidelity background visualizer of this track.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="bg-[#121826] border border-[rgba(212,163,42,0.18)] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
                About The Song
              </h3>
              
              <div className="space-y-4 text-sm text-[#B8BEC9] leading-relaxed">
                {song.id === "adavi-chetla-naduma" ? (
                  <p>
                    <strong>O Yaathrikudaa</strong> is an inspiring Christian worship collective bringing high-quality Telugu lyrics paired with modern acoustic and cinematic backdrops. "Adavi Chetla Naduma" speaks of the beautiful presence of Jesus in the middle of a wilderness, comparing Him to a fruitful tree yielding shade and life in the middle of a barren forest.
                  </p>
                ) : (
                  <p>
                    This is a premium high-fidelity track produced by the acclaimed artist <strong>{song.artist}</strong>. Featured on the album <strong>{song.album}</strong>, this song exhibits state of the art soundscapes and deep melodic structures designed for a supreme listening experience.
                  </p>
                )}
              </div>

              {/* Restyled song metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <div className="bg-[#151B28] border border-[rgba(212,163,42,0.08)] p-4 rounded-2xl flex items-center gap-3">
                  <Disc className="w-5 h-5 text-[#D4A32A]" />
                  <div>
                    <span className="text-[10px] font-bold text-[#B8BEC9] block uppercase tracking-wider">Album</span>
                    <span className="text-xs font-semibold text-white block truncate">{song.album}</span>
                  </div>
                </div>

                <div className="bg-[#151B28] border border-[rgba(212,163,42,0.08)] p-4 rounded-2xl flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#D4A32A]" />
                  <div>
                    <span className="text-[10px] font-bold text-[#B8BEC9] block uppercase tracking-wider">Release Year</span>
                    <span className="text-xs font-semibold text-white block truncate">{song.releaseYear}</span>
                  </div>
                </div>

                <div className="bg-[#151B28] border border-[rgba(212,163,42,0.08)] p-4 rounded-2xl flex items-center gap-3">
                  <Layers className="w-5 h-5 text-[#D4A32A]" />
                  <div>
                    <span className="text-[10px] font-bold text-[#B8BEC9] block uppercase tracking-wider">Genre</span>
                    <span className="text-xs font-semibold text-white block truncate">{song.genre}</span>
                  </div>
                </div>

                <div className="bg-[#151B28] border border-[rgba(212,163,42,0.08)] p-4 rounded-2xl flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#D4A32A]" />
                  <div>
                    <span className="text-[10px] font-bold text-[#B8BEC9] block uppercase tracking-wider">BPM</span>
                    <span className="text-xs font-semibold text-white block truncate">{song.bpm}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Toast Notification */}
      {shareNotification && (
        <div className="fixed bottom-24 right-8 bg-[#121826] border border-[#D4A32A] text-[#D4A32A] px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
          <Check className="w-3.5 h-3.5 text-[#D4A32A]" />
          <span>Link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
