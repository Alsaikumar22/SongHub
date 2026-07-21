import { db } from "./config";
import { collection, doc } from "firebase/firestore";

/**
 * Collection Name Constants
 */
export const COLLECTIONS = {
  YOUWORSHIP_SONGS: "Youworship_songs",
  YOUWORSHIP_USERS: "Youworship_users",
};

/**
 * Helper to get reference to Youworship_songs collection
 */
export const getSongsCollectionRef = () => collection(db, COLLECTIONS.YOUWORSHIP_SONGS);

/**
 * Helper to get reference to a specific song document
 */
export const getSongDocRef = (songId) => doc(db, COLLECTIONS.YOUWORSHIP_SONGS, songId);

export { db };
