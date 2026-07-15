import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "./context/audio-context";
import { SearchProvider } from "./context/search-context";
import Header from "./components/layout/Header";
import PlayerBar from "./components/player-bar";

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
    >
      <body className="text-gray-100 font-sans select-none">
        <AudioProvider>
          <SearchProvider>
            <div className="h-screen flex flex-col">
              <Header />
              <div className="flex flex-1 min-h-0">
                {children}
              </div>
              <PlayerBar />
            </div>
          </SearchProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
