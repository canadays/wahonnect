import { site } from "@/data/site";
import { getPhotos } from "@/lib/photos";
import { Photo } from "@/components/Photo";
import { getUpcomingEvents, formatEvent } from "@/lib/next-event";
import { EventDetails } from "@/components/EventDetails";
import { BoardingPass } from "@/components/BoardingPass";
import { Header, Footer, MobileBar } from "@/components/Chrome";
import { GhostButton, LineButton, SignalButton } from "@/components/ui";

const voices = [
  "海外に行ってみたい。でも、仕事を辞める決心がつかない。",
  "ワーホリの前に、英語を実際に使う練習をしておきたい。",
  "帰国してから、英語を話す機会がなくなってしまった。",
  "あの経験を分かち合える人が、周りにいない。",
];

const facts = [
  ["対象", "社会人（年齢不問）"],
  ["参加費", "参加無料"],
  ["開催", "月2回"],
  ["エリア", "東京・大阪・オンライン"],
];

const forChallengers = [
  ["経験者に、本音で直接聞ける", "ビザ、お金、仕事の辞め方まで。ネットには載っていない、社会人ならではのリアルな話が聞けます。"],
  ["行く前から、仲間ができる", "同じタイミングで挑戦する人と今から繋がれます。現地でもコミュニティが続くから、一人じゃない。"],
  ["決断までの過程を、一緒に考えられる", "仕事、貯金、キャリアの空白。社会人だからこそ悩む部分を、先に経験した人と整理できます。"],
  ["抱えていた不安が、話せる不安になる", "迷っている段階でも大丈夫。経験者や同じ気持ちの仲間と話すのが、いちばんの近道です。"],
];

const forSenpai = [
  ["同じ景色を見た仲間と、また会える", "あの体験を共有できる人と、帰国後も関係が続きます。経験者同士だから話せることがあります。"],
  ["あなたの経験が、誰かの道しるべになる", "リアルな体験談が、次の挑戦者の背中を押します。どんな経験も、誰かの判断材料になります。"],
  ["海外志向の仲間とのつながりが広がる", "同じ経験を持つ仲間に加えて、これから一歩を踏み出す社会人とも出会えます。"],
  ["英語を使い続ける場所がある", "言語交換で、帰国後も英語を話す習慣を。海外で得たものを、持ったまま帰ってこられます。"],
];

const stages = [
  ["行く前", "英語を使う練習と、先輩への相談。決める前の不安を、ここで言葉にする。"],
  ["海外にいる間", "同じ時期に渡航した仲間と、オンラインでつながり続ける。"],
  ["帰ってから", "英語を使う場と、あの経験を話せる仲間。次に行く人へ、経験を手渡す。"],
];

const eventTypes = [
  ["Language Exchange", "日本語と英語を使って話す言語交換。日本に住む外国人と、グループに分かれて交流します。"],
  ["海外挑戦 交流会", "経験者と挑戦中の社会人が集まる交流会。東京・大阪で定期開催。"],
  ["経験者トーク・体験談シェア会", "ワーホリ・留学経験者が、帰国後のキャリアも含めて本音で語ります。質問し放題。"],
  ["オンライン作業会・相談会", "全国どこからでも参加できます。海外志向の仲間と一緒に過ごす時間。"],
];

const faqs = [
  ["誰でも参加できますか？", "社会人限定のコミュニティです（年齢は問いません）。ワーホリ・語学留学・海外留学、どの形での挑戦でも歓迎です。"],
  ["参加は無料ですか？", "コミュニティへの参加は無料です。イベントによって参加費が発生する場合があります。"],
  ["英語に自信がなくても、言語交換に参加できますか？", "参加できます。英語・日本語のレベルは問いません。トークテーマとグループ分けを用意しているので、初めての方や一人参加の方も話しやすい形にしています。"],
  ["まだ行くか迷っている段階でも大丈夫ですか？", "もちろんです。働きながら情報収集したい方、まだ迷っている方も歓迎しています。"],
  ["ワーホリではなく語学留学・海外留学でも参加できますか？", "参加できます。語学留学・大学留学・海外生活など、海外への挑戦であれば何でも対象です。"],
  ["イベントは必ず参加しないといけませんか？", "すべて任意参加です。参加したいイベントだけ選んでください。"],
  ["経験者として参加したいです。", "大歓迎です。経験者同士の交流や、これから行く人へ経験をシェアする場を定期的に作っています。"],
];

