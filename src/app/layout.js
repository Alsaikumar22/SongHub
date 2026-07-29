import { Geist, Geist_Mono, Lato, NTR } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/audio-context";
import { SearchProvider } from "@/context/search-context";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import AppLayout from "@/components/layout/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"],
});

const ntr = NTR({
  variable: "--font-ntr",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "youworship",
  description:
    "A sleek and clean minimalist music player built with Next.js and TailwindCSS",
  icons: {
    icon: "/youlogo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${ntr.variable} h-full antialiased`}
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
