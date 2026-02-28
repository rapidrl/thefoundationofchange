import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
const GTM_ID = "GTM-KT5G8Z3W";

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
  twitter: {
    card: 'summary_large_image',
    title: 'Court-Approved Online Community Service | The Foundation of Change',
    description: 'Complete court-approved community service hours 100% online. 501(c)(3) nonprofit accepted in all 50 states.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://thefoundationofchange.org',
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        {/* gtag.js for GA4 + Google Ads */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_MEASUREMENT_ID}');
              gtag('config', '${GA_ADS_ID}');
            `,
          }}
        />
      </head>
      <body>
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <TimezoneDetector />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

