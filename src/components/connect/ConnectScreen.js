"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Cast,
  Loader2,
  BluetoothSearching,
  Check,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  Lock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useConnect } from "@/context/connect-context";
import { useAudio } from "@/context/audio-context";
import { getDeviceTypeLabel } from "@/lib/connect-service";
import DeviceIcon from "./DeviceIcon";
import TransferModal from "./TransferModal";

// Simulated Bluetooth discovery results (nearby control only — no streaming)
const NEARBY_DEVICES = [
  { id: "samsung-s24", name: "Samsung S24", type: "mobile" },
  { id: "oneplus-12", name: "OnePlus 12", type: "mobile" },
  { id: "windows-laptop", name: "Windows Laptop", type: "laptop" },
  { id: "galaxy-tablet", name: "Galaxy Tablet", type: "tablet" },
];

function StatusPill({ status }) {
  const map = {
    playing: { label: "Playing", dot: "bg-emerald-400", text: "text-emerald-400", pulse: true },
    connected: { label: "Connected", dot: "bg-emerald-400", text: "text-emerald-400", pulse: true },
    available: { label: "Available", dot: "bg-amber-400", text: "text-amber-400", pulse: false },
    offline: { label: "Offline", dot: "bg-white/25", text: "text-white/40", pulse: false },
  };
  const s = map[status] || map.offline;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${s.text} bg-white/5 border border-white/10 shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
      {s.label}
    </span>
  );
}

function Equalizer({ className = "" }) {
  return (
    <div className={`flex items-end gap-[2px] h-3 shrink-0 text-[#D4A32A] ${className}`}>
      <span className="w-[3px] bg-current rounded-sm animate-music-bar-1" style={{ height: "100%" }} />
      <span className="w-[3px] bg-current rounded-sm animate-music-bar-2" style={{ height: "100%" }} />
      <span className="w-[3px] bg-current rounded-sm animate-music-bar-3" style={{ height: "100%" }} />
    </div>
  );
}

