import type { Metadata, Viewport } from "next";
import "@fontsource/shippori-mincho/600.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "../../globals.css";
import { site } from "@/data/site";

const title = "WAHONNECT | Japanese × English Language Exchange in Osaka";
const description =
  "Meet Japanese people, practice Japanese and English, and make friends beyond the language barrier. A casual language exchange in Osaka for working adults. All levels welcome.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  alternates: { canonical: "/en", languages: { ja: "/", en: "/en" } },
  openGraph: {
    title,
    description,
    url: "/en",
    siteName: site.name,
    locale: "en_US",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "WAHONNECT" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export const viewport: Viewport = { themeColor: "#0f1b40" };

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="!leading-[1.7] [font-feature-settings:normal]">{children}</body>
    </html>
  );
}
