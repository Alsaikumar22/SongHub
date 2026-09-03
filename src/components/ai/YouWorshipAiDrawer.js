"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Play,
  Pause,
  Plus,
  Heart,
  FileText,
  Clock,
  Music2,
  CalendarDays,
  ListMusic,
  Check,
  Bot,
  RotateCcw,
  BookOpen,
  Compass,
} from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useAuth } from "@/context/auth-context";
import SongArtwork from "@/components/ui/SongArtwork";
import Link from "next/link";
import Image from "next/image";
import ProtectedAction from "@/components/auth/ProtectedAction";

export default function YouWorshipAiDrawer({ isOpen, onClose }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    addToQueue,
    setAddToPlaylistSong,
    createPlaylist,
    addSongToPlaylist,
    toggleFavorite,
    favorites,
  } = useAudio();
  const { user } = useAuth();

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingPlaylistId, setSavingPlaylistId] = useState(null);
  const [savedPlaylistSuccess, setSavedPlaylistSuccess] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const QUICK_PROMPTS = [
    {
      id: "prayer",
      icon: Music2,
      chipClass:
        "bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 group-hover:border-amber-400/40",
      label: "Peaceful Prayer Songs",
      description: "Quiet worship for prayer & meditation",
      prompt: "Find peaceful worship songs for prayer",
    },
    {
      id: "sunday",
      icon: ListMusic,
      chipClass:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/40",
      label: "30-Min Sunday Playlist",
      description: "Build a timed service worship set",
      prompt: "Create a 30-minute Sunday morning worship playlist",
    },
    {
      id: "lyrics",
      icon: BookOpen,
      chipClass:
        "bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-500/20 group-hover:border-sky-400/40",
      label: "Find by Lyrics",
      description: "Search catalog by remembered lyrics",
      prompt: "Find song with lyrics: పరిశుద్ధుడా",
    },
    {
      id: "service",
      icon: CalendarDays,
      chipClass:
        "bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:border-purple-400/40",
      label: "Plan 45-Min Service",
      description: "Structured service order with songs",
      prompt: "Plan a 45-minute Sunday worship service order in Telugu",
    },
  ];

  const SUGGESTED_CHIPS = [
    { label: "Telugu communion songs", prompt: "Telugu communion songs" },
    { label: "High praise & thanksgiving", prompt: "High praise & thanksgiving" },
    { label: "Songs by Hosanna Ministries", prompt: "Songs by Hosanna Ministries" },
    { label: "15-min morning worship", prompt: "Short 15-minute morning worship" },
  ];

  const msgIdCounter = useRef(0);

  const handleSend = async (userPrompt) => {
    const textToSend = (userPrompt || inputQuery).trim();
    if (!textToSend || loading) return;

    msgIdCounter.current += 1;
    const currentId = msgIdCounter.current;

    // Append user message
    const userMsg = {
      id: `user_${currentId}`,
      sender: "user",
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend }),
      });

      const data = await res.json();

      const aiMsg = {
        id: `ai_${currentId}`,
        sender: "ai",
        text: data.reply || "Here is what I found for you:",
        type: data.type || "chat",
        data: data.data,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${currentId}`,
          sender: "ai",
          text: "I encountered an issue connecting to the assistant. Please try again.",
          type: "chat",
          data: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorship = (songsList) => {
    if (!songsList || songsList.length === 0) return;
    playSong(songsList[0], null, null, songsList);
  };

  const handleSavePlaylist = async (playlistData, messageId) => {
    if (!playlistData || !playlistData.songs || playlistData.songs.length === 0)
      return;

    setSavingPlaylistId(messageId);
    try {
      const title = playlistData.title || "AI Worship Playlist";
      const desc = playlistData.description || "Generated with YouWorship AI";

      const created = await createPlaylist(title, desc);
      if (created && created.id) {
        // Add all songs to the playlist
        for (const s of playlistData.songs) {
          await addSongToPlaylist(created.id, s.id);
        }
        setSavedPlaylistSuccess((prev) => ({
          ...prev,
          [messageId]: created.name || title,
        }));
      }
    } catch (err) {
      console.error("Failed to save AI playlist:", err);
      alert("Failed to save playlist. Please make sure you are signed in.");
    } finally {
      setSavingPlaylistId(null);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setSavedPlaylistSuccess({});
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex justify-end select-none">
        {/* Backdrop Scrim */}
        <motion.div
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative z-10 w-full md:w-[480px] h-full max-md:max-h-[90vh] max-md:mt-auto max-md:rounded-t-3xl bg-card/95 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-line/60 shadow-2xl flex flex-col overflow-hidden text-title"
        >
          {/* Mobile Handle Bar */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-line" />
          </div>

          {/* Header */}
          <div className="px-5 py-4 border-b border-line/60 flex items-center justify-between shrink-0 bg-card/60 backdrop-blur-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-md border border-line shrink-0 p-1">
                <Image
                  src="/youworship-logo.png"
                  alt="YouWorship Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-title tracking-tight truncate">
                  YouWorship AI
                </h2>
                <p className="text-[11px] text-muted truncate mt-0.5 font-normal">
                  Worship songs, playlists, lyrics & service orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="p-2 rounded-xl text-muted hover:text-title hover:bg-card-hover transition-colors cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-card-hover hover:bg-line text-muted hover:text-title flex items-center justify-center transition-colors cursor-pointer"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-5 space-y-4">
            {/* Initial Welcome & Quick Prompts if no messages */}
            {messages.length === 0 && (
              <div className="space-y-4 py-1">
                {/* Welcome Card */}
                <div className="p-4 rounded-2xl bg-card border border-line/80 shadow-md relative overflow-hidden space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[#D4A32A] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-title block">
                        Welcome to YouWorship AI
                      </span>
                      <span className="text-[10px] text-muted block">
                        Your intelligent catalog assistant
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-copy/90 leading-relaxed font-normal">
                    Search and discover worship songs from our verified catalog. Ask to find songs by mood, generate timed playlists, search remembered lyrics, or plan full services.
                  </p>
                </div>

                {/* Quick Prompts Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-dim uppercase tracking-wider">
                      Quick Starter Actions
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {QUICK_PROMPTS.map((qp) => {
                      const IconComp = qp.icon;
                      return (
                        <button
                          key={qp.id}
                          onClick={() => handleSend(qp.prompt)}
                          className="group p-3.5 text-left rounded-2xl bg-card hover:bg-card-hover border border-line hover:border-[#D4A32A]/40 transition-all text-xs font-semibold text-title flex items-start gap-3 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${qp.chipClass}`}
                          >
                            <IconComp className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block font-bold text-title group-hover:text-[#D4A32A] transition-colors leading-tight truncate">
                              {qp.label}
                            </span>
                            <span className="text-[11px] text-muted block truncate mt-1 leading-normal font-normal">
                              {qp.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Suggestions Section */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-1.5 px-1 text-[10px] font-bold text-dim uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5 text-[#D4A32A]" />
                    <span>Popular Ideas to Try</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_CHIPS.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleSend(chip.prompt)}
                        className="px-3 py-1.5 rounded-full bg-card hover:bg-card-hover border border-line hover:border-[#D4A32A]/40 text-[11px] font-medium text-muted hover:text-title transition-all cursor-pointer active:scale-95 shadow-xs"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message History */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                } space-y-2`}
              >
                {/* Text Bubble */}
                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#D4A32A] text-black font-semibold rounded-br-none shadow-md"
                      : "bg-card border border-line text-copy rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Rich Grounded Data Cards (AI responses only) */}
                {msg.sender === "ai" && msg.data && (
                  <div className="w-full space-y-3 mt-1">
                    {/* 1. Song Results Cards */}
                    {msg.type === "song_results" && msg.data.songs && (
                      <div className="space-y-1.5">
                        {msg.data.songs.map((song) => {
                          const isCurrent = currentSong?.id === song.id;
                          const isPlayingThis = isCurrent && isPlaying;

                          return (
                            <div
                              key={song.id}
                              className="group flex items-center justify-between p-2.5 rounded-2xl bg-card border border-line hover:border-line/80 shadow-sm"
                            >
                              <div
                                onClick={() => playSong(song)}
                                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                              >
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-line shrink-0 bg-card-hover">
                                  <SongArtwork
                                    song={song}
                                    className="w-full h-full object-cover"
                                    iconSize="w-4 h-4"
                                  />
                                </div>
                                <div className="min-w-0 flex-1 pr-2">
                                  <span
                                    className={`text-xs font-bold block truncate ${
                                      isCurrent
                                        ? "text-[#D4A32A]"
                                        : "text-title"
                                    }`}
                                  >
                                    {song.title || song.teluguTitle}
                                  </span>
                                  <span className="text-[10px] text-muted block truncate mt-0.5">
                                    {typeof song.artist === "object"
                                      ? song.artist?.name
                                      : song.artist || "Unknown Artist"}{" "}
                                    • {song.duration || "4:00"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => playSong(song)}
                                  className="w-8 h-8 rounded-full bg-[#D4A32A] hover:bg-[#c49527] text-black flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-sm"
                                  title="Play song"
                                >
                                  {isPlayingThis ? (
                                    <Pause className="w-3.5 h-3.5 fill-current text-black" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-black" />
                                  )}
                                </button>
                                <button
                                  onClick={() => addToQueue(song)}
                                  className="p-2 rounded-xl text-muted hover:text-title hover:bg-card-hover transition-colors cursor-pointer"
                                  title="Add to queue"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 2. Playlist Draft Card */}
                    {msg.type === "playlist_draft" && msg.data && (
                      <div className="p-4 rounded-3xl bg-card border border-[#D4A32A]/35 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-line/60 pb-3">
                          <div>
                            <h3 className="text-sm font-black text-title">
                              {msg.data.title}
                            </h3>
                            <p className="text-[11px] text-muted mt-0.5">
                              {msg.data.songCount} songs • Total:{" "}
                              <span className="font-bold text-[#D4A32A]">
                                {msg.data.totalDurationFormatted}
                              </span>
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-[#D4A32A]/15 border border-[#D4A32A]/30 flex items-center justify-center text-[#D4A32A]">
                            <ListMusic className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Song Tracklist */}
                        <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
                          {msg.data.songs.map((song, idx) => (
                            <div
                              key={song.id || idx}
                              onClick={() =>
                                playSong(song, null, null, msg.data.songs)
                              }
                              className="flex items-center justify-between p-2 rounded-xl bg-card-hover/40 hover:bg-card-hover cursor-pointer transition-colors text-xs font-semibold"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="w-4 text-center text-[10px] font-bold text-dim">
                                  {idx + 1}
                                </span>
                                <span className="text-title truncate">
                                  {song.title || song.teluguTitle}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted shrink-0 tabular-nums">
                                {song.duration || "4:00"}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Playlist Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleStartWorship(msg.data.songs)}
                            className="flex-1 py-2.5 rounded-2xl bg-[#D4A32A] hover:bg-[#c49527] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Worship</span>
                          </button>

                          <ProtectedAction action="save_ai_playlist">
                            <button
                              onClick={() =>
                                handleSavePlaylist(msg.data, msg.id)
                              }
                              disabled={
                                savingPlaylistId === msg.id ||
                                !!savedPlaylistSuccess[msg.id]
                              }
                              className="px-4 py-2.5 rounded-2xl bg-card-hover hover:bg-line border border-line text-title font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {savedPlaylistSuccess[msg.id] ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                                  <span className="text-emerald-400">Saved</span>
                                </>
                              ) : savingPlaylistId === msg.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <span>Save</span>
                              )}
                            </button>
                          </ProtectedAction>
                        </div>
                      </div>
                    )}

                    {/* 3. Worship Service Plan Card */}
                    {msg.type === "worship_plan" && msg.data && (
                      <div className="p-4 rounded-3xl bg-card border border-line/60 shadow-xl space-y-4">
                        <div className="border-b border-line/60 pb-3">
                          <h3 className="text-sm font-black text-title">
                            {msg.data.title}
                          </h3>
                          <p className="text-[11px] text-muted mt-0.5">
                            Occasion: {msg.data.occasion} • Total:{" "}
                            <span className="font-bold text-[#D4A32A]">
                              {msg.data.totalDurationFormatted}
                            </span>
                          </p>
                        </div>

                        {/* Stages list */}
                        <div className="space-y-2">
                          {msg.data.stages.map((stageItem, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-2xl bg-card-hover/40 border border-line/40 space-y-1"
                            >
                              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#D4A32A]">
                                <span>{stageItem.stage}</span>
                                <span className="text-dim tabular-nums">
                                  {stageItem.duration}
                                </span>
                              </div>
                              <div
                                onClick={() => playSong(stageItem.song)}
                                className="flex items-center justify-between cursor-pointer hover:text-[#D4A32A] transition-colors"
                              >
                                <span className="text-xs font-bold text-title block truncate">
                                  {stageItem.song?.title ||
                                    stageItem.song?.teluguTitle}
                                </span>
                                <Play className="w-3 h-3 fill-current shrink-0 ml-2" />
                              </div>
                              <p className="text-[10px] text-muted italic">
                                {stageItem.purpose}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Worship Plan Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleStartWorship(msg.data.allSongs)}
                            className="flex-1 py-2.5 rounded-2xl bg-[#D4A32A] hover:bg-[#c49527] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Worship Set</span>
                          </button>

                          <ProtectedAction action="save_worship_plan">
                            <button
                              onClick={() =>
                                handleSavePlaylist(
                                  {
                                    title: msg.data.title,
                                    description: `Worship service plan for ${msg.data.occasion}`,
                                    songs: msg.data.allSongs,
                                  },
                                  msg.id,
                                )
                              }
                              disabled={
                                savingPlaylistId === msg.id ||
                                !!savedPlaylistSuccess[msg.id]
                              }
                              className="px-4 py-2.5 rounded-2xl bg-card-hover hover:bg-line border border-line text-title font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {savedPlaylistSuccess[msg.id] ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                                  <span className="text-emerald-400">Saved</span>
                                </>
                              ) : savingPlaylistId === msg.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <span>Save Playlist</span>
                              )}
                            </button>
                          </ProtectedAction>
                        </div>
                      </div>
                    )}

                    {/* 4. Lyrics Match Cards */}
                    {msg.type === "lyrics_results" && msg.data?.matches && (
                      <div className="space-y-2">
                        {msg.data.matches.map((item, mIdx) => (
                          <div
                            key={item.song.id || mIdx}
                            className="p-3 rounded-2xl bg-card border border-line hover:border-line/80 space-y-2 shadow-sm"
                          >
                            <div className="p-2 rounded-xl bg-card-hover/80 border border-line/30">
                              <span className="text-[10px] text-dim block font-bold uppercase tracking-wider mb-0.5">
                                Matched Lyric Line:
                              </span>
                              <p className="text-xs font-semibold text-[#D4A32A] italic">
                                &ldquo;{item.matchedLine}&rdquo;
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div
                                onClick={() => playSong(item.song)}
                                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                              >
                                <div className="w-9 h-9 rounded-xl overflow-hidden border border-line shrink-0 bg-card-hover">
                                  <SongArtwork
                                    song={item.song}
                                    className="w-full h-full object-cover"
                                    iconSize="w-4 h-4"
                                  />
                                </div>
                                <div className="min-w-0 flex-1 pr-1">
                                  <span className="text-xs font-bold text-title block truncate">
                                    {item.song.title || item.song.teluguTitle}
                                  </span>
                                  <span className="text-[10px] text-muted block truncate">
                                    {typeof item.song.artist === "object"
                                      ? item.song.artist?.name
                                      : item.song.artist || "Unknown Artist"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => playSong(item.song)}
                                  className="w-7 h-7 rounded-full bg-[#D4A32A] hover:bg-[#c49527] text-black flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                                  title="Play song"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                </button>
                                <Link
                                  href={`/song/${encodeURIComponent(item.song.slug || item.song.id)}?view=lyrics`}
                                  onClick={onClose}
                                  className="p-1.5 rounded-xl text-muted hover:text-title hover:bg-card-hover transition-colors"
                                  title="View full lyrics"
                                >
                                  <FileText className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-card border border-line w-fit">
                <Loader2 className="w-4 h-4 text-[#D4A32A] animate-spin" />
                <span className="text-xs font-semibold text-muted">
                  Searching song catalog...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3.5 md:p-4 border-t border-line/60 bg-card/85 backdrop-blur-xl shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center gap-2 bg-input/90 backdrop-blur-md border border-line/80 focus-within:border-[#D4A32A] focus-within:shadow-[0_0_20px_rgba(212,163,42,0.15)] rounded-full p-1.5 pl-4 transition-all duration-200"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask YouWorship AI (e.g. 30-min prayer playlist)..."
                className="flex-1 bg-transparent text-xs text-title placeholder:text-muted/60 border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none ring-0 appearance-none shadow-none"
                style={{ outline: "none", border: "none", boxShadow: "none" }}
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-[#D4A32A] hover:brightness-110 text-black flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-muted/60 font-medium">
                YouWorship song catalog • Verified songs only
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
