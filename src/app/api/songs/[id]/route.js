import { getSongById } from "@/lib/song-service";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const song = await getSongById(id);

    if (!song) {
      return Response.json({ error: "Song not found" }, { status: 404 });
    }

    return Response.json({ song });
  } catch (error) {
    console.error(`GET /api/songs/${params?.id} error:`, error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
