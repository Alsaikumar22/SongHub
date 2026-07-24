"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./auth-context";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  updateFavorites,
  updatePlaylists,
  updateRecentlyPlayed,
} from "@/lib/firestore-service";

const AudioContext = createContext(null);

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
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [viewedSongId, setViewedSongId] = useState(null);
  const [activeTab, setActiveTab] = useState("discover");
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  const handleNextSong = () => {
    if (queue.length === 0) return;

    let nextIndex = 0;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (currentSong) {
      const currentIndex = queue.findIndex(s => s.id === currentSong.id);
      if (currentIndex !== -1 && currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      }
    }

    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
    setProgress(0);
  };

  const handlePrevSong = () => {
    if (queue.length === 0) return;

    let prevIndex = 0;
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else if (currentSong) {
      const currentIndex = queue.findIndex(s => s.id === currentSong.id);
      if (currentIndex > 0) {
        prevIndex = currentIndex - 1;
      } else {
        prevIndex = queue.length - 1; // loop back to end
      }
    }

    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
    setProgress(0);
  };

  const audioRef = useRef(null);

  // Keep user ref in sync
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // When Firebase user data loads, merge it (Firestore wins over localStorage)
  useEffect(() => {
    if (!firestoreData) return;

    const { favorites: favs, playlists: pls, recentlyPlayed: recent } = firestoreData;

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

  // Load songs from Firebase Youworship_songs collection via songService
  useEffect(() => {
    let isMounted = true;
    setSongsLoading(true);
    import("@/services/songService").then(({ songService }) => {
      songService.getAllSongs()
        .then((fetchedSongs) => {
          if (!isMounted) return;
          setSongs(fetchedSongs);
          setQueue(fetchedSongs);
          setSongsLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("Failed to fetch songs from Youworship_songs:", err);
          setSongsLoading(false);
        });
    });
    return () => { isMounted = false; };
  }, []);

  // Initialize browser-dependent values
  useEffect(() => {
    // 1. Initialize HTML Audio Element
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

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
    };

    const handleEnded = () => {
      // Handles auto-play next
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(err => console.log("Playback error: ", err));
      } else {
        handleNextSong();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
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
            playPromise.catch(err => {
              console.warn("Audio playback attempted for src:", srcToPlay, err);
              // If play() was interrupted by load() or buffering, auto-play once audio is ready
              if (err.name === "AbortError" || err.name === "NotAllowedError" || err.name === "NotSupportedError") {
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
        setRecentlyPlayed(prev => {
          const filtered = prev.filter(id => id !== currentSong.id);
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
        playPromise.catch(err => {
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

  // Handle volume and mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // ─── YouTube Duration Detection ──────────────────────────────────
  // When a song with a YouTube ID plays (but no direct audio URL),
  // detect the video duration from the YouTube IFrame API.
  const youtubeApiLoadedRef = useRef(false);
  const youtubePlayerRef = useRef(null);
  const youtubeReadyCallbackRef = useRef(null);

  useEffect(() => {
    // Only for songs with YouTube ID and no direct audio URL
    const hasYoutube = currentSong?.youtubeId;
    const hasAudio = currentSong?.audioUrl || currentSong?.media?.audio;
    if (!hasYoutube || hasAudio) return;

    let isMounted = true;
    let pollTimer = null;
    const youtubeId = currentSong.youtubeId;

    // Clean up previous player
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.destroy();
      } catch (e) {}
      youtubePlayerRef.current = null;
    }

    // Create a hidden div for the YouTube player
    const playerDivId = `yt-dur-${youtubeId}-${Date.now()}`;
    const playerDiv = document.createElement("div");
    playerDiv.id = playerDivId;
    playerDiv.style.display = "none";
    document.body.appendChild(playerDiv);

    // Function to create the player and get duration
    const createPlayer = () => {
      if (!isMounted || !window.YT?.Player) return;
      try {
        const player = new window.YT.Player(playerDivId, {
          height: "1",
          width: "1",
          videoId: youtubeId,
          playerVars: { autoplay: 0, controls: 0, modestbranding: 1 },
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              const detectedSec = event.target.getDuration();
              if (detectedSec && detectedSec > 0) {
                setDuration(detectedSec);
                // Sync the duration back to currentSong and songs array
                // so card components show the correct duration
                const mins = Math.floor(detectedSec / 60);
                const secs = Math.floor(detectedSec % 60);
                const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;
                setCurrentSong(prev => prev ? { ...prev, duration: formatted, durationSec: detectedSec } : prev);
                setSongs(prev => prev.map(s =>
                  s.id === currentSong?.id ? { ...s, duration: formatted, durationSec: detectedSec } : s
                ));
                // Save to Firebase so it persists after page refresh
                const songId = currentSong?.id;
                if (songId) {
                  const songRef = doc(db, "Youworship_songs", songId);
                  updateDoc(songRef, {
                    duration: detectedSec,
                    updatedAt: new Date().toISOString(),
                  }).catch(err => console.warn("Failed to save duration to Firebase:", err));
                }
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
      // Load YouTube IFrame API script once
      if (!youtubeApiLoadedRef.current) {
        youtubeApiLoadedRef.current = true;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(tag, firstScript);

        // Set a global callback that fires for any pending ready callback
        window.onYouTubeIframeAPIReady = () => {
          // Call the stored callback if any
          if (youtubeReadyCallbackRef.current) {
            youtubeReadyCallbackRef.current();
            youtubeReadyCallbackRef.current = null;
          }
        };
      }

      // Store this effect's callback and poll until API loads (max 15s)
      youtubeReadyCallbackRef.current = createPlayer;
      let pollCount = 0;
      pollTimer = setInterval(() => {
        pollCount++;
        if (window.YT?.Player) {
          // Clear our callback and create the player
          if (youtubeReadyCallbackRef.current === createPlayer) {
            youtubeReadyCallbackRef.current = null;
          }
          clearInterval(pollTimer);
          pollTimer = null;
          createPlayer();
        } else if (pollCount > 50) {
          // Timeout after ~15 seconds (50 * 300ms)
          clearInterval(pollTimer);
          pollTimer = null;
        }
      }, 300);
    } else {
      createPlayer();
    }

    return () => {
      isMounted = false;
      // Clear polling timer
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      // Clear our callback reference if it was set
      if (youtubeReadyCallbackRef.current === createPlayer) {
        youtubeReadyCallbackRef.current = null;
      }
      // Clean up player div
      const existingDiv = document.getElementById(playerDivId);
      if (existingDiv) existingDiv.remove();
      // Destroy YouTube player
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (e) {}
        youtubePlayerRef.current = null;
      }
    };
  }, [currentSong?.id]);



  const playSong = (song) => {
    if (!song) return;

    if (currentSong && currentSong.id === song.id) {
      if (isPlaying) {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.pause();
      } else {
        setIsPlaying(true);
        if (audioRef.current && audioRef.current.src) {
          audioRef.current.play().catch(e => console.warn("Play error:", e));
        }
      }
    } else {
      const srcToPlay = song.audioUrl || song.media?.audio || "";
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (srcToPlay) {
          audioRef.current.src = srcToPlay;
          audioRef.current.load();
          audioRef.current.play().catch(err => {
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
          audioRef.current.play().catch(e => console.warn("Toggle play error:", e));
        }
      }
    }
  };

  const seekTo = (time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
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
    setIsMuted(prev => !prev);
  };

  const toggleFavorite = (songId) => {
    setFavorites(prev => {
      const updated = prev.includes(songId)
        ? prev.filter(id => id !== songId)
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
      songIds: []
    };
    setPlaylists(prev => {
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
    setPlaylists(prev => {
      const updated = prev.filter(list => list.id !== playlistId);
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
    setPlaylists(prev => {
      const updated = prev.map(list => {
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
    setPlaylists(prev => {
      const updated = prev.map(list => {
        if (list.id === playlistId) {
          return { ...list, songIds: list.songIds.filter(id => id !== songId) };
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
        setIsShuffled,
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
        setActivePlaylistId
      }}
    >
      {children}
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
