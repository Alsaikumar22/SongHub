import { getSongById, getAllSongs } from "@/lib/song-service";

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params;

    let targetId = rawId;
    try {
      targetId = decodeURIComponent(rawId);
    } catch (e) {
      targetId = rawId;
    }

    let song = await getSongById(targetId);
    if (!song && targetId !== rawId) {
      song = await getSongById(rawId);
    }

    if (!song) {
      const allSongs = await getAllSongs();
      song = allSongs.find(
        (s) =>
          s.id === targetId ||
          s.id === rawId ||
          decodeURIComponent(s.id || "") === targetId
      );
    }

    if (!song) {
      return Response.json({ error: "Song not found" }, { status: 404 });
    }

    return Response.json({ song });
  } catch (error) {
    console.error(`GET /api/songs error:`, error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
