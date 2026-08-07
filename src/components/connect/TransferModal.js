"use client";

import React, { useState } from "react";
import { X, Check, Loader2, ArrowRightLeft } from "lucide-react";
import DeviceIcon from "./DeviceIcon";

/**
 * Premium "Transfer Playback" confirmation modal (spec):
 * shows the current song + target device, with Cancel / Transfer actions.
 */
export default function TransferModal({ device, songTitle, onCancel, onConfirm }) {
  const [transferring, setTransferring] = useState(false);
  const [done, setDone] = useState(false);

  if (!device) return null;

  const handleConfirm = async () => {
    setTransferring(true);
    const ok = await onConfirm();
    if (ok) {
      setDone(true);
      setTimeout(() => onCancel(), 1400);
    } else {
      setTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !transferring && !done && onCancel()}
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-[#D4A32A]/25 bg-[#151A23]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Gold top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#D4A32A]/0 via-[#D4A32A] to-[#D4A32A]/0" />

        <div className="p-6">
          {done ? (
            /* ─── Success state ─── */
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#D4A32A]/15 border border-[#D4A32A]/30 flex items-center justify-center animate-auth-success">
                <Check className="w-8 h-8 text-[#D4A32A]" strokeWidth={3} />
              </div>
              <h3 className="text-lg font-black text-white mt-4">Playback Transferred</h3>
              <p className="text-sm text-[#A7AEB8] mt-1.5">
                Now playing on{" "}
                <span className="text-white font-semibold">{device.deviceName}</span>
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#D4A32A]/12 border border-[#D4A32A]/25 flex items-center justify-center text-[#D4A32A]">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Transfer Playback</h3>
                    <p className="text-[11px] text-[#A7AEB8] font-medium">Seamless hand-off between devices</p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  disabled={transferring}
                  className="p-1.5 -m-1.5 rounded-full text-[#A7AEB8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
                  aria-label="Close"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Current song */}
              <div className="mt-5 rounded-2xl bg-[#0B0F18] border border-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A7AEB8]">Current Song</p>
                <p className="text-sm font-bold text-white mt-1.5 truncate">{songTitle || "Nothing playing"}</p>
              </div>

              {/* Target device */}
              <div className="mt-3 rounded-2xl bg-[#0B0F18] border border-[#D4A32A]/20 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#151A23] border border-white/10 flex items-center justify-center text-[#D4A32A] shrink-0">
                  <DeviceIcon type={device.deviceType} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A7AEB8]">Transfer playback to</p>
                  <p className="text-sm font-bold text-white mt-0.5 truncate">{device.deviceName}</p>
                </div>
                <span className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={onCancel}
                  disabled={transferring}
                  className="flex-1 py-3 rounded-full border border-white/10 text-white/80 text-sm font-semibold hover:bg-white/5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={transferring}
                  className="flex-1 py-3 rounded-full bg-[#D4A32A] text-black text-sm font-black hover:bg-[#c49527] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4A32A]/20"
                >
                  {transferring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    "Transfer"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
