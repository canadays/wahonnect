import { site } from "@/data/site";
import { formatEvent, type EventItem } from "@/lib/next-event";

const t = {
  ja: {
    kind: "次回のイベント",
    date: "日付",
    time: "時間",
    place: "場所",
    fee: "参加費",
    seats: "定員",
    seatsUnit: "名",
    reserve: "Meetupで席を予約する",
    note: "予約にはMeetupでの登録とInstagramのフォローが必要です",
    emptyBadge: "言語交換イベント",
    lang: "言語",
    langV: "日本語 × 英語",
    level: "レベル",
    levelV: "問いません",
    solo: "一人参加",
    soloV: "歓迎",
    when: "日程・会場",
    whenV: "決まり次第お知らせ",
    emptyCta: "Meetupで開催の通知を受け取る",
    emptyNote: "Meetupのグループに参加すると、日程の公開時に通知が届きます",
  },
  en: {
    kind: "Next event",
    date: "Date",
    time: "Time",
    place: "Place",
    fee: "Fee",
    seats: "Seats",
    seatsUnit: "",
    reserve: "RSVP on Meetup",
    note: "RSVP on Meetup and follow us on Instagram to attend",
    emptyBadge: "Language exchange",
    lang: "Languages",
    langV: "Japanese × English",
    level: "Level",
    levelV: "All levels",
    solo: "Coming alone",
    soloV: "Welcome",
    when: "Date & venue",
    whenV: "To be announced",
    emptyCta: "Get notified on Meetup",
    emptyNote: "Join the Meetup group to hear when the next date is posted",
  },
};

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-[11px] font-bold text-sub">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-bold leading-snug">{children}</dd>
    </div>
  );
}

export function BoardingPass({
  event,
  locale = "ja",
  notchColor = "bg-mist",
}: {
  event: EventItem | null;
  locale?: "ja" | "en";
  notchColor?: string;
}) {
  const l = t[locale];
  const f = event ? formatEvent(event, locale) : null;

  return (
    <article
      className="pass-issue relative mx-auto w-full max-w-[420px] rounded-3xl bg-white text-ink shadow-[0_30px_60px_-20px_rgba(15,27,64,0.45)]"
      aria-label={l.kind}
    >
      <header className="flex items-center justify-between rounded-t-3xl bg-ink px-6 py-3.5 text-white">
        <span className="font-code text-lg font-semibold tracking-[0.08em]">
          WAHONNECT<span className="text-signal">.</span>
        </span>
        <span className="rounded-full bg-signal px-3 py-1 text-xs font-bold text-ink">{event ? l.kind : l.emptyBadge}</span>
      </header>

      {event && f ? (
        <>
          <div className="px-6 pb-6 pt-5">
            <div className="flex items-end gap-3">
              <p className="font-code text-[76px] font-semibold leading-[0.85] tracking-tight">{f.md}</p>
              <p className="pb-1 text-sm font-bold leading-tight">
                {locale === "ja" ? `${f.weekday}曜日` : f.weekday}
                <br />
                <span className="font-code text-xl font-semibold">{f.time}</span>
              </p>
            </div>
            <h3 className="mt-4 text-lg font-bold leading-snug">
              {event.title}
            </h3>
            {event.venue && (
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-rule pt-4">
                <Field label={l.place} wide>{event.venue}</Field>
              </dl>
            )}
          </div>

          <div className="relative border-t-2 border-dashed border-rule px-6 pb-6 pt-5">
            <span className={`absolute -left-3 -top-3 h-6 w-6 rounded-full ${notchColor}`} aria-hidden="true" />
            <span className={`absolute -right-3 -top-3 h-6 w-6 rounded-full ${notchColor}`} aria-hidden="true" />
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-full bg-signal px-6 py-4 text-base font-bold leading-none text-ink shadow-[0_6px_0_#c99700] transition-transform hover:-translate-y-0.5"
            >
              {l.reserve}
            </a>
            <p className="mt-4 text-center text-xs leading-relaxed text-sub">{l.note}</p>
            <div className="barcode mt-4 h-8 w-full text-ink/80" aria-hidden="true" />
          </div>
        </>
      ) : (
        <>
          <div className="px-6 pb-6 pt-6">
            <p className="font-code text-[52px] font-semibold leading-[0.95] tracking-tight">
              Language
              <br />
              Exchange
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-rule pt-4">
              <Field label={l.lang} wide>{l.langV}</Field>
              <Field label={l.level}>{l.levelV}</Field>
              <Field label={l.solo}>{l.soloV}</Field>
              <Field label={l.when} wide>{l.whenV}</Field>
            </dl>
          </div>
          <div className="relative border-t-2 border-dashed border-rule px-6 pb-6 pt-5">
            <span className={`absolute -left-3 -top-3 h-6 w-6 rounded-full ${notchColor}`} aria-hidden="true" />
            <span className={`absolute -right-3 -top-3 h-6 w-6 rounded-full ${notchColor}`} aria-hidden="true" />
            <a
              href={site.meetup}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-full bg-signal px-6 py-4 text-base font-bold leading-none text-ink shadow-[0_6px_0_#c99700] transition-transform hover:-translate-y-0.5"
            >
              {l.emptyCta}
            </a>
            <p className="mt-4 text-center text-xs leading-relaxed text-sub">{l.emptyNote}</p>
            <div className="barcode mt-4 h-8 w-full text-ink/80" aria-hidden="true" />
          </div>
        </>
      )}
    </article>
  );
}
