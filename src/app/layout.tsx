import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Foundation of Change | Online Community Service Programs",
    template: "%s | The Foundation of Change",
  },
  description:
    "The Foundation of Change is a 501(c)(3) nonprofit providing court recognized community service hours online. Complete self-paced tasks from home, earn a certificate of completion, and meet court, school, or probation requirements.",
  keywords: [
    "community service",
    "online community service",
    "court-approved",
    "community service hours",
    "probation",
    "nonprofit",
    "certificate",
    "501(c)(3)",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "The Foundation of Change",
    title: "The Foundation of Change | Online Community Service Programs",
    description:
      "Complete your court-approved community service online. Earn verified community service hours from home — accepted by courts, probation, and schools nationwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
