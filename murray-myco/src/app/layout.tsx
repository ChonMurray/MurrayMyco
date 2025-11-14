import type { Metadata, Viewport } from "next";
import { Inter, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import PageTransition from "./PageTransition";
import BackgroundToggle from "@/components/mycelium/BackgroundToggle";
import Navbar from "@/components/layout/Navbar";
import { env } from "@/lib/env";
// NOTE: Ensure no client-only hooks (e.g., usePathname) are imported in this server layout

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: "Biomimetic mycelium-inspired experience",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f9' },
    { media: '(prefers-color-scheme: dark)', color: '#16161d' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Client hook inside server layout is unsafe; so delegate to a client wrapper
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceSans.variable} antialiased bg-background text-foreground`}>
        <Providers>
          <Navbar />
          <BackgroundToggle />
          <main className="min-h-screen pt-16 text-white">
            <PageTransition>{children}</PageTransition>
          </main>
        </Providers>
      </body>
    </html>
  );
}
