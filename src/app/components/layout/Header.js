"use client";

import { Music, Search, X } from "lucide-react";
import { useSearch } from "../../context/search-context";

export default function Header() {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <header className="h-14 bg-gray-950/95 backdrop-blur-md border-b border-gray-800 px-6 flex items-center justify-between gap-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-white shadow-sm">
          <Music className="w-4 h-4" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-gray-100 hidden sm:inline">
          SongHub
        </span>
      </div>

      <div className="relative flex-1 max-w-md mx-auto">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search songs, artists, or albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-gray-200 placeholder-gray-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="p-1 hover:bg-gray-800 rounded-full absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs font-medium text-gray-500 hidden sm:inline">
          Collaborator Mode
        </span>
        <div className="w-8 h-8 rounded-full bg-indigo-900/30 border border-indigo-800 flex items-center justify-center text-xs font-semibold text-indigo-300">
          CM
        </div>
      </div>
    </header>
  );
}
