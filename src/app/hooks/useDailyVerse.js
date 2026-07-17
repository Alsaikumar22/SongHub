"use client";

import { useState, useEffect, useMemo } from "react";
import VERSES from "../../data/verses";

/**
 * Returns the current date's day-of-year (1-365/366) in Indian Standard Time (UTC+5:30).
 * This ensures every user worldwide sees the same verse on the same IST calendar day.
 */
function getISTDayOfYear() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const istYear = istTime.getUTCFullYear();
  const istMonth = istTime.getUTCMonth();
  const istDate = istTime.getUTCDate();

  const startOfISTYear = new Date(Date.UTC(istYear, 0, 1));
  const currentISTDate = new Date(Date.UTC(istYear, istMonth, istDate));
  const diffMs = currentISTDate.getTime() - startOfISTYear.getTime();
  const dayOfYear = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;

  return dayOfYear;
}

/**
 * Calculate the time remaining until the next midnight IST (UTC+5:30).
 * Returns milliseconds.
 */
function getMsUntilNextISTMidnight() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = now.getTime() + istOffset;
  const msPerDay = 24 * 60 * 60 * 1000;
  const nextMidnightIST = Math.ceil(nowIST / msPerDay) * msPerDay;
  return nextMidnightIST - nowIST;
}

/**
 * useDailyVerse
 *
 * Returns a verse from the local verses.js collection that changes daily
 * based on Indian Standard Time (IST). The verse rotates automatically
 * every day at midnight IST (5:30 UTC).
 *
 * @param {Object} [options]
 * @param {number} [options.verseIndex] - Override the index for testing.
 * @returns {{
 *   verse: Object,
 *   reference: string,
 *   referenceTelugu: string,
 *   dayOfYear: number,
 *   totalVerses: number,
 * }}
 */
export default function useDailyVerse(options = {}) {
  const { verseIndex } = options;

  // Force re-render when date changes at IST midnight
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const msUntilMidnight = getMsUntilNextISTMidnight();
    const timer = setTimeout(() => {
      setTick((prev) => prev + 1);
    }, msUntilMidnight + 1000);

    return () => clearTimeout(timer);
  }, [tick]);

  const dayOfYear = verseIndex !== undefined ? verseIndex : getISTDayOfYear();

  const verse = useMemo(() => {
    const index = (dayOfYear - 1) % VERSES.length;
    const v = VERSES[index];
    return {
      ...v,
      reference: `${v.book} ${v.chapter}:${v.verse}`,
      referenceTelugu: `${v.bookTelugu} ${v.chapter}:${v.verse}`,
    };
  }, [dayOfYear]);

  return {
    verse,
    reference: verse.reference,
    referenceTelugu: verse.referenceTelugu,
    dayOfYear,
    totalVerses: VERSES.length,
  };
}
