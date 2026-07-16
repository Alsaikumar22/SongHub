"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CategoryCard({ category, language, onClick }) {
  const name = language === "telugu" ? category.nameTe : category.nameEn;
  const songCount = language === "telugu" ? category.songIdsTe.length : category.songIdsEn.length;
  const langLabel = language === "telugu" ? "Telugu" : "English";

  return (
    <motion.div
      onClick={onClick}
      className="relative w-full h-[180px] rounded-[22px] overflow-hidden border border-white/5 bg-[#121826]/40 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.37)] cursor-pointer group flex flex-col justify-end p-5 select-none"
      whileHover={{
        scale: 1.04,
        borderColor: "rgba(212, 163, 42, 0.55)",
        boxShadow: "0 0 25px rgba(212, 163, 42, 0.22), 0 8px 32px rgba(0, 0, 0, 0.5)"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src={category.bgImage}
          alt={category.motif}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/95 via-[#070707]/40 to-transparent transition-all duration-300 group-hover:from-[#070707]/98 group-hover:via-[#070707]/50" />
      </div>

      {/* Info Container */}
      <div className="relative z-10 flex flex-col gap-0.5">
        <span className="text-[9px] font-bold tracking-widest text-[#a7a7a7]/60 uppercase transition-colors duration-300 group-hover:text-[#D4A32A]/70">
          {category.motif}
        </span>
        <h3 className="text-lg font-black text-white group-hover:text-[#D4A32A] transition-colors duration-300 line-clamp-2 leading-tight">
          {name}
        </h3>
        <p className="text-xs text-[#a7a7a7] font-medium mt-1">
          {songCount} {langLabel} Song{songCount !== 1 && "s"}
        </p>
      </div>
    </motion.div>
  );
}
