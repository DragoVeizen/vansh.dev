import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ModeInitScript } from "@/components/ModeInitScript";
import { TopBar } from "@/components/TopBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vansh-dev-five.vercel.app"),
  title: {
    default: "Vansh Thakur — Full Stack Engineer",
    template: "%s · Vansh Thakur",
  },
  description:
    "Vansh Thakur — Full Stack Engineer at Hudle. Backend-leaning. Payments, search, and platform work.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vansh-dev-five.vercel.app",
    siteName: "vansh.dev",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // Default for no-JS / pre-paint. The init script overrides this
      // synchronously based on URL ?mode=... and localStorage.
      data-mode="recruiter"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ModeInitScript />
      </head>
      <body className="min-h-full bg-bg text-fg">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
