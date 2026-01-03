import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import InstallPrompt from "@/components/InstallPrompt";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
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
        suppressHydrationWarning
        className={`${manrope.variable} font-sans antialiased`}
      >
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
