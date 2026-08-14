"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Music, LayoutGrid, Heart, Clock, ArrowLeft } from "lucide-react";

// ─── Inline social SVGs (lucide no longer ships brand icons) ────────────────

function YouTubeIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

// ─── Footer link data ────────────────────────────────────────────────────────

const exploreLinks = [
  { label: "Songs", href: "/home", icon: Music },
  { label: "Categories", href: "/home?tab=categories", icon: LayoutGrid },
  { label: "Favorites", href: "/home?tab=favorites", icon: Heart },
  { label: "Recently Played", href: "/home?tab=recently-played", icon: Clock },
];

const socialLinks = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@youworship",
    Icon: YouTubeIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/youworship",
    Icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/youworship",
    Icon: FacebookIcon,
  },
];

function openTalkToUs(e) {
  e.preventDefault();
  window.dispatchEvent(new CustomEvent("youworship:open-talk-to-us"));
}

function openAbout(e) {
  e.preventDefault();
  window.dispatchEvent(new CustomEvent("youworship:open-about"));
}

export default function Footer() {
  const router = useRouter();

  const goBack = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/home");
    }
  };

  return (
    <footer className="mt-10 border-t border-line/40">
      <div className="px-6 md:px-8 py-10 max-w-7xl mx-auto">
        {/* Branding */}
        <div className="flex items-center gap-2.5 mb-8">
          <Image
            src="/youworship-logo.png"
            alt="YouWorship"
            width={36}
            height={36}
            className="w-9 h-9 object-contain shrink-0"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-serif font-bold gold-title-text tracking-wide">
              YouWorship
            </span>
            <span className="text-[11px] text-muted mt-0.5">
              Worship through songs, lyrics, and music.
            </span>
          </div>
        </div>

        {/* 5 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {/* Column 1 — Explore */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-dim uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {exploreLinks.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-xs text-muted hover:text-title transition-colors cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-dim group-hover:text-handle transition-colors" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — Help & Support */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-dim uppercase tracking-wider">
              Help &amp; Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={openTalkToUs}
                  className="text-xs text-muted hover:text-title transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 — About */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-dim uppercase tracking-wider">
              About
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={openAbout}
                  className="text-xs text-muted hover:text-title transition-colors cursor-pointer"
                >
                  About YouWorship
                </button>
              </li>
              <li>
                <button
                  onClick={openAbout}
                  className="text-xs text-muted hover:text-title transition-colors cursor-pointer"
                >
                  Our Mission
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-dim uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-xs text-muted hover:text-title transition-colors cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-xs text-muted hover:text-title transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy#copyright"
                  className="text-xs text-muted hover:text-title transition-colors cursor-pointer"
                >
                  Copyright
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy#third-party"
                  className="text-xs text-muted hover:text-title transition-colors cursor-pointer"
                >
                  Third-Party Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 — Connect With Us */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold text-dim uppercase tracking-wider">
              Connect With Us
            </h4>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="p-2 rounded-full text-muted hover:text-handle hover:bg-card-hover transition-colors cursor-pointer"
                >
                  <Icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line/40">
        <div className="px-6 md:px-8 py-5 max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={goBack}
                aria-label="Go back to previous page"
                title="Go back"
                className="p-2 rounded-full text-muted hover:text-title hover:bg-card-hover transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-dim">
                © {new Date().getFullYear()} YouWorship. All rights reserved.
              </span>
            </div>
          </div>

          <p className="text-[10px] text-dim/80 text-center max-w-2xl leading-relaxed">
            YouWorship uses third-party services such as YouTube, Google, and
            Firebase. These services have their own privacy policies and terms.
          </p>
        </div>
      </div>
    </footer>
  );
}
