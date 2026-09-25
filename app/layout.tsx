import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nabda",
  description: "Nabda",
  applicationName: "Nabda",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Nabda",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#fcf8fb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}
