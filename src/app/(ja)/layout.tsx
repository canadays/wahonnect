import type { Metadata, Viewport } from "next";
import "@fontsource/shippori-mincho/600.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "../globals.css";
import { site } from "@/data/site";

const title = "WAHONNECT | 社会人のためのワーホリ・留学コミュニティ";
const description =
  "ワーホリ・海外留学を目指す社会人と、経験した先輩をつなぐコミュニティ。大阪での日本語×英語の言語交換、交流会、オンライン相談会を開催。参加無料、LINEから参加できます。";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  alternates: { canonical: "/", languages: { ja: "/", en: "/en" } },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: site.name,
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "WAHONNECT その一歩を、ひとりにしない。" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export const viewport: Viewport = { themeColor: "#0f1b40" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
