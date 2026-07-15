import React from "react";
import { Grid3X3, ChevronDown } from "lucide-react";

export default function BrowseByLetterHeader({ filterMode, onChangeFilterMode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(212,163,42,0.12)] pb-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(212,163,42,0.18)] bg-[#0F1420] text-[#D4A32A]">
          <Grid3X3 className="w-4 h-4" />
        </span>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#C6CCD7] sm:text-xs">
          Browse by Letter
        </span>
      </div>
      <div className="relative">
        <select
          value={filterMode}
          onChange={(e) => onChangeFilterMode(e.target.value)}
          className="appearance-none rounded-xl border border-[#D4A32A]/45 bg-[#0F1420] px-4 py-2 pr-10 text-xs font-semibold text-white shadow-[inset_0_0_0_1px_rgba(212,163,42,0.04)] outline-none transition-colors duration-200 hover:border-[#D4A32A] focus:border-[#D4A32A]"
        >
          <option value="all" className="bg-[#121826] text-white">
            All
          </option>
          <option value="available" className="bg-[#121826] text-white">
            Available
          </option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4A32A]" />
      </div>
    </div>
  );
}
