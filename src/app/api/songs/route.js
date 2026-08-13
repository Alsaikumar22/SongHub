import { songService } from "@/services/songService";

export const dynamic = "force-dynamic";

/**
 * GET /api/songs
 * Optional server-side API route returning all songs from youworship_songs
 */
export async function GET() {
  try {
    const songs = await songService.getAllSongs();
    return Response.json({ songs, count: songs.length });
  } catch (error) {
    console.error("GET /api/songs error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch songs from youworship_songs" },
      { status: 500 },
    );
  }
}
