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

  // Handle redirect login results (mostly on mobile)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("Redirect login successful:", result.user);
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
      });
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user data from Firestore — also save auth profile info
        const data = await fetchUserData(firebaseUser.uid, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        setFirestoreData(data);
      } else {
        setFirestoreData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const isMobile = typeof window !== "undefined" && 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        console.log("Mobile device detected: Using signInWithRedirect");
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.log("Desktop device detected: Using signInWithPopup");
        try {
          await signInWithPopup(auth, googleProvider);
        } catch (popupError) {
          if (popupError.code === "auth/popup-blocked" || popupError.code === "auth/popup-closed-by-user") {
            console.warn("Popup blocked or closed by user. Falling back to signInWithRedirect...");
            await signInWithRedirect(auth, googleProvider);
          } else {
            throw popupError;
          }
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
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
