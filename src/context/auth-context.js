"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  googleProvider,
} from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
} from "firebase/auth";
import { fetchUserData } from "@/lib/firestore-service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firestoreData, setFirestoreData] = useState(null);

  // Initialize auth: process redirect result AND listen for auth state changes
  useEffect(() => {
    let cancelled = false;

    // 1. Handle redirect login results (mobile flow via signInWithRedirect)
    getRedirectResult(auth)
      .then((result) => {
        if (cancelled) return;
        if (result?.user) {
          // Explicitly set the user so the account shows immediately
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });

    // 2. Listen for all auth state changes (popup, redirect, refresh, etc.)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const data = await fetchUserData(firebaseUser.uid, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          if (!cancelled) setFirestoreData(data);
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setFirestoreData(null);
      }

      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Try popup first — works everywhere except some restrictive mobile browsers
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      // If popup was blocked, fall back to redirect (real mobile devices)
      if (
        error.code === "auth/popup-blocked"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error("Redirect sign-in error:", redirectError);
        }
      } else {
        console.error("Google sign-in error:", error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firestoreData,
        setFirestoreData,
        signInWithGoogle,
        signOut: handleSignOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
