import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

// Font configuration
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Metadata
export const metadata: Metadata = {
  title: {
    default: "AI LinkedIn Post Generator",
    template: "%s | AI LinkedIn Post Generator",
  },
  description:
    "Generate polished, LinkedIn-ready posts from any topic using AI. Multiple tones, personas, hashtags, and CTAs supported. Built with Next.js + OpenAI.",
  keywords: [
    "AI",
    "LinkedIn Post Generator",
    "Next.js",
    "OpenAI",
    "Vercel",
    "Content Automation",
  ],
  authors: [{ name: "Ashutosh", url: "https://github.com/ashutosh" }],
  creator: "Ashutosh",
  metadataBase: new URL("https://postgen.ashutosh.dev"),
  openGraph: {
    title: "AI LinkedIn Post Generator",
    description:
      "Turn topics into multiple LinkedIn post drafts in seconds. Powered by AI, designed for creators.",
    url: "https://postgen.ashutosh.dev",
    siteName: "PostGen",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI LinkedIn Post Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI LinkedIn Post Generator",
    description:
      "Turn topics into multiple LinkedIn-ready post drafts in seconds.",
    images: ["/og-image.png"],
    creator: "@yourhandle",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      dir='ltr'
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className='flex flex-col min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100 transition-colors'>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          {/* Sticky Navbar */}
          <Navbar />

          {/* Main content -> padding top equal to navbar height */}
          <main className='flex-1 container mx-auto px-4 py-8 pt-20'>
            {children}
          </main>
          <Toaster />
          {/* Footer always bottom */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
