import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import {
  Geist,
  Geist_Mono,
  Anton,
  Abril_Fatface,
  EB_Garamond,
} from "next/font/google";
import NavBar from "@/components/layout/nav/NavBar";
import Footer from "@/components/layout/footer/Footer";
import AnalyticsEvents from "@/components/AnalyticsEvents";
import { GA_TRACKING_ID } from "@/lib/gtag";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const abrilFatface = Abril_Fatface({
  variable: "--font-abril-fatface",
  subsets: ["latin"],
  weight: "400",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Coastal Creations Studios",
  description: "Coastal Creations Studio, Ocean City, NJ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ebGaramond.variable} ${geistSans.variable} ${geistMono.variable} ${anton.variable} ${abrilFatface.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <AnalyticsEvents />
        </Suspense>
        {/* <AuthProvider> */}
        <NavBar />
        <div className="relative pt-32 md:pt-56">
          <div className="absolute inset-0 bg-gradient-to-r from-[#b6dce6] via-[#BEDCDC] to-[#daebeb]  z-10"></div>

          <div className="relative z-20">{children}</div>
        </div>
        <Footer />
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

        <Analytics />
      </body>
    </html>
  );
}
