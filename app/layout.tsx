import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { ApiKeyProvider } from "@/src/context/ApiKeyContext";
import { config } from "@/src/config";

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

// Metadata from centralized config
export const metadata: Metadata = {
  title: config.seo.title,
  description: config.seo.description,
  keywords: config.seo.keywords,
  authors: [{ name: config.seo.author.name, url: config.seo.author.url }],
  creator: config.seo.author.name,
  metadataBase: new URL(config.seo.url),
  openGraph: {
    title: config.seo.title.default,
    description: config.seo.description,
    url: config.seo.url,
    siteName: config.ui.brand.name,
    images: [
      {
        url: config.seo.ogImage,
        width: 1200,
        height: 630,
        alt: config.seo.title.default,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: config.seo.title.default,
    description: config.seo.description,
    images: [config.seo.ogImage],
    creator: config.seo.author.twitter,
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
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
          <ApiKeyProvider>
            {/* Sticky Navbar */}
            <Navbar />

            {/* Main content */}
            <main className='flex-1 container mx-auto px-4 py-4 pt-20'>
              {children}
            </main>
            <Toaster />
            {/* Footer */}
            <Footer />
          </ApiKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