export default function ConnectScreen({ onClose }) {
  const { isConnected, selfDevice, otherDevices, activeDevice, transferPlayback, adopting, connectionError, retryConnect } = useConnect();
  const { currentSong, isPlaying, volume, isMuted, togglePlay, prevSong, nextSong, adjustVolume, toggleMute } = useAudio();

  const [transferTarget, setTransferTarget] = useState(null);
  const [nearbyStatus, setNearbyStatus] = useState("idle"); // idle | scanning | results
  const [paired, setPaired] = useState({});
  const [nearbyControl, setNearbyControl] = useState(null);
  const scanTimerRef = useRef(null);

  const songTitle = currentSong ? currentSong.teluguTitle || currentSong.title : "Nothing playing";

  // Clear any pending scan timer on unmount
  useEffect(() => () => clearTimeout(scanTimerRef.current), []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const startScan = () => {
    setNearbyStatus("scanning");
    clearTimeout(scanTimerRef.current);
    scanTimerRef.current = setTimeout(() => setNearbyStatus("results"), 1800);
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-[#0B0F18] text-white overflow-hidden flex flex-col">
      {/* Ambient gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(212,163,42,0.08) 0%, transparent 60%), radial-gradient(80% 60% at 100% 100%, rgba(212,163,42,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-2xl mx-auto h-full flex flex-col">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#D4A32A]/12 border border-[#D4A32A]/25 flex items-center justify-center text-[#D4A32A] shadow-[0_0_20px_rgba(212,163,42,0.15)]">
                <Cast className="w-5 h-5" />
              </span>
              Connect
            </h1>
            <p className="text-xs text-[#A7AEB8] mt-1 ml-13">Play this song on your other devices</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#A7AEB8] hover:text-white transition-all cursor-pointer"
            aria-label="Close Connect"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {!isConnected ? (
          /* ─── Signed-out fallback ─── */
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#151A23] border border-white/10 flex items-center justify-center text-[#D4A32A] mb-5">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-white">Sign in to connect your devices</h2>
            <p className="text-sm text-[#A7AEB8] mt-2 leading-relaxed max-w-sm">
              Devices that are signed in to the same account discover each other automatically.
            </p>
          </div>
        ) : (
          <>
            {/* ─── Scrollable content ─── */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-6">
              {/* Connection / permissions error banner */}
              {connectionError && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-red-300">Could not reach your devices</p>
                    <p className="text-[11px] text-[#A7AEB8] mt-1 leading-relaxed">{connectionError}</p>
                    <button
                      onClick={retryConnect}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] font-bold hover:bg-red-500/25 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </button>
                  </div>
                </div>
              )}
              {/* Incoming playback indicator */}
              {adopting && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-[#D4A32A]/30 bg-[#D4A32A]/8 px-4 py-3 animate-in fade-in duration-200">
                  <Loader2 className="w-4 h-4 text-[#D4A32A] animate-spin shrink-0" />
                  <p className="text-xs font-bold text-[#D4A32A]">Receiving playback…</p>
                </div>
              )}
              {/* Active device card */}
              <div className="relative rounded-[24px] border border-[#D4A32A]/25 bg-[#151A23] p-5 overflow-hidden">
                {activeDevice?.status === "playing" && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#D4A32A]/10 blur-3xl animate-pulse" />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-[#0B0F18] border border-[#D4A32A]/30 flex items-center justify-center text-[#D4A32A] transition-shadow ${
                        activeDevice?.status === "playing" ? "shadow-[0_0_24px_rgba(212,163,42,0.35)]" : ""
                      }`}
                    >
                      <DeviceIcon type={selfDevice?.deviceType} className="w-7 h-7" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-[3px] border-[#151A23]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#A7AEB8]">Currently Playing</p>
                    <p className="text-base font-black text-white truncate mt-0.5">{songTitle}</p>
                    <div className="flex items-center gap-2.5 mt-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Connected
                      </span>
                      {isPlaying && <Equalizer />}
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#A7AEB8]">This device</p>
                    <p className="text-sm font-bold text-white mt-1 max-w-[120px] truncate">{selfDevice?.deviceName}</p>
                  </div>
                </div>
              </div>

              {/* Available devices */}
              <div>
                <div className="flex items-center justify-between px-1 mb-3">
                  <h2 className="text-xs font-black uppercase tracking-widest text-[#A7AEB8]">Available Devices</h2>
                  <span className="text-[10px] font-bold text-[#A7AEB8]/70">
                    {otherDevices.filter((d) => d.online).length} online
                  </span>
                </div>

                {otherDevices.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-[#151A23]/60 p-7 text-center">
                    <Cast className="w-8 h-8 text-[#A7AEB8] mx-auto mb-3" />
                    <p className="text-sm font-bold text-white">No devices found</p>
                    <p className="text-xs text-[#A7AEB8] mt-1.5 leading-relaxed max-w-sm mx-auto">
                      Open YouWorship on another device and sign in with the same account. It will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {otherDevices.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => d.online && setTransferTarget(d)}
                        disabled={!d.online}
                        className={`w-full flex items-center gap-3.5 rounded-[24px] border p-4 text-left transition-all group ${
                          d.online
                            ? "border-white/10 bg-[#151A23] hover:border-[#D4A32A]/40 hover:bg-[#1A2130] cursor-pointer"
                            : "border-white/5 bg-[#151A23]/40 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                            d.online
                              ? "bg-[#0B0F18] border-white/10 text-white group-hover:text-[#D4A32A] group-hover:border-[#D4A32A]/40"
                              : "bg-[#0B0F18]/60 border-white/5 text-white/30"
                          }`}
                        >
                          <DeviceIcon type={d.deviceType} className="w-5.5 h-5.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate">{d.deviceName}</p>
                          <p className="text-[11px] text-[#A7AEB8] mt-0.5">{getDeviceTypeLabel(d.deviceType)}</p>
                        </div>
                        {d.status === "playing" && <Equalizer />}
                        <StatusPill status={d.status} />
                        {d.online && (
                          <span className="text-[#A7AEB8] opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold shrink-0">
                            Transfer ›
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nearby devices — Bluetooth mode */}
              <div>
                <div className="flex items-center justify-between px-1 mb-3">
                  <h2 className="text-xs font-black uppercase tracking-widest text-[#A7AEB8] flex items-center gap-1.5">
                    <BluetoothSearching className="w-3.5 h-3.5 text-[#D4A32A]" />
                    Nearby Devices
                  </h2>
                </div>

                {nearbyStatus === "idle" && (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-[#151A23]/60 p-6 text-center">
                    <Radio className="w-7 h-7 text-[#A7AEB8] mx-auto mb-2.5" />
                    <p className="text-xs text-[#A7AEB8]">
                      Tap <span className="text-white font-bold">Find Devices</span> to scan for nearby Bluetooth devices.
                    </p>
                  </div>
                )}

                {nearbyStatus === "scanning" && (
                  <div className="rounded-[24px] border border-[#D4A32A]/25 bg-[#151A23] p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-11 h-11 shrink-0">
                        <span className="absolute inset-0 rounded-full border-2 border-[#D4A32A]/20 animate-ping" />
                        <span className="absolute inset-1.5 rounded-full border-2 border-[#D4A32A]/60 border-t-transparent animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Scanning for nearby devices…</p>
                        <p className="text-[11px] text-[#A7AEB8] mt-0.5">Bluetooth discovery in progress</p>
                      </div>
                    </div>
                  </div>
                )}

                {nearbyStatus === "results" && (
                  <div className="space-y-2.5">
                    {NEARBY_DEVICES.map((nd) => {
                      const isPaired = !!paired[nd.id];
                      const isControlled = nearbyControl?.id === nd.id;
                      return (
                        <div
                          key={nd.id}
                          className={`rounded-[24px] border p-4 transition-colors ${
                            isPaired ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-[#151A23]"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-[#0B0F18] border border-white/10 flex items-center justify-center text-white shrink-0">
                              <DeviceIcon type={nd.type} className="w-5.5 h-5.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-white truncate">{nd.name}</p>
                              <p className="text-[11px] text-[#A7AEB8] mt-0.5">
                                {getDeviceTypeLabel(nd.type)} · Nearby
                              </p>
                            </div>
                            {isPaired ? (
                              <button
                                onClick={() => {
                                  setPaired((p) => ({ ...p, [nd.id]: false }));
                                  if (isControlled) setNearbyControl(null);
                                }}
                                className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Connected
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setPaired((p) => ({ ...p, [nd.id]: true }));
                                  setNearbyControl(nd);
                                }}
                                className="px-3.5 py-1.5 rounded-full bg-[#D4A32A] text-black text-[11px] font-black hover:bg-[#c49527] transition-all cursor-pointer shadow-lg shadow-[#D4A32A]/20 shrink-0"
                              >
                                Pair
                              </button>
                            )}
                          </div>

                          {/* Nearby control strip (plays on this device — simulation) */}
                          {isPaired && isControlled && (
                            <div className="mt-3.5 pt-3.5 border-t border-white/5 flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#A7AEB8] uppercase tracking-wider mr-1 shrink-0">
                                Control
                              </span>
                              <button
                                onClick={prevSong}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                                aria-label="Previous"
                              >
                                <SkipBack className="w-4 h-4" />
                              </button>
                              <button
                                onClick={togglePlay}
                                className="w-9 h-9 rounded-full bg-[#D4A32A] text-black flex items-center justify-center hover:bg-[#c49527] transition-colors cursor-pointer"
                                aria-label={isPlaying ? "Pause" : "Play"}
                              >
                                {isPlaying ? (
                                  <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                )}
                              </button>
                              <button
                                onClick={nextSong}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                                aria-label="Next"
                              >
                                <SkipForward className="w-4 h-4" />
                              </button>
                              <div className="flex items-center gap-1.5 flex-1 ml-1 min-w-0">
                                <button
                                  onClick={toggleMute}
                                  className="text-[#A7AEB8] hover:text-white cursor-pointer shrink-0"
                                  aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                                >
                                  {isMuted || volume === 0 ? (
                                    <VolumeX className="w-4 h-4" />
                                  ) : (
                                    <Volume2 className="w-4 h-4" />
                                  )}
                                </button>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  value={isMuted ? 0 : volume}
                                  onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                                  className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#D4A32A] min-w-0"
                                  aria-label="Volume"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <p className="text-[10px] text-[#A7AEB8]/60 px-1 pt-1">
                      Nearby discovery is simulated in this preview — audio always plays on the active device.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Sticky bottom: Find Devices ─── */}
            <div className="shrink-0 px-6 pb-8 pt-3">
              <button
                onClick={startScan}
                disabled={nearbyStatus === "scanning"}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4A32A] to-[#c49527] text-black font-black text-sm tracking-wide hover:shadow-[0_0_40px_rgba(212,163,42,0.35)] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {nearbyStatus === "scanning" ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Scanning…
                  </>
                ) : (
                  <>
                    <BluetoothSearching className="w-4.5 h-4.5" />
                    Find Devices
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Transfer confirmation modal */}
      <TransferModal
        device={transferTarget}
        songTitle={songTitle}
        onCancel={() => setTransferTarget(null)}
        onConfirm={() => transferPlayback(transferTarget)}
      />
    </div>
  );
}
