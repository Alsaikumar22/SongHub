import { db, COLLECTIONS } from "../firebase/firestore";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";

/**
 * Parses raw lyrics text into an array of verse lines/paragraphs
 * Splits by double newlines or single newlines if needed
 */
function parseLyrics(lyrics) {
  if (!lyrics || typeof lyrics !== "string") return [];
  return lyrics
    .split(/\n\n+/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function formatSecondsToDisplay(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/");
    return parts[1] ? parts[1].split("?")[0].split("&")[0] : null;
  }
  if (trimmed.includes("youtube.com")) {
    const match = trimmed.match(/[?&]v=([^&]+)/);
    if (match && match[1]) return match[1];
    if (trimmed.includes("/embed/")) {
      const parts = trimmed.split("/embed/");
      return parts[1] ? parts[1].split("?")[0].split("&")[0] : null;
    }
  }
  return null;
}

/**
 * Transforms a raw Firestore document snapshot into a standardized Song object.
 * Supports the NEW structured schema while preserving UI backwards-compatibility.
 *
 * @param {import("firebase/firestore").DocumentSnapshot} docSnap
 * @returns {Object} Standardized song object
 */
export function transformSongDoc(docSnap) {
  if (!docSnap.exists()) return null;

  const data = docSnap.data() || {};
  const docId = docSnap.id;

  // 1. Core Fields
  const title = data.title || "";
  const slug = data.slug || docId;

  // 2. Artist Object
  const artistObj = typeof data.artist === "object" && data.artist !== null
    ? data.artist
    : { id: null, name: data.artist || "Unknown Artist" };
  const artistName = artistObj.name || "Unknown Artist";

  // 3. Categories & Tags
  const categoryArr = Array.isArray(data.category)
    ? data.category
    : (data.category ? [data.category] : ["Praise & Worship"]);
  const categoryPrimary = categoryArr[0] || "Praise & Worship";

  const tagsArr = Array.isArray(data.tags)
    ? data.tags
    : (typeof data.tags === "string" ? data.tags.split(",").map((t) => t.trim()) : []);

  // 4. Duration
  const durationSec = typeof data.duration === "number"
    ? data.duration
    : (typeof data.duration === "string" && data.duration.includes(":")
        ? data.duration.split(":").reduce((acc, time) => (60 * acc) + +time, 0)
        : Number(data.duration) || 0);
  const durationDisplay = formatSecondsToDisplay(durationSec);

  // 5. Media Object
  const rawAudio = data.media?.audio || data.audioUrl || "";
  const rawVideo = data.media?.video || data.videoUrl || data.youtubeUrl || "";

  const youtubeId = extractYouTubeId(rawAudio) || extractYouTubeId(rawVideo);

  let audioUrl = rawAudio;
  let videoUrl = rawVideo;

  // If audio field contains a YouTube URL, route it to video & clear audioUrl for HTML5 audio
  if (rawAudio.includes("youtube.com") || rawAudio.includes("youtu.be")) {
    if (!videoUrl) videoUrl = rawAudio;
    audioUrl = "";
  }

  const mediaObj = {
    image:
      data.media?.image ||
      data.imageUrl ||
      data.coverUrl ||
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    audio: audioUrl ? audioUrl.trim() : "",
    video: videoUrl ? videoUrl.trim() : "",
    youtubeId: youtubeId || null,
  };

  // 6. Multilingual Lyrics Array
  let lyricsArray = [];
  let teluguLyricsText = "";
  let englishLyricsText = "";

  if (Array.isArray(data.lyrics) && data.lyrics.length > 0) {
    lyricsArray = data.lyrics;
    const teBlock = lyricsArray.find((l) => l.language === "te" || l.isDefault);
    const enBlock = lyricsArray.find((l) => l.language === "en");
    teluguLyricsText = teBlock?.content || lyricsArray[0]?.content || "";
    englishLyricsText = enBlock?.content || "";
  } else if (typeof data.lyrics === "string") {
    teluguLyricsText = data.lyrics;
    englishLyricsText = data.englishLyrics || "";
    lyricsArray = [
      { language: "te", format: "original", title: "తెలుగు", content: teluguLyricsText, isDefault: true },
      { language: "en", format: "transliteration", title: "Romanized", content: englishLyricsText }
    ];
  }

  const firstLetter = title ? title.charAt(0).toUpperCase() : "";

  return {
    id: docId,
    title,
    slug,
    artist: artistName,
    artistObj: artistObj,
    artistName: artistName,
    language: data.language || "te",
    category: categoryPrimary,
    categoryArr: categoryArr,
    categoryPrimary: categoryPrimary,
    genre: categoryPrimary,
    album: data.album || null,
    year: data.year !== undefined && data.year !== null ? Number(data.year) : 2026,
    releaseYear: data.year || 2026,
    duration: durationDisplay,
    durationSec,
    tags: tagsArr,
    lyrics: lyricsArray,
    lyricsTelugu: parseLyrics(teluguLyricsText),
    lyricsEnglish: parseLyrics(englishLyricsText),
    media: mediaObj,
    imageUrl: mediaObj.image,
    coverUrl: mediaObj.image,
    audioUrl: mediaObj.audio,
    videoUrl: mediaObj.video,
    youtubeUrl: mediaObj.video,
    youtubeId: youtubeId || null,
    teluguTitle: title,
    firstLetter,
    teluguFirstLetter: firstLetter,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

/**
 * Song Service — Manages Firestore operations for Youworship_songs
 */
export const songService = {
  /**
   * Fetch all songs from 'Youworship_songs' collection sorted alphabetically by title.
   * Uses client-side fallback sorting to handle mixed language characters smoothly.
   *
   * @returns {Promise<Array>} List of transformed song objects with document IDs
   */
  async getAllSongs() {
    try {
      const songsRef = collection(db, COLLECTIONS.YOUWORSHIP_SONGS);
      const snapshot = await getDocs(songsRef);

      if (snapshot.empty) {
        console.warn("⚠️ No songs found in 'Youworship_songs' collection.");
        return [];
      }

      const songs = snapshot.docs.map((docSnap) => transformSongDoc(docSnap));

      // Sort alphabetically by title
      songs.sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" }));

      console.log(`🎵 [songService] Loaded ${songs.length} songs from Youworship_songs.`);
      return songs;
    } catch (error) {
      console.error("❌ [songService.getAllSongs] Error fetching songs:", error);
      throw error;
    }
  },

  /**
   * Fetch a single song by its Firestore Document ID.
   *
   * @param {string} songId - Document ID
   * @returns {Promise<Object|null>} Song object or null if not found
   */
  async getSongById(songId) {
    if (!songId) return null;
    let targetId = songId;
    try {
      targetId = decodeURIComponent(songId);
    } catch (e) {
      targetId = songId;
    }

    try {
      // 1. Direct lookup by decoded targetId
      const songRef = doc(db, COLLECTIONS.YOUWORSHIP_SONGS, targetId);
      const docSnap = await getDoc(songRef);
      if (docSnap.exists()) {
        return transformSongDoc(docSnap);
      }

      // 2. Lookup by raw songId
      if (targetId !== songId) {
        const rawRef = doc(db, COLLECTIONS.YOUWORSHIP_SONGS, songId);
        const rawSnap = await getDoc(rawRef);
        if (rawSnap.exists()) {
          return transformSongDoc(rawSnap);
        }
      }

      // 3. Fallback: Search all songs list for matching ID
      const allSongs = await this.getAllSongs();
      const match = allSongs.find(
        (s) =>
          s.id === targetId ||
          s.id === songId ||
          decodeURIComponent(s.id || "") === targetId
      );

      if (match) return match;

      console.warn(`⚠️ Song document with ID '${songId}' not found.`);
      return null;
    } catch (error) {
      console.error(`❌ [songService.getSongById] Error fetching song '${songId}':`, error);
      throw error;
    }
  },

  /**
   * Fetch songs filtered by category.
   *
   * @param {string} category - Category name
   * @returns {Promise<Array>} List of matching songs
   */
  async getSongsByCategory(category) {
    if (!category) return this.getAllSongs();
    try {
      const songsRef = collection(db, COLLECTIONS.YOUWORSHIP_SONGS);
      const q = query(songsRef, where("category", "==", category));
      const snapshot = await getDocs(q);
      const songs = snapshot.docs.map((docSnap) => transformSongDoc(docSnap));
      return songs.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error(`❌ [songService.getSongsByCategory] Error:`, error);
      throw error;
    }
  },

  /**
   * Fetch songs starting with a specific first letter.
   *
   * @param {string} letter - Character/Letter
   * @returns {Promise<Array>} List of matching songs
   */
  async getSongsByFirstLetter(letter) {
    if (!letter) return this.getAllSongs();
    try {
      const allSongs = await this.getAllSongs();
      const targetLetter = letter.trim().toLowerCase();
      return allSongs.filter(
        (s) =>
          (s.firstLetter && s.firstLetter.toLowerCase() === targetLetter) ||
          (s.title && s.title.trim().startsWith(letter))
      );
    } catch (error) {
      console.error(`❌ [songService.getSongsByFirstLetter] Error:`, error);
      throw error;
    }
  },

  /**
   * Client-side search across title, artist, and lyrics.
   *
   * @param {string} searchQuery - Query string
   * @returns {Promise<Array>} List of matching songs
   */
  async searchSongs(searchQuery) {
    if (!searchQuery || !searchQuery.trim()) return this.getAllSongs();
    const q = searchQuery.trim().toLowerCase();
    const allSongs = await this.getAllSongs();
    return allSongs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.titleEnglish.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.lyrics.toLowerCase().includes(q)
    );
  }
};
