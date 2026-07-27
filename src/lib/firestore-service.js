import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
} from "firebase/firestore";

/**
 * Get user document from Firestore, creating one if it doesn't exist.
 * Also saves/updates the user's auth profile (email, displayName, photoURL).
 */
async function getUserDoc(uid, userProfile = null) {
  const ref = doc(db, "Youworship_users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Create a brand new document with defaults + profile info
    const defaultData = {
      uid: uid,
      role: "user",
      favorites: [],
      playlists: [],
      recentlyPlayed: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      ...(userProfile
        ? {
            email: userProfile.email || null,
            displayName: userProfile.displayName || null,
            photoURL: userProfile.photoURL || null,
            provider: userProfile.provider || null,
          }
        : {}),
    };
    await setDoc(ref, defaultData);
    return defaultData;
  }

  // Document already exists — still sync the latest profile info
  if (userProfile) {
    await setDoc(
      ref,
      {
        email: userProfile.email || null,
        displayName: userProfile.displayName || null,
        photoURL: userProfile.photoURL || null,
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    );
    // Re-read so returned data includes the freshly-saved profile
    const updatedSnap = await getDoc(ref);
    return updatedSnap.data();
  }

  return snap.data();
}

/**
 * Fetch all user data from Firestore.
 * Optionally pass userProfile { email, displayName, photoURL } to save auth info.
 */
export async function fetchUserData(uid, userProfile = null) {
  if (!uid) return null;
  try {
    return await getUserDoc(uid, userProfile);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

/**
 * Save user login data to Firestore (provider, timestamps).
 */
export async function saveUserLoginData(uid, loginData) {
  if (!uid) return;
  try {
    const ref = doc(db, "Youworship_users", uid);
    await setDoc(
      ref,
      {
        email: loginData.email || null,
        displayName: loginData.displayName || null,
        photoURL: loginData.photoURL || null,
        provider: loginData.provider || "unknown",
        lastLogin: loginData.lastLogin || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving login data:", error);
  }
}

/**
 * Update favorites list in Firestore.
 */
export async function updateFavorites(uid, favorites) {
  if (!uid) return;
  try {
    await setDoc(doc(db, "Youworship_users", uid), { favorites }, { merge: true });
  } catch (error) {
    console.error("Error updating favorites:", error);
  }
}

/**
 * Update playlists in Firestore.
 */
export async function updatePlaylists(uid, playlists) {
  if (!uid) return;
  try {
    await setDoc(doc(db, "Youworship_users", uid), { playlists }, { merge: true });
  } catch (error) {
    console.error("Error updating playlists:", error);
  }
}

/**
 * Update recently played list in Firestore.
 */
export async function updateRecentlyPlayed(uid, recentlyPlayed) {
  if (!uid) return;
  try {
    await setDoc(doc(db, "Youworship_users", uid), { recentlyPlayed }, { merge: true });
  } catch (error) {
    console.error("Error updating recently played:", error);
  }
}

/**
 * Batch save all user data at once (favorites + playlists + recently).
 */
export async function saveUserData(uid, { favorites, playlists, recentlyPlayed }) {
  if (!uid) return;
  try {
    await setDoc(
      doc(db, "Youworship_users", uid),
      {
        favorites,
        playlists,
        recentlyPlayed,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving user data:", error);
  }
}

/**
 * Save song request to Firestore.
 */
export async function saveSongRequest(requestData) {
  try {
    const ref = collection(db, "Youworship_requests");
    await addDoc(ref, {
      ...requestData,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error saving song request:", error);
    throw error;
  }
}

/**
 * Save user feedback to Firestore.
 */
export async function saveFeedback(feedbackData) {
  try {
    const ref = collection(db, "Youworship_feedback");
    await addDoc(ref, {
      ...feedbackData,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error saving feedback:", error);
    throw error;
  }
}