function Points({ items }: { items: string[][] }) {
  return (
    <ul className="mt-8 divide-y divide-rule border-y border-rule">
      {items.map(([head, body]) => (
        <li key={head} className="py-5">
          <h4 className="text-[17px] font-bold leading-snug">{head}</h4>
          <p className="mt-1.5 text-[15px] text-sub">{body}</p>
        </li>
      ))}
    </ul>
  );
}

export default async function Home() {
  const events = await getUpcomingEvents();
  const event = events[0] ?? null;
  const photos = await getPhotos();
  const showStoryGuide = process.env.NODE_ENV === "development";
  const f = event ? formatEvent(event, "ja") : null;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.name,
      url: site.url,
      description: "社会人のためのワーホリ・留学コミュニティ",
      sameAs: [site.instagram, site.meetup, site.line],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    ...(event
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Event",
            name: event.title,
            startDate: event.start,
            endDate: event.end,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            ...(event.venue ? { location: { "@type": "Place", name: event.venue } } : {}),
            organizer: { "@type": "Organization", name: site.name, url: site.url },
            url: event.url,
          },
        ]
      : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main>
        {/* ヒーロー */}
        <section className="overflow-hidden bg-mist">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 md:grid-cols-[1.15fr_0.85fr] md:pb-28 md:pt-20">
            <div>
              <p className="text-sm font-bold text-sub">社会人のためのワーホリ・留学コミュニティ</p>
              <h1 className="mt-5 font-display text-[40px] font-semibold leading-[1.3] tracking-[0.02em] sm:text-6xl lg:text-[68px]">
                <span className="whitespace-nowrap">その一歩を、</span>
                <br />
                <span className="whitespace-nowrap">ひとりにしない。</span>
              </h1>
              <p className="mt-7 max-w-xl text-base text-sub md:text-lg">
                ワーホリ・海外留学を目指す社会人と、実際に経験した先輩をつなぐコミュニティです。渡航前の不安も、帰ってきてからの想いも、ここでなら話せます。
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <LineButton>LINEでコミュニティに参加する</LineButton>
                <GhostButton href="#event">言語交換イベントを見る</GhostButton>
              </div>
              <p className="mt-5 text-sm text-sub">参加無料、いつでも退会できます。</p>
            </div>
            <div className="[--tilt:2deg] md:pl-4">
              <BoardingPass event={event} />
            </div>
          </div>
        </section>

        {/* 基本情報 */}
        <section aria-label="コミュニティの基本情報" className="border-b border-rule">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 px-5 md:grid-cols-4">
            {facts.map(([k, v]) => (
              <div key={k} className="border-rule py-6 pr-4 md:border-l md:pl-6 md:first:border-l-0 md:first:pl-0">
                <dt className="text-xs font-bold text-sub">{k}</dt>
                <dd className="mt-1 text-sm font-bold leading-snug md:text-base">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {photos.hero || process.env.NODE_ENV === "development" ? (
          <div className="mx-auto max-w-6xl px-5 pt-12 md:pt-16">
            <Photo
              src={photos.hero}
              alt="WAHONNECTのイベントで話す参加者"
              className="aspect-[16/9] w-full"
              sizes="(min-width: 1152px) 1112px, 100vw"
              guide="管理ページ（/admin）から「トップの写真」を入れると、ここに大きく表示されます"
              priority
            />
          </div>
        ) : null}

        {/* 共感 */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <h2 className="font-display text-3xl font-semibold md:text-5xl">ひとりで、考え込んでいませんか。</h2>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {voices.map((v) => (
              <li key={v} className="border-t border-rule py-6 font-display text-xl font-semibold leading-relaxed [text-wrap:balance] [word-break:auto-phrase] md:text-2xl">
                「{v}」
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-2xl text-base text-sub md:text-lg">
            社会人が海外に挑戦するのは、簡単な決断ではありません。だからこそ、先にその道を歩いた人と、同じ場所に立っている人に、会える場所をつくりました。
          </p>
        </section>

        {/* 言語交換イベント */}
        <section id="event" className="bg-ink text-white">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
            <div>
              <p className="font-code text-xl font-semibold tracking-[0.06em] text-signal">Japanese × English Language Exchange</p>
              <h2 className="mt-4 font-display text-3xl font-semibold md:text-5xl">
                英語は、勉強するより
                <br />
                使うと伸びる。
              </h2>
              <p className="mt-6 max-w-xl text-white/80 md:text-lg">
                英語を話したい日本人と、日本語を話したい外国人が、少人数のグループで話す言語交換です。トークテーマとグループ分けはこちらで用意するので、一人でも、英語に自信がなくても参加できます。
              </p>

              {event && f && (
                <>
                  <p className="mt-8 border-l-4 border-signal pl-5 text-lg font-bold leading-relaxed">
                    次回は{f.longJa} {f.time}
                    {event.venue ? `、会場は${event.venue}` : ""}。
                    <br />
                    <span className="text-base font-medium text-white/80">{event.title}</span>
                  </p>
                  <EventDetails events={events} locale="ja" />
                </>
              )}

              {!event && (
                <p className="mt-8 border-l-4 border-signal pl-5 text-lg font-bold leading-relaxed">
                  次回の日程と会場は調整中です。
                  <br />
                  決まり次第、Meetupと公式LINEでお知らせします。
                </p>
              )}

              <h3 className="mt-12 text-lg font-bold">参加までの流れ</h3>
              <ol className="mt-5 space-y-4">
                {[
                  ["Meetupで参加登録する", "Meetupのイベントページから席を予約します。当日の飛び入り参加はできません。"],
                  ["Instagramをフォローする", `公式アカウント ${site.instagramHandle} のフォローが参加条件です。`],
                  ["当日、会場へ", "トークテーマとグループ分けを用意しています。一人での参加も歓迎です。"],
                ].map(([head, body], i) => (
                  <li key={head} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal font-code text-xl font-semibold text-ink">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold">{head}</p>
                      <p className="text-sm text-white/70">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-10 flex flex-wrap gap-4">
                <SignalButton href={event?.url ?? site.meetup}>
                  {event ? "Meetupで席を予約する" : "Meetupで開催の通知を受け取る"}
                </SignalButton>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white px-6 py-3.5 text-[15px] font-bold leading-none"
                >
                  Instagramをフォローする
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold">ほかにも、こんな場を開いています</h3>
              <ul className="mt-5 divide-y divide-white/15 border-y border-white/15">
                {eventTypes.map(([head, body]) => (
                  <li key={head} className="py-5">
                    <p className="font-bold">{head}</p>
                    <p className="mt-1 text-sm text-white/70">{body}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-white/60">
                イベントはすべて任意参加です。内容によって参加費が発生する場合があります。開催のお知らせは公式LINEで届きます。
              </p>
            </div>
          </div>
        </section>

        {/* イベントの様子：public/photos/gallery/ の画像を自動表示 */}
        {photos.gallery.length > 0 || process.env.NODE_ENV === "development" ? (
          <section className="mx-auto max-w-6xl px-5 pt-20 md:pt-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold md:text-5xl">イベントの様子</h2>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold underline underline-offset-4"
              >
                Instagramでもっと見る
              </a>
            </div>
            {photos.gallery.length > 0 ? (
              <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                {photos.gallery.map((src, i) => (
                  <li key={src} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                    <Photo
                      src={src}
                      alt={`WAHONNECTのイベントの様子 ${i + 1}`}
                      className={i === 0 ? "aspect-square h-full w-full" : "aspect-square w-full"}
                      sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <Photo src={null} alt="" className="mt-8 aspect-[3/1] w-full" guide="管理ページ（/admin）から「イベントの様子」を追加すると、ここに並びます" />
            )}
          </section>
        ) : null}

        {/* 二つの立場 */}
        <section id="for-you" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <h2 className="font-display text-3xl font-semibold md:text-5xl">経験が、つながりになる。</h2>
          <p className="mt-5 max-w-2xl text-sub md:text-lg">
            これから挑む人と、すでにその道を歩いた人。立場は違っても、ここで得られるものがあります。
          </p>
          <div className="mt-12 grid gap-14 md:grid-cols-2 md:gap-16">
            <div>
              <h3 className="inline-block rounded-full bg-signal px-4 py-1.5 text-sm font-bold">これから行く方へ</h3>
              <Points items={forChallengers} />
            </div>
            <div>
              <h3 className="inline-block rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-white">経験者の方へ</h3>
              <Points items={forSenpai} />
            </div>
          </div>
        </section>

        {/* 行く前・滞在中・帰国後 */}
        <section className="bg-mist">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">行く前も、海外にいる間も、帰ってからも。</h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
              {stages.map(([head, body], i) => (
                <li key={head} className="relative md:pr-10">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full border-4 border-ink bg-signal" />
                    {i < stages.length - 1 && <span className="hidden h-0.5 flex-1 bg-ink/25 md:block" />}
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{head}</h3>
                  <p className="mt-2 text-[15px] text-sub">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* なぜつくったのか */}
        <section id="story" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="text-sm font-bold text-sub">なぜ、WAHONNECTをつくったのか</p>
          <h2 className="mt-4 font-display text-4xl font-semibold md:text-6xl">「誰にも、相談できなかった。」</h2>

          <div className={`mt-12 grid gap-12 ${photos.teamGroup || showStoryGuide ? "md:grid-cols-[0.8fr_1.2fr] md:gap-16" : "max-w-3xl"}`}>
            {(photos.teamGroup || showStoryGuide) && (
              <figure className="md:sticky md:top-24 md:self-start">
                <Photo
                  src={photos.teamGroup}
                  alt="WAHONNECT運営チーム"
                  className="aspect-[4/5] w-full"
                  sizes="(min-width: 768px) 40vw, 100vw"
                  guide="管理ページ（/admin）から「運営チームの写真」を入れると、ここに表示されます"
                />
                {photos.teamGroup && <figcaption className="mt-3 text-sm text-sub">WAHONNECT 運営チーム</figcaption>}
              </figure>
            )}

            <div>
              <div className="space-y-6 text-[17px] leading-[2.1]">
                <p>
                  社会人でワーホリに行くと決めたとき、周りにワーホリ経験者は誰もいませんでした。相談できる相手もおらず、渡航前の不安は、ひとりで抱えるしかありませんでした。
                </p>
                <p>
                  社会人がワーホリに挑戦するのは、簡単な決断ではありません。仕事を辞めて、貯金を切り崩して、キャリアに空白をつくる。それでも一歩を踏み出したくて、経験者のリアルな声をもっと聞ける場所が欲しかった。
                </p>
                <p className="font-display text-2xl font-semibold leading-relaxed">
                  帰ってきたあと、あの経験を持ったまま帰ってこられる場所をつくりたかった。
                </p>
                <p>
                  ワーホリでの日々は、帰国したあとも自分の中に生き続けます。でも日本に戻ると、あの感覚を分かち合える人はなかなかいない。
                </p>
                <p>同じ景色を見た仲間と、帰国後も繋がり続けられる場所。それが、WAHONNECTです。</p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <Photo src={photos.founder} alt="WAHONNECT代表" className="h-16 w-16 !rounded-full" sizes="64px" />
                <p className="text-sm font-bold text-sub">WAHONNECT Founder</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-rule">
          <div className="mx-auto max-w-3xl px-5 py-20 md:py-24">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">よくある質問</h2>
            <div className="mt-8 divide-y divide-rule border-y border-rule">
              {faqs.map(([q, a]) => (
                <details key={q} className="group">
                  <summary className="flex items-center justify-between gap-6 py-5 text-[17px] font-bold leading-snug">
                    {q}
                    <span className="faq-mark shrink-0 text-2xl font-normal leading-none transition-transform" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="pb-6 pr-10 text-[15px] text-sub">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 参加導線 */}
        <section id="join" className="bg-mist">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <h2 className="font-display text-4xl font-semibold md:text-6xl">一歩、踏み出そう。</h2>
            <p className="mt-5 max-w-xl text-sub md:text-lg">経験者も、挑戦者も。まずは、いちばん入りやすい入口からどうぞ。</p>
            <div className="mt-12 grid gap-5 md:grid-cols-[1.3fr_1fr_1fr]">
              <div className="rounded-3xl bg-ink p-8 text-white">
                <h3 className="text-2xl font-bold">公式LINEで参加する</h3>
                <p className="mt-3 text-white/75">
                  コミュニティへの入口です。イベントの案内が届き、質問や相談もここからできます。参加無料、いつでも退会できます。
                </p>
                <LineButton className="mt-7 !shadow-none">LINEでコミュニティに参加する</LineButton>
              </div>
              <div className="rounded-3xl bg-white p-8">
                <h3 className="text-xl font-bold">Meetupで言語交換を予約</h3>
                <p className="mt-3 text-[15px] text-sub">日本語×英語のLanguage Exchangeは、Meetupから席を予約できます。</p>
                <GhostButton href={site.meetup} className="mt-7">Meetupを開く</GhostButton>
              </div>
              <div className="rounded-3xl bg-white p-8">
                <h3 className="text-xl font-bold">Instagramで様子を見る</h3>
                <p className="mt-3 text-[15px] text-sub">イベントの雰囲気や最新のお知らせを発信しています。まずは覗いてみたい方に。</p>
                <GhostButton href={site.instagram} className="mt-7">{site.instagramHandle}</GhostButton>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBar eventUrl={event?.url ?? site.meetup} hasEvent={!!event} />
    </>
  );
}
