"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryLanguageSelector from "./CategoryLanguageSelector";
import CategoryCard from "./CategoryCard";
import CategoryDetails from "./CategoryDetails";
import { CATEGORIES_DATA } from "./categoryData";

export default function CategoryExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState("telugu");

  // Read selected category from query param
  const selectedCategoryId = searchParams?.get("category") || null;
  const selectedCategory = CATEGORIES_DATA.find((c) => c.id === selectedCategoryId);

  const handleSelectCategory = (id) => {
    const params = new URLSearchParams(window.location.search);
    params.set("category", id);
    router.push(`/?${params.toString()}`);
  };

  const handleBack = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("category");
    router.push(`/?${params.toString()}`);
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
                  Browse Song Categories
                </h1>
                <p className="text-xs md:text-sm text-muted font-semibold">
                  Discover Christian worship songs by category.
                </p>
              </div>

              <div className="shrink-0">
                <CategoryLanguageSelector
                  selectedLanguage={selectedLanguage}
                  onChange={setSelectedLanguage}
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
              {CATEGORIES_DATA.map((category) => (
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
