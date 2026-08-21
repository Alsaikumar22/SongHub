"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Must match src/proxy.js — this cookie tells the landing gate that the
// visitor chose to enter the app, letting all subsequent navigation through.
const ENTERED_COOKIE = "yw_entered";

/**
 * "Explore Songs" CTA. Sets the session cookie (so the app is not gated again)
 * and navigates to `href` — either /home or the deep link the visitor was sent
 * to (e.g. a shared song).
 */
export default function EnterAppButton({ href }) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={() => {
        // Session cookie — lets in-app navigation pass the landing gate.
        document.cookie = `${ENTERED_COOKIE}=1; path=/; SameSite=Lax`;
      }}
      className="landing-cta group relative inline-flex items-center justify-center gap-2.5 md:gap-3 rounded-[30px] px-7 py-3.5 md:px-11 md:py-[18px] text-[clamp(0.95rem,min(2vh,4.2vw),1.35rem)] font-serif font-bold text-white bg-white/[0.06] backdrop-blur-xl border border-[#D9A544]/50 shadow-[0_0_30px_rgba(242,193,78,0.22),inset_0_1px_0_rgba(255,255,255,0.14)] cursor-pointer"
    >
      <span>Explore Songs</span>
      <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-[#F2C14E] transition-transform duration-300 group-hover:translate-x-1.5" />
    </Link>
  );
}
