"use client";

import React, { useState, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import BrowseByLetterHeader from "./BrowseByLetterHeader";
import AlphabetGrid from "./AlphabetGrid";
import SongList from "./SongList";
import { BROWSE_SONGS } from "./songsData";
import { useAudio } from "../../context/audio-context";

export default function BrowseByLetterSection() {
  const { currentSong, isPlaying, playSong } = useAudio();

  const [selectedLanguage, setSelectedLanguage] = useState("telugu");
  const [filterMode, setFilterMode] = useState("all");
  const [selectedLetter, setSelectedLetter] = useState(null);

  // Reset selected letter when language changes
  useEffect(() => {
    setSelectedLetter(null);
  }, [selectedLanguage]);

  // Keep the selected letter valid when switching to availability mode
  useEffect(() => {
    if (filterMode !== "available" || !selectedLetter) {
      return;
    }

    const safeLanguageSongs = BROWSE_SONGS.filter(
      (song) => song.language === selectedLanguage
    );
    const availableLetters = new Set(
      safeLanguageSongs.map((song) => song.startingLetter).filter(Boolean)
    );

    if (!availableLetters.has(selectedLetter)) {
      setSelectedLetter(null);
    }
  }, [filterMode, selectedLetter, selectedLanguage]);

  // Get songs for the current language
  const languageSongs = BROWSE_SONGS.filter(
    (song) => song.language === selectedLanguage
  );

  // Determine which letters have songs in the current language
  const availableLetters = Array.from(
    new Set(languageSongs.map((song) => song.startingLetter))
  ).filter(Boolean);

  // Filter songs based on letter selection
  const displayedSongs = selectedLetter
    ? languageSongs.filter((song) => song.startingLetter === selectedLetter)
    : languageSongs;

  const languageLabel = selectedLanguage === "telugu" ? "తెలుగు" : "English";
  const sectionLabel = selectedLetter
    ? `${languageLabel} Songs starting with "${selectedLetter}"`
    : `All ${languageLabel} Songs`;

  const handleSelectLetter = (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null); // Deselect if clicked again
    } else {
      setSelectedLetter(letter);
    }
  };

  return (
    <div className="space-y-6">
      <LanguageSwitcher
        selectedLanguage={selectedLanguage}
        onChange={setSelectedLanguage}
      />

      <div className="rounded-[28px] border border-[rgba(212,163,42,0.18)] bg-[#121826] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <BrowseByLetterHeader
          filterMode={filterMode}
          onChangeFilterMode={setFilterMode}
        />

        <div className="pt-1">
          <AlphabetGrid
            language={selectedLanguage}
            filterMode={filterMode}
            selectedLetter={selectedLetter}
            onSelectLetter={handleSelectLetter}
            availableLetters={availableLetters}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="pl-1 text-xs font-bold uppercase tracking-[0.22em] text-[#B8BEC9]">
          {sectionLabel}
        </h3>
        <SongList
          songs={displayedSongs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={playSong}
          selectedLetter={selectedLetter}
          onChangeFilterMode={setFilterMode}
        />
      </div>
    </div>
  );
}
