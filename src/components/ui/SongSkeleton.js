import { Spiral } from "@/components/ui/Spiral";

export function SongCardSkeleton() {
  return (
    <div className="group relative w-48 shrink-0 animate-pulse" role="status" aria-label="Loading song">
      <div className="relative aspect-square w-full rounded-md bg-card-hover overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02]" />
      </div>
      <div className="mt-2.5 space-y-1.5 px-0.5">
        <div className="h-3.5 bg-card-hover rounded-md w-3/4" />
        <div className="h-3 bg-card-hover rounded-md w-1/2" />
      </div>
    </div>
  );
}

export function SongRowSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex items-center justify-between px-1">
        <div className="h-5 bg-card-hover rounded-md w-16" />
        <div className="h-3 bg-card-hover rounded-md w-14" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <SongCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SongsSectionSkeleton() {
  return (
    <div className="space-y-8 py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SongRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full min-h-[340px] md:h-[360px] rounded-2xl md:rounded-3xl overflow-hidden bg-card border border-line shadow-2xl flex items-center p-6 md:p-10 animate-pulse">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full">
        <div className="w-36 h-36 md:w-56 md:h-56 rounded-2xl bg-card-hover shrink-0" />
        <div className="flex-1 space-y-4 w-full">
          <div className="h-5 bg-card-hover rounded-full w-48" />
          <div className="h-8 md:h-12 bg-card-hover rounded-xl w-3/4" />
          <div className="h-4 bg-card-hover rounded-lg w-1/2" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-32 bg-card-hover rounded-full" />
            <div className="h-10 w-32 bg-card-hover rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerseSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-white/[0.04] border border-line p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
      <div className="flex-1 space-y-4 w-full">
        <div className="flex items-center gap-2">
          <div className="h-4 w-28 bg-card-hover rounded-full" />
          <div className="h-px w-8 bg-card-hover" />
          <div className="h-3 w-20 bg-card-hover rounded-md" />
        </div>
        <div className="space-y-3">
          <div className="h-6 md:h-8 bg-card-hover rounded-lg w-full" />
          <div className="h-6 md:h-8 bg-card-hover rounded-lg w-4/5" />
          <div className="h-4 bg-card-hover rounded-md w-2/3" />
        </div>
      </div>
      <div className="w-full md:w-32 flex flex-col items-end gap-3 shrink-0">
        <div className="h-8 w-24 bg-card-hover rounded-full" />
        <div className="h-4 w-20 bg-card-hover rounded-md mt-auto" />
      </div>
    </div>
  );
}

export function SongPageSkeleton() {
  return (
    <div className="min-h-screen bg-canvas p-6 md:p-12 space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-card-hover shrink-0" />
        <div className="space-y-4 flex-1 w-full">
          <div className="h-4 bg-card-hover rounded-full w-24" />
          <div className="h-10 md:h-14 bg-card-hover rounded-xl w-3/4" />
          <div className="h-5 bg-card-hover rounded-lg w-1/3" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-36 bg-card-hover rounded-full" />
            <div className="h-12 w-12 bg-card-hover rounded-full" />
          </div>
        </div>
      </div>
      <div className="space-y-4 max-w-2xl mx-auto pt-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-5 bg-card-hover rounded-md w-full" style={{ width: `${60 + (i % 4) * 10}%` }} />
        ))}
      </div>
    </div>
  );
}

export function CategoryDetailsSkeleton({ language = "telugu" }) {
  const loadingLabels = {
    telugu: "కేటగిరీ పాటలు లోడ్ అవుతున్నాయి...",
    english: "Loading category songs...",
    hindi: "कैटेगरी के गाने लोड हो रहे हैं...",
    tamil: "வகைப் பாடல்கள் ஏற்றப்படுகின்றன...",
  };
  const label = loadingLabels[language] || loadingLabels.english;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-200">
      <Spiral className="w-12 h-12 text-[#D4A32A]" dots={10} radius={34} />
      <p className="text-xs md:text-sm font-bold text-title tracking-tight font-telugu">{label}</p>
    </div>
  );
}

export function LyricsSkeleton({ language = "telugu" }) {
  const loadingLabels = {
    telugu: "తెలుగు లిరిక్స్ లోడ్ అవుతున్నాయి...",
    english: "Loading lyrics...",
    hindi: "हिन्दी लिरिक्स लोड हो रहे हैं...",
    tamil: "பாடல் வரிகள் ஏற்றப்படுகின்றன...",
  };
  const label = loadingLabels[language] || loadingLabels.english;

  return (
    <div className="w-full text-center space-y-4 animate-in fade-in duration-200 py-16 flex flex-col items-center justify-center">
      <Spiral className="w-12 h-12 text-[#D4A32A]" dots={10} radius={34} />
      <p className="text-xs md:text-sm font-bold text-title tracking-tight font-telugu">{label}</p>
    </div>
  );
}

export function FullAppSkeleton() {
  return (
    <div className="flex-1 bg-canvas p-6 space-y-8 animate-pulse">
      <HeroCarouselSkeleton />
      <VerseSkeleton />
      <SongsSectionSkeleton />
    </div>
  );
}
