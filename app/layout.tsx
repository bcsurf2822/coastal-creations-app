import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/layout/nav/NavBar";
import Footer from "@/components/layout/footer/Footer";
import AnalyticsEvents from "@/components/AnalyticsEvents";
import { GA_TRACKING_ID } from "@/lib/gtag";
import "./globals.css";
// import Image from "next/image";
// import AuthProvider from "../components/providers/AuthProvider";

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
        <Suspense fallback={null}>
          <AnalyticsEvents />
        </Suspense>
        {/* <AuthProvider> */}
        <NavBar />
        <div className="relative">
          {/* Background image */}
          {/* <Image
            src="/assets/backgrounds/spatterBg.png"
            alt="Splatter background"
            fill
            className="object-cover z-0"
            priority
          /> */}

          {/* Optional gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#87d8d8] to-[#dfdfdf]  z-10"></div>

          {/* Content */}
          <div className="relative z-20">{children}</div>
        </div>
        <Footer />
        {/* </AuthProvider> */}

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
