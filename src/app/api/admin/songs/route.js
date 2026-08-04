import { NextResponse } from "next/server";
import { getFirebaseAdmin, verifyAdminAuth, COLLECTION_NAME, generateSongId, FieldValue } from "@/lib/admin-firebase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/songs
 * List all songs from the Youworship_songs collection.
 */
export async function GET(request) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const db = getFirebaseAdmin();
    const songsRef = db.collection(COLLECTION_NAME);
    const snapshot = await songsRef.get();

    const songs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort alphabetically in-memory to avoid needing a composite Firestore index
    songs.sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" }));

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Error listing songs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list songs." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/songs
 * Create a new song in the Youworship_songs collection.
 * Document ID is auto-generated as title-artistName.
 */
export async function POST(request) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Song title is required." }, { status: 400 });
    }

    const db = getFirebaseAdmin();


    let artistName = "Unknown Artist";
    let artistId = null;
    if (typeof body.artist === "object" && body.artist !== null) {
      artistName = body.artist.name?.trim() || "Unknown Artist";
      artistId = body.artist.id || null;
    } else if (typeof body.artist === "string" && body.artist.trim()) {
      artistName = body.artist.trim();
    }

    // Generate custom document ID: title-artistName
    const customId = generateSongId(body.title, artistName);

    // Convert lyrics if it is a string
    let inputLyrics = [];
    if (Array.isArray(body.lyrics)) {
      inputLyrics = body.lyrics;
    } else if (typeof body.lyrics === "string" && body.lyrics.trim()) {
      inputLyrics = [
        { language: "te", format: "original", title: "తెలుగు", content: body.lyrics.trim(), isDefault: true }
      ];
      if (body.englishLyrics && typeof body.englishLyrics === "string" && body.englishLyrics.trim()) {
        inputLyrics.push({
          language: "en",
          format: "transliteration",
          title: "Romanized",
          content: body.englishLyrics.trim()
        });
      }
    }

    const songsRef = db.collection(COLLECTION_NAME);

    // Check if a song with this ID already exists
    const existingDoc = await songsRef.doc(customId).get();
    if (existingDoc.exists) {
      const existingData = existingDoc.data() || {};
      const existingLyrics = Array.isArray(existingData.lyrics) ? existingData.lyrics : [];

      // Merge lyrics arrays by matching language
      const lyricsMap = {};
      existingLyrics.forEach((l) => {
        if (l && l.language) lyricsMap[l.language] = l;
      });
      inputLyrics.forEach((l) => {
        if (l && l.language) lyricsMap[l.language] = l;
      });
      const mergedLyrics = Object.values(lyricsMap);

      // Ensure that at least one lyric block is set as default
      if (mergedLyrics.length > 0 && !mergedLyrics.some((l) => l.isDefault)) {
        mergedLyrics[0].isDefault = true;
      }

      // Merge categories, tags, and media
      const mergedCategories = Array.from(new Set([
        ...(Array.isArray(body.category) ? body.category : (body.category ? [body.category] : [])),
        ...(Array.isArray(existingData.category) ? existingData.category : (existingData.category ? [existingData.category] : []))
      ]));

      const mergedTags = Array.from(new Set([
        ...(Array.isArray(body.tags) ? body.tags : []),
        ...(Array.isArray(existingData.tags) ? existingData.tags : [])
      ]));

      const updateData = {
        title: body.title.trim(),
        titleEnglish: body.titleEnglish ? body.titleEnglish.trim() : (existingData.titleEnglish || ""),
        artist: { id: artistId, name: artistName },
        language: body.language || existingData.language || "te",
        category: mergedCategories,
        album: body.album !== undefined ? body.album : (existingData.album || null),
        year: typeof body.year === "number" ? body.year : (existingData.year || new Date().getFullYear()),
        duration: typeof body.duration === "number" ? body.duration : (existingData.duration || null),
        tags: mergedTags,
        lyrics: mergedLyrics,
        media: {
          image: body.media?.image || body.imageUrl || existingData.media?.image || existingData.imageUrl || "",
          audio: body.media?.audio || body.audioUrl || existingData.media?.audio || existingData.audioUrl || "",
          video: body.media?.video || body.videoUrl || existingData.media?.video || existingData.videoUrl || "",
        },
        updatedBy: auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await songsRef.doc(customId).update(updateData);

      return NextResponse.json(
        { success: true, id: customId, message: "Song updated successfully." },
        { status: 200 }
      );
    }

    const songData = {
      id: customId,
      title: body.title.trim(),
      titleEnglish: body.titleEnglish ? body.titleEnglish.trim() : "",
      slug: customId,
      artist: { id: artistId, name: artistName },
      language: body.language || "te",
      category: Array.isArray(body.category) ? body.category : (body.category ? [body.category] : []),
      album: body.album || null,
      year: typeof body.year === "number" ? body.year : new Date().getFullYear(),
      duration: typeof body.duration === "number" ? body.duration : null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      lyrics: inputLyrics,
      media: body.media || { image: "", audio: "", video: "" },
      createdBy: auth.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await songsRef.doc(customId).set(songData);

    return NextResponse.json(
      { success: true, id: customId, message: "Song added successfully." },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding song:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add song." },
      { status: 500 }
    );
  }
}
