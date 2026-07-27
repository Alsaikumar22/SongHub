"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

/**
 * LoginPage — Spotify-inspired login form with YouWorship gold branding.
 * Supports email link (passwordless) login and OAuth providers.
 */
export default function LoginPage({
  onContinueWithEmail,
  onSwitchToSignup,
  onPasswordLogin,
  onClose,
  onSuccess,
}) {
  const { signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    // Let the parent handle the real Firebase sendEmailLink call
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    onContinueWithEmail(email.trim());
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading("google");
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
        console.warn("Google sign-in popup closed by user or cancelled request.");
      } else {
        console.error("Google sign-in error:", err);
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setOauthLoading("facebook");
    try {
      console.log("Facebook sign-in");
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
        console.warn("Facebook sign-in popup closed by user or cancelled request.");
      } else {
        console.error("Facebook sign-in error:", err);
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setOauthLoading("apple");
    try {
      console.log("Apple sign-in");
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
        console.warn("Apple sign-in popup closed by user or cancelled request.");
      } else {
        console.error("Apple sign-in error:", err);
      }
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="p-8 md:p-10 w-full max-w-md mx-auto">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex justify-center mb-6"
      >
        <img
          src="/youlogo.png"
          alt="YouWorship"
          className="w-14 h-14 object-contain"
        />
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl md:text-3xl font-black text-white text-center tracking-tight mb-8"
      >
        Welcome Back
      </motion.h1>

      {/* Email Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleEmailSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            autoFocus
            className="w-full px-4 py-3 bg-[#111111] border border-[rgba(255,255,255,0.12)] rounded-lg text-sm text-white placeholder-[#727272] focus:outline-none focus:border-[#D4A32A] focus:ring-1 focus:ring-[#D4A32A]/30 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full py-3 rounded-full bg-[#D4A32A] text-black font-bold text-sm hover:bg-[#c49527] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : null}
          <span>Continue</span>
        </button>
      </motion.form>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-4 my-6"
      >
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
        <span className="text-xs font-semibold text-[#727272] uppercase tracking-wider">OR</span>
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
      </motion.div>

      {/* OAuth Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <button
          onClick={handleGoogleSignIn}
          disabled={oauthLoading !== null}
          className="w-full py-3 rounded-full border border-[rgba(255,255,255,0.15)] bg-transparent hover:bg-[rgba(255,255,255,0.05)] text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
        >
          {oauthLoading === "google" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <button
          onClick={handleFacebookSignIn}
          disabled={oauthLoading !== null}
          className="w-full py-3 rounded-full border border-[rgba(255,255,255,0.15)] bg-transparent hover:bg-[rgba(255,255,255,0.05)] text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
        >
          {oauthLoading === "facebook" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
            </svg>
          )}
          <span>Continue with Facebook</span>
        </button>

        <button
          onClick={handleAppleSignIn}
          disabled={oauthLoading !== null}
          className="w-full py-3 rounded-full border border-[rgba(255,255,255,0.15)] bg-transparent hover:bg-[rgba(255,255,255,0.05)] text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
        >
          {oauthLoading === "apple" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          )}
          <span>Continue with Apple</span>
        </button>

        {/* Password Login Link */}
        <button
          onClick={onPasswordLogin}
          className="w-full py-2 text-sm text-[#a7a7a7] hover:text-white font-semibold transition-colors cursor-pointer"
        >
          Log in with password
        </button>
      </motion.div>

      {/* Bottom switch */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-[#a7a7a7]">
          Don&apos;t have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-white font-semibold hover:underline cursor-pointer"
          >
            Create one
          </button>
        </p>
      </motion.div>
    </div>
  );
}
