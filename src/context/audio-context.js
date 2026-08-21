"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./auth-context";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  updateFavorites,
  updatePlaylists,
  updateRecentlyPlayed,
} from "@/lib/firestore-service";

const AudioContext = createContext(null);

function getDisplayArtist(song) {
  if (typeof song?.artist === "string" && song.artist.trim()) {
    return song.artist.trim();
  }

  if (typeof song?.artistName === "string" && song.artistName.trim()) {
    return song.artistName.trim();
  }

  if (typeof song?.artistObj?.name === "string" && song.artistObj.name.trim()) {
    return song.artistObj.name.trim();
  }

  if (
    typeof song?.artist === "object" &&
    typeof song.artist?.name === "string" &&
    song.artist.name.trim()
  ) {
    return song.artist.name.trim();
  }

  return "Unknown Artist";
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeSongForUi(song) {
  const artist = getDisplayArtist(song);

  return {
    ...song,
    id: String(song?.id || song?.slug || song?.title || crypto.randomUUID()),
    title: String(song?.title || song?.teluguTitle || "Untitled Song"),
    teluguTitle: song?.teluguTitle ? String(song.teluguTitle) : "",
    artist,
    artistName: artist,
    artistObj: song?.artistObj || { id: null, name: artist },
    album: song?.album ? String(song.album) : "",
    duration: song?.duration ? String(song.duration) : "0:00",
  };
}

function isSongPlayable(song) {
  if (!song) return false;
  const audioUrl = song.audioUrl || song.media?.audio;
  const youtubeId = song.youtubeId;
  return !!(audioUrl || youtubeId);
}

export const AudioProvider = ({ children }) => {
  const { user, firestoreData, setFirestoreData } = useAuth();
  const userRef = useRef(user);
  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [queue, setQueue] = useState([]);
  const [originalQueue, setOriginalQueue] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [viewedSongId, setViewedSongId] = useState(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [showFullHome, setShowFullHome] = useState(true);
  const [isMiniPlayerActive, setIsMiniPlayerActive] = useState(false);
  const [lyricsLanguage, setLyricsLanguage] = useState("telugu");

  const [sections, setSections] = useState({});
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [currentSectionLetter, setCurrentSectionLetter] = useState(null);
  const [currentIndexInSection, setCurrentIndexInSection] = useState(null);
  const [isLoadingMoreNext, setIsLoadingMoreNext] = useState(false);

  const isLoopingRef = useRef(isLooping);
  const isShuffledRef = useRef(isShuffled);
  const sectionsRef = useRef(sections);
  const currentSectionLetterRef = useRef(currentSectionLetter);
  const currentIndexInSectionRef = useRef(currentIndexInSection);
  const sectionsLoadingRef = useRef(sectionsLoading);
  const queueRef = useRef(queue);
  const currentSongRef = useRef(currentSong);
  const consecutiveErrorsRef = useRef(0);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  useEffect(() => {
    isShuffledRef.current = isShuffled;
  }, [isShuffled]);

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  useEffect(() => {
    currentSectionLetterRef.current = currentSectionLetter;
  }, [currentSectionLetter]);

  useEffect(() => {
    currentIndexInSectionRef.current = currentIndexInSection;
  }, [currentIndexInSection]);

  useEffect(() => {
    sectionsLoadingRef.current = sectionsLoading;
  }, [sectionsLoading]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  const getCurrentContextSongs = (currentPlayingSong) => {
    let contextSongs = songs;
    if (activeTab === "favorites") {
      contextSongs = songs.filter((s) => favorites.includes(s.id));
    } else if (activeTab === "playlist" && activePlaylistId) {
      const pl = playlists.find((p) => p.id === activePlaylistId);
      if (pl) {
        contextSongs = songs.filter((s) => pl.songIds.includes(s.id));
      } else {
        contextSongs = [];
      }
    } else if (activeTab === "recently-played") {
      contextSongs = recentlyPlayed
        .map((id) => songs.find((s) => s.id === id))
        .filter(Boolean);
    }

    // Ensure the playing song is part of the queue
    if (
      currentPlayingSong &&
      !contextSongs.some((s) => s.id === currentPlayingSong.id)
    ) {
      return songs;
    }
    return contextSongs;
  };

  const handleSetIsShuffled = (shuffledVal) => {
    setIsShuffled(shuffledVal);
    if (shuffledVal) {
      const remaining = originalQueue.filter((s) => s.id !== currentSong?.id);
      const shuffled = currentSong
        ? [currentSong, ...shuffleArray(remaining)]
        : shuffleArray(originalQueue);
      setQueue(shuffled);
    } else {
      setQueue(originalQueue);
    }
  };

  const handleNextSong = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return;

    let currentIndex = -1;
    if (currentSongRef.current) {
      currentIndex = currentQueue.findIndex(
        (s) => s.id === currentSongRef.current.id,
      );
    }

    let nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % currentQueue.length;
    let checkedCount = 0;

    // Skip songs that do not have audio
    while (
      checkedCount < currentQueue.length &&
      !isSongPlayable(currentQueue[nextIndex])
    ) {
      nextIndex = (nextIndex + 1) % currentQueue.length;
      checkedCount++;
    }

    if (checkedCount < currentQueue.length) {
      setCurrentSong(currentQueue[nextIndex]);
      setIsPlaying(true);
      setProgress(0);
    } else {
      setIsPlaying(false);
    }
  }, []);

  const handlePrevSong = useCallback(() => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) return;

    let currentIndex = -1;
    if (currentSongRef.current) {
      currentIndex = currentQueue.findIndex(
        (s) => s.id === currentSongRef.current.id,
      );
    }

    let prevIndex = currentIndex === -1
      ? currentQueue.length - 1
      : (currentIndex - 1 + currentQueue.length) % currentQueue.length;
    let checkedCount = 0;

    // Skip songs that do not have audio
    while (
      checkedCount < currentQueue.length &&
      !isSongPlayable(currentQueue[prevIndex])
    ) {
      prevIndex = (prevIndex - 1 + currentQueue.length) % currentQueue.length;
      checkedCount++;
    }

    if (checkedCount < currentQueue.length) {
      setCurrentSong(currentQueue[prevIndex]);
      setIsPlaying(true);
      setProgress(0);
    } else {
      setIsPlaying(false);
    }
  }, []);

  const audioRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  // Keep user ref in sync
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // When the user signs out, stop playback entirely so music does not
  // keep playing while the player bar is hidden for logged-out users.
  useEffect(() => {
    if (!user && currentSongRef.current) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
      }
      if (
        youtubePlayerRef.current &&
        typeof youtubePlayerRef.current.pauseVideo === "function"
      ) {
        try {
          youtubePlayerRef.current.pauseVideo();
        } catch (e) {}
      }
      setIsPlaying(false);
      setCurrentSong(null);
      setProgress(0);
    }
  }, [user]);

  // When Firebase user data loads, merge it (Firestore wins over localStorage)
  useEffect(() => {
    if (!firestoreData) return;

    const {
      favorites: favs,
      playlists: pls,
      recentlyPlayed: recent,
    } = firestoreData;

    if (Array.isArray(favs) && favs.length > 0) {
      setFavorites(favs);
    }
    if (Array.isArray(pls) && pls.length > 0) {
      setPlaylists(pls);
    }
    if (Array.isArray(recent) && recent.length > 0) {
      setRecentlyPlayed(recent);
    }
  }, [firestoreData]);

  // Load songs from the API endpoint.
  // Priority: 1) prefetched global 2) browser cache 3) fresh fetch
  useEffect(() => {
    let isMounted = true;
    setSongsLoading(true);

    // Skip fetch if songs already loaded (SPA re-mount / hot reload)
    if (songs.length > 0) {
      setSongsLoading(false);
      return () => { isMounted = false; };
    }

    // 1) Check if the landing page prefetched songs (instant!)
    const prefetched = window.__SONGHUB_PREFETCHED_SONGS;
    if (Array.isArray(prefetched) && prefetched.length > 0) {
      const fetchedSongs = prefetched.filter(Boolean).map(normalizeSongForUi);
      setSongs(fetchedSongs);
      setQueue(fetchedSongs);
      setOriginalQueue(fetchedSongs);
      setSongsLoading(false);
      console.log(`✓ Loaded ${fetchedSongs.length} songs from prefetch (instant)`);
      delete window.__SONGHUB_PREFETCHED_SONGS; // free memory
      return () => { isMounted = false; };
    }

    // 2) Browser cache or fresh fetch
    fetch("/api/songs", { cache: "default" })
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const fetchedSongs = Array.isArray(data?.songs)
          ? data.songs.filter(Boolean).map(normalizeSongForUi)
          : [];
        setSongs(fetchedSongs);
        setQueue(fetchedSongs);
        setOriginalQueue(fetchedSongs);
        setSongsLoading(false);
        console.log(`✓ Loaded ${fetchedSongs.length} songs from API`);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("❌ Failed to fetch songs from API:", err);
        setSongsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync native looping property of the HTML5 Audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Initialize browser-dependent values
  useEffect(() => {
    // 1. Initialize HTML Audio Element by ref from DOM or fallback
    if (!audioRef.current) {
      audioRef.current = document.getElementById("global-audio-player") || new Audio();
    }
    audioRef.current.volume = volume;
    audioRef.current.loop = isLoopingRef.current;

    // 2. Load lists from localStorage (fallback for non-auth users)
    const savedFavorites = localStorage.getItem("songhub_favorites");
    if (savedFavorites) {
      try {
        const favs = JSON.parse(savedFavorites);
        setTimeout(() => {
          setFavorites(favs);
        }, 0);
      } catch (e) {
        console.error(e);
      }
    }

    const savedPlaylists = localStorage.getItem("songhub_playlists");
    if (savedPlaylists) {
      try {
        const plays = JSON.parse(savedPlaylists);
        setTimeout(() => {
          setPlaylists(plays);
        }, 0);
      } catch (e) {
        console.error(e);
      }
    }

    const savedRecently = localStorage.getItem("songhub_recently");
    if (savedRecently) {
      try {
        const recently = JSON.parse(savedRecently);
        setTimeout(() => {
          setRecentlyPlayed(recently);
        }, 0);
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Setup audio event listeners
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      consecutiveErrorsRef.current = 0; // Reset error count on successful load
    };

    const handleEnded = async () => {
      if (isLoopingRef.current) {
        audio.currentTime = 0;
        audio.play().catch((err) => console.log("Playback error: ", err));
        return;
      }

      // Check if we are playing inside an alphabetical letter section
      const letter = currentSectionLetterRef.current;
      const index = currentIndexInSectionRef.current;

      if (letter && index !== null) {
        const section = sectionsRef.current[letter];
        if (section && section.songs) {
          const nextIndex = index + 1;
          
          if (nextIndex < section.songs.length) {
            // Next song is already loaded in the section, play it!
            const nextSong = section.songs[nextIndex];
            playSong(nextSong, letter, nextIndex, section.songs);
          } else if (section.hasMore && section.allSongs) {
            // End of loaded batch but all songs are pre-computed in allSongs
            const allLetterSongs = section.allSongs;
            if (nextIndex < allLetterSongs.length) {
              const updatedSongs = allLetterSongs;
              setSections((prev) => ({
                ...prev,
                [letter]: {
                  ...prev[letter],
                  songs: updatedSongs,
                  hasMore: false,
                  showAll: true,
                }
              }));
              const nextSong = updatedSongs[nextIndex];
              playSong(nextSong, letter, nextIndex, updatedSongs);
            }
          }
        }
      } else {
        // Default queue auto-play next
        handleNextSong();
      }
    };

    const handleError = (e) => {
      console.warn("Audio element error, skipping to next song:", e);
      consecutiveErrorsRef.current += 1;
      const currentQueue = queueRef.current;
      if (consecutiveErrorsRef.current >= Math.max(5, currentQueue.length)) {
        console.error("Too many consecutive audio playback errors. Stopping.");
        setIsPlaying(false);
        consecutiveErrorsRef.current = 0;
      } else {
        handleNextSong();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, []);

  // Handle currentSong change
  useEffect(() => {
    if (!audioRef.current) return;

    if (currentSong) {
      const srcToPlay = currentSong.audioUrl || currentSong.media?.audio || "";

      if (srcToPlay) {
        const isSameSrc = audioRef.current.src === srcToPlay;
        if (!isSameSrc) {
          audioRef.current.src = srcToPlay;
          audioRef.current.load();
        }

        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn("Audio playback attempted for src:", srcToPlay, err);
              // If play() was interrupted by load() or buffering, auto-play once audio is ready
              if (
                err.name === "AbortError" ||
                err.name === "NotAllowedError" ||
                err.name === "NotSupportedError"
              ) {
                const onCanPlay = () => {
                  audioRef.current?.play().catch(() => setIsPlaying(false));
                  audioRef.current?.removeEventListener("canplay", onCanPlay);
                };
                audioRef.current?.addEventListener("canplay", onCanPlay);
              } else {
                setIsPlaying(false);
              }
            });
          }
        }
      } else {
        // No direct MP3 URL (e.g. YouTube video only) — pause HTML5 audio so only video plays
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }

      // Add to recently played + sync to Firestore if logged in
      setTimeout(() => {
        setRecentlyPlayed((prev) => {
          const filtered = prev.filter((id) => id !== currentSong.id);
          const updated = [currentSong.id, ...filtered].slice(0, 10);
          localStorage.setItem("songhub_recently", JSON.stringify(updated));
          // Sync to Firestore if authenticated
          const uid = userRef.current?.uid;
          if (uid) {
            updateRecentlyPlayed(uid, updated);
          }
          return updated;
        });
      }, 0);
    } else {
      audioRef.current.pause();
    }
  }, [currentSong]);

  // Handle play/pause toggles
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const srcToPlay = currentSong.audioUrl || currentSong.media?.audio || "";
    if (!srcToPlay) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Play failed: ", err);
          if (err.name === "AbortError") {
            const onCanPlay = () => {
              audioRef.current?.play().catch(() => setIsPlaying(false));
              audioRef.current?.removeEventListener("canplay", onCanPlay);
            };
            audioRef.current?.addEventListener("canplay", onCanPlay);
          } else {
            setIsPlaying(false);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Keep refs in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Handle volume and mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // ─── YouTube Player Management ─────────────────────────────────
  // Manages a hidden YT.Player for YouTube-only songs (no audio URL).
  // Handles: playback, duration detection, progress tracking, auto-next.
  const youtubeApiLoadedRef = useRef(false);
  const youtubePlayerRef = useRef(null);
  const youtubeProgressRef = useRef(null);

  useEffect(() => {
    const hasYoutube = currentSong?.youtubeId;
    const hasAudio = currentSong?.audioUrl || currentSong?.media?.audio;
    if (!hasYoutube || hasAudio) {
      setIsMiniPlayerActive(false);
      return;
    }

    let isMounted = true;
    let pollTimer = null;
    const youtubeId = currentSong.youtubeId;

    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.destroy();
      } catch (e) {}
      youtubePlayerRef.current = null;
    }
    if (youtubeProgressRef.current) {
      clearInterval(youtubeProgressRef.current);
      youtubeProgressRef.current = null;
    }

    const playerDivId = `yt-audio-${youtubeId}-${Date.now()}`;
    const playerDiv = document.createElement("div");
    playerDiv.id = playerDivId;
    playerDiv.style.position = "absolute";
    playerDiv.style.width = "200px";
    playerDiv.style.height = "200px";
    playerDiv.style.opacity = "0";
    playerDiv.style.pointerEvents = "none";
    playerDiv.style.left = "-9999px";
    playerDiv.style.top = "-9999px";
    document.body.appendChild(playerDiv);

    const createPlayer = () => {
      if (!isMounted || !window.YT?.Player) return;
      try {
        const player = new window.YT.Player(playerDivId, {
          height: "200",
          width: "200",
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: () => {
              if (!isMounted) return;
              youtubePlayerRef.current = player;
              consecutiveErrorsRef.current = 0; // Reset error count on successful YouTube ready

              if (typeof player.setVolume === "function") {
                player.setVolume(isMuted ? 0 : volume * 100);
              }

              const detectedSec = player.getDuration();
              if (detectedSec && detectedSec > 0) {
                setDuration(detectedSec);
                const mins = Math.floor(detectedSec / 60);
                const secs = Math.floor(detectedSec % 60);
                const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;
                setCurrentSong((prev) =>
                  prev
                    ? { ...prev, duration: formatted, durationSec: detectedSec }
                    : prev,
                );
                setSongs((prev) =>
                  prev.map((s) =>
                    s.id === currentSong?.id
                      ? { ...s, duration: formatted, durationSec: detectedSec }
                      : s,
                  ),
                );
                const songRef = doc(db, "youworship_songs", currentSong.id);
                updateDoc(songRef, {
                  duration: detectedSec,
                  updatedAt: new Date().toISOString(),
                }).catch(() => {});
              }

              if (
                isPlayingRef.current &&
                typeof player?.playVideo === "function"
              ) {
                try {
                  player.playVideo();
                } catch (e) {}
              }

              youtubeProgressRef.current = setInterval(() => {
                if (!youtubePlayerRef.current || !isMounted) return;
                try {
                  if (
                    typeof youtubePlayerRef.current.getCurrentTime ===
                    "function"
                  ) {
                    const time = youtubePlayerRef.current.getCurrentTime();
                    if (time !== undefined) setProgress(time);
                  }
                } catch (e) {}
              }, 1000);
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              if (event.data === 0) {
                if (isLoopingRef.current) {
                  if (typeof player?.seekTo === "function")
                    try {
                      player.seekTo(0);
                    } catch (e) {}
                  if (typeof player?.playVideo === "function")
                    try {
                      player.playVideo();
                    } catch (e) {}
                } else {
                  handleNextSong();
                }
              }
            },
            onError: (event) => {
              console.warn("YouTube player error:", event.data);
              consecutiveErrorsRef.current += 1;
              const currentQueue = queueRef.current;
              if (consecutiveErrorsRef.current >= Math.max(5, currentQueue.length)) {
                console.error("Too many consecutive YouTube playback errors. Stopping.");
                setIsPlaying(false);
                consecutiveErrorsRef.current = 0;
              } else {
                handleNextSong();
              }
            },
          },
        });
        youtubePlayerRef.current = player;
      } catch (err) {
        console.warn("YouTube player creation failed:", err);
      }
    };

    if (!window.YT?.Player) {
      if (!youtubeApiLoadedRef.current) {
        youtubeApiLoadedRef.current = true;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(tag, firstScript);
        window.onYouTubeIframeAPIReady = () => {};
      }
      pollTimer = setInterval(() => {
        if (window.YT?.Player && isMounted) {
          clearInterval(pollTimer);
          pollTimer = null;
          createPlayer();
        }
      }, 300);
    } else {
      createPlayer();
    }

    return () => {
      isMounted = false;
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (youtubeProgressRef.current) {
        clearInterval(youtubeProgressRef.current);
        youtubeProgressRef.current = null;
      }
      const existingDiv = document.getElementById(playerDivId);
      if (existingDiv) existingDiv.remove();
      if (youtubePlayerRef.current) {
        try {
          if (typeof youtubePlayerRef.current.destroy === "function") {
            youtubePlayerRef.current.destroy();
          }
        } catch (e) {}
        youtubePlayerRef.current = null;
      }
    };
  }, [currentSong?.id]);

  // Control YouTube playback when isPlaying toggles
  useEffect(() => {
    const player = youtubePlayerRef.current;
    if (!player) return;
    try {
      if (isPlaying) {
        if (typeof player.playVideo === "function") {
          player.playVideo();
        }
      } else {
        if (typeof player.pauseVideo === "function") {
          player.pauseVideo();
        }
      }
    } catch (e) {
      console.warn("YouTube play/pause error:", e);
    }
  }, [isPlaying]);

  // Handle YouTube iframe sizing and styling for Mini Player mode
  useEffect(() => {
    const player = youtubePlayerRef.current;
    if (!player) return;
    try {
      const iframe = player.getIframe();
      if (!iframe) return;

      if (isMiniPlayerActive) {
        iframe.style.display = "block";
        iframe.style.position = "fixed";
        iframe.style.bottom = "100px";
        iframe.style.right = "24px";
        iframe.style.left = "auto";
        iframe.style.top = "auto";
        iframe.style.opacity = "1";
        iframe.style.pointerEvents = "auto";
        iframe.style.width = "320px";
        iframe.style.height = "180px";
        iframe.style.zIndex = "9999";
        iframe.style.borderRadius = "12px";
        iframe.style.border = "2px solid rgba(255, 255, 255, 0.15)";
        iframe.style.boxShadow =
          "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)";
        if (typeof player.setSize === "function") {
          player.setSize(320, 180);
        }
      } else {
        iframe.style.display = "block";
        iframe.style.position = "absolute";
        iframe.style.left = "-9999px";
        iframe.style.top = "-9999px";
        iframe.style.opacity = "0";
        iframe.style.pointerEvents = "none";
        iframe.style.width = "200px";
        iframe.style.height = "200px";
        iframe.style.zIndex = "-1";
        iframe.style.borderRadius = "0px";
        iframe.style.border = "none";
        iframe.style.boxShadow = "none";
        if (typeof player.setSize === "function") {
          player.setSize(200, 200);
        }
      }
    } catch (e) {
      console.warn("Mini player effect sizing error:", e);
    }
  }, [isMiniPlayerActive, currentSong?.id]);

  const initializeAlphabeticalSections = useCallback(async (lang = "english") => {
    // Build alphabetical sections from the already-loaded songs in state
    const currentSongs = songs;
    if (currentSongs.length === 0) {
      console.log("[Sections] songs still empty, skipping init");
      return;
    }

    console.log("[Sections] Initializing sections for", lang, "with", currentSongs.length, "songs");

    const ALPHABETS = {
      english: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
      telugu: ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'క', 'ఖ', 'గ', 'ఘ', 'చ', 'జ', 'డ', 'త', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ'],
      hindi: ['आ', 'इ', 'उ', 'ख', 'च', 'ज', 'झ', 'त', 'द', 'न', 'प', 'य', 'र', 'ल', 'व', 'स'],
      tamil: ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'க', 'ச', 'ஜ', 'ஞ', 'ட', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ற', 'ல', 'வ', 'ஷ', 'ஸ', 'ஹ'],
    };

    // Language filter
    const languageMap = {
      english: ["en", "english"],
      telugu: ["te", "telugu"],
      hindi: ["hi", "hindi"],
      tamil: ["ta", "tamil"],
    };
    const allowedLangs = languageMap[lang] || languageMap.english;

    const letters = ALPHABETS[lang] || ALPHABETS.english;
    // Always rebuild — clear old sections for this language's letters first
    const newSections = {};

    setSectionsLoading(true);
    try {
      const BATCH_SIZE = 20;

      // Group all songs by their first letter
      const grouped = {};
      currentSongs.forEach(song => {
        const songLang = (song.language || "").toLowerCase();
        if (!allowedLangs.includes(songLang)) return;

        const firstLetter = song.firstLetter || (song.title ? song.title.charAt(0).toUpperCase() : "");
        if (!grouped[firstLetter]) grouped[firstLetter] = [];
        grouped[firstLetter].push(song);
      });

      console.log("[Sections] Grouped letters:", Object.keys(grouped).join(", "));

      // Sort songs within each letter group
      Object.keys(grouped).forEach(letter => {
        grouped[letter].sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" }));
      });

      // Build sections for all letters that have songs
      letters.forEach(letter => {
        const allLetterSongs = grouped[letter] || [];
        if (allLetterSongs.length === 0) return;

        const initialSongs = allLetterSongs.slice(0, BATCH_SIZE);
        newSections[letter] = {
          songs: initialSongs,
          lastDoc: null,
          hasMore: allLetterSongs.length > BATCH_SIZE,
          allSongs: allLetterSongs,
          showAll: false,
          loading: false,
        };
      });

      console.log("[Sections] Built sections for letters:", Object.keys(newSections).join(", "));

      setSections(newSections);
    } catch (error) {
      console.error("Failed to initialize alphabetical sections for language:", lang, error);
    } finally {
      setSectionsLoading(false);
    }
  }, [songs]);

  const showAllSongsForLetter = useCallback(async (letter) => {
    const section = sectionsRef.current[letter];
    if (!section || section.showAll || section.loading) return;

    // Use the pre-computed allSongs from initialization
    const allLetterSongs = section.allSongs || section.songs;

    setSections((prev) => ({
      ...prev,
      [letter]: {
        ...prev[letter],
        songs: allLetterSongs,
        hasMore: false,
        showAll: true,
        loading: false,
      },
    }));
  }, []);

  const playSong = (song, sectionLetter = null, indexInSection = null, customQueue = null) => {
    if (!song) return;

    setCurrentSectionLetter(sectionLetter);
    setCurrentIndexInSection(indexInSection);
    currentSectionLetterRef.current = sectionLetter;
    currentIndexInSectionRef.current = indexInSection;

    if (currentSong && currentSong.id === song.id) {
      if (isPlaying) {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
      } else {
        setIsPlaying(true);
        if (audioRef.current && audioRef.current.src) {
          audioRef.current.play().catch((e) => console.warn("Play error:", e));
        }
      }
    } else {
      const contextSongs = customQueue || getCurrentContextSongs(song);

      if (!isSongPlayable(song)) {
        // If the song is statically unplayable, search for the next playable one
        const currentIndex = contextSongs.findIndex((s) => s.id === song.id);
        if (currentIndex !== -1) {
          let nextIndex = (currentIndex + 1) % contextSongs.length;
          let checkedCount = 0;
          while (
            checkedCount < contextSongs.length &&
            !isSongPlayable(contextSongs[nextIndex])
          ) {
            nextIndex = (nextIndex + 1) % contextSongs.length;
            checkedCount++;
          }
          if (checkedCount < contextSongs.length) {
            playSong(contextSongs[nextIndex], sectionLetter, nextIndex, contextSongs);
            return;
          }
        }
      }

      const srcToPlay = song.audioUrl || song.media?.audio || "";
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);

      // Set queue and originalQueue for this context
      setOriginalQueue(contextSongs);

      if (isShuffled) {
        const remaining = contextSongs.filter((s) => s.id !== song.id);
        const shuffled = [song, ...shuffleArray(remaining)];
        setQueue(shuffled);
      } else {
        setQueue(contextSongs);
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (srcToPlay) {
          audioRef.current.src = srcToPlay;
          audioRef.current.load();
          audioRef.current.play().catch((err) => {
            console.warn("Direct click play error:", err);
          });
        } else {
          audioRef.current.pause();
          audioRef.current.removeAttribute("src");
        }
      }
    }
  };

  const togglePlay = () => {
    if (!currentSong && songs.length > 0) {
      playSong(songs[0]);
    } else if (currentSong) {
      if (isPlaying) {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
      } else {
        setIsPlaying(true);
        if (audioRef.current && audioRef.current.src) {
          audioRef.current
            .play()
            .catch((e) => console.warn("Toggle play error:", e));
        }
      }
    }
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    if (
      youtubePlayerRef.current &&
      typeof youtubePlayerRef.current.seekTo === "function"
    ) {
      try {
        youtubePlayerRef.current.seekTo(time, true);
      } catch (e) {}
    }
    setProgress(time);
  };

  const adjustVolume = (vol) => {
    const parsedVol = Math.max(0, Math.min(1, vol));
    setVolume(parsedVol);
    if (parsedVol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleFavorite = (songId) => {
    setFavorites((prev) => {
      const updated = prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId];
      localStorage.setItem("songhub_favorites", JSON.stringify(updated));

      // Sync to Firestore if authenticated
      const uid = userRef.current?.uid;
      if (uid) {
        updateFavorites(uid, updated);
      }

      return updated;
    });
  };

  const createPlaylist = (name) => {
    if (!name.trim()) return;
    const newPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      songIds: [],
    };
    setPlaylists((prev) => {
      const updated = [...prev, newPlaylist];
      localStorage.setItem("songhub_playlists", JSON.stringify(updated));
      // Sync to Firestore if authenticated
      const uid = userRef.current?.uid;
      if (uid) {
        updatePlaylists(uid, updated);
      }
      return updated;
    });
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists((prev) => {
      const updated = prev.filter((list) => list.id !== playlistId);
      localStorage.setItem("songhub_playlists", JSON.stringify(updated));
      // Sync to Firestore if authenticated
      const uid = userRef.current?.uid;
      if (uid) {
        updatePlaylists(uid, updated);
      }
      return updated;
    });
  };

  const addSongToPlaylist = (playlistId, songId) => {
    setPlaylists((prev) => {
      const updated = prev.map((list) => {
        if (list.id === playlistId && !list.songIds.includes(songId)) {
          return { ...list, songIds: [...list.songIds, songId] };
        }
        return list;
      });
      localStorage.setItem("songhub_playlists", JSON.stringify(updated));
      // Sync to Firestore if authenticated
      const uid = userRef.current?.uid;
      if (uid) {
        updatePlaylists(uid, updated);
      }
      return updated;
    });
  };

  const removeSongFromPlaylist = (playlistId, songId) => {
    setPlaylists((prev) => {
      const updated = prev.map((list) => {
        if (list.id === playlistId) {
          return {
            ...list,
            songIds: list.songIds.filter((id) => id !== songId),
          };
        }
        return list;
      });
      localStorage.setItem("songhub_playlists", JSON.stringify(updated));
      // Sync to Firestore if authenticated
      const uid = userRef.current?.uid;
      if (uid) {
        updatePlaylists(uid, updated);
      }
      return updated;
    });
  };

  return (
    <AudioContext.Provider
      value={{
        songs: songs,
        songsLoading,
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        isMuted,
        isLooping,
        isShuffled,
        queue,
        favorites,
        playlists,
        recentlyPlayed,
        setCurrentSong,
        setIsPlaying,
        setQueue,
        playSong,
        togglePlay,
        nextSong: handleNextSong,
        prevSong: handlePrevSong,
        seekTo,
        adjustVolume,
        toggleMute,
        setIsLooping,
        setIsShuffled: handleSetIsShuffled,
        toggleFavorite,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        viewedSongId,
        setViewedSongId,
        activeTab,
        setActiveTab,
        activePlaylistId,
        setActivePlaylistId,
        showFullHome,
        setShowFullHome,
        isMiniPlayerActive,
        setIsMiniPlayerActive,
        lyricsLanguage,
        setLyricsLanguage,
        sections,
        sectionsLoading,
        initializeAlphabeticalSections,
        showAllSongsForLetter,
      }}
    >
      {children}
      <audio id="global-audio-player" ref={audioRef} preload="none" />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
