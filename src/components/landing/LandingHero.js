"use client";

import Image from "next/image";
import EnterAppButton from "./EnterAppButton";
import SongsPrefetcher from "./SongsPrefetcher";

export default function LandingHero({ onEnter, redirectTo }) {
  return (
    <div className="relative min-h-[100dvh] h-full w-full overflow-y-auto overflow-x-hidden bg-[#0B0F18] flex flex-col items-center justify-between sm:justify-center px-4 sm:px-6 py-6 sm:py-8 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] select-none">
      {/* Inline script: starts fetching songs BEFORE React hydrates */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (window.__SONGHUB_SONGS_PREFETCHED) return;
              window.__SONGHUB_SONGS_PREFETCHED = true;
              fetch('/api/songs?all=true', { cache: 'default' })
                .then(function(r) { return r.ok ? r.json() : null; })
                .then(function(d) {
                  if (d && d.songs) {
                    window.__SONGHUB_PREFETCHED_SONGS = d.songs;
                  }
                })
                .catch(function() {});
            })();
          `,
        }}
      />
      {/* Prefetch API */}
      <link rel="prefetch" href="/api/songs?all=true" />
      <SongsPrefetcher />

      {/* Deep navy (#0B0F18) → black gradient */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#0B0F18] via-[#02040E] to-black pointer-events-none"
      />

      {/* Soft golden ambient glow radiating from behind the centered logo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[8%] flex justify-center">
        <div className="landing-glow h-[min(58vw,440px)] w-[min(88vw,640px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(242,193,78,0.18)_0%,rgba(242,193,78,0.05)_42%,transparent_70%)] blur-2xl" />
      </div>

      {/* Subtle bottom fade for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-48 bg-gradient-to-t from-black/60 to-transparent"
      />

      {/* ─── Content ─── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full my-auto py-2">
        {/* LOGO */}
        <div className="landing-fade-up relative mb-2 sm:mb-3.5 md:mb-6 shrink-0">
          <div
            aria-hidden
            className="landing-glow pointer-events-none absolute -inset-6 sm:-inset-8 rounded-full bg-[radial-gradient(circle,rgba(242,193,78,0.3)_0%,transparent_70%)] blur-2xl"
          />
          <div className="landing-float relative">
            <Image
              src="/youworship-logo.png"
              alt="You Worship"
              width={1254}
              height={1254}
              priority
              className="relative w-[clamp(4.25rem,min(13vh,28vw),14rem)] h-auto drop-shadow-[0_0_20px_rgba(242,193,78,0.25)]"
            />
            <div
              aria-hidden
              className="landing-shimmer pointer-events-none absolute inset-0 rounded-full"
            />
          </div>
        </div>

        {/* TITLE */}
        <h1
          className="landing-fade-up font-serif text-[clamp(1.65rem,min(5.2vh,8.5vw),5rem)] font-bold leading-[1.1] tracking-[0.03em] whitespace-nowrap gold-title-text"
          style={{ animationDelay: "0.15s" }}
        >
          You Worship
        </h1>

        {/* SUBTITLE */}
        <p
          className="landing-fade-up mt-2 sm:mt-3 md:mt-4 text-[clamp(0.62rem,min(1.6vh,2.7vw),1.1rem)] text-[#A9B2C6] md:text-[#8A93A8] font-normal md:font-light tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.28em] uppercase max-w-md px-2"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="inline-flex items-center gap-x-1.5 sm:gap-x-2.5 gap-y-1 flex-wrap justify-center">
            <span>Christian Songs</span>
            <span className="text-[#F2C14E] text-[0.6em] leading-none">•</span>
            <span>Lyrics</span>
            <span className="text-[#F2C14E] text-[0.6em] leading-none">•</span>
            <span>Audio</span>
            <span className="text-[#F2C14E] text-[0.6em] leading-none">•</span>
            <span>Videos</span>
          </span>
        </p>

        {/* TAGLINE */}
        <div
          className="landing-fade-up mt-2 sm:mt-3 md:mt-5 space-y-0.5 sm:space-y-1 text-[clamp(0.85rem,min(1.9vh,3.5vw),1.5rem)] font-serif italic font-medium leading-snug sm:leading-relaxed text-[#F2F2F2] px-3"
          style={{ animationDelay: "0.45s" }}
        >
          <p>
            Songs that <span className="text-[#F2C14E] font-medium">inspire</span>.
          </p>
          <p>
            Lyrics that <span className="text-[#F2C14E] font-medium">touch</span> the heart.
          </p>
        </div>

        {/* CTA BUTTON */}
        <div
          className="landing-fade-up mt-3.5 sm:mt-5 md:mt-7 shrink-0"
          style={{ animationDelay: "0.6s" }}
        >
          <EnterAppButton
            href={redirectTo || "/?tab=discover"}
            onEnter={onEnter}
          />
          {redirectTo && (
            <p className="mt-2.5 text-[10px] sm:text-xs text-[#8A93A8]/90 tracking-wide">
              You were sent to a song — open it after entering.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
