import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { DynamicToaster } from "@/components/DynamicToaster";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Shopry - Launch Your Store",
  description: "The easiest way to start selling online in Ghana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} antialiased font-sans`}
      >
        {children}
        <DynamicToaster />
      </body>
    </html>
  );
}
