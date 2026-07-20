import { getAllSongs } from "@/lib/song-service";

export async function GET() {
  try {
    const songs = await getAllSongs();
    return Response.json({ songs });
  } catch (error) {
    console.error("GET /api/songs error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
