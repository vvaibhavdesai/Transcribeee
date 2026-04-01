import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TranscribeIQ — Audio Intelligence by Cohere",
  description:
    "Transcribe and analyze audio using Cohere Transcribe (ASR) and Command A. Extract summaries, action items, topics, and sentiment from any audio file in 14 languages.",
  openGraph: {
    title: "TranscribeIQ",
    description: "Audio intelligence powered by Cohere Transcribe + Command A",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}