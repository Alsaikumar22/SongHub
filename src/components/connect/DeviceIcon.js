"use client";

import { Smartphone, Tablet, Laptop, Monitor, Tv, Speaker, Watch, Radio } from "lucide-react";

const ICONS = {
  mobile: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  desktop: Monitor,
  tv: Tv,
  speaker: Speaker,
  watch: Watch,
};

/**
 * Auto-assigned icon per device type (spec):
 * 📱 Mobile · 💻 Laptop · 🖥 Desktop · 📺 Smart TV · 🎵 Smart Speaker · ⌚ Watch · 📟 Tablet
 */
export default function DeviceIcon({ type, className }) {
  const Icon = ICONS[type] || Smartphone;
  return <Icon className={className} />;
}
