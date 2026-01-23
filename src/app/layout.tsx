import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
  ssr: false,
});

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
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
