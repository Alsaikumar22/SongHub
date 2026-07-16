"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CategoryLanguageSelector from "./CategoryLanguageSelector";
import CategoryCard from "./CategoryCard";
import CategoryDetails from "./CategoryDetails";
import { CATEGORIES_DATA } from "./categoryData";

export default function CategoryExplorer() {
  const [selectedLanguage, setSelectedLanguage] = useState("telugu");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const selectedCategory = CATEGORIES_DATA.find((c) => c.id === selectedCategoryId);

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
              onBack={() => setSelectedCategoryId(null)}
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
            {/* Header section */}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Browse Song Categories
              </h1>
              <p className="text-xs md:text-sm text-[#a7a7a7] mt-1 font-semibold">
                Discover Christian worship songs by category.
              </p>
            </div>

            {/* Language Selector */}
            <CategoryLanguageSelector
              selectedLanguage={selectedLanguage}
              onChange={setSelectedLanguage}
            />

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
                  onClick={() => setSelectedCategoryId(category.id)}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
