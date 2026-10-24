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
  Mic,
  MicOff,
  Volume2,
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
    togglePlay,
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

  // ── Voice Search State ──
  const [voiceSearchState, setVoiceSearchState] = useState("inactive"); // "inactive" | "listening" | "error"
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef(null);
  const isManualCloseRef = useRef(false);

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
    } else {
      // Stop voice if drawer closes
      stopVoiceSearch();
    }
  }, [isOpen]);

  const [feedbackToast, setFeedbackToast] = useState(null);
  const feedbackToastTimerRef = useRef(null);

  const showFeedbackToast = (message) => {
    if (feedbackToastTimerRef.current) clearTimeout(feedbackToastTimerRef.current);
    setFeedbackToast(message);
    feedbackToastTimerRef.current = setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  const isSongActive = (targetSong) => {
    if (!targetSong || !currentSong) return false;
    const targetId = String(targetSong.id || "").normalize("NFC");
    const currentId = String(currentSong.id || "").normalize("NFC");
    const targetSlug = String(targetSong.slug || "").normalize("NFC");
    const currentSlug = String(currentSong.slug || "").normalize("NFC");
    return (
      (targetId && targetId === currentId) ||
      (targetSlug && targetSlug === currentSlug) ||
      (targetId && targetId === currentSlug) ||
      (targetSlug && targetSlug === currentId)
    );
  };

  const isListPlaying = (songsList) => {
    if (!songsList || !currentSong || !isPlaying) return false;
    return songsList.some((s) => isSongActive(s));
  };

  // Toggle play/pause for a given song in context
  const togglePlaySong = (song, contextQueue = null) => {
    if (!song) return;
    const songName = song.title || song.teluguTitle || "Song";
    if (isSongActive(song)) {
      togglePlay();
      if (isPlaying) {
        showFeedbackToast(`Paused: ${songName}`);
      } else {
        showFeedbackToast(`Resumed: ${songName}`);
      }
    } else {
      playSong(song, null, null, contextQueue || [song]);
      showFeedbackToast(`Now Playing: ${songName}`);
    }
  };

  // Start voice recognition
  const startVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.",
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "te-IN"; // Default to Telugu with broad recognition

      isManualCloseRef.current = false;
      setVoiceTranscript("");
      setVoiceSearchState("listening");

      rec.onstart = () => {
        setVoiceSearchState("listening");
      };

      rec.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setVoiceTranscript(currentTranscript);
        if (event.results[0]?.isFinal) {
          const finalResult = event.results[0][0].transcript;
          if (finalResult && finalResult.trim()) {
            setInputQuery(finalResult.trim());
            setVoiceSearchState("inactive");
            setTimeout(() => {
              handleSend(finalResult.trim());
            }, 400);
          }
        }
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (!isManualCloseRef.current) {
          setVoiceSearchState("error");
        }
      };

      rec.onend = () => {
        if (!isManualCloseRef.current && voiceSearchState === "listening") {
          if (voiceTranscript && voiceTranscript.trim()) {
            setInputQuery(voiceTranscript.trim());
            handleSend(voiceTranscript.trim());
          }
          setVoiceSearchState("inactive");
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Speech recognition failed to start:", err);
      setVoiceSearchState("error");
    }
  };

  const stopVoiceSearch = () => {
    isManualCloseRef.current = true;
    try {
      recognitionRef.current?.stop();
    } catch (_) {}
    setVoiceSearchState("inactive");
  };

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

  const handleStartWorship = (songsList, listTitle = "Worship Set") => {
    if (!songsList || songsList.length === 0) return;
    const firstSong = songsList[0];
    playSong(firstSong, null, null, songsList);
    const songName = firstSong.title || firstSong.teluguTitle || "Song";
    showFeedbackToast(`Starting ${listTitle}: "${songName}" (${songsList.length} songs)`);
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
        showFeedbackToast(`Playlist saved: "${title}"`);
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
    setFeedbackToast(null);
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
          <div className="px-5 py-4 border-b border-line/60 flex items-center justify-between shrink-0 bg-card/60 backdrop-blur-xl relative">
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

            {/* Instant Floating Action / Playback Feedback Toast */}
            <AnimatePresence>
              {feedbackToast && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute bottom-0 left-0 right-0 transform translate-y-full z-30 bg-[#D4A32A] text-black px-4 py-2 text-xs font-black shadow-xl flex items-center justify-between gap-2 border-b border-black/10"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-end gap-[1.5px] h-3 shrink-0">
                      <span className="w-1 bg-black rounded-full h-3 animate-music-bar-1" />
                      <span className="w-1 bg-black rounded-full h-2 animate-music-bar-2" />
                      <span className="w-1 bg-black rounded-full h-3 animate-music-bar-3" />
                    </div>
                    <span className="truncate">{feedbackToast}</span>
                  </div>
                  <button
                    onClick={() => setFeedbackToast(null)}
                    className="p-0.5 hover:bg-black/15 rounded-full cursor-pointer text-black shrink-0"
                  >
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
                          const isCurrent = isSongActive(song);
                          const isPlayingThis = isCurrent && isPlaying;

                          return (
                            <div
                              key={song.id}
                              onClick={() => togglePlaySong(song, msg.data.songs)}
                              className={`group flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer shadow-sm active:scale-[0.99] ${
                                isPlayingThis
                                  ? "bg-[#D4A32A]/15 border-[#D4A32A]/60 shadow-[0_0_15px_rgba(212,163,42,0.15)] ring-1 ring-[#D4A32A]/30"
                                  : isCurrent
                                    ? "bg-card-hover/80 border-[#D4A32A]/40"
                                    : "bg-card border-line hover:border-[#D4A32A]/30 hover:bg-card-hover/40"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-line shrink-0 bg-card-hover shadow-xs">
                                  <SongArtwork
                                    song={song}
                                    className="w-full h-full object-cover"
                                    iconSize="w-4 h-4"
                                  />
                                  {isPlayingThis && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center gap-0.5">
                                      <span className="w-1 bg-[#D4A32A] rounded-full h-3.5 animate-music-bar-1" />
                                      <span className="w-1 bg-[#D4A32A] rounded-full h-4.5 animate-music-bar-2" />
                                      <span className="w-1 bg-[#D4A32A] rounded-full h-2.5 animate-music-bar-3" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1 pr-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span
                                      className={`text-xs font-bold block truncate ${
                                        isCurrent
                                          ? "text-[#D4A32A]"
                                          : "text-title"
                                      }`}
                                    >
                                      {song.title || song.teluguTitle}
                                    </span>
                                    {isPlayingThis && (
                                      <span className="px-1.5 py-0.5 bg-[#D4A32A] text-black text-[8px] font-black rounded-sm uppercase tracking-wider shrink-0 animate-pulse">
                                        Playing
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-muted block truncate mt-0.5">
                                    {typeof song.artist === "object"
                                      ? song.artist?.name
                                      : song.artist || "Unknown Artist"}{" "}
                                    • {song.duration || "4:00"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => togglePlaySong(song, msg.data.songs)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm ${
                                    isPlayingThis
                                      ? "bg-[#D4A32A] text-black ring-2 ring-[#D4A32A]/50 shadow-[0_0_12px_rgba(212,163,42,0.4)]"
                                      : "bg-[#D4A32A] hover:bg-[#c49527] text-black hover:scale-105"
                                  }`}
                                  title={isPlayingThis ? "Pause song" : "Play song"}
                                >
                                  {isPlayingThis ? (
                                    <Pause className="w-3.5 h-3.5 fill-current text-black" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-black" />
                                  )}
                                </button>
                                <Link
                                  href={`/song/${encodeURIComponent(song.slug || song.id)}?view=lyrics`}
                                  onClick={onClose}
                                  className="p-1.5 rounded-xl text-muted hover:text-title hover:bg-card-hover transition-colors"
                                  title="View lyrics"
                                >
                                  <FileText className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => {
                                    addToQueue(song);
                                    showFeedbackToast(`Added to queue: "${song.title || song.teluguTitle}"`);
                                  }}
                                  className="p-1.5 rounded-xl text-muted hover:text-title hover:bg-card-hover transition-colors cursor-pointer"
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
                          {msg.data.songs.map((song, idx) => {
                            const isCurrent = isSongActive(song);
                            const isPlayingThis = isCurrent && isPlaying;

                            return (
                              <div
                                key={song.id || idx}
                                onClick={() =>
                                  togglePlaySong(song, msg.data.songs)
                                }
                                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer text-xs font-semibold ${
                                  isPlayingThis
                                    ? "bg-[#D4A32A]/20 border border-[#D4A32A]/50 text-[#D4A32A]"
                                    : isCurrent
                                      ? "bg-card-hover text-[#D4A32A] border border-line"
                                      : "bg-card-hover/40 hover:bg-card-hover border border-transparent"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className="w-5 flex items-center justify-center shrink-0">
                                    {isPlayingThis ? (
                                      <div className="flex items-end gap-[1.5px] h-3">
                                        <span className="w-[2px] bg-[#D4A32A] rounded-full h-3 animate-music-bar-1" />
                                        <span className="w-[2px] bg-[#D4A32A] rounded-full h-2 animate-music-bar-2" />
                                        <span className="w-[2px] bg-[#D4A32A] rounded-full h-2.5 animate-music-bar-3" />
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-bold text-dim">
                                        {idx + 1}
                                      </span>
                                    )}
                                  </div>
                                  <span className={`truncate ${isCurrent ? "text-[#D4A32A] font-bold" : "text-title"}`}>
                                    {song.title || song.teluguTitle}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] text-muted tabular-nums">
                                    {song.duration || "4:00"}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePlaySong(song, msg.data.songs);
                                    }}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                                      isPlayingThis
                                        ? "bg-[#D4A32A] text-black ring-1 ring-[#D4A32A]"
                                        : "bg-card border border-line/60 hover:bg-[#D4A32A] hover:text-black text-muted hover:border-[#D4A32A]"
                                    }`}
                                  >
                                    {isPlayingThis ? (
                                      <Pause className="w-2.5 h-2.5 fill-current text-black" />
                                    ) : (
                                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Playlist Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          {(() => {
                            const isPlaylistPlaying = isListPlaying(msg.data.songs);
                            const isCurrentInList = msg.data.songs?.some((s) => isSongActive(s));

                            return (
                              <button
                                onClick={() => {
                                  if (isPlaylistPlaying) {
                                    togglePlay();
                                    showFeedbackToast("Paused Worship Playlist");
                                  } else if (isCurrentInList && !isPlaying) {
                                    togglePlay();
                                    showFeedbackToast("Resumed Worship Playlist");
                                  } else {
                                    handleStartWorship(msg.data.songs, msg.data.title || "Playlist");
                                  }
                                }}
                                className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition-all duration-200 cursor-pointer ${
                                  isPlaylistPlaying
                                    ? "bg-[#D4A32A] text-black ring-2 ring-[#D4A32A] shadow-[0_0_25px_rgba(212,163,42,0.4)]"
                                    : "bg-[#D4A32A] hover:bg-[#c49527] text-black shadow-md hover:shadow-xl hover:scale-[1.02]"
                                }`}
                              >
                                {isPlaylistPlaying ? (
                                  <>
                                    <Pause className="w-4 h-4 fill-current text-black" />
                                    <span className="tracking-wide">Pause Worship Set</span>
                                    <div className="flex items-end gap-[2px] h-3.5 ml-1">
                                      <span className="w-1 bg-black rounded-full h-3.5 animate-music-bar-1" />
                                      <span className="w-1 bg-black rounded-full h-2 animate-music-bar-2" />
                                      <span className="w-1 bg-black rounded-full h-3 animate-music-bar-3" />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 fill-current ml-0.5 text-black" />
                                    <span className="tracking-wide">Start Worship</span>
                                  </>
                                )}
                              </button>
                            );
                          })()}

                          <ProtectedAction action="save_ai_playlist">
                            <button
                              onClick={() =>
                                handleSavePlaylist(msg.data, msg.id)
                              }
                              disabled={
                                savingPlaylistId === msg.id ||
                                !!savedPlaylistSuccess[msg.id]
                              }
                              className="px-4 py-3 rounded-2xl bg-card-hover hover:bg-line border border-line text-title font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
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
                          {msg.data.stages.map((stageItem, sIdx) => {
                            const isCurrent = isSongActive(stageItem.song);
                            const isPlayingThis = isCurrent && isPlaying;

                            return (
                              <div
                                key={sIdx}
                                onClick={() => stageItem.song && togglePlaySong(stageItem.song, msg.data.allSongs)}
                                className={`p-2.5 rounded-2xl border transition-all cursor-pointer space-y-1 active:scale-[0.99] ${
                                  isPlayingThis
                                    ? "bg-[#D4A32A]/15 border-[#D4A32A]/60 shadow-sm ring-1 ring-[#D4A32A]/30"
                                    : isCurrent
                                      ? "bg-card-hover/80 border-[#D4A32A]/30"
                                      : "bg-card-hover/40 border border-line/40 hover:bg-card-hover/70"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#D4A32A]">
                                  <span>{stageItem.stage}</span>
                                  <div className="flex items-center gap-1.5">
                                    {isPlayingThis && (
                                      <span className="px-1.5 py-0.2 bg-[#D4A32A] text-black text-[8px] font-black rounded-xs animate-pulse">
                                        Playing
                                      </span>
                                    )}
                                    <span className="text-dim tabular-nums">
                                      {stageItem.duration}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-bold block truncate ${isCurrent ? "text-[#D4A32A]" : "text-title"}`}>
                                    {stageItem.song?.title ||
                                      stageItem.song?.teluguTitle}
                                  </span>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-2 ${
                                    isPlayingThis
                                      ? "bg-[#D4A32A] text-black"
                                      : "bg-card border border-line text-muted hover:text-title hover:bg-[#D4A32A] hover:text-black"
                                  }`}>
                                    {isPlayingThis ? (
                                      <Pause className="w-2.5 h-2.5 fill-current text-black" />
                                    ) : (
                                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-[10px] text-muted italic">
                                  {stageItem.purpose}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Worship Plan Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          {(() => {
                            const isPlanPlaying = isListPlaying(msg.data.allSongs);
                            const isCurrentInPlan = msg.data.allSongs?.some((s) => isSongActive(s));

                            return (
                              <button
                                onClick={() => {
                                  if (isPlanPlaying) {
                                    togglePlay();
                                    showFeedbackToast("Paused Worship Set");
                                  } else if (isCurrentInPlan && !isPlaying) {
                                    togglePlay();
                                    showFeedbackToast("Resumed Worship Set");
                                  } else {
                                    handleStartWorship(msg.data.allSongs, msg.data.title || "Worship Set");
                                  }
                                }}
                                className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition-all duration-200 cursor-pointer ${
                                  isPlanPlaying
                                    ? "bg-[#D4A32A] text-black ring-2 ring-[#D4A32A] shadow-[0_0_25px_rgba(212,163,42,0.4)]"
                                    : "bg-[#D4A32A] hover:bg-[#c49527] text-black shadow-md hover:shadow-xl hover:scale-[1.02]"
                                }`}
                              >
                                {isPlanPlaying ? (
                                  <>
                                    <Pause className="w-4 h-4 fill-current text-black" />
                                    <span className="tracking-wide">Pause Worship Set</span>
                                    <div className="flex items-end gap-[2px] h-3.5 ml-1">
                                      <span className="w-1 bg-black rounded-full h-3.5 animate-music-bar-1" />
                                      <span className="w-1 bg-black rounded-full h-2 animate-music-bar-2" />
                                      <span className="w-1 bg-black rounded-full h-3 animate-music-bar-3" />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 fill-current ml-0.5 text-black" />
                                    <span className="tracking-wide">Start Worship Set</span>
                                  </>
                                )}
                              </button>
                            );
                          })()}

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
                              className="px-4 py-3 rounded-2xl bg-card-hover hover:bg-line border border-line text-title font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
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
                        {msg.data.matches.map((item, mIdx) => {
                          const isCurrent = isSongActive(item.song);
                          const isPlayingThis = isCurrent && isPlaying;

                          return (
                            <div
                              key={item.song.id || mIdx}
                              className={`p-3 rounded-2xl border space-y-2 shadow-sm transition-all active:scale-[0.99] ${
                                isPlayingThis
                                  ? "bg-[#D4A32A]/10 border-[#D4A32A]/60 shadow-[0_0_15px_rgba(212,163,42,0.1)] ring-1 ring-[#D4A32A]/30"
                                  : isCurrent
                                    ? "bg-card border-[#D4A32A]/30"
                                    : "bg-card border-line hover:border-line/80"
                              }`}
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
                                  onClick={() => togglePlaySong(item.song)}
                                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                                >
                                  <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-line shrink-0 bg-card-hover">
                                    <SongArtwork
                                      song={item.song}
                                      className="w-full h-full object-cover"
                                      iconSize="w-4 h-4"
                                    />
                                    {isPlayingThis && (
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                                        <span className="w-[2px] bg-[#D4A32A] rounded-full h-2.5 animate-music-bar-1" />
                                        <span className="w-[2px] bg-[#D4A32A] rounded-full h-3.5 animate-music-bar-2" />
                                        <span className="w-[2px] bg-[#D4A32A] rounded-full h-2 animate-music-bar-3" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1 pr-1">
                                    <span className={`text-xs font-bold block truncate ${isCurrent ? "text-[#D4A32A]" : "text-title"}`}>
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
                                    onClick={() => togglePlaySong(item.song)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer ${
                                      isPlayingThis
                                        ? "bg-[#D4A32A] text-black"
                                        : "bg-[#D4A32A] hover:bg-[#c49527] text-black"
                                    }`}
                                    title={isPlayingThis ? "Pause song" : "Play song"}
                                  >
                                    {isPlayingThis ? (
                                      <Pause className="w-3.5 h-3.5 fill-current text-black" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-black" />
                                    )}
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
                          );
                        })}
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

          {/* Bottom Chat Input Bar with Interactive Voice Feedback Popup */}
          <div className="p-3.5 md:p-4 border-t border-line/60 bg-card/85 backdrop-blur-xl shrink-0 relative">
            {/* Interactive Voice Recording / Listening Floating Box */}
            <AnimatePresence>
              {voiceSearchState !== "inactive" && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-3xl bg-card border border-[#D4A32A]/50 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(212,163,42,0.2)] mb-3 relative overflow-hidden backdrop-blur-2xl"
                >
                  {/* Close button */}
                  <button
                    onClick={stopVoiceSearch}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-card-hover text-muted hover:text-title transition-colors cursor-pointer"
                    title="Cancel voice input"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Pulsing Glowing Mic Avatar */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-16 h-16 rounded-full bg-[#D4A32A]/20 animate-ping duration-1000" />
                      <span className="absolute w-14 h-14 rounded-full bg-[#D4A32A]/30 animate-pulse duration-700" />
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-[#D4A32A] text-black flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Mic className="w-6 h-6 fill-current animate-bounce" />
                      </div>
                    </div>

                    {/* Live status & transcript */}
                    <div className="space-y-1 max-w-xs">
                      <h4 className="text-xs font-bold text-title tracking-tight">
                        {voiceSearchState === "listening"
                          ? "Listening to your voice..."
                          : "Couldn't hear clearly. Try again."}
                      </h4>
                      <p className="text-[11px] text-muted italic min-h-[1.5rem] px-2 py-1 rounded-lg bg-card-hover/60 border border-line/40">
                        {voiceTranscript ? `"${voiceTranscript}"` : "Speak in Telugu or English (e.g., 'Play praise songs')"}
                      </p>
                    </div>

                    {/* Dynamic Voice Waveform Bars */}
                    {voiceSearchState === "listening" && (
                      <div className="flex items-center gap-1.5 h-6">
                        <span className="w-1 bg-[#D4A32A] rounded-full animate-voice-wave-1 h-2" />
                        <span className="w-1 bg-[#D4A32A] rounded-full animate-voice-wave-2 h-5" />
                        <span className="w-1 bg-[#D4A32A] rounded-full animate-voice-wave-3 h-3" />
                        <span className="w-1 bg-[#D4A32A] rounded-full animate-voice-wave-4 h-6" />
                        <span className="w-1 bg-[#D4A32A] rounded-full animate-voice-wave-5 h-2" />
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 pt-1 w-full">
                      {voiceTranscript && (
                        <button
                          onClick={() => {
                            const text = voiceTranscript.trim();
                            stopVoiceSearch();
                            handleSend(text);
                          }}
                          className="flex-1 py-2 rounded-xl bg-[#D4A32A] hover:bg-[#c49527] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Ask AI Now</span>
                        </button>
                      )}
                      <button
                        onClick={stopVoiceSearch}
                        className="px-3 py-2 rounded-xl bg-card-hover hover:bg-line border border-line text-muted hover:text-title font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

              {/* High Visibility Glowing Mic Button */}
              <button
                type="button"
                onClick={voiceSearchState === "listening" ? stopVoiceSearch : startVoiceSearch}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm active:scale-95 ${
                  voiceSearchState === "listening"
                    ? "bg-red-500 text-white animate-pulse shadow-red-500/30 ring-2 ring-red-400"
                    : "bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/60 shadow-amber-500/10"
                }`}
                title="Voice Input (Speak Telugu or English)"
                aria-label="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>

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
