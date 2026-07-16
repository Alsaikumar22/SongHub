"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Heart, Share2, Check } from "lucide-react";

const CATEGORY_DESCRIPTIONS = {
  "morning-worship": "Start your day in His presence with inspiring morning worship melodies.",
  "prayer-songs": "Peaceful worship songs for prayer, deep devotion, and communion with God.",
  "worship-songs": "Enter into holy worship with these heartfelt songs of praise and adoration.",
  "praise-songs": "Lift up your hands and celebrate His goodness with joyful songs of praise.",
  "salvation-songs": "Reflect on the gift of grace, redemption, and eternal salvation.",
  "faith-hope-songs": "Find strength, encouragement, and hope for your journey in times of trial.",
  "repentance-songs": "Songs of humble repentance, seeking God's mercy, forgiveness, and restoration.",
  "holy-spirit-songs": "Invite the presence, power, and guidance of the Holy Spirit into your heart.",
  "healing-miracle-songs": "Experience God's healing touch and comfort through songs of faith and miracles.",
  "bible-based-songs": "Sing the truths of Scripture with songs grounded in God's eternal Word.",
  "festival-special-songs": "Joyful songs for special church occasions, celebrations, and holy days.",
  "children-songs": "Pure, simple, and inspiring worship melodies for children and family worship.",
  "youth-songs": "Energetic, modern worship songs for youth fellowship and personal devotion.",
  "communion-songs": "Meditate on the body and blood of Christ during Communion and Holy Supper.",
  "christmas-songs": "Celebrate the birth of our Savior Jesus Christ with classic Christmas songs.",
  "good-friday-songs": "Remember the ultimate sacrifice of Jesus Christ on the cross at Calvary.",
  "easter-songs": "Rejoice in the glorious resurrection of Jesus Christ and His victory over death.",
  "baptism-songs": "Celebrate new life in Christ and public declaration of faith through baptism.",
  "marriage-songs": "Sacred and joyful songs celebrating Christian marriage and holy covenant.",
  "thanksgiving-songs": "Express gratitude and praise for God's endless blessings, harvest, and love."
};

export default function CategoryHeroBanner({ category, language, songCount, onPlayAll }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const name = language === "telugu" ? category.nameTe : category.nameEn;
  const langName = language === "telugu" ? "Telugu" : "English";
  const desc = CATEGORY_DESCRIPTIONS[category.id] || "Curated Christian worship and devotion collection.";

  const handleShare = () => {
    setIsShared(true);
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
    setTimeout(() => setIsShared(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[22px] border border-white/5 bg-[#121826]/40 backdrop-blur-md p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end w-full select-none"
    >
      {/* Blurred background image */}
      <div className="absolute inset-0 z-0 opacity-15 blur-2xl scale-110 pointer-events-none">
        <img src={category.bgImage} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-transparent z-0 pointer-events-none" />

      {/* Category artwork */}
      <motion.div 
        className="w-36 h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-10"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <img src={category.bgImage} alt={name} className="w-full h-full object-cover" />
      </motion.div>

      {/* Category details */}
      <div className="flex-1 text-center md:text-left z-10 flex flex-col justify-end">
        <span className="text-[10px] font-black text-[#D4A32A] uppercase tracking-widest block mb-2">
          Playlist
        </span>
        <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight leading-none mb-3 drop-shadow-md">
          {name}
        </h1>
        <p className="text-sm text-[#e5e7eb] font-semibold mb-2">
          {langName} &bull; {songCount} Song{songCount !== 1 && "s"}
        </p>
        <p className="text-xs text-[#a7a7a7] max-w-xl mb-5 leading-relaxed">
          {desc}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <button
            onClick={onPlayAll}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4A32A] to-[#F5D061] text-[#070707] font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_4px_15px_rgba(212,163,42,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer duration-200"
          >
            <Play className="w-4.5 h-4.5 fill-current" />
            Play All
          </button>

          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`flex items-center justify-center p-3 rounded-full border transition-all duration-200 cursor-pointer ${
              isFavorited
                ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            }`}
            title="Add to Favorites"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center justify-center p-3 rounded-full border transition-all duration-200 cursor-pointer ${
              isShared
                ? "bg-[#D4A32A]/20 border-[#D4A32A]/40 text-[#D4A32A]"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            }`}
            title="Share Category"
          >
            {isShared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
