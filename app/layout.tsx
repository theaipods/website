import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import "./product.css";
import "./product-menu.css";
import "./solutions.css";
import "./docs.css";
import "./onboarding-studio.css";
import "./orchestrator-flow.css";
import "./brand-theme.css";
import "./site-chrome.css";
import { PlatformProvider } from "@/components/platform-context";
import { SiteChrome } from "@/components/SiteChrome";
import { siteBrand } from "@/lib/site-brand";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${siteBrand.name} — Build your AI workforce`,
  description:
    "Create teams of specialised AI employees that plan, collaborate, execute and deliver real business work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" />
      </head>
      <body className="min-h-full flex flex-col">
        <PlatformProvider><SiteChrome>{children}</SiteChrome></PlatformProvider>
      </body>
    </html>
  );
}
