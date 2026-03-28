import type { Metadata } from "next";
import { Baloo_2 } from 'next/font/google'
import "./globals.css";

const latin = Baloo_2({ weight: ["400"], subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Hunt Stats Frame v1",
  description: "Check your HUNT STATS by @tieubochet.eth",
  other: {
    "name": "talentapp:project_verification",
    "content": "b70c8833bbf0f77768198ee82925ee16a05a8b87eb5a34dd3d19d129f7f73c7327123836617fefcd7c04d96933d76707431f8f0651e20ba62a8aee8b9cd64d9a"
  }
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
