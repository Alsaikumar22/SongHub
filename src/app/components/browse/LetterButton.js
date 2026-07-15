import React from "react";

export default function LetterButton({
  letter,
  mode,
  isAvailable,
  isSelected,
  isDisabled,
  onClick,
}) {
  if (isSelected) {
    return (
      <button
        onClick={onClick}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4A32A] bg-[#D4A32A] text-sm font-extrabold text-black shadow-[0_0_18px_rgba(212,163,42,0.28)] transition-all duration-200 hover:scale-105 active:scale-95"
        title={`Deselect ${letter}`}
      >
        {letter}
      </button>
    );
  }

  if (mode === "available") {
    if (isAvailable) {
      return (
        <button
          onClick={onClick}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-[#1E2536] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4A32A]/30 hover:bg-[#222B3E] active:scale-95"
          title={`Filter by ${letter}`}
        >
          {letter}
        </button>
      );
    }

    return (
      <button
        disabled
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-transparent bg-transparent text-sm font-semibold text-[#475062] opacity-45 cursor-not-allowed"
        title={`${letter} is unavailable`}
      >
        {letter}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-[#141B29] text-sm font-semibold text-[#E8EDF5] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4A32A]/20 hover:bg-[#1A2233] active:scale-95"
      title={`Filter by ${letter}`}
    >
      {letter}
    </button>
  );
}
