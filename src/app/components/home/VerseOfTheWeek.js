"use client";

import React, { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";
import useDailyVerse from "../../hooks/useDailyVerse";

export default function VerseOfTheWeek() {
  const { verse, reference, referenceTelugu } = useDailyVerse();
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const shareText = `${verse.textEnglish}

— ${reference}

${verse.textTelugu}
— ${referenceTelugu}

SongHub — Daily Bible Verse`;

    // Try native Web Share API first (mobile & modern desktop)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SongHub - ${reference}`,
          text: shareText,
        });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if (err.name !== "AbortError") {
          console.debug("Web Share API error:", err);
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.debug("Clipboard API error:", err);
    }
  }, [verse, reference, referenceTelugu]);

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
            Verse of the Day
          </span>
          <span className="h-px w-8 bg-line" />
          <span className="text-[10px] font-bold text-dim uppercase tracking-wider">
            {reference}
          </span>
        </div>
        <div className="space-y-3">
          {/* Telugu verse */}
          <p className="text-white text-xl md:text-2xl font-bold leading-[1.6] font-telugu text-left drop-shadow-sm group-hover:text-white transition-colors duration-300">
            &ldquo;{verse.textTelugu}&rdquo;
          </p>
          {/* English verse */}
          <p className="text-muted/80 text-xs md:text-sm italic font-medium leading-relaxed text-left">
            &ldquo;{verse.textEnglish}&rdquo;
          </p>
        </div>
      </div>

      {/* Right Citation block & Large Quotes Graphic */}
      <div className="relative z-10 flex flex-col items-end justify-between shrink-0 self-stretch text-right md:border-l md:border-line/20 md:pl-6 pt-2 md:pt-0">
        {/* Share button - top of right column */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 text-dim hover:text-title group/btn"
          title="Share this verse"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">
                Copied!
              </span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform duration-200" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Share
              </span>
            </>
          )}
        </button>

        {/* Giant clean quotes icon */}
        <span className="text-title/10 text-7xl font-serif select-none leading-none -mt-4 hidden md:block">
          &ldquo;
        </span>

        <div className="mt-auto space-y-1">
          <span className="text-xs font-bold text-white block">
            {referenceTelugu}
          </span>
          <span className="text-[10px] text-dim block tracking-wider uppercase font-semibold">
            Bible Verse Daily
          </span>
        </div>
      </div>
    </div>
  );
}
