"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/auth-context";

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const hasTriggeredRef = useRef(false);

  /**
   * Onboarding Tour Launch Logic:
   * 1. Without login: Shows when opening the website.
   * 2. After login: Shows on first login for each user account.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (authLoading) return;

    try {
      if (!isAuthenticated || !user?.uid) {
        // Without login: show on first visit / session
        const guestStorageKey = "youworship_guest_tour_shown";
        const hasShownGuest = sessionStorage.getItem(guestStorageKey);

        if (!hasShownGuest && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          const timer = setTimeout(() => {
            setCurrentStep(0);
            setIsOpen(true);
            try {
              sessionStorage.setItem(guestStorageKey, "true");
            } catch {
              // Ignore session storage error
            }
          }, 1200);
          return () => clearTimeout(timer);
        }
      } else {
        // Logged in: show on first login for this user account
        const userStorageKey = `youworship_onboardingCompleted_${user.uid}`;
        const isCompleted = localStorage.getItem(userStorageKey);

        if (!isCompleted && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          const timer = setTimeout(() => {
            setCurrentStep(0);
            setIsOpen(true);
          }, 1200);
          return () => clearTimeout(timer);
        }
      }
    } catch {
      // Handle storage errors safely
    }
  }, [isAuthenticated, user, authLoading]);

  // Start / Replay Tour manually anytime
  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  // Close tour and save completion
  const closeTour = useCallback(() => {
    setIsOpen(false);
    try {
      if (user?.uid) {
        localStorage.setItem(`youworship_onboardingCompleted_${user.uid}`, "true");
      } else {
        sessionStorage.setItem("youworship_guest_tour_shown", "true");
      }
    } catch {
      // Handle storage errors safely
    }
  }, [user]);

  const nextStep = useCallback((totalSteps) => {
    setCurrentStep((prev) => {
      if (prev + 1 >= totalSteps) {
        closeTour();
        return prev;
      }
      return prev + 1;
    });
  }, [closeTour]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <TourContext.Provider
      value={{
        isOpen,
        currentStep,
        setCurrentStep,
        startTour,
        closeTour,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
