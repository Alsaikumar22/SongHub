"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Loader2,
  Trash2,
  Power,
  Pencil,
  MonitorSmartphone,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import {
  fetchAllDevices,
  removeDevice,
  renameDevice,
  forceLogoutDevice,
  formatLastSeen,
  getDeviceTypeLabel,
} from "@/lib/connect-service";
import DeviceIcon from "@/components/connect/DeviceIcon";

/**
 * Admin "Connected Devices" dashboard (spec):
 * Device Name · User · Type · Online · Current Song · Last Seen · Active
 * Actions: Remove Device · Force Logout Device · Rename Device
 */
export default function ConnectedDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchAllDevices();
      setDevices(rows);
    } catch (err) {
      console.error("Error loading devices:", err);
      showMessage("error", "Failed to load devices — check Firestore rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setBusyId(renameTarget.id);
    try {
      await renameDevice(renameTarget.uid, renameTarget.id, renameValue);
      showMessage("success", "Device renamed successfully.");
      setRenameTarget(null);
      load();
    } catch (err) {
      showMessage("error", "Rename failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setBusyId(removeTarget.id);
    try {
      await removeDevice(removeTarget.uid, removeTarget.id);
      showMessage("success", "Device removed.");
      setRemoveTarget(null);
      load();
    } catch (err) {
      showMessage("error", "Remove failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleForceLogout = async (d) => {
    setBusyId(d.id);
    try {
      await forceLogoutDevice(d.uid, d.id);
      showMessage("success", "Logout signal sent to " + d.deviceName + ".");
    } catch (err) {
      showMessage("error", "Force logout failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const onlineCount = devices.filter((d) => d.online).length;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#D4A32A]/10 border border-[#D4A32A]/25 flex items-center justify-center text-[#D4A32A]">
              <MonitorSmartphone className="w-4.5 h-4.5" />
            </span>
            Connected Devices
          </h2>
          <p className="text-xs text-[#727272] mt-1 ml-12">
            {devices.length} registered · {onlineCount} online
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] text-xs font-bold text-[#727272] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`mb-5 p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <p className={`text-sm font-semibold ${message.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {message.text}
          </p>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-[#727272]">
          <Loader2 className="w-7 h-7 text-[#D4A32A] animate-spin" />
          <p className="text-xs font-semibold">Loading connected devices…</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="py-16 text-center">
          <MonitorSmartphone className="w-10 h-10 text-[#727272] mx-auto mb-3" />
          <p className="text-sm font-bold text-white">No devices registered yet</p>
          <p className="text-xs text-[#727272] mt-1.5">
            Devices appear here automatically when users sign in on the app.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-[#727272] border-b border-[rgba(255,255,255,0.06)]">
                <th className="py-3 pr-4 font-bold">Device</th>
                <th className="py-3 pr-4 font-bold">User</th>
                <th className="py-3 pr-4 font-bold">Type</th>
                <th className="py-3 pr-4 font-bold">Online</th>
                <th className="py-3 pr-4 font-bold">Current Song</th>
                <th className="py-3 pr-4 font-bold">Last Seen</th>
                <th className="py-3 pr-4 font-bold">Active</th>
                <th className="py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr
                  key={`${d.uid}-${d.id}`}
                  className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#D4A32A] shrink-0">
                        <DeviceIcon type={d.deviceType} className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-sm font-semibold text-white">{d.deviceName || "Unnamed device"}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="text-sm text-white">{d.userName}</p>
                    <p className="text-[11px] text-[#727272]">{d.userEmail}</p>
                  </td>
                  <td className="py-3.5 pr-4 text-xs text-[#a7a7a7]">{getDeviceTypeLabel(d.deviceType)}</td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        d.online ? "text-emerald-400" : "text-[#727272]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          d.online ? "bg-emerald-400 animate-pulse" : "bg-[#3a3a3a]"
                        }`}
                      />
                      {d.online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-xs text-[#a7a7a7] max-w-[160px] truncate">
                    {d.currentSong?.title || d.currentSong || "—"}
                  </td>
                  <td className="py-3.5 pr-4 text-xs text-[#a7a7a7]">{formatLastSeen(d.lastSeenMs)}</td>
                  <td className="py-3.5 pr-4">
                    {d.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4A32A]/10 border border-[#D4A32A]/25 text-[#D4A32A] text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4A32A] animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-[#727272]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setRenameTarget(d);
                          setRenameValue(d.deviceName || "");
                        }}
                        className="p-2 rounded-lg text-[#a7a7a7] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer"
                        title="Rename device"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleForceLogout(d)}
                        disabled={busyId === d.id}
                        className="p-2 rounded-lg text-[#a7a7a7] hover:text-amber-400 hover:bg-amber-500/5 transition-all cursor-pointer disabled:opacity-50"
                        title="Force logout device"
                      >
                        {busyId === d.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Power className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setRemoveTarget(d)}
                        className="p-2 rounded-lg text-[#a7a7a7] hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
                        title="Remove device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rename modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRenameTarget(null)} />
          <div className="relative bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">Rename Device</h3>
              <button onClick={() => setRenameTarget(null)} className="p-1.5 rounded-full text-[#727272] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-xl text-sm text-white focus:outline-none focus:border-[#D4A32A] focus:ring-1 focus:ring-[#D4A32A]/30 transition-all"
              placeholder="e.g. Praveen's Living Room"
            />
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => setRenameTarget(null)}
                className="flex-1 py-2.5 rounded-full border border-[rgba(255,255,255,0.1)] text-xs font-semibold text-[#727272] hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={!renameValue.trim()}
                className="flex-1 py-2.5 rounded-full bg-[#D4A32A] text-black text-xs font-black hover:bg-[#c49527] transition-all disabled:opacity-50 cursor-pointer"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove confirm modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRemoveTarget(null)} />
          <div className="relative bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Remove Device?</h3>
            <p className="text-sm text-[#a7a7a7] mb-6">
              &ldquo;{removeTarget.deviceName}&rdquo; will no longer be able to receive playback.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRemoveTarget(null)}
                className="flex-1 py-3 rounded-full border border-[rgba(255,255,255,0.15)] text-white font-semibold text-sm hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={busyId === removeTarget.id}
                className="flex-1 py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {busyId === removeTarget.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
