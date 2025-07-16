import type { Metadata } from "next";
import { Inter, Baloo_2 } from 'next/font/google'
import { Rubik_Bubbles } from "next/font/google";
import "./globals.css";

const latin = Baloo_2({ weight: ["400"], subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Hunt Stats Frame v1",
  description: "Check your HUNT STATS by @teeboo.eth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={latin.className}>{children}</body>
    </html>
  );
}
