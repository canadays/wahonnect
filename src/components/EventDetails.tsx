import type { EventItem } from "@/lib/next-event";
import { formatEvent } from "@/lib/next-event";

/* Meetupに書いた説明文と、2件目以降の予定。濃紺の背景の上で使う。 */
export function EventDetails({ events, locale }: { events: EventItem[]; locale: "ja" | "en" }) {
  const [next, ...later] = events;
  if (!next) return null;
  const ja = locale === "ja";
  return (
    <>
      {next.description && (
        <details className="mt-6 rounded-2xl bg-white/10">
          <summary className="flex items-center justify-between gap-4 px-5 py-4 text-sm font-bold">
            {ja ? "イベントの内容を読む（Meetupより）" : "Read the event details (from Meetup)"}
            <span className="faq-mark text-xl font-normal leading-none transition-transform" aria-hidden="true">+</span>
          </summary>
          <p className="max-h-96 overflow-y-auto whitespace-pre-line break-words px-5 pb-5 text-sm leading-relaxed text-white/85">
            {next.description}
          </p>
        </details>
      )}
      {later.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold">{ja ? "その後の予定" : "Later dates"}</h3>
          <ul className="mt-3 divide-y divide-white/15 border-y border-white/15">
            {later.slice(0, 5).map((e) => {
              const f = formatEvent(e, locale);
              return (
                <li key={e.url + e.start}>
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex gap-4 py-4 hover:underline hover:underline-offset-4">
                    <span className="w-36 shrink-0 font-bold">{ja ? f.longJa : f.longEn.split(", ")[1]}</span>
                    <span className="text-white/80">{e.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
