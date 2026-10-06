import Link from "next/link";
import { site } from "@/data/site";
import { LineButton, LineIcon, Wordmark } from "./ui";

export function Header({ locale = "ja" }: { locale?: "ja" | "en" }) {
  const ja = locale === "ja";
  const nav = ja
    ? [
        ["#event", "イベント"],
        ["#for-you", "できること"],
        ["#story", "つくった理由"],
        ["#faq", "よくある質問"],
      ]
    : [
        ["#event", "Next event"],
        ["#join", "How to join"],
      ];
  return (
    <header className="sticky top-0 z-40 border-b border-rule/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href={ja ? "/" : "/en"} aria-label="WAHONNECT">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold md:flex" aria-label={ja ? "メイン" : "Main"}>
          {nav.map(([href, label]) => (
            <a key={href} href={href} className="hover:underline hover:underline-offset-8">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={ja ? "/en" : "/"}
            lang={ja ? "en" : "ja"}
            className="rounded-full border border-rule px-3.5 py-2 text-xs font-bold leading-none"
          >
            {ja ? "English" : "日本語"}
          </Link>
          {ja ? (
            <span className="hidden sm:block">
              <LineButton className="!px-5 !py-3 !text-sm !shadow-none">LINEで参加</LineButton>
            </span>
          ) : (
            <a
              href={site.meetup}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-signal px-5 py-3 text-sm font-bold leading-none sm:inline-flex"
            >
              Join on Meetup
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer({ locale = "ja" }: { locale?: "ja" | "en" }) {
  const ja = locale === "ja";
  const links = [
    [site.line, ja ? "公式LINE" : "LINE (Japanese)"],
    [site.meetup, "Meetup"],
    [site.instagram, `Instagram ${site.instagramHandle}`],
  ];
  return (
    <footer className="bg-ink pb-28 pt-12 text-white md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 text-sm text-white/70">
            {ja ? "社会人のためのワーホリ・留学コミュニティ" : "A community for working adults going abroad — and coming home."}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-7 gap-y-2 text-sm font-bold">
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-5 text-xs text-white/50">© 2026 WAHONNECT. All rights reserved.</p>
    </footer>
  );
}

/* スマホでは常に画面下に参加導線を出す */
export function MobileBar({ locale = "ja", eventUrl, hasEvent = false }: { locale?: "ja" | "en"; eventUrl: string; hasEvent?: boolean }) {
  const ja = locale === "ja";
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-rule bg-white/95 p-3 backdrop-blur md:hidden">
      {ja && (
        <a
          href={site.line}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-line py-3.5 text-sm font-bold leading-none text-white"
        >
          <LineIcon className="h-4 w-4" />
          LINEで参加（無料）
        </a>
      )}
      <a
        href={eventUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center rounded-full bg-signal py-3.5 text-sm font-bold leading-none text-ink"
      >
        {ja ? (hasEvent ? "イベントを予約" : "Meetupを見る") : hasEvent ? "RSVP on Meetup" : "Join on Meetup"}
      </a>
    </div>
  );
}
