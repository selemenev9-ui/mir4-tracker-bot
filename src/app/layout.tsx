import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "MIR4 Boss Tracker",
  description:
    "Real-time boss spawn tracker for MIR4 guilds — Secret Peak, Mirage, and World Bosses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="bg-orb bg-orb-purple" aria-hidden="true" />
        <div className="bg-orb bg-orb-cyan" aria-hidden="true" />
        <div className="bg-orb bg-orb-red" aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-full">{children}</div>
      </body>
    </html>
  );
}
