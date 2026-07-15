import React from "react";
import LetterButton from "./LetterButton";
import { ENGLISH_ALPHABET, TELUGU_ALPHABET } from "./alphabetData";

export default function AlphabetGrid({
  language,
  filterMode,
  selectedLetter,
  onSelectLetter,
  availableLetters = []
}) {
  const alphabet = language === "telugu" ? TELUGU_ALPHABET : ENGLISH_ALPHABET;
  
  const availableSet = new Set(availableLetters);

  return (
    <div className="flex flex-wrap gap-2.5 py-5 select-none">
      {alphabet.map((letter) => {
        const isAvailable = availableSet.has(letter);
        const isSelected = selectedLetter === letter;
        const isDisabled = filterMode === "available" && !isAvailable;
        
        return (
          <LetterButton
            key={letter}
            letter={letter}
            mode={filterMode}
            isAvailable={isAvailable}
            isSelected={isSelected}
            isDisabled={isDisabled}
            onClick={() => onSelectLetter(letter)}
          />
        );
      })}
    </div>
  );
}
