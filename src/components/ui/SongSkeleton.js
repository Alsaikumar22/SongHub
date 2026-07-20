export function SongCardSkeleton() {
  return (
    <div className="group relative w-[172px] shrink-0 animate-pulse" role="status" aria-label="Loading song">
      <div className="relative aspect-square w-full rounded-xl bg-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02]" />
      </div>
      <div className="mt-2.5 space-y-1.5 px-0.5">
        <div className="h-3.5 bg-white/8 rounded-md w-3/4" />
        <div className="h-3 bg-white/5 rounded-md w-1/2" />
      </div>
    </div>
  );
}

export function SongRowSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="h-5 bg-white/8 rounded-md w-16" />
        <div className="h-3 bg-white/5 rounded-md w-14" />
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
      {Array.from({ length: 5 }).map((_, i) => (
        <SongRowSkeleton key={i} />
      ))}
    </div>
  );
}
