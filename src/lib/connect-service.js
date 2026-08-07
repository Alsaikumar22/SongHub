import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";

const USERS_COLLECTION = "Youworship_users";
const DEVICES_PATH = "devices";

// ─── Device identity helpers ───────────────────────────────────────

/** Best-effort device type detection from the browser user agent. */
export function detectDeviceType() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/smart-tv|smarttv|hbbtv|googletv|appletv|roku|netcast|vizio|firetv|androidtv|youtube\/.*tv/i.test(ua)) return "tv";
  if (/ipad|tablet|playbook|silk|kindle/i.test(ua)) return "tablet";
  if (/android/i.test(ua) && !/mobile/i.test(ua)) return "tablet";
  if (/iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  if ((navigator.maxTouchPoints || 0) > 0 && /macintosh/i.test(ua)) return "tablet"; // iPad Pro
  if ((navigator.maxTouchPoints || 0) > 0) return "laptop"; // touchscreen laptop
  if (/windows|macintosh|linux|crOS|x11/i.test(ua)) return "desktop";
  return "desktop";
}

const TYPE_LABELS = {
  mobile: "Phone",
  tablet: "Tablet",
  laptop: "Laptop",
  desktop: "Desktop",
  tv: "Smart TV",
  speaker: "Smart Speaker",
  watch: "Watch",
};

export function getDeviceTypeLabel(type) {
  return TYPE_LABELS[type] || "Device";
}

/** Persistent browser-scoped id (survives refreshes). */
function getPersistentBrowserId() {
  try {
    let id = window.localStorage.getItem("youworship_device_id");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem("youworship_device_id", id);
    }
    return id;
  } catch {
    return "device";
  }
}

/** Per-tab id so two tabs of the same browser register as two devices. */
function getTabId() {
  try {
    let tab = window.sessionStorage.getItem("youworship_tab_id");
    if (!tab) {
      tab = Math.random().toString(36).slice(2, 8);
      window.sessionStorage.setItem("youworship_tab_id", tab);
    }
    return tab;
  } catch {
    return "tab";
  }
}

/** Stable, tab-unique device id. */
export function getDeviceId() {
  return `${getPersistentBrowserId()}-${getTabId()}`;
}

/**
 * Build the full device info object written to Firestore.
 * shape: { deviceId, deviceName, deviceType, bluetoothEnabled, wifiConnected }
 */
export function buildDeviceInfo(displayName) {
  const type = detectDeviceType();
  const firstName = (displayName || "").trim().split(/\s+/)[0] || "My";
  return {
    deviceId: getDeviceId(),
    deviceName: `${firstName}'s ${getDeviceTypeLabel(type)}`,
    deviceType: type,
    bluetoothEnabled: typeof navigator !== "undefined" && !!navigator.bluetooth,
    wifiConnected: typeof navigator !== "undefined" ? !!navigator.onLine : true,
  };
}

export function getDeviceDocRef(uid, deviceId) {
  return doc(db, USERS_COLLECTION, uid, DEVICES_PATH, deviceId);
}

function getDevicesCollectionRef(uid) {
  return collection(db, USERS_COLLECTION, uid, DEVICES_PATH);
}

// ─── Registration & presence ───────────────────────────────────────

/**
 * Register (or refresh) this device under the signed-in user.
 * Devices belong to a single account — other accounts are never listed.
 */
