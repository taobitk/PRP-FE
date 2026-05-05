import type { Metadata } from "next";
import { QueryProvider } from "@/shared/lib/queryProvider";
import { Toaster } from "@/components/ui/sonner";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoPRP Frontend",
  description: "PRP ERP Frontend",
};

import { ProfileSynchronizer } from "@/shared/lib/ProfileSynchronizer";
import { Navbar } from "@/widgets/app-nav/ui/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/50 font-sans">
        <QueryProvider>
          <ProfileSynchronizer />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
