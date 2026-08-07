"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { useAudio } from "@/context/audio-context";
import { doc, updateDoc, onSnapshot, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  buildDeviceInfo,
  registerDevice,
  updateDevicePresence,
  subscribeToDevices,
  markDeviceOffline,
  requestTransfer,
  demoteDevice,
  clearForceLogout,
} from "@/lib/connect-service";

const ConnectContext = createContext(null);

export function ConnectProvider({ children }) {
  const { user, signOut } = useAuth();
  const audio = useAudio();
  const {
    songs,
    currentSong,
    isPlaying,
    progress,
    volume,
    isMuted,
    isLooping,
    isShuffled,
    playSong,
    seekTo,
    setIsPlaying,
    adjustVolume,
    setIsLooping,
    setIsShuffled,
  } = audio;

  const [deviceInfo, setDeviceInfo] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [adopting, setAdopting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [retryNonce, setRetryNonce] = useState(0);

  // Live refs so interval/listener callbacks always read fresh values.
  // State is mirrored after every render (imperative flags like
  // isAdopting/isActive/lastAdoptKey are mutated only in effects/callbacks).
  const refs = useRef({ isAdopting: false, isActive: false, lastAdoptKey: null });
  const adoptTokenRef = useRef(0);

  useEffect(() => {
    refs.current.currentSong = currentSong;
    refs.current.isPlaying = isPlaying;
    refs.current.progress = progress;
    refs.current.volume = volume;
    refs.current.isMuted = isMuted;
    refs.current.isLooping = isLooping;
    refs.current.isShuffled = isShuffled;
    refs.current.songs = songs;
    refs.current.devices = devices;
    refs.current.deviceInfo = deviceInfo;
    refs.current.user = user;
  });

  // ─── Register this device + subscribe to account devices on login ───
  // Re-runs when `retryNonce` changes so users can retry after transient
  // failures (e.g. rules not deployed yet, flaky network).
  useEffect(() => {
    if (!user) {
      setDevices([]);
      setDeviceInfo(null);
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    let isMounted = true;
    // Track whether THIS device could be registered. A successful snapshot
    // only clears subscription errors — a registration failure stays visible
    // even if reads happen to be allowed.
    let registerFailed = false;
    const info = buildDeviceInfo(user.displayName);
    setDeviceInfo(info);
    setConnectionError(null);
    registerDevice(user.uid, info).then((ok) => {
      if (!isMounted) return;
      registerFailed = !ok;
      if (!ok) {
        setConnectionError(
          "Couldn't register this device with Firestore. Check your network and that the Firestore security rules allow device registration (devices subcollection)."
        );
      }
    });
    setIsConnected(true);

    const unsub = subscribeToDevices(
      user.uid,
      (list) => {
        refs.current.devices = list;
        setDevices(list);
        // Only a healthy snapshot from a successfully registered device is a
        // clean bill of health; otherwise the registration banner stays up.
        if (isMounted && !registerFailed) setConnectionError(null);
      },
      (error) => {
        console.warn("Devices subscription error:", error);
        if (isMounted) {
          const isPermission =
            typeof error?.code === "string" &&
            (error.code.includes("permission-denied") || error.code.includes("PERMISSION_DENIED"));
          setConnectionError(
            isPermission
              ? "Firestore denied device discovery (permission-denied). Deploy the updated firestore.rules (devices subcollection rule) to the Firebase project, then tap Retry."
              : `Couldn't reach your devices: ${error?.message || "unknown error"}`
          );
        }
      }
    );

    const handleUnload = () => markDeviceOffline(user.uid, info.deviceId);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      isMounted = false;
      unsub();
      markDeviceOffline(user.uid, info.deviceId);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [user?.uid, retryNonce]);

  // ─── Heartbeat: keep presence fresh (battery-friendly ~12s) ───
  useEffect(() => {
    if (!user || !deviceInfo) return;
    const uid = user.uid;
    const interval = setInterval(() => {
      const r = refs.current;
      updateDevicePresence(uid, deviceInfo.deviceId, {
        online: true,
        isActive: r.isActive,
        isPlaying: !!r.isPlaying,
        currentSong: r.currentSong ? { id: r.currentSong.id, title: r.currentSong.title } : null,
        position: Math.round(r.progress || 0),
        volume: Math.round((r.volume || 0.8) * 100),
        isLooping: !!r.isLooping,
        isShuffled: !!r.isShuffled,
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [user?.uid, deviceInfo?.deviceId]);

  // ─── Sync playback state on key changes (position exact when paused) ───
  // Note: undefined values would make updateDoc() throw, so `position` is
  // only included when paused (exact) — while playing the heartbeat keeps it fresh.
  useEffect(() => {
    if (!user || !deviceInfo) return;
    const r = refs.current;
    const patch = {
      isPlaying: !!r.isPlaying,
      currentSong: r.currentSong ? { id: r.currentSong.id, title: r.currentSong.title } : null,
      volume: Math.round((r.volume || 0.8) * 100),
      isMuted: !!r.isMuted,
      isLooping: !!r.isLooping,
      isShuffled: !!r.isShuffled,
    };
    if (!r.isPlaying) patch.position = Math.round(r.progress || 0);
    updateDevicePresence(user.uid, deviceInfo.deviceId, patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, deviceInfo?.deviceId, currentSong?.id, isPlaying, isLooping, isShuffled, volume, isMuted]);

  // ─── Auto-connect: when this device starts playing it becomes active ───
  useEffect(() => {
    if (!user || !deviceInfo || !isPlaying || !currentSong) return;
    if (refs.current.isAdopting) return;
    const uid = user.uid;
    const wasActive = refs.current.isActive;
    refs.current.isActive = true;
    updateDevicePresence(uid, deviceInfo.deviceId, {
      isActive: true,
      isPlaying: true,
      currentSong: { id: currentSong.id, title: currentSong.title },
    });
    // Demote other online devices only when this device newly became active
    if (!wasActive) {
      refs.current.devices
        .filter((d) => d.id !== deviceInfo.deviceId && d.online && d.isActive)
        .forEach((d) => demoteDevice(uid, d.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentSong?.id]);

  // ─── Adopt an incoming transfer (and handle remote force-logout) ───
  const adoptRemote = useCallback(
    async (req) => {
      const r = refs.current;
      const token = ++adoptTokenRef.current;
      const targetId = String(req.songId || "");

      // Wait up to ~5s for the song catalog to load (the device may have
      // just opened the app) so transfers are never silently dropped.
      let song = null;
      for (let i = 0; i < 18; i++) {
        song = r.songs.find((s) => String(s.id) === targetId);
        if (song) break;
        await new Promise((res) => setTimeout(res, 300));
      }
      if (!song) return false;

      r.isAdopting = true;
      setAdopting(true);

      adjustVolume(typeof req.volume === "number" ? req.volume / 100 : r.volume);
      setIsLooping(!!req.isLooping);
      setIsShuffled(!!req.isShuffled);

      if (r.currentSong?.id !== song.id) {
        playSong(song);
      } else if (!r.isPlaying && req.isPlaying) {
        setIsPlaying(true);
      }
      if (!req.isPlaying) {
        setTimeout(() => {
          if (adoptTokenRef.current !== token) return;
          setIsPlaying(false);
        }, 400);
      }
      if (r.user) {
        updateDevicePresence(r.user.uid, refs.current.deviceInfo?.deviceId, { isActive: true });
      }

      // Resume from the exact playback position — retry until the media is
      // ready (audio metadata / YouTube player), canceling stale attempts
      // when a newer transfer arrives.
      const position = Number(req.position) || 0;
      const trySeek = (attempt) => {
        if (adoptTokenRef.current !== token) return;
        if (attempt <= 0) return;
        setTimeout(() => {
          if (adoptTokenRef.current !== token) return;
          seekTo(position);
          trySeek(attempt - 1);
        }, 350);
      };
      trySeek(5);

      setTimeout(() => {
        if (adoptTokenRef.current !== token) return;
        r.isAdopting = false;
        setAdopting(false);
      }, 2200);
      return true;
    },
    [playSong, seekTo, setIsPlaying, adjustVolume, setIsLooping, setIsShuffled]
  );

  useEffect(() => {
    if (!user || !deviceInfo) return;
    const uid = user.uid;
    const myRef = doc(db, "Youworship_users", uid, "devices", deviceInfo.deviceId);

    const unsub = onSnapshot(
      myRef,
      (snap) => {
        const data = snap.data();
        if (!data) return;

        // Remote admin action: sign out this device
        if (data.forceLogout) {
          clearForceLogout(uid, deviceInfo.deviceId);
          if (typeof signOut === "function") signOut();
          return;
        }

        const req = data.transferRequest;
        if (!req || !req.fromDeviceId || req.fromDeviceId === deviceInfo.deviceId) return;
        const key = `${req.songId}|${req.requestedAt}`;
        if (refs.current.lastAdoptKey === key) return;
        refs.current.lastAdoptKey = key;

        // Consume the request once adoption has finished (incl. catalog wait)
        adoptRemote(req).finally(() => {
          updateDoc(myRef, { transferRequest: deleteField() }).catch(() => {});
        });
      },
      (err) => console.warn("Device listener error:", err)
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, deviceInfo?.deviceId]);

  // ─── Transfer playback to another device of the same account ───
  const transferPlayback = useCallback(
    async (targetDevice) => {
      const r = refs.current;
      if (!r.user || !r.deviceInfo || !targetDevice) return false;
      if (targetDevice.id === r.deviceInfo.deviceId) return false;
      if (!targetDevice.online) return false;

      const payload = {
        songId: r.currentSong?.id || null,
        songTitle: r.currentSong?.title || "",
        position: Math.round(r.progress || 0),
        isPlaying: !!r.isPlaying,
        volume: Math.round((r.volume || 0.8) * 100),
        isLooping: !!r.isLooping,
        isShuffled: !!r.isShuffled,
        fromDeviceId: r.deviceInfo.deviceId,
        requestedAt: Date.now(),
      };

      try {
        await requestTransfer(r.user.uid, targetDevice.id, payload);
        await demoteDevice(r.user.uid, r.deviceInfo.deviceId);
        refs.current.isActive = false;
        // Source device stops playback immediately
        if (r.isPlaying) setIsPlaying(false);
        return true;
      } catch (error) {
        console.warn("Transfer failed:", error);
        return false;
      }
    },
    [setIsPlaying]
  );

  const selfDevice = deviceInfo
    ? devices.find((d) => d.id === deviceInfo.deviceId) || {
        id: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        online: true,
        status: "connected",
        isPlaying: isPlaying,
        currentSong: currentSong ? { id: currentSong.id, title: currentSong.title } : null,
        position: progress,
        volume: Math.round((volume || 0.8) * 100),
      }
    : null;

  const otherDevices = deviceInfo ? devices.filter((d) => d.id !== deviceInfo.deviceId) : [];
  const activeDevice = devices.find((d) => d.isActive && d.online) || null;

  return (
    <ConnectContext.Provider
      value={{
        isConnected,
        devices,
        selfDevice,
        otherDevices,
        activeDevice,
        deviceInfo,
        adopting,
        connectionError,
        retryConnect: () => setRetryNonce((n) => n + 1),
        transferPlayback,
      }}
    >
      {children}
    </ConnectContext.Provider>
  );
}

export function useConnect() {
  const context = useContext(ConnectContext);
  if (!context) {
    throw new Error("useConnect must be used within a ConnectProvider");
  }
  return context;
}
