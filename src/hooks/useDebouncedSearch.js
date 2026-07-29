"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useDebouncedSearch — Reusable hook that debounces search input updates.
 *
 * Keeps a local `inputValue` that updates immediately so the input stays
 * responsive, while the `onCommit` callback (which updates the shared context)
 * is delayed until the user stops typing.
 *
 * @param {Object} options
 * @param {string} options.initialValue  — The current value from the shared context (e.g. searchQuery)
 * @param {(value: string) => void} options.onCommit — Callback invoked with the debounced value (e.g. setSearchQuery)
 * @param {number} [options.debounceMs=250] — Debounce delay in milliseconds
 *
 * @returns {{ inputValue: string, setInputValue: (v: string) => void, handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void, flush: () => void, clear: () => void }}
 */
export function useDebouncedSearch({ initialValue, onCommit, debounceMs = 250 }) {
  const [inputValue, setInputValue] = useState(initialValue || "");
  const debounceTimer = useRef(null);

  // Sync local value when the external context value changes
  useEffect(() => {
    setInputValue(initialValue || "");
  }, [initialValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, []);

  /** Call from the input's onChange — updates inputValue instantly, debounces onCommit */
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onCommit(value);
    }, debounceMs);
  }, [onCommit, debounceMs]);

  /** Flush pending debounce immediately — good for Enter key or navigation */
  const flush = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    onCommit(inputValue);
  }, [inputValue, onCommit]);

  /** Clear input and commit immediately */
  const clear = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setInputValue("");
    onCommit("");
  }, [onCommit]);

  return {
    inputValue,
    setInputValue,
    handleChange,
    flush,
    clear,
  };
}
