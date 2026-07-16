"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { MOCK_SONGS } from "@/data/songs";
import { defaultPlaylists } from "@/data/playlists";

const AudioContext = createContext(null);

// Songs are now imported from @/data/songs

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [queue, setQueue] = useState(MOCK_SONGS);
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

  // Initialize browser-dependent values
  useEffect(() => {
    // 1. Initialize HTML Audio Element
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    // 2. Load lists from localStorage
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
    } else {
      setTimeout(() => {
        setPlaylists(defaultPlaylists);
      }, 0);
      localStorage.setItem("songhub_playlists", JSON.stringify(defaultPlaylists));
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
      const isSameSrc = audioRef.current.src === currentSong.audioUrl;
      if (!isSameSrc) {
        audioRef.current.src = currentSong.audioUrl;
        audioRef.current.load();
      }

      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log("Playback failed to start:", err);
          setIsPlaying(false);
        });
      }

      // Add to recently played
      setTimeout(() => {
        setRecentlyPlayed(prev => {
          const filtered = prev.filter(id => id !== currentSong.id);
          const updated = [currentSong.id, ...filtered].slice(0, 10);
          localStorage.setItem("songhub_recently", JSON.stringify(updated));
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

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.log("Play failed: ", err);
        setIsPlaying(false);
      });
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
    // If it's already the current song, just toggle play
    if (currentSong && currentSong.id === song.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const togglePlay = () => {
    if (!currentSong && MOCK_SONGS.length > 0) {
      setCurrentSong(MOCK_SONGS[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
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

      // Sync with "My Favorites" playlist
      setPlaylists(prevLists => {
        const synced = prevLists.map(list => {
          if (list.id === "fav-list") {
            return { ...list, songIds: updated };
          }
          return list;
        });
        localStorage.setItem("songhub_playlists", JSON.stringify(synced));
        return synced;
      });

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
      return updated;
    });
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists(prev => {
      const updated = prev.filter(list => list.id !== playlistId);
      localStorage.setItem("songhub_playlists", JSON.stringify(updated));
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
      return updated;
    });
  };

  return (
    <AudioContext.Provider
      value={{
        songs: MOCK_SONGS,
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
