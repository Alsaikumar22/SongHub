import { Geist, Geist_Mono, Lato, NTR, Playfair_Display, Noto_Serif_Telugu, Noto_Sans_Telugu, Merriweather, Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/audio-context";
import { ConnectProvider } from "@/context/connect-context";
import { SearchProvider } from "@/context/search-context";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import AppLayout from "@/components/layout/AppLayout";
import { GoogleAnalytics } from "@/lib/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

const ntr = NTR({
  variable: "--font-ntr",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const notoSerifTelugu = Noto_Serif_Telugu({
  variable: "--font-noto-serif-telugu",
  subsets: ["telugu"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

const notoSansTelugu = Noto_Sans_Telugu({
  variable: "--font-noto-sans-telugu",
  subsets: ["telugu"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "You Worship — Christian Songs, Lyrics, Audio & Videos",
  description:
    "A Christ-centered worship platform. Telugu & English Christian songs with lyrics, audio and videos.",
  icons: {
    icon: "/youworship-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${ntr.variable} ${playfair.variable} ${notoSerifTelugu.variable} ${notoSansTelugu.variable} ${merriweather.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="text-title font-sans select-none">
        <GoogleAnalytics />
        <ThemeProvider>
          <AuthProvider>
            <AudioProvider>
              <ConnectProvider>
                <SearchProvider>
                  <AppLayout>{children}</AppLayout>
                </SearchProvider>
              </ConnectProvider>
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
