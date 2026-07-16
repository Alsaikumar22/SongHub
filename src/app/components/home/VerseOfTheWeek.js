"use client";

import React from "react";

export default function VerseOfTheWeek() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-card-hover/20 via-card/10 to-card-hover/20 border border-line/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-title/30 transition-all duration-500 group">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-title/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-title/8 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/2 rounded-full blur-[40px] pointer-events-none" />

      {/* Left Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-title via-title/50 to-transparent" />

      {/* Content Column */}
      <div className="relative z-10 flex-1 space-y-4 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-title uppercase tracking-widest bg-title/10 px-2.5 py-1 rounded-full">
            Verse of the Week
          </span>
          <span className="h-px w-8 bg-line" />
          <span className="text-[10px] font-bold text-dim uppercase tracking-wider">
            2 Timothy 1:7
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-white text-lg md:text-xl font-bold leading-relaxed font-telugu text-left drop-shadow-sm group-hover:text-white transition-colors duration-300">
            "దేవుడు మనకు శక్తియు ప్రేమయు స్వస్థబుద్ధియుగల ఆత్మనే యిచ్చెను గాని పిరికితనముగల ఆత్మనియ్యలేదు."
          </p>
          <p className="text-muted/80 text-xs md:text-sm italic font-medium leading-normal text-left">
            "For God has not given us a spirit of fear, but of power and of love and of a sound mind."
          </p>
        </div>
      </div>

      {/* Right Citation block & Large Quotes Graphic */}
      <div className="relative z-10 flex flex-col items-end justify-between shrink-0 self-stretch text-right md:border-l md:border-line/20 md:pl-6 pt-2 md:pt-0">
        {/* Giant clean quotes icon */}
        <span className="text-title/10 text-7xl font-serif select-none leading-none -mt-4 hidden md:block">
          “
        </span>
        <div className="mt-auto space-y-1">
          <span className="text-xs font-bold text-white block">
            2 తిమోతి 1:7
          </span>
          <span className="text-[10px] text-dim block tracking-wider uppercase font-semibold">
            Bible Verse Daily
          </span>
        </div>
      </div>
    </div>
  );
}
