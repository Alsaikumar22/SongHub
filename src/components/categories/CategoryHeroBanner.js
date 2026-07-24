"use client";

import React from "react";
import { motion } from "framer-motion";

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

const CATEGORY_COLORS = {
  "morning-worship": "from-[#7a2c02]/80 to-canvas",
  "prayer-songs": "from-[#024e75]/80 to-canvas",
  "worship-songs": "from-[#065f46]/80 to-canvas",
  "praise-songs": "from-[#991b1b]/80 to-canvas",
  "salvation-songs": "from-[#581c87]/80 to-canvas",
  "faith-hope-songs": "from-[#065f46]/80 to-canvas",
  "repentance-songs": "from-[#3730a3]/80 to-canvas",
  "holy-spirit-songs": "from-[#075985]/80 to-canvas",
  "healing-miracle-songs": "from-[#155e75]/80 to-canvas",
  "bible-based-songs": "from-[#065f46]/80 to-canvas",
  "festival-special-songs": "from-[#9d174d]/80 to-canvas",
  "children-songs": "from-[#92400e]/80 to-canvas",
  "youth-songs": "from-[#5b21b6]/80 to-canvas",
  "communion-songs": "from-[#881337]/80 to-canvas",
  "christmas-songs": "from-[#991b1b]/80 to-canvas",
  "good-friday-songs": "from-[#292524]/80 to-canvas",
  "easter-songs": "from-[#854d0e]/80 to-canvas",
  "baptism-songs": "from-[#155e75]/80 to-canvas",
  "marriage-songs": "from-[#be185d]/80 to-canvas",
  "thanksgiving-songs": "from-[#7a2c02]/80 to-canvas"
};

export default function CategoryHeroBanner({ category, language, songCount }) {
  const name = language === "telugu" ? category.nameTe : category.nameEn;
  const langName = language === "telugu" ? "Telugu" : "English";
  const desc = CATEGORY_DESCRIPTIONS[category.id] || "Curated Christian worship and devotion collection.";
  const bannerColor = CATEGORY_COLORS[category.id] || "from-[#1e293b]/80 to-canvas";

  return (
    <div className={`relative w-full pt-16 pb-6 px-6 md:px-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end select-none overflow-hidden bg-gradient-to-b ${bannerColor}`}>
      {/* Category artwork (sharp corners per Spotify Album design) */}
      <motion.div 
        className="w-44 h-44 md:w-48 md:h-48 rounded-md overflow-hidden shrink-0 shadow-lg z-10 border border-line"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <img src={category.bgImage} alt={name} className="w-full h-full object-cover" />
      </motion.div>

      {/* Category details */}
      <div className="flex-1 text-center md:text-left z-10 flex flex-col justify-end">
        <span className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-1">
          Playlist
        </span>
        <h1 className={`text-title text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 drop-shadow-md ${language === "telugu" ? "font-telugu" : ""}`}>
          {name}
        </h1>
        <p className="text-xs md:text-sm text-muted max-w-xl mb-4 leading-relaxed font-medium">
          {desc}
        </p>
        <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-title font-bold">
          <span>youworship</span>
          <span className="text-muted/50">&bull;</span>
          <span className="text-muted font-medium">{langName}</span>
          <span className="text-muted/50">&bull;</span>
          <span>{songCount} song{songCount !== 1 && "s"}</span>
        </div>
      </div>
    </div>
  );
}
