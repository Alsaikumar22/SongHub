import React from "react";
import { Spiral } from "@/components/ui/Spiral";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas text-center select-none animate-in fade-in duration-200">
      <Spiral className="w-12 h-12 text-[#D4A32A]" dots={10} radius={34} />
      <p className="text-xs text-muted/80 font-bold tracking-wider uppercase mt-4">
        Loading...
      </p>
    </div>
  );
}
