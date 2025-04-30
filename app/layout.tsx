// app/layout.js

import type { Metadata } from "next";
import Script from "next/script"; // <-- Import Script
import { Suspense } from "react"; // <-- Import Suspense
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/layout/nav/NavBar";
import Footer from "@/components/layout/footer/Footer";
import AnalyticsEvents from "@/components/AnalyticsEvents"; // <-- Import the client component
import { GA_TRACKING_ID } from "@/lib/gtag"; // <-- Import your tracking ID
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
  title: "Coastal Creation Studios, OC",
  description: "Coastal Creation Studio, Ocean City, NJ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Suspense is needed because AnalyticsEvents uses useSearchParams */}
        <Suspense fallback={null}>
          <AnalyticsEvents />
        </Suspense>

        <NavBar />
        {children}
        <Footer />

        {/* --- Google Analytics Scripts Start --- */}
        {/* Only add scripts if GA_TRACKING_ID is available */}
        {GA_TRACKING_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname, // Initial page load path
                  });
                `,
              }}
            />
          </>
        )}
        {/* --- Google Analytics Scripts End --- */}
      </body>
    </html>
  );
}
