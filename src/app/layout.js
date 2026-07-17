import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "./context/audio-context";
import { SearchProvider } from "./context/search-context";
import { ThemeProvider } from "./context/theme-context";
import { AuthProvider } from "./context/auth-context";
import AppLayout from "./components/layout/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SongHub - Minimalist Music Player",
  description: "A sleek and clean minimalist music player built with Next.js and TailwindCSS",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="text-title font-sans select-none">
        <ThemeProvider>
          <AuthProvider>
            <AudioProvider>
              <SearchProvider>
                <AppLayout>{children}</AppLayout>
              </SearchProvider>
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
