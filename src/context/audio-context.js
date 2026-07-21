"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./auth-context";
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
