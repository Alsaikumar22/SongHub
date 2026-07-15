"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const AudioContext = createContext(null);

export const MOCK_SONGS = [
  {
    id: "1",
    title: "Ambient Gold",
    artist: "Lofi Dreamer",
    album: "Zen Garden",
    genre: "Lo-Fi",
    duration: "3:12",
    durationSec: 192,
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    releaseYear: 2023,
    bpm: 72,
    plays: 14205,
    lyrics: "[00:10] (Soft vinyl crackle)\n[00:20] Dreaming of golden fields...\n[00:45] Underneath the amber skies\n[01:10] Time slows down, worries fly\n[01:40] (Saxophone interlude)\n[02:15] Lost in a peaceful state\n[02:40] Finding calmness at the gate\n[03:00] (Fades out gently)"
  },
  {
    id: "2",
    title: "Synthwave Breeze",
    artist: "Retro Horizon",
    album: "Neon Highways",
    genre: "Synthwave",
    duration: "7:05",
    durationSec: 425,
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    releaseYear: 2022,
    bpm: 115,
    plays: 89312,
    lyrics: "[00:00] (Instrumental intro with arpeggiator)\n[00:30] Electric grid under our wheels\n[01:00] Let's run away to the neon sunset\n[01:30] In the shadows of the cyber city\n[02:00] Synth beats keep driving us forward\n[03:00] (Guitar solo section)\n[04:30] Driving through the endless night\n[05:30] Laser lights guides us home"
  },
  {
    id: "3",
    title: "Pop Neon",
    artist: "Starlight",
    album: "Glitter & Glow",
    genre: "Pop",
    duration: "5:44",
    durationSec: 344,
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    releaseYear: 2024,
    bpm: 120,
    plays: 245012,
    lyrics: "[00:15] Out on the dance floor tonight\n[00:35] Hearts beating to the rhythm of the light\n[00:55] Oh, we are shining brighter than the stars\n[01:20] Forget the world, let's make it ours\n[01:50] Pop the neon, live it up loud!\n[02:30] Jump high, lose yourself in the crowd\n[03:40] (Electric hook plays)\n[04:45] We will never fade away!"
  },
  {
    id: "4",
    title: "Melancholy Rock",
    artist: "Dark Antlers",
    album: "Echoes of Silence",
    genre: "Rock",
    duration: "5:02",
    durationSec: 302,
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    releaseYear: 2021,
    bpm: 88,
    plays: 53140,
    lyrics: "[00:20] Standing in the pouring rain\n[00:45] Trying to wash away the pain\n[01:15] Shadows calling out my name\n[01:45] But it's all part of the game\n[02:15] (Heavy drum entry)\n[02:45] Breaking the walls, finding the light\n[03:30] We will stand up and fight\n[04:20] (Epic guitar outro)"
  },
  {
    id: "5",
    title: "Chilled Beats",
    artist: "Summer Chill",
    album: "Island Breeze",
    genre: "Lo-Fi",
    duration: "6:03",
    durationSec: 363,
    coverUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    releaseYear: 2023,
    bpm: 80,
    plays: 67902,
    lyrics: "[00:00] (Ocean waves crashing)\n[00:30] Feel the warm breeze on your face\n[01:00] Slow down, let's match the pace\n[01:30] Nothing to do, nowhere to run\n[02:00] Just baking under the golden sun\n[03:00] (Melodic flute solo)\n[04:00] Waves come and waves go\n[05:00] Let's just go with the flow"
  },
  {
    id: "6",
    title: "Cyberpunk Drive",
    artist: "Future City",
    album: "Protocol X",
    genre: "Synthwave",
    duration: "7:56",
    durationSec: 476,
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    releaseYear: 2025,
    bpm: 125,
    plays: 120455,
    lyrics: "[00:00] (Industrial noise and synth swell)\n[00:45] Cybernetic eyes see through the fog\n[01:30] Running the program, hacking the log\n[02:15] Neon wires pulse in my veins\n[03:00] Breaking free from digital chains\n[04:00] (Intense bass drops)\n[05:30] Speeding on the cyber highway\n[06:30] To a place where we can stay"
  },
  {
    id: "7",
    title: "Acoustic Sun",
    artist: "Willow Tree",
    album: "Meadow Song",
    genre: "Rock",
    duration: "6:26",
    durationSec: 386,
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    releaseYear: 2020,
    bpm: 94,
    plays: 38102,
    lyrics: "[00:15] Sitting on the front porch step\n[00:45] Remembering the secrets we kept\n[01:15] Guitar strings strumming soft and sweet\n[01:45] Barefoot dancing in the street\n[02:30] Under the acoustic sun, we shine\n[03:15] Everything will be just fine\n[04:15] (Harmonica solo)\n[05:15] As the day turns into night"
  },
  {
    id: "8",
    title: "Jazz Cafe",
    artist: "Midnight Quartet",
    album: "Velvet Nights",
    genre: "Lo-Fi",
    duration: "5:38",
    durationSec: 338,
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    releaseYear: 2022,
    bpm: 65,
    plays: 95403,
    lyrics: "[00:00] (Rain drops on window, glass clinking)\n[00:30] Warm coffee, dim jazz lights\n[01:00] Escaping the cold city nights\n[01:30] Piano chords strike a mellow chord\n[02:00] Standard worries are ignored\n[02:40] (Double bass and drums swing)\n[03:30] Double shots of espresso and blues\n[04:20] Nothing left for us to lose"
  },
  {
    id: "adavi-chetla-naduma",
    title: "అడవి చెట్ల నడుమ",
    artist: "O Yaathrikudaa",
    album: "Worship Sessions",
    genre: "Rock",
    duration: "4:15",
    durationSec: 255,
    coverUrl: "/worship_forest.png",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    releaseYear: 2024,
    bpm: 78,
    plays: 2150000,
    lyrics: "ఓ యాత్రికుడా ఓహో యాత్రికుడా\nబ్రతుకు ప్రయాణములో గమ్యమెంత దూరమో తెలుసా..\nఓ బాటసారి ఓహో బాటసారి\nజీవిత యాత్రలో కాలమెంత విశాలమో తెలుసా\nగుండె ఆగిపోగానే ఊపిరి ఆగిపోతుంది\nనాడి నిలిచిపోగానే ఆత్మ ఎగిరిపోతుంది\nఅంతా ఆ దైవ నిర్ణయం\nమనిషి కాలగత దేవుని ఆదేశం\nపుట్టగానే తొట్టెలో వేస్తారు\nగిట్టగానే పెట్టెలో మూస్తారు\nజాగు చేయక కాటికి మోస్తారు\nఆరడుగుల గుంటలో తోస్తారు\nబ్రతుకు మూల్యమింతే – మనిషికి ఉన్న విలువంతే",
    lyricsTelugu: [
      "ఓ యాత్రికుడా ఓహో యాత్రికుడా",
      "బ్రతుకు ప్రయాణములో గమ్యమెంత దూరమో తెలుసా..",
      "ఓ బాటసారి ఓహో బాటసారి",
      "జీవిత యాత్రలో కాలమెంత విశాలమో తెలుసా",
      "గుండె ఆగిపోగానే ఊపిరి ఆగిపోతుంది",
      "నాడి నిలిచిపోగానే ఆత్మ ఎగిరిపోతుంది",
      "అంతా ఆ దైవ నిర్ణయం",
      "మనిషి కాలగత దేవుని ఆదేశం",
      "పుట్టగానే తొట్టెలో వేస్తారు",
      "గిట్టగానే పెట్టెలో మూస్తారు",
      "జాగు చేయక కాటికి మోస్తారు",
      "ఆరడుగుల గుంటలో తోస్తారు",
      "ఆశించినవేవి నీవెంటారావు"
    ],
    lyricsEnglish: [
      "O Yaathrikudaa Oho Yaathrikudaa",
      "Brathuku Prayanamulo Gamyamentha Dooramo Telusa..",
      "O Baatasari Oho Baatasari",
      "Jeevitha Yaathralo Kaalamentha Vishaalamo Telusa",
      "Gunde Aagipogaane Oopiri Aagipothundi",
      "Naadi Nilichipogaane Aathma Egiripothundi",
      "Antha Aa Daiva Nirnayam",
      "Manishi Kaalagatha Devuni Aadesham",
      "Puttagaane Thottelo Vesthaaru",
      "Gittagaane Pettelo Moosthaaru",
      "Jaagu Cheyaka Kaatiki Mosthaaru",
      "Aaradugula Guntalo Thosthaaru",
      "Aashinchinavevi Neeventaraavu"
    ]
  }
];

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
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error(e);
      }
    }

    const savedPlaylists = localStorage.getItem("songhub_playlists");
    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default playlist
      const defaultPlaylists = [
        { id: "fav-list", name: "My Favorites", songIds: [] },
        { id: "chill-list", name: "Chill Vibez", songIds: ["1", "5", "8"] }
      ];
      setPlaylists(defaultPlaylists);
      localStorage.setItem("songhub_playlists", JSON.stringify(defaultPlaylists));
    }

    const savedRecently = localStorage.getItem("songhub_recently");
    if (savedRecently) {
      try {
        setRecentlyPlayed(JSON.parse(savedRecently));
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
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(id => id !== currentSong.id);
        const updated = [currentSong.id, ...filtered].slice(0, 10);
        localStorage.setItem("songhub_recently", JSON.stringify(updated));
        return updated;
      });
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
        addSongToPlaylist,
        removeSongFromPlaylist
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
