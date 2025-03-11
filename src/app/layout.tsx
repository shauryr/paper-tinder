import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ScholarTinderProvider } from "@/lib/state";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scholar Tinder - Discover Relevant Research Papers",
  description: "A Tinder-like interface for discovering research papers that match your academic interests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ScholarTinderProvider>
          {children}
          <Toaster position="top-center" />
        </ScholarTinderProvider>
      </body>
    </html>
  );
}
