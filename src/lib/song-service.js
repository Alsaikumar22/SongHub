/**
 * Song Service — Fetch & transform songs from Firebase `songs` collection
 *
 * The Firebase `songs` collection stores songs in a raw format.
 * This service fetches them and transforms them into the app's
 * expected structure with sensible defaults for missing fields.
 *
 * Recommended Song Structure:
 * ───────────────────────────
 * id              (string)    Document ID
 * title           (string)    Telugu title (primary)
 * teluguTitle     (string)    Same as title (Telugu)
 * titleEnglish    (string)    English title (for bilingual display)
 * teluguFirstLetter (string)  First Telugu character (for alphabet index)
 * artist          (string)    Artist name
 * lyricist       (string)    Songwriter credit
 * album           (string)    Album name
 * genre           (string)    Genre (from category/theme fallback)
 * language        (string)    Language ("Telugu", "English")
 * category        (string)    Category ("Praise & Worship")
 * theme           (string)    Theme ("Worship")
 * duration        (string)    Display duration ("4:30")
 * durationSec     (number)    Duration in seconds (270)
 * coverUrl        (string)    Cover art URL
 * audioUrl        (string)    Audio file URL
 * youtubeUrl      (string)    YouTube video URL
 * spotifyUrl      (string)    Spotify URL
 * releaseYear     (number)    Release year
 * bpm             (number)    Beats per minute
 * plays           (number)    Play count
 * lyricsTelugu    (string[])  Telugu lyrics (verse array)
 * lyricsEnglish   (string[])  English lyrics (verse array)
 * summary         (string)    Description/summary
 * background      (string)    Gradient/background color
 */

import { db } from "./firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Extract the first Telugu character from a Telugu string.
 * Telugu range: \u0C00-\u0C7F
 */
function extractFirstTeluguLetter(str) {
  if (!str) return "";
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    if (code >= 0x0c00 && code <= 0x0c7f) return ch;
  }
  return str.charAt(0).toUpperCase();
}

/**
 * Parse a single lyrics string into an array of verses.
 * Splits by double newlines (paragraph/verse breaks).
 */
function parseLyrics(lyrics) {
  if (!lyrics || typeof lyrics !== "string") return [];
  return lyrics
    .split(/\n\n+/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/**
 * Format seconds into "m:ss" display string.
 */
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Transform: Firebase doc → App song object ──────────────────────────

function transformSong(docId, data) {
  const title = data.title || "";
  const language = data.language || "Telugu";
  const isEnglish = language === "English";

  // Route lyrics based on language + available fields
  const rawLyrics = data.lyrics || "";
  const rawEnglishLyrics = data.englishLyrics || data.lyricsEnglish || "";

  let lyricsTelugu = [];
  let lyricsEnglish = [];

  if (isEnglish) {
    lyricsEnglish = data.lyricsEnglish || parseLyrics(rawLyrics);
    lyricsTelugu = data.lyricsTelugu || [];
    // If englishLyrics exists separately, use that instead
    if (data.englishLyrics) {
      lyricsEnglish = parseLyrics(data.englishLyrics);
    }
  } else {
    lyricsTelugu = data.lyricsTelugu || parseLyrics(rawLyrics);
    lyricsEnglish = data.lyricsEnglish || parseLyrics(rawEnglishLyrics);
  }

  return {
    id: docId,
    title: title,
    teluguTitle: data.teluguTitle || title,
    titleEnglish: data.titleEnglish || "",
    teluguFirstLetter: extractFirstTeluguLetter(data.teluguTitle || title),
    artist: data.artist || "Unknown Artist",
    lyricist: data.lyricist || data.artist || "",
    album: data.album || "Unknown Album",
    genre: data.genre || data.category || data.theme || "Worship",
    language: language,
    category: data.category || "",
    theme: data.theme || "",

    // Duration
    duration: data.duration || formatDuration(data.durationSec || 0),
    durationSec: data.durationSec || 0,

    // Media
    coverUrl: data.coverUrl || data.imageUrl || "",
    audioUrl: data.audioUrl || "",
    youtubeUrl: data.youtubeUrl || "",
    spotifyUrl: data.spotifyUrl || "",

    // Metadata
    releaseYear: data.releaseYear || data.year || new Date().getFullYear(),
    bpm: data.bpm || 0,
    plays: data.plays || 0,

    // Lyrics (properly routed by language)
    lyricsTelugu,
    lyricsEnglish,

    // Extra info
    summary: data.summary || "",
    background: data.background || "",
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Fetch all songs from the Firebase `songs` collection.
 * Returns transformed song objects ready for the app.
 */
export async function getAllSongs() {
  try {
    const q = collection(db, "songs");
    const snap = await getDocs(q);

    if (snap.empty) {
      console.warn("⚠️  No songs found in Firebase 'songs' collection.");
      return [];
    }

    const songs = snap.docs.map((doc) => transformSong(doc.id, doc.data()));
    console.log(`🎵 Loaded ${songs.length} songs from Firebase`);
    return songs;
  } catch (error) {
    console.error("❌ Error fetching songs from Firebase:", error);
    return [];
  }
}

/**
 * Fetch a single song by document ID.
 */
export async function getSongById(songId) {
  try {
    const ref = doc(db, "songs", songId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return transformSong(snap.id, snap.data());
  } catch (error) {
    console.error(`❌ Error fetching song ${songId}:`, error);
    return null;
  }
}

/**
 * Transform a single raw Firebase data object (useful for real-time updates).
 */
export function transformRawSong(docId, data) {
  return transformSong(docId, data);
}
