import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bodoni = localFont({
  src: "../public/fonts/bodoni-moda-600.ttf",
  weight: "600",
  style: "normal",
  variable: "--font-azania",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AZANIA — Art, beyond the frame",
  description:
    "A new perspective on Ghanaian art and cultural heritage. Discover AZANIA, a virtual gallery you can step inside.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={bodoni.variable}>
      <body>{children}</body>
    </html>
  );
}
