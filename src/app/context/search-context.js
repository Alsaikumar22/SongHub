"use client";

import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullResults, setShowFullResults] = useState(false);
  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, showFullResults, setShowFullResults }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used within SearchProvider");
  return context;
}
