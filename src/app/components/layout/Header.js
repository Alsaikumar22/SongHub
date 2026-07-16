"use client";

import { Music, Search, X, LayoutGrid } from "lucide-react";
import { useSearch } from "../../context/search-context";
import { useAudio } from "../../context/audio-context";

export default function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { activeTab, setActiveTab } = useAudio();

  return (
    <header className="h-16 bg-canvas/95 backdrop-blur-md border-b border-line-muted p-2 flex items-center justify-between gap-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-card-hover flex items-center justify-center text-white shadow-sm">
          <Music className="w-4 h-4" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-title hidden sm:inline">
          SongHub
        </span>
      </div>

      <div className="relative flex-1 max-w-sm h-full mx-auto group">
        <Search className="w-6 h-6 text-muted absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors group-focus-within:text-copy" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-full pl-10 pr-16 text-sm bg-input backdrop-blur-sm border border-line/60 rounded-full focus:outline-none transition-all duration-200 text-copy placeholder-muted/70"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 hover:bg-line/30 rounded-full text-dim hover:text-copy cursor-pointer transition-all duration-150"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setActiveTab(activeTab === "categories" ? "discover" : "categories")}
            className={`p-1 hover:bg-line/30 rounded-full cursor-pointer transition-all duration-150 ${
              activeTab === "categories" ? "text-white" : "text-dim hover:text-copy"
            }`}
            title="Browse Categories"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-medium text-dim hidden sm:inline">
          Collaborator Mode
        </span>
        <div className="w-8 h-8 rounded-full bg-card-hover border border-line flex items-center justify-center text-xs font-semibold text-handle">
          CM
        </div>
      </div>
    </header>
  );
}

