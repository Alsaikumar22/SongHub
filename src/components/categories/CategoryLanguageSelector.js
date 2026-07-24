"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CategoryLanguageSelector({ selectedLanguage, onChange }) {
  const options = [
    { id: "telugu", label: "తెలుగు" },
    { id: "english", label: "English" }
  ];

  return (
    <div className="flex justify-start items-center">
      <div className="flex h-11 bg-card-hover/50 backdrop-blur-md border border-white/5 rounded-full p-1 shadow-[0_8px_32px_rgba(0,0,0,0.37)] relative select-none w-fit overflow-hidden">
        {options.map((opt) => {
          const isSelected = selectedLanguage === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`relative h-full px-6 text-xs font-bold rounded-full transition-colors duration-300 cursor-pointer flex items-center justify-center z-10 select-none outline-none ${
                isSelected ? "text-black" : "text-muted hover:text-title"
              }`}
            >
              <span className="relative z-10" style={{ color: isSelected ? '#000' : undefined }}>{opt.label}</span>
              {isSelected && (
                <motion.div
                  layoutId="activeLangIndicator"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
