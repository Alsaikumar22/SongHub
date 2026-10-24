import { NextResponse } from "next/server";
import { songService } from "@/services/songService";
import Fuse from "fuse.js";

// Helper: Format seconds to M:SS or MM:SS
function formatDuration(totalSec) {
  if (!totalSec || isNaN(totalSec)) return "0:00";
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Global Lyrics Search Index Cache ────────────────────────────────
let _lyricsSearchIndex = null;
let _lyricsIndexTs = 0;
const LYRICS_INDEX_TTL = 300_000; // 5 minutes

function getLyricsSearchIndex(allSongs) {
  if (_lyricsSearchIndex && Date.now() - _lyricsIndexTs < LYRICS_INDEX_TTL) {
    return _lyricsSearchIndex;
  }

  const entries = [];
  for (const song of allSongs) {
    const lines = [];
    if (typeof song.lyricsTelugu === "string") {
      lines.push(...song.lyricsTelugu.split("\n"));
    }
    if (typeof song.lyricsEnglish === "string") {
      lines.push(...song.lyricsEnglish.split("\n"));
    }
    if (Array.isArray(song.lyrics)) {
      song.lyrics.forEach((block) => {
        if (block && block.content) {
          lines.push(...block.content.split("\n"));
        }
      });
    }

    const cleanLines = lines.map((l) => l.trim()).filter((l) => l.length > 2);
    for (const line of cleanLines) {
      entries.push({
        song,
        line,
      });
    }
  }

  _lyricsSearchIndex = new Fuse(entries, {
    keys: ["line", "song.title", "song.titleEnglish"],
    threshold: 0.35,
    distance: 120,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
  _lyricsIndexTs = Date.now();

  return _lyricsSearchIndex;
}

// ─── Tool 1: Search Songs by Mood / Category / Language / Keywords ───
function toolSearchSongs(allSongs, { mood, language, category, keywords, maxResults = 8 }) {
  let filtered = [...allSongs];

  // Language filter
  if (language) {
    const langLower = language.toLowerCase();
    filtered = filtered.filter((s) => {
      const sLang = (s.language || "").toLowerCase();
      if (langLower.includes("telugu") || langLower === "te") {
        return sLang === "te" || sLang === "telugu" || !sLang;
      }
      if (langLower.includes("english") || langLower === "en") {
        return sLang === "en" || sLang === "english";
      }
      if (langLower.includes("hindi") || langLower === "hi") {
        return sLang === "hi" || sLang === "hindi";
      }
      return sLang.includes(langLower);
    });
  }

  // Keywords / Mood / Theme Scoring
  const searchTerms = [];
  if (mood) searchTerms.push(...mood.toLowerCase().split(/\s+/));
  if (category) searchTerms.push(...category.toLowerCase().split(/\s+/));
  if (keywords) searchTerms.push(...keywords.toLowerCase().split(/\s+/));

  const validTerms = searchTerms.filter((t) => t.length >= 2);

  if (validTerms.length > 0) {
    const scored = filtered
      .map((song) => {
        let score = 0;
        const textToSearch = [
          song.title || "",
          song.titleEnglish || "",
          song.teluguTitle || "",
          song.category || "",
          Array.isArray(song.categoryArr) ? song.categoryArr.join(" ") : "",
          Array.isArray(song.tags) ? song.tags.join(" ") : "",
          song.artist || "",
          typeof song.lyricsTelugu === "string" ? song.lyricsTelugu.substring(0, 300) : "",
          typeof song.lyricsEnglish === "string" ? song.lyricsEnglish.substring(0, 300) : "",
        ]
          .join(" ")
          .toLowerCase();

        for (const term of validTerms) {
          if (textToSearch.includes(term)) {
            score += 2;
            if (
              (song.title || "").toLowerCase().includes(term) ||
              (song.titleEnglish || "").toLowerCase().includes(term)
            ) {
              score += 5;
            }
          }
        }

        // Boost playable tracks
        if (song.audioUrl || song.media?.audio) {
          score += 1;
        }

        return { song, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      return scored.slice(0, maxResults).map((item) => item.song);
    }
  }

  return filtered.slice(0, maxResults);
}

// ─── Tool 2: Create Playlist by Target Duration ──────────────────────
function toolCreatePlaylist(allSongs, { targetMinutes = 30, language, occasion, mood }) {
  const targetSec = Math.max(300, targetMinutes * 60);

  // Search filtered pool
  let pool = toolSearchSongs(allSongs, {
    language,
    mood,
    category: occasion,
    keywords: `${occasion || ""} ${mood || ""}`.trim(),
    maxResults: 50,
  });

  // If pool is sparse, add broader songs from the catalog
  if (pool.length < 10) {
    const remaining = allSongs.filter((s) => !pool.some((p) => p.id === s.id));
    pool = [...pool, ...remaining];
  }

  // Shuffle candidate pool
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

  const selected = [];
  let accumulatedSec = 0;
  const toleranceSec = 240;

  for (const song of shuffledPool) {
    const sec = song.durationSec && song.durationSec > 60 ? song.durationSec : 270;
    if (accumulatedSec + sec <= targetSec + toleranceSec) {
      selected.push(song);
      accumulatedSec += sec;
    }
    if (accumulatedSec >= targetSec - 60) {
      break;
    }
  }

  if (selected.length === 0 && shuffledPool.length > 0) {
    selected.push(shuffledPool[0]);
    accumulatedSec += shuffledPool[0].durationSec || 270;
  }

  const occasionTitle = occasion ? occasion.charAt(0).toUpperCase() + occasion.slice(1) : "Worship";
  const playlistTitle = `${targetMinutes}-Minute ${occasionTitle} Set`;

  return {
    title: playlistTitle,
    description: `Curated ${targetMinutes}-minute worship set created with YouWorship AI.`,
    songs: selected,
    totalDurationSec: accumulatedSec,
    totalDurationFormatted: formatDuration(accumulatedSec),
    songCount: selected.length,
  };
}

// ─── Tool 3: Search Song by Lyrics ──────────────────────────────────
function toolSearchLyrics(allSongs, { queryText, maxResults = 5 }) {
  if (!queryText || !queryText.trim()) return [];

  const fuse = getLyricsSearchIndex(allSongs);
  const results = fuse.search(queryText.trim());

  const seenSongIds = new Set();
  const matched = [];

  for (const r of results) {
    const s = r.item.song;
    if (!seenSongIds.has(s.id)) {
      seenSongIds.add(s.id);
      matched.push({
        song: s,
        matchedLine: r.item.line,
        score: r.score,
      });
    }
    if (matched.length >= maxResults) break;
  }

  return matched;
}

// ─── Tool 4: Plan Worship Service ────────────────────────────────────
function toolPlanWorshipService(allSongs, { targetMinutes = 45, language, occasion }) {
  const STAGES = [
    {
      stage: "Opening & Call to Worship",
      keywords: ["opening", "call", "start", "holy", "welcome", "prayer", "పరిశుద్ధుడా", "సన్నిధి"],
      purpose: "Reverent invitation into God's presence",
    },
    {
      stage: "High Praise & Celebration",
      keywords: ["praise", "joy", "hosanna", "halleluya", "celebrate", "victory", "స్తుతి", "జయము", "హోసన్నా"],
      purpose: "Joyful thanksgiving and celebration",
    },
    {
      stage: "Deep Worship & Adoration",
      keywords: ["worship", "holy", "adore", "glory", "king", "aradhana", "ఆరాధన", "మహిమ", "రాజు"],
      purpose: "Intimate adoration and exalting Christ",
    },
    {
      stage: "Reflection & Surrender",
      keywords: ["cross", "grace", "surrender", "spirit", "peace", "prayer", "సిలువ", "కృప", "శాంతి"],
      purpose: "Quiet reflection, confession, and prayer",
    },
    {
      stage: "Closing & Commissioning",
      keywords: ["amen", "blessing", "send", "faith", "hope", "forever", "దీవెన", "నిత్యము", "ఆమేన్"],
      purpose: "Benediction and carrying God's light into the week",
    },
  ];

  const planStages = [];
  const usedSongIds = new Set();
  let accumulatedSec = 0;

  for (const stageDef of STAGES) {
    const matches = toolSearchSongs(allSongs, {
      language,
      keywords: stageDef.keywords.join(" "),
      maxResults: 20,
    });

    let selectedSong = matches.find((s) => !usedSongIds.has(s.id));
    if (!selectedSong) {
      selectedSong = allSongs.find((s) => !usedSongIds.has(s.id));
    }

    if (selectedSong) {
      usedSongIds.add(selectedSong.id);
      const songSec = selectedSong.durationSec && selectedSong.durationSec > 60 ? selectedSong.durationSec : 270;
      accumulatedSec += songSec;
      planStages.push({
        stage: stageDef.stage,
        purpose: stageDef.purpose,
        song: selectedSong,
        duration: selectedSong.duration || formatDuration(songSec),
        durationSec: songSec,
      });
    }
  }

  const planTitle = `${targetMinutes}-Minute Worship Service Order`;

  return {
    title: planTitle,
    occasion: occasion || "Sunday Service",
    stages: planStages,
    totalDurationSec: accumulatedSec,
    totalDurationFormatted: formatDuration(accumulatedSec),
    allSongs: planStages.map((s) => s.song),
  };
}

// ─── Main POST Handler ───────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, language = "Telugu" } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.trim();
    const lowerPrompt = cleanPrompt.toLowerCase();

    // 1. Fetch real song catalog from cache
    const allSongs = await songService.getAllSongs();

    if (!allSongs || allSongs.length === 0) {
      return NextResponse.json({
        reply: "No songs are currently available in the database.",
        type: "chat",
        data: null,
      });
    }

    // 2. Intent Detection

    // A. Lyrics Search Intent
    const isLyricsIntent =
      lowerPrompt.includes("lyric") ||
      lowerPrompt.includes("line") ||
      lowerPrompt.includes("words") ||
      lowerPrompt.includes("remember") ||
      lowerPrompt.startsWith("find by lyrics") ||
      lowerPrompt.startsWith("find lyrics");

    if (isLyricsIntent) {
      const queryText = cleanPrompt
        .replace(/find\s+(?:by\s+)?lyrics(?:\s*[:\-])?/gi, "")
        .replace(/i\s+remember\s+lyrics(?:\s*[:\-])?/gi, "")
        .replace(/song\s+with\s+lyrics(?:\s*[:\-])?/gi, "")
        .replace(/lyrics(?:\s*[:\-])?/gi, "")
        .trim();

      const lyricMatches = toolSearchLyrics(allSongs, {
        queryText: queryText || cleanPrompt,
        maxResults: 4,
      });

      if (lyricMatches.length > 0) {
        return NextResponse.json({
          reply: `I searched the lyrics index and found ${lyricMatches.length} matching song${
            lyricMatches.length > 1 ? "s" : ""
          } in YouWorship:`,
          type: "lyrics_results",
          data: {
            matches: lyricMatches,
            query: queryText,
          },
        });
      } else {
        return NextResponse.json({
          reply: `I searched our entire lyrics database for "${queryText || cleanPrompt}", but didn't find an exact line match. Try with different keywords or check spelling.`,
          type: "chat",
          data: null,
        });
      }
    }

    // B. Worship Plan Intent
    const isWorshipPlanIntent =
      lowerPrompt.includes("plan") ||
      lowerPrompt.includes("order of service") ||
      lowerPrompt.includes("service order") ||
      lowerPrompt.includes("service plan");

    if (isWorshipPlanIntent) {
      let targetMins = 45;
      const durationMatch = lowerPrompt.match(/(\d+)\s*(?:min|minute|m\b)/);
      if (durationMatch && durationMatch[1]) {
        targetMins = parseInt(durationMatch[1], 10);
      } else if (lowerPrompt.includes("1 hour") || lowerPrompt.includes("hour")) {
        targetMins = 60;
      }

      const plan = toolPlanWorshipService(allSongs, {
        targetMinutes: targetMins,
        language: lowerPrompt.includes("english") ? "English" : language,
        occasion: lowerPrompt.includes("sunday") ? "Sunday Morning Service" : "Worship Service",
      });

      return NextResponse.json({
        reply: `Here is a structured **${targetMins}-Minute Worship Service Plan** crafted from genuine songs in our catalog:`,
        type: "worship_plan",
        data: plan,
      });
    }

    // C. Playlist Creation Intent
    const isPlaylistIntent =
      lowerPrompt.includes("playlist") ||
      lowerPrompt.includes("setlist") ||
      lowerPrompt.includes("minute worship") ||
      lowerPrompt.includes("min worship");

    if (isPlaylistIntent) {
      let targetMins = 30;
      const durationMatch = lowerPrompt.match(/(\d+)\s*(?:min|minute|m\b)/);
      if (durationMatch && durationMatch[1]) {
        targetMins = parseInt(durationMatch[1], 10);
      } else if (lowerPrompt.includes("45 min") || lowerPrompt.includes("45-minute")) {
        targetMins = 45;
      } else if (lowerPrompt.includes("1 hour") || lowerPrompt.includes("60 min")) {
        targetMins = 60;
      }

      const occasion = lowerPrompt.includes("sunday")
        ? "Sunday Morning"
        : lowerPrompt.includes("prayer")
        ? "Prayer & Fasting"
        : lowerPrompt.includes("youth")
        ? "Youth Worship"
        : "Praise & Worship";

      const playlistDraft = toolCreatePlaylist(allSongs, {
        targetMinutes: targetMins,
        language: lowerPrompt.includes("english") ? "English" : language,
        occasion,
        mood: lowerPrompt.includes("peaceful") ? "peaceful" : lowerPrompt.includes("praise") ? "praise" : "",
      });

      return NextResponse.json({
        reply: `I crafted a **${targetMins}-minute playlist draft** (${playlistDraft.totalDurationFormatted} total) tailored for ${occasion}:`,
        type: "playlist_draft",
        data: playlistDraft,
      });
    }

    // D. Default Mood / Topic Search Intent
    const searchResults = toolSearchSongs(allSongs, {
      mood: lowerPrompt,
      language: lowerPrompt.includes("english") ? "English" : language,
      keywords: cleanPrompt,
      maxResults: 6,
    });

    if (searchResults.length > 0) {
      return NextResponse.json({
        reply: `I found ${searchResults.length} song${
          searchResults.length > 1 ? "s" : ""
        } in YouWorship matching your request:`,
        type: "song_results",
        data: {
          songs: searchResults,
          query: cleanPrompt,
        },
      });
    }

    const generalSongs = allSongs.slice(0, 4);
    return NextResponse.json({
      reply: `I couldn't find exact matches for "${cleanPrompt}". Here are popular worship songs in our catalog you might like:`,
      type: "song_results",
      data: {
        songs: generalSongs,
        query: cleanPrompt,
      },
    });
  } catch (error) {
    console.error("❌ [YouWorship AI Assistant API Error]:", error);
    return NextResponse.json(
      {
        reply: "I ran into a problem processing your request. Please try again with different keywords.",
        type: "chat",
        data: null,
      },
      { status: 500 }
    );
  }
}
