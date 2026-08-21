import { db, COLLECTIONS } from "../firebase/firestore";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { getEnglishSlug } from "@/utils/songSlug";

/**
 * Parses raw lyrics text into an array of verse lines/paragraphs
 * Splits by double newlines or single newlines if needed
 */
function parseLyrics(lyrics) {
  if (!lyrics) return "";
  if (typeof lyrics === "string") return lyrics.trim();
  if (Array.isArray(lyrics)) return lyrics;
  return "";
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
  const title = (data.title || "").replace(/-/g, " ");
  const slug = data.slug || docId;

  // 2. Artist Object
  let rawArtistName = "";
  let rawArtistNameEnglish = "";
  let artistId = null;
  if (typeof data.artist === "object" && data.artist !== null) {
    rawArtistName = data.artist.name || "";
    rawArtistNameEnglish = data.artist.nameEnglish || "";
    artistId = data.artist.id || null;
  } else if (typeof data.artist === "string") {
    rawArtistName = data.artist;
  } else if (typeof data.artistName === "string") {
    rawArtistName = data.artistName;
  }

  if (typeof data.artistNameEnglish === "string") {
    rawArtistNameEnglish = data.artistNameEnglish;
  }

  const cleanArtist = rawArtistName.trim();
  const invalidArtistValues = [
    "na",
    "n/a",
    "unknown",
    "none",
    "null",
    "undefined",
    "",
  ];
  const artistName =
    !cleanArtist || invalidArtistValues.includes(cleanArtist.toLowerCase())
      ? "Unknown Artist"
      : cleanArtist;

  const cleanArtistEnglish = rawArtistNameEnglish.trim();
  const artistNameEnglish =
    !cleanArtistEnglish ||
    invalidArtistValues.includes(cleanArtistEnglish.toLowerCase())
      ? "Unknown Artist"
      : cleanArtistEnglish;

  const artistObj = {
    id: artistId,
    name: artistName,
    nameEnglish: artistNameEnglish,
  };

  // 3. Categories & Tags
  const categoryArr = Array.isArray(data.category)
    ? data.category
    : data.category
      ? [data.category]
      : ["Praise & Worship"];
  const categoryPrimary = categoryArr[0] || "Praise & Worship";

  const tagsArr = Array.isArray(data.tags)
    ? data.tags
    : typeof data.tags === "string"
      ? data.tags.split(",").map((t) => t.trim())
      : [];

  // 4. Duration
  const durationSec =
    typeof data.duration === "number"
      ? data.duration
      : typeof data.duration === "string" && data.duration.includes(":")
        ? data.duration.split(":").reduce((acc, time) => 60 * acc + +time, 0)
        : Number(data.duration) || 0;
  const durationDisplay = formatSecondsToDisplay(durationSec);

  // 5. Media Object
  const rawAudio = data.media?.audio || data.audioUrl || "";
  const rawVideo = data.media?.video || data.videoUrl || data.youtubeUrl || "";

  const youtubeId = extractYouTubeId(rawAudio) || extractYouTubeId(rawVideo);

  let audioUrl = rawAudio;
  let videoUrl = rawVideo;

  // If audio field contains a YouTube URL or fake placeholder with YouTube video present, route to video & clear audioUrl
  if (
    rawAudio.includes("youtube.com") ||
    rawAudio.includes("youtu.be") ||
    (youtubeId && rawAudio.includes("soundhelix.com"))
  ) {
    if (!videoUrl) videoUrl = rawAudio;
    audioUrl = "";
  }

  const mediaObj = {
    image: data.media?.image || data.imageUrl || data.coverUrl || "",
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
      {
        language: "te",
        format: "original",
        title: "తెలుగు",
        content: teluguLyricsText,
        isDefault: true,
      },
      {
        language: "en",
        format: "transliteration",
        title: "Romanized",
        content: englishLyricsText,
      },
    ];
  }

  const firstLetter = title ? title.charAt(0).toUpperCase() : "";
  let titleEnglish = (data.titleEnglish || "").replace(/-/g, " ");

  // If the language is Tamil and titleEnglish is empty or contains Tamil characters,
  // extract the English transliteration from the first line of the English lyrics block.
  const isTamil = (data.language || "").toLowerCase() === "ta" || (data.language || "").toLowerCase() === "tamil" || /[\u0B80-\u0BFF]/.test(title);
  if (isTamil && (!titleEnglish || /[\u0B80-\u0BFF]/.test(titleEnglish))) {
    let enContent = "";
    if (Array.isArray(data.lyrics) && data.lyrics.length > 0) {
      const enBlock = data.lyrics.find((l) => l.language === "en");
      enContent = enBlock?.content || "";
    } else if (typeof data.englishLyrics === "string") {
      enContent = data.englishLyrics;
    } else if (typeof data.lyrics === "string") {
      enContent = data.englishLyrics || "";
    }
    if (enContent) {
      const firstLine = enContent.split("\n").map(line => line.trim()).filter(Boolean)[0];
      if (firstLine && !/[\u0B80-\u0BFF]/.test(firstLine)) {
        titleEnglish = firstLine;
      }
    }
  }

  return {
    id: docId,
    title,
    titleEnglish,
    slug: slug || docId,
    slugEnglish: getEnglishSlug(titleEnglish),
    artist: artistName,
    artistObj: artistObj,
    artistName: artistName,
    artistNameEnglish: artistNameEnglish,
    language: data.language || "te",
    category: categoryPrimary,
    categoryArr: categoryArr,
    categoryPrimary: categoryPrimary,
    genre: categoryPrimary,
    album: data.album || null,
    year:
      data.year !== undefined && data.year !== null ? Number(data.year) : 2026,
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
    chords: Array.isArray(data.chords)
      ? data.chords
      : typeof data.chords === "string" && data.chords.trim()
        ? data.chords.split("\n")
        : [],
    chordCredits: data.chordCredits || "",
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

/**
 * True when a song is Tamil. Tamil songs are temporarily excluded from the
 * app (the owner will re-add Tamil content later); remove this filter once
 * Tamil songs are ready.
 */
function isTamilSong(song) {
  if (!song) return false;
  const lang = (song.language || "").toLowerCase();
  return (
    lang === "ta" ||
    lang === "tamil" ||
    /[\u0B80-\u0BFF]/.test(song.title || "")
  );
}

/**
 * Song Service — Manages Firestore operations for youworship_songs
 */
export const songService = {
  /**
   * Fetch all songs from 'youworship_songs' collection sorted alphabetically by title.
   * Uses client-side fallback sorting to handle mixed language characters smoothly.
   *
   * @returns {Promise<Array>} List of transformed song objects with document IDs
   */
  async getAllSongs() {
    try {
      const songsRef = collection(db, COLLECTIONS.YOUWORSHIP_SONGS);
      const snapshot = await getDocs(songsRef);

      if (snapshot.empty) {
        console.warn("⚠️ No songs found in 'youworship_songs' collection.");
        return [];
      }

      const songs = snapshot.docs
        .map((docSnap) => transformSongDoc(docSnap))
        .filter((song) => song && !isTamilSong(song)); // exclude Tamil songs for now

      // Sort alphabetically by title
      songs.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", undefined, {
          sensitivity: "base",
        }),
      );

      console.log(
        `🍟 [songService] Loaded ${songs.length} songs from youworship_songs.`,
      );
      return songs;
    } catch (error) {
      console.error(
        "❌ [songService.getAllSongs] Error fetching songs:",
        error,
      );
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
        const song = transformSongDoc(docSnap);
        return song && !isTamilSong(song) ? song : null;
      }

      // 2. Lookup by raw songId
      if (targetId !== songId) {
        const rawRef = doc(db, COLLECTIONS.YOUWORSHIP_SONGS, songId);
        const rawSnap = await getDoc(rawRef);
        if (rawSnap.exists()) {
          const song = transformSongDoc(rawSnap);
          return song && !isTamilSong(song) ? song : null;
        }
      }

      // 3. Fallback: Search all songs list for matching ID or Slug (with NFC normalization)
      const allSongs = await this.getAllSongs();
      const targetNFC = (targetId || "").normalize("NFC");
      const songNFC = (songId || "").normalize("NFC");

      const match = allSongs.find((s) => {
        const sIdNFC = (s.id || "").normalize("NFC");
        const sSlugNFC = (s.slug || "").normalize("NFC");
        const sSlugEnglishNFC = (s.slugEnglish || "").normalize("NFC");
        return (
          sIdNFC === targetNFC ||
          sIdNFC === songNFC ||
          sSlugNFC === targetNFC ||
          sSlugNFC === songNFC ||
          sSlugEnglishNFC === targetNFC ||
          sSlugEnglishNFC === songNFC ||
          decodeURIComponent(sIdNFC) === targetNFC ||
          decodeURIComponent(sSlugNFC) === targetNFC
        );
      });

      if (match) return match;

      console.warn(`⚠️ Song document with ID/Slug '${songId}' not found.`);
      return null;
    } catch (error) {
      console.error(
        `❌ [songService.getSongById] Error fetching song '${songId}':`,
        error,
      );
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
      const allSongs = await this.getAllSongs();
      const lowerCat = category.trim().toLowerCase();
      const songs = allSongs.filter((s) => {
        if (Array.isArray(s.categoryArr)) {
          return s.categoryArr.some((c) => c.trim().toLowerCase() === lowerCat);
        }
        if (typeof s.category === "string") {
          return s.category.trim().toLowerCase() === lowerCat;
        }
        return false;
      });
      return songs.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
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
          (s.title && s.title.trim().startsWith(letter)),
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
    return allSongs.filter((s) => {
      const lyricsStr = Array.isArray(s.lyrics)
        ? s.lyrics.join(" ")
        : s.lyrics || "";
      return (
        s.title.toLowerCase().includes(q) ||
        s.titleEnglish.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        lyricsStr.toLowerCase().includes(q)
      );
    });
  },

  /**
   * Fetch the first 20 songs starting with the specified letter from Firestore.
   */
  async fetchInitialSongsForLetter(letter) {
    try {
      const songsRef = collection(db, COLLECTIONS.YOUWORSHIP_SONGS);
      const q = query(
        songsRef,
        where("firstLetter", "==", letter.toUpperCase()),
        orderBy("title"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const songs = snapshot.docs.map((docSnap) => transformSongDoc(docSnap)).filter(Boolean);
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      return { songs, lastDoc, hasMore: snapshot.docs.length === 20 };
    } catch (error) {
      console.error(`Error fetching initial songs for letter ${letter}:`, error);
      throw error;
    }
  },

  /**
   * Fetch all remaining songs starting with the specified letter from Firestore.
   */
  async fetchRemainingSongsForLetter(letter, lastDoc) {
    if (!lastDoc) return { songs: [], lastDoc: null, hasMore: false };
    try {
      const songsRef = collection(db, COLLECTIONS.YOUWORSHIP_SONGS);
      const q = query(
        songsRef,
        where("firstLetter", "==", letter.toUpperCase()),
        orderBy("title"),
        startAfter(lastDoc)
      );
      const snapshot = await getDocs(q);
      const songs = snapshot.docs.map((docSnap) => transformSongDoc(docSnap)).filter(Boolean);
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      return { songs, lastDoc: newLastDoc, hasMore: false };
    } catch (error) {
      console.error(`Error fetching remaining songs for letter ${letter}:`, error);
      throw error;
    }
  },

  /**
   * Fetch the next batch (limitCount) of songs starting with the specified letter from Firestore.
   */
  async fetchNextBatchForLetter(letter, lastDoc, limitCount = 20) {
    if (!lastDoc) return { songs: [], lastDoc: null, hasMore: false };
    try {
      const songsRef = collection(db, COLLECTIONS.YOUWORSHIP_SONGS);
      const q = query(
        songsRef,
        where("firstLetter", "==", letter.toUpperCase()),
        orderBy("title"),
        startAfter(lastDoc),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const songs = snapshot.docs.map((docSnap) => transformSongDoc(docSnap)).filter(Boolean);
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      return { songs, lastDoc: newLastDoc, hasMore: snapshot.docs.length === limitCount };
    } catch (error) {
      console.error(`Error fetching next batch for letter ${letter}:`, error);
      throw error;
    }
  }
};
