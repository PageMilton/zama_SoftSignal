import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SDKLoader } from "@/components/SDKLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SoftSignal - Privacy-Preserving Mental Health Tracking",
  description: "Track your emotions, stress, and sleep patterns with complete privacy using FHEVM technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <SDKLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
