import React from "react";

export default function LanguageSwitcher({ selectedLanguage, onChange }) {
  return (
    <div className="flex justify-center">
      <div className="flex w-full max-w-105 rounded-3xl border border-[rgba(212,163,42,0.16)] bg-[#121826] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <button
          onClick={() => onChange("telugu")}
          className={`flex-1 rounded-[18px] px-4 py-3 text-sm sm:text-base font-semibold transition-all duration-300 cursor-pointer ${
            selectedLanguage === "telugu"
              ? "bg-[#1E2536] text-white shadow-[0_8px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/8"
              : "text-[#7D8798] hover:text-white bg-transparent"
          }`}
        >
          తెలుగు (Telugu)
        </button>
        <button
          onClick={() => onChange("english")}
          className={`flex-1 rounded-[18px] px-4 py-3 text-sm sm:text-base font-semibold transition-all duration-300 cursor-pointer ${
            selectedLanguage === "english"
              ? "bg-[#1E2536] text-white shadow-[0_8px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/8"
              : "text-[#7D8798] hover:text-white bg-transparent"
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
}
