"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, ArrowLeft, ExternalLink } from "lucide-react";

/**
 * EmailSentPage — "Check your email" screen shown after Firebase sendSignInLinkToEmail().
 * Spotify-inspired design with YouWorship gold branding.
 *
 * Shows:
 *   - Success check icon with animation
 *   - Masked email address
 *   - Email illustration
 *   - "Open Gmail" button (opens mailto / gmail)
 *   - "Use another email" link
 *   - 60-second resend cooldown
 */
export default function EmailSentPage({
  email,
  onBack,
  onResend,
  onUseAnotherEmail,
  resendLoading = false,
}) {
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Mask email like Spotify does: praveen***23@gmail.com
  const maskEmail = (email) => {
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const visibleStart = local.slice(0, Math.min(4, local.length));
    const visibleEnd = local.slice(-2);
    const stars = "*".repeat(
      Math.max(3, local.length - visibleStart.length - visibleEnd.length)
    );
    return `${visibleStart}${stars}${visibleEnd}@${domain}`;
  };

  // Timer countdown for resend
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (!canResend || resendLoading) return;
    setTimer(60);
    setCanResend(false);
    onResend?.();
  };

  const handleOpenGmail = () => {
    window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-8 md:p-10 w-full max-w-md mx-auto">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-8"
      >
        <img
          src="/youlogo.png"
          alt="YouWorship"
          className="w-12 h-12 object-contain"
        />
      </motion.div>

      {/* Success Check Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex justify-center mb-5"
      >
        <div className="w-16 h-16 rounded-full bg-[#D4A32A]/15 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-[#D4A32A]" />
        </div>
      </motion.div>

      {/* Email Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex justify-center mb-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
          <Mail className="w-10 h-10 text-[#D4A32A]/70" />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl md:text-2xl font-black text-white text-center tracking-tight mb-2"
      >
        Check your email
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-sm text-[#a7a7a7] text-center leading-relaxed mb-2"
      >
        We sent a magic link to{" "}
        <span className="text-white font-semibold">{maskEmail(email)}</span>
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-[#727272] text-center mb-8"
      >
        Click the link in the email to sign in instantly. No password needed.
      </motion.p>

      {/* Open Gmail Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3"
      >
        <button
          onClick={handleOpenGmail}
          className="w-full py-3 rounded-full bg-[#D4A32A] text-black font-bold text-sm hover:bg-[#c49527] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Gmail</span>
        </button>

        {/* Resend / Timer */}
        <div className="text-center pt-1">
          {resendLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#D4A32A]/30 border-t-[#D4A32A] rounded-full animate-spin" />
              <span className="text-sm text-[#a7a7a7]">Resending...</span>
            </div>
          ) : canResend ? (
            <button
              onClick={handleResend}
              className="text-sm text-[#D4A32A] font-semibold hover:underline cursor-pointer"
            >
              Resend email
            </button>
          ) : (
            <p className="text-sm text-[#727272] font-mono">
              Resend in 00:{timer.toString().padStart(2, "0")}
            </p>
          )}
        </div>
      </motion.div>

      {/* Bottom Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 space-y-4"
      >
        <button
          onClick={onUseAnotherEmail}
          className="w-full text-center text-sm text-[#a7a7a7] hover:text-white font-semibold transition-colors cursor-pointer"
        >
          Use a different email
        </button>

        <button
          onClick={onBack}
          className="w-full text-center text-sm text-[#727272] hover:text-[#a7a7a7] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </motion.div>
    </div>
  );
}