export async function registerDevice(uid, info) {
  if (!uid || !info?.deviceId) return false;
  try {
    await setDoc(
      getDeviceDocRef(uid, info.deviceId),
      {
        ...info,
        online: true,
        isActive: false,
        isPlaying: false,
        currentSong: null,
        position: 0,
        volume: 80,
        isLooping: false,
        isShuffled: false,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("Device registration failed:", error);
    return false;
  }
}

/** Write playback/presence fields (lastSeen always refreshed). */
export async function updateDevicePresence(uid, deviceId, patch) {
  if (!uid || !deviceId) return;
  try {
    await updateDoc(getDeviceDocRef(uid, deviceId), {
      ...patch,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    // doc may not exist yet — ignore transient failures
  }
}

export async function markDeviceOffline(uid, deviceId) {
  if (!uid || !deviceId) return;
  try {
    await updateDoc(getDeviceDocRef(uid, deviceId), {
      online: false,
      lastSeen: serverTimestamp(),
    });
  } catch {
    // ignore
  }
}

// ─── Realtime discovery ────────────────────────────────────────────

/**
 * Subscribe to all devices of the signed-in user's account.
 * Online status is derived from `online` + `lastSeen` freshness.
 * Returns the unsubscribe function.
 */
export function subscribeToDevices(uid, onData, onError) {
  return onSnapshot(
    getDevicesCollectionRef(uid),
    (snap) => {
      const now = Date.now();
      const list = snap.docs.map((d) => {
        const data = d.data();
        const lastSeenMs = toMillis(data.lastSeen);
        const online = !!data.online && now - lastSeenMs < 90000;
        let status = "offline";
        if (online && data.isActive && data.isPlaying) status = "playing";
        else if (online && data.isActive) status = "connected";
        else if (online) status = "available";
        return { id: d.id, ...data, online, status, lastSeenMs };
      });
      onData(list);
    },
    (error) => {
      console.warn("Devices subscription error:", error);
      if (typeof onError === "function") onError(error);
    }
  );
}

// ─── Playback transfer ─────────────────────────────────────────────

/** Ask a target device to take over playback (writes a transferRequest). */
export async function requestTransfer(uid, targetDeviceId, payload) {
  await updateDoc(getDeviceDocRef(uid, targetDeviceId), {
    isActive: true,
    transferRequest: payload,
  });
}

export async function demoteDevice(uid, deviceId) {
  try {
    await updateDoc(getDeviceDocRef(uid, deviceId), { isActive: false });
  } catch {
    // ignore
  }
}

// ─── Management (admin / device settings) ──────────────────────────

export async function removeDevice(uid, deviceId) {
  await deleteDoc(getDeviceDocRef(uid, deviceId));
}

export async function renameDevice(uid, deviceId, name) {
  await updateDoc(getDeviceDocRef(uid, deviceId), { deviceName: name.trim() });
}

/** Signal a device to sign the user out remotely. */
export async function forceLogoutDevice(uid, deviceId) {
  await updateDoc(getDeviceDocRef(uid, deviceId), {
    forceLogout: true,
    forceLogoutAt: serverTimestamp(),
  });
}

export async function clearForceLogout(uid, deviceId) {
  try {
    await updateDoc(getDeviceDocRef(uid, deviceId), {
      forceLogout: deleteField(),
      forceLogoutAt: deleteField(),
    });
  } catch {
    // ignore
  }
}

// ─── Admin: all connected devices across accounts ──────────────────

/** Fetch devices of every user (admin dashboard). */
export async function fetchAllDevices() {
  const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
  const rows = [];
  for (const userSnap of usersSnap.docs) {
    const userData = userSnap.data() || {};
    const devicesSnap = await getDocs(getDevicesCollectionRef(userSnap.id));
    const now = Date.now();
    devicesSnap.docs.forEach((d) => {
      const data = d.data();
      const lastSeenMs = toMillis(data.lastSeen);
      const online = !!data.online && now - lastSeenMs < 90000;
      rows.push({
        id: d.id,
        uid: userSnap.id,
        userName: userData.displayName || userSnap.id,
        userEmail: userData.email || "—",
        ...data,
        online,
        lastSeenMs,
      });
    });
  }
  rows.sort((a, b) => b.lastSeenMs - a.lastSeenMs);
  return rows;
}

// ─── Formatting helpers ────────────────────────────────────────────

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value;
  return Date.parse(value) || 0;
}

export function formatLastSeen(ms) {
  if (!ms) return "Never";
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
