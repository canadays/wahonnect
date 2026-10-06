// サイト全体で使うリンク。イベントはMeetupから、写真は管理ページ（/admin）から更新します。

export const site = {
  name: "WAHONNECT",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wahonnect.vercel.app",
  line: "https://lin.ee/SCjB3LJ",
  meetup: "https://www.meetup.com/wahonnect/",
  // イベントの日程と内容は、このMeetup公開カレンダーから自動で読み込みます
  meetupIcal: "https://www.meetup.com/wahonnect/events/ical/",
  instagram: "https://www.instagram.com/waho_nnect/",
  instagramHandle: "@waho_nnect",
};
