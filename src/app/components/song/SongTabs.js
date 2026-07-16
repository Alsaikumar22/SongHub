"use client";

import React from "react";

export default function SongTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl p-1 w-fit backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 text-xs font-bold tracking-wider rounded-lg transition-all duration-300 cursor-pointer border ${
              isActive
                ? "bg-white/10 text-white border-white/10 shadow-sm shadow-black/10"
                : "text-muted/80 border-transparent hover:text-white hover:bg-white/[0.01]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
