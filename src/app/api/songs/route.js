import { songService } from "@/services/songService";

export const dynamic = "force-dynamic";

/**
 * GET /api/songs
 * Returns a lightweight summary of all songs (lyrics/chords stripped).
 * Server-side in-memory cache (60 s) + HTTP cache headers for fast loads.
 */
export async function GET() {
  try {
    const songs = await songService.getAllSongsSummary();
    return Response.json(
      { songs, count: songs.length },
      {
        headers: {
          // Browser can serve from cache for 30 s, revalidate in background
          "Cache-Control": "public, s-maxage=60, max-age=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/songs error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch songs from youworship_songs" },
      { status: 500 },
    );
  }
}
