import { site } from "@/data/site";
import { getUpcomingEvents, formatEvent } from "@/lib/next-event";
import { EventDetails } from "@/components/EventDetails";
import { BoardingPass } from "@/components/BoardingPass";
import { Header, Footer, MobileBar } from "@/components/Chrome";
import { GhostButton, SignalButton } from "@/components/ui";

const reasons = [
  ["Make Japanese friends", "Most of our members are Japanese working adults who want to talk with people from other countries."],
  ["Practice Japanese without pressure", "You don't need to be fluent in Japanese or English. Beginners are welcome."],
  ["Nobody is left standing alone", "We prepare conversation topics and split everyone into small groups, so everyone gets a chance to talk."],
  ["Meet people outside of work", "Many people come on their own. Come alone or bring a friend."],
];

const steps = [
  ["RSVP on Meetup", "Join the group, then RSVP once the next date is posted. Seats are limited. No walk-ins."],
  ["Follow us on Instagram", `Following ${site.instagramHandle} is required to attend.`],
  ["Come and talk", "We set the topics and the groups. You bring yourself."],
];

export default async function EnHome() {
  const events = await getUpcomingEvents();
  const event = events[0] ?? null;
  const f = event ? formatEvent(event, "en") : null;

  return (
    <>
      <Header locale="en" />
      <main>
        <section className="overflow-hidden bg-mist">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 md:grid-cols-[1.15fr_0.85fr] md:pb-28 md:pt-20">
            <div>
              <p className="text-sm font-bold text-sub">Japanese × English Language Exchange in Osaka</p>
              <h1 className="mt-5 text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                Make friends beyond the language barrier.
              </h1>
              <p className="mt-7 max-w-xl text-lg text-sub">
                WAHONNECT is a community of Japanese working adults who are heading abroad, or have just come home. We
                want to keep speaking English. You want to speak Japanese. Let&apos;s talk.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <SignalButton href={event?.url ?? site.meetup}>{event ? "RSVP on Meetup" : "Join the group on Meetup"}</SignalButton>
                <GhostButton href={site.instagram}>Follow on Instagram</GhostButton>
              </div>
            </div>
            <div id="event" className="[--tilt:2deg] md:pl-4">
              <BoardingPass event={event} locale="en" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            A casual evening of Japanese and English.
          </h2>
          {event && f && (
            <p className="mt-6 max-w-2xl border-l-4 border-signal pl-5 text-lg font-bold">
              Next: {f.longEn}, {f.time} (Japan time){event.venue ? ` at ${event.venue}` : ""}.
              <br />
              <span className="text-base font-medium text-sub">{event.title}</span>
            </p>
          )}
          {!event && (
            <p className="mt-6 max-w-2xl border-l-4 border-signal pl-5 text-lg font-bold">
              The next date and venue are being arranged. Join the Meetup group and you&apos;ll hear as soon as it&apos;s posted.
            </p>
          )}
          <ul className="mt-12 grid gap-x-16 md:grid-cols-2">
            {reasons.map(([head, body]) => (
              <li key={head} className="border-t border-rule py-6">
                <h3 className="text-xl font-bold">{head}</h3>
                <p className="mt-1.5 text-sub">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="join" className="bg-ink text-white">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">How to join</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map(([head, body], i) => (
                <li key={head}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal font-code text-2xl font-semibold text-ink">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{head}</h3>
                  <p className="mt-1.5 text-white/75">{body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12 flex flex-wrap gap-4">
              <SignalButton href={event?.url ?? site.meetup}>{event ? "RSVP on Meetup" : "Join the group on Meetup"}</SignalButton>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border-2 border-white px-6 py-3.5 text-[15px] font-bold leading-none"
              >
                Follow {site.instagramHandle}
              </a>
            </div>
            <div className="max-w-2xl">
              <EventDetails events={events} locale="en" />
            </div>
            <p className="mt-8 text-sm text-white/60">Some events may have a participation fee. Check the Meetup page for details.</p>
          </div>
        </section>
      </main>
      <Footer locale="en" />
      <MobileBar locale="en" eventUrl={event?.url ?? site.meetup} hasEvent={!!event} />
    </>
  );
}
