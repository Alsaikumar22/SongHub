/**
 * Shared Firebase Admin SDK initialization and admin auth verification.
 * Used by admin API routes to avoid code duplication.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const COLLECTION_NAME = "Youworship_songs";

let adminDb = typeof global !== "undefined" ? global.firebaseAdminDb : null;

/**
 * Initialize Firebase Admin SDK (singleton pattern)
 */
export function getFirebaseAdmin() {
  if (typeof global !== "undefined" && global.firebaseAdminDb) return global.firebaseAdminDb;

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.trim();
    // Remove wrapping quotes/commas from copy-paste
    privateKey = privateKey.replace(/^[^a-zA-Z0-9+\/=_-]+|[^a-zA-Z0-9+\/=_-]+$/g, '');
    
    // Fix leftover 'n' from '\n' if header was removed
    if (privateKey.startsWith('nMII')) {
      privateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey.substring(1);
    }
    
    // Ensure BEGIN/END headers exist
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      privateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey;
    }
    if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
      privateKey = privateKey + '\n-----END PRIVATE KEY-----';
    }
    
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (admin.getApps().length === 0) {
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.cert({ projectId, clientEmail, privateKey }),
      });
    } else if (projectId) {
      admin.initializeApp({ projectId });
    } else {
      admin.initializeApp();
    }
  }

  const dbInstance = getFirestore();
  if (typeof global !== "undefined") {
    global.firebaseAdminDb = dbInstance;
  }
  return dbInstance;
}

/**
 * Verifies the Firebase ID token from the Authorization header
 * and checks if the user has admin privileges.
 */
export async function verifyAdminAuth(request) {
  // Ensure Firebase Admin is initialized before accessing Auth services
  getFirebaseAdmin();

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authorized: false, error: "Missing or invalid authorization header" };
  }

  try {
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);


    const email = decodedToken.email || "";
    const isAdmin =
      email === "alsaikumar22@gmail.com" || email.endsWith("@youworship.admin");

    if (!isAdmin) {
      return { authorized: false, error: "User does not have admin privileges" };
    }

    return { authorized: true, uid: decodedToken.uid, email };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { authorized: false, error: "Failed to verify authentication" };
  }
}

/**
 * Generate a consistent document ID: title-artistName
 * Spaces are replaced with hyphens, Unicode characters preserved.
 */
export function generateSongId(title, artistName) {
  // Use song title only, replace spaces and slashes with hyphens to ensure it is route-safe
  return (title || "").trim().replace(/\s+/g, "-").replace(/[\/\\]/g, "-");
}

export { admin, COLLECTION_NAME, FieldValue };
