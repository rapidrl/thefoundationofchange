import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TimezoneDetector from "@/components/TimezoneDetector";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const GA_ADS_ID = "AW-17595795029";
const GA4_MEASUREMENT_ID = "G-ER8YE9QEM6";

export const metadata: Metadata = {
  metadataBase: new URL('https://thefoundationofchange.org'),
  title: {
    default: "The Foundation of Change | Court-Approved Online Community Service",
    template: "%s | The Foundation of Change",
  },
  description:
    "Complete court-approved community service hours 100% online. 501(c)(3) nonprofit accepted by courts, probation, and schools in all 50 states. Self-paced coursework, verified certificates, and instant enrollment from $28.99.",
  keywords: [
    "online community service",
    "court-approved community service",
    "community service hours online",
    "court-ordered community service",
    "probation community service",
    "community service certificate",
    "501(c)(3) nonprofit",
    "volunteer hours online",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "The Foundation of Change",
    title: "Court-Approved Online Community Service | The Foundation of Change",
    description:
      "Complete your court-approved community service 100% online. Verified by a 501(c)(3) nonprofit — accepted by courts, probation, and schools in all 50 states.",
    images: [{ url: '/logo.png', width: 600, height: 600, alt: 'The Foundation of Change Logo' }],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google Ads Conversion Tracking (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-gtag-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_MEASUREMENT_ID}');
            gtag('config', '${GA_ADS_ID}');
          `}
        </Script>
      </head>
      <body>
        <TimezoneDetector />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
