import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { AppFooter } from "@/components/layout/app-footer";
import { AppNavbar } from "@/components/layout/app-navbar";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GeoMatchX",
  description: "Discover and manage skilled worker networks across emerging markets.",
  metadataBase: new URL("https://geomatchx.local"),
  openGraph: {
    title: "GeoMatchX",
    description: "Smart matching between SMEs and skilled operators.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoMatchX",
    description: "Smart matching between SMEs and skilled operators.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} grid-overlay antialiased`}>
        <AppNavbar />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        <AppFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
