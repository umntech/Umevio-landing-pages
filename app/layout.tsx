import type { Metadata } from "next";
import { Outfit, DM_Serif_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { client } from "@/lib/client.config";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dmserif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Umevio",
  description: "Performance marketing studio — Meta & Google Ads, AI creative, and landing pages. Founder-led.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSerif.variable}`}>
      <head>
        {/* Meta Domain Verification — TODO: add Umevio's own verification code from Meta Business */}
        {/* Preconnect — reduces critical-path latency for 3rd-party origins */}
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="" />
      </head>
      <body className="font-outfit bg-proCream antialiased">
        {children}
        {/* Google Analytics 4 — deferred, does not block render */}
        <Script id="ga4-js" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${client.tracking.ga4Id}`} />
        <Script id="ga4-config" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${client.tracking.ga4Id}');`}</Script>
        {/* GTM intentionally omitted — Umevio has no GTM container yet (client.tracking.gtmId is blank).
            When a container is created, re-add the GTM <Script> + noscript <iframe> here. */}
        {/* Meta Pixel stub — afterInteractive ensures fbq() exists before any button click */}
        <Script id="meta-pixel-stub" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${client.tracking.pixelId}');fbq('track','PageView');`}</Script>
        {/* fbevents.js — still lazy-loaded to keep TBT low; queued calls above drain on load */}
        <Script id="meta-pixel-sdk" strategy="lazyOnload" src="https://connect.facebook.net/en_US/fbevents.js" />
        <noscript>
          <img height="1" width="1" style={{display:"none"}}
            src={`https://www.facebook.com/tr?id=${client.tracking.pixelId}&ev=PageView&noscript=1`}
          />
        </noscript>
      </body>
    </html>
  );
}
