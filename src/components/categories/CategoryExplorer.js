"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAudio } from "@/context/audio-context";
import CategoryLanguageSelector from "./CategoryLanguageSelector";
import CategoryCard from "./CategoryCard";
import CategoryDetails from "./CategoryDetails";
import { CATEGORIES_DATA } from "./categoryData";

export default function CategoryExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { songs } = useAudio();
  const selectedLanguage = searchParams?.get("lang") || "telugu";

  const handleLanguageChange = (lang) => {
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const filteredCategories = CATEGORIES_DATA.filter((category) => {
    // If selected language is Hindi, only show the specified categories
    if (selectedLanguage === "hindi") {
      const allowedHindiCategories = [
        "Worship",
        "Praise",
        "Hope",
        "Christmas",
        "Gospel",
        "Encouraging",
        "Second Coming",
        "Comfort",
        "Commitment",
        "Thanksgiving",
        "Repentance"
      ];
      if (!allowedHindiCategories.some(c => c.toLowerCase() === category.nameEn.toLowerCase())) {
        return false;
      }
    }

    const songIds = selectedLanguage === "telugu" ? category.songIdsTe : category.songIdsEn;
    const songCount = (songs || []).filter((song) => {
      const songLanguage = (song.language || "").toLowerCase();
      let matchesLanguage = false;
      if (selectedLanguage === "telugu") {
        matchesLanguage = songLanguage === "te" || songLanguage === "telugu";
      } else if (selectedLanguage === "english") {
        matchesLanguage = songLanguage === "en" || songLanguage === "english";
      } else if (selectedLanguage === "hindi") {
        matchesLanguage = songLanguage === "hi" || songLanguage === "hindi";
      } else if (selectedLanguage === "tamil") {
        matchesLanguage = songLanguage === "ta" || songLanguage === "tamil";
      }

      if (!matchesLanguage) return false;

      if (selectedLanguage === "telugu") {
        const hasTeluguScript = /[\u0C00-\u0C7F]/.test(song.title) || /[\u0C00-\u0C7F]/.test(song.teluguTitle);
        if (!hasTeluguScript) return false;
      }

      const matchByCategoryField = Array.isArray(song.categoryArr)
        ? song.categoryArr.some(cat => 
            cat.toLowerCase() === category.nameEn.toLowerCase() || 
            cat.toLowerCase() === category.nameTe.toLowerCase() ||
            (Array.isArray(category.legacyNames) && category.legacyNames.some(ln => ln.toLowerCase() === cat.toLowerCase()))
          )
        : (typeof song.category === "string" && (
            song.category.toLowerCase() === category.nameEn.toLowerCase() || 
            song.category.toLowerCase() === category.nameTe.toLowerCase() ||
            (Array.isArray(category.legacyNames) && category.legacyNames.some(ln => ln.toLowerCase() === song.category.toLowerCase()))
          ));

      const matchByHardcodedList = songIds.includes(song.id);

      return matchByCategoryField || matchByHardcodedList;
    }).length;

    if (selectedLanguage === "hindi" || selectedLanguage === "tamil") {
      return true;
    }
    return songCount > 0;
  });

  // Read selected category from query param
  const selectedCategoryId = searchParams?.get("category") || null;
  const selectedCategory = CATEGORIES_DATA.find((c) => c.id === selectedCategoryId);

  const handleSelectCategory = (id) => {
    const params = new URLSearchParams(window.location.search);
    params.set("category", id);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleBack = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("category");
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6 select-none">
      <AnimatePresence mode="wait">
        {selectedCategory ? (
          <motion.div
            key="category-details"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <CategoryDetails
              category={selectedCategory}
              language={selectedLanguage}
              onBack={handleBack}
            />
          </motion.div>
        ) : (
          <motion.div
            key="category-browse"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="space-y-6"
          >
            {/* Header section with inline Language Selector */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-5">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black text-title tracking-tight">
                  Songs By Categories
                </h1>
                <p className="text-xs md:text-sm text-muted font-semibold">
                  Discover Christian worship songs by category.
                </p>
              </div>

              <div className="shrink-0">
                <CategoryLanguageSelector
                  selectedLanguage={selectedLanguage}
                  onChange={handleLanguageChange}
                />
              </div>
            </div>

            {/* Categories Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2"
            >
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  language={selectedLanguage}
                  onClick={() => handleSelectCategory(category.id)}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
