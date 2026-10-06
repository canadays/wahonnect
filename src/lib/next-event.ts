import { cacheLife, cacheTag } from "next/cache";
import { site } from "@/data/site";

/*
 * イベントはMeetupの公開カレンダー（iCal）から読み込みます。
 * Meetupでイベントを作成・編集・中止すると、1時間以内にサイトへ反映されます。
 * 読み込めないときやイベントが無いときは「決まり次第お知らせ」の表示になります。
 */

export type EventItem = {
  title: string;
  start: string; // ISO 8601 (UTC)
  end: string;
  venue: string | null;
  description: string;
  url: string;
};

const unescape = (v: string) =>
  v.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1").trim();

// 「TZID付きの現地時刻」や「Z付きUTC」をUTCのDateにする
function toDate(value: string, tzid?: string): Date | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [y, mo, d, h, mi, s] = [m[1], m[2], m[3], m[4] ?? "0", m[5] ?? "0", m[6] ?? "0"].map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  if (m[7] || !tzid) return new Date(guess);
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tzid,
      hourCycle: "h23",
      year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",
    }).formatToParts(new Date(guess));
    const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
    const asIfUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
    return new Date(guess - (asIfUtc - guess));
  } catch {
    return new Date(guess);
  }
}

export function parseIcal(text: string): EventItem[] {
  const lines = text.replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const events: EventItem[] = [];
  let cur: Record<string, { value: string; tzid?: string }> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT") {
      if (cur) {
        const start = cur.DTSTART && toDate(cur.DTSTART.value, cur.DTSTART.tzid);
        const end = (cur.DTEND && toDate(cur.DTEND.value, cur.DTEND.tzid)) || start;
        const url = cur.URL?.value ?? "";
        const cancelled = cur.STATUS?.value.toUpperCase() === "CANCELLED";
        if (start && end && cur.SUMMARY && !cancelled) {
          events.push({
            title: unescape(cur.SUMMARY.value),
            start: start.toISOString(),
            end: end.toISOString(),
            venue: cur.LOCATION ? unescape(cur.LOCATION.value) || null : null,
            description: unescape(cur.DESCRIPTION?.value ?? ""),
            url: url.startsWith("https://www.meetup.com/") ? url : site.meetup,
          });
        }
      }
      cur = null;
    } else if (cur) {
      const i = line.indexOf(":");
      if (i < 0) continue;
      const [name, ...params] = line.slice(0, i).split(";");
      const tzid = params.find((p) => p.toUpperCase().startsWith("TZID="))?.slice(5);
      cur[name.toUpperCase()] = { value: line.slice(i + 1), tzid };
    }
  }
  return events;
}

// これから開催されるイベント（近い順）
export async function getUpcomingEvents(): Promise<EventItem[]> {
  "use cache";
  cacheTag("events");
  cacheLife("hours");
  try {
    const res = await fetch(process.env.MEETUP_ICAL_URL ?? site.meetupIcal, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WAHONNECT-site)", Accept: "text/calendar,*/*" },
    });
    if (!res.ok) throw new Error(`Meetup ${res.status}`);
    const now = Date.now();
    return parseIcal(await res.text())
      .filter((e) => new Date(e.end).getTime() > now)
      .sort((a, b) => a.start.localeCompare(b.start));
  } catch (e) {
    console.error("Meetupのイベントを読み込めませんでした:", e);
    return [];
  }
}

const JST = "Asia/Tokyo";

export function formatEvent(e: EventItem, locale: "ja" | "en") {
  const start = new Date(e.start);
  const end = new Date(e.end);
  const time = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: JST, hour: "2-digit", minute: "2-digit" }).format(d);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: JST, month: "numeric", day: "numeric" }).formatToParts(start);
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  const weekday = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    timeZone: JST,
    weekday: locale === "ja" ? "short" : "long",
  }).format(start);
  const monthName = new Intl.DateTimeFormat("en-US", { timeZone: JST, month: "long" }).format(start);
  return {
    md: `${month}.${day}`,
    weekday,
    time: `${time(start)}–${time(end)}`,
    longJa: `${month}月${day}日（${weekday}）`,
    longEn: `${weekday}, ${monthName} ${day}`,
  };
}
