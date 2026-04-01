import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Nomadly — Work remotely from anywhere. Built for India.",
    template: "%s | Nomadly",
  },
  description:
    "Everything an Indian developer needs to go remote — visas, costs, jobs, and community. Indian-passport-first. Costs shown in ₹.",
  keywords: [
    "digital nomad India",
    "remote jobs India",
    "visa free countries Indian passport",
    "cost of living abroad India",
    "work remotely from abroad India",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://nomadly.in",
    siteName: "Nomadly",
    title: "Nomadly — Work remotely from anywhere. Built for India.",
    description:
      "Visas, costs, and remote jobs — all calibrated for Indian passport holders.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomadly — Work remotely from anywhere. Built for India.",
    description:
      "Visas, costs, and remote jobs — all calibrated for Indian passport holders.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
