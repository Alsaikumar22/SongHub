import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

/**
 * Landing / Welcome screen — shown at the root URL (youworship.world).
 * Premium gold-on-navy hero per the product design:
 *   deep navy → black gradient, glowing logo, luxury serif title,
 *   subtitle, tagline and a glassmorphism "Explore Songs" CTA that
 *   opens the application at /home.
 *
 * Legacy deep links (e.g. /?tab=..., /?q=..., /?auth=...) that the app
 * previously generated are forwarded to /home so bookmarks, shared links
 * and the auth modal keep working after the move.
 */
const APP_PARAMS = ["tab", "q", "category", "playlistId", "auth", "redirect"];

export default async function LandingPage({ searchParams }) {
  const params = await searchParams;
  if (params && APP_PARAMS.some((key) => params[key] !== undefined)) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) value.forEach((v) => query.append(key, v));
      else if (value !== undefined && value !== null) query.set(key, String(value));
    }
    redirect(`/home?${query.toString()}`);
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0B0F18] flex flex-col items-center justify-center px-5 sm:px-6 select-none">
      {/* Deep navy (#0B0F18) → black gradient, middle toned to blend the logo seamlessly */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#0B0F18] via-[#02040E] to-black"
      />

      {/* Soft golden ambient glow radiating from behind the centered logo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[14%] flex justify-center">
        <div className="landing-glow h-[min(58vw,500px)] w-[min(88vw,740px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(242,193,78,0.18)_0%,rgba(242,193,78,0.05)_42%,transparent_70%)] blur-2xl" />
      </div>

      {/* Subtle bottom fade for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent"
      />

      {/* ─── Content ─── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
        {/* LOGO — original artwork used exactly as-is (shape, gold tone, shading untouched) */}
        <div className="landing-fade-up relative mb-6 md:mb-8">
          <div
            aria-hidden
            className="landing-glow pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(242,193,78,0.32)_0%,transparent_70%)] blur-2xl"
          />
          <div className="landing-float relative">
            <Image
              src="/youlogo.png"
              alt="You Worship"
              width={1254}
              height={1254}
              priority
              className="relative w-[clamp(5rem,10vh,8rem)] h-auto"
            />
            {/* Very faint diagonal light shimmer sweeping across the gold surface */}
            <div
              aria-hidden
              className="landing-shimmer pointer-events-none absolute inset-0"
            />
          </div>
        </div>

        {/* TITLE — luxury serif with metallic gold gradient */}
        <h1
          className="landing-fade-up font-serif text-[clamp(2.25rem,min(9vh,13vw),6.5rem)] font-bold leading-[1.15] tracking-[0.04em] whitespace-nowrap gold-title-text"
          style={{ animationDelay: "0.15s" }}
        >
          You Worship
        </h1>

        {/* SUBTITLE — white sans with thin gold dot separators */}
        <p
          className="landing-fade-up mt-5 md:mt-6 text-[clamp(0.85rem,min(2.2vh,4vw),1.25rem)] text-[#A9B2C6] md:text-[#8A93A8] font-normal md:font-light tracking-[0.18em] md:tracking-[0.3em] uppercase"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="inline-flex items-center gap-x-3 gap-y-1 flex-wrap justify-center">
            <span>Christian Songs</span>
            <span className="text-[#F2C14E] text-[0.6em] leading-none">•</span>
            <span>Lyrics</span>
            <span className="text-[#F2C14E] text-[0.6em] leading-none">•</span>
            <span>Audio</span>
            <span className="text-[#F2C14E] text-[0.6em] leading-none">•</span>
            <span>Videos</span>
          </span>
        </p>

        {/* TAGLINE — two lines with gold accent words */}
        <div
          className="landing-fade-up mt-5 md:mt-7 space-y-1.5 md:space-y-2 text-[clamp(1.1rem,min(2.4vh,4.5vw),1.75rem)] font-serif italic font-medium leading-relaxed text-[#F2F2F2]"
          style={{ animationDelay: "0.45s" }}
        >
          <p>
            Songs that <span className="text-[#F2C14E] font-medium">inspire</span>.
          </p>
          <p>
            Lyrics that <span className="text-[#F2C14E] font-medium">touch</span> the heart.
          </p>
        </div>

        {/* CTA — glassmorphism pill with gold border + glow */}
        <div
          className="landing-fade-up mt-7 md:mt-9"
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            href="/home"
            className="landing-cta group relative inline-flex items-center justify-center gap-2.5 md:gap-3 rounded-[30px] px-7 py-3.5 md:px-11 md:py-[18px] text-[clamp(0.95rem,min(2vh,4.2vw),1.35rem)] font-serif font-bold text-white bg-white/[0.06] backdrop-blur-xl border border-[#D9A544]/50 shadow-[0_0_30px_rgba(242,193,78,0.22),inset_0_1px_0_rgba(255,255,255,0.14)] cursor-pointer"
          >
            <span>Explore Songs</span>
            <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-[#F2C14E] transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
