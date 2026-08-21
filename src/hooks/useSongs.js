"use client";

import { useState, useEffect, useCallback } from "react";
import { songService } from "../services/songService";

/**
 * Custom React hook for fetching and managing songs from youworship_songs collection.
 * Provides loading states, error handling, refetch capabilities, and filtering helpers.
 *
 * @returns {Object} { songs, loading, error, refetch, search, filterByCategory, filterByLetter }
 */
export function useSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all songs from Firestore
   */
  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await songService.getAllSongs();
      setSongs(data);
    } catch (err) {
      console.error("useSongs hook error:", err);
      setError(err.message || "Failed to load songs from Firestore.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on initial mount
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  /**
   * Search songs by query
   */
  const search = useCallback(async (queryStr) => {
    setLoading(true);
    try {
      const results = await songService.searchSongs(queryStr);
      setSongs(results);
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Filter songs by category
   */
  const filterByCategory = useCallback(async (category) => {
    setLoading(true);
    try {
      const results = await songService.getSongsByCategory(category);
      setSongs(results);
    } catch (err) {
      setError(err.message || "Category filter failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Filter songs by first letter
   */
  const filterByLetter = useCallback(async (letter) => {
    setLoading(true);
    try {
      const results = await songService.getSongsByFirstLetter(letter);
      setSongs(results);
    } catch (err) {
      setError(err.message || "Letter filter failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    songs,
    loading,
    error,
    refetch: fetchSongs,
    search,
    filterByCategory,
    filterByLetter,
  };
}
