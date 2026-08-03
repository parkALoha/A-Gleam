import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Only the weights actually used in Tailwind classes across the app —
// "300" was never referenced anywhere, just extra font-file weight on
// every page load.
const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

const description =
  "A GLEAM — เสื้อผู้หญิงสไตล์ casual น่ารักทุกวัน ไซส์เดียวใส่ได้ทุกวัน สั่งซื้อออนไลน์ได้เลย";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "A GLEAM | อะ - กลีม",
    template: "%s | A GLEAM",
  },
  description,
  openGraph: {
    title: "A GLEAM | อะ - กลีม",
    description,
    siteName: "A GLEAM | อะ - กลีม",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A GLEAM | อะ - กลีม",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
