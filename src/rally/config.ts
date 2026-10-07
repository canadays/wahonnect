import type { AdminLook, AdminWords } from "./AdminScreen";
import type { Mission } from "./types";

export const rally = {
  missionsCollection: "wahonnect_rally_missions",
  teamsCollection: "wahonnect_rally_teams",
  storageKey: "wahonnect_rally_v1",
  passwordEnv: "RALLY_ADMIN_PASSWORD",
  adminEndpoint: "/api/rally/admin",
};

const titles: [string, number, string?][] = [
  ["外国語の看板を見つける", 1],
  ["橋の上で1枚", 2],
  ["チーム全員の靴を並べて撮る", 1],
  ["地元の名物を食べる", 3],
  ["知らない国の国旗を探す", 2],
  ["チームで同じポーズ", 1],
  ["いちばん高い場所からの景色", 3],
  ["お店の人と一緒に", 3, "声をかけて、許可をもらってから撮りましょう。"],
  ["英語で道をたずねる", 3, "たずねている様子を、別のメンバーが撮ってください。"],
  ["赤いものを3つ集めて撮る", 1],
  ["水辺で1枚", 2],
  ["ゴールで全員の集合写真", 5, "全員が写っていること。これがないと記録になりません。"],
];

// まだ管理ページで保存していないあいだの見本
export const defaultMissions: Mission[] = titles.map(([title, points, detail], i) => ({
  id: `default-${String(i + 1).padStart(2, "0")}`,
  title,
  detail: detail ?? "",
  points,
  isMust: i === titles.length - 1,
  isActive: true,
  order: i,
}));

export const adminWords: AdminWords = {
  brand: "WAHONNECT",
  title: "Photo Rally 管理",
  mission: "ミッション",
  must: "必須",
  unit: "pt",
  playHref: "/rally",
};

export const adminLook: AdminLook = {
  page: "bg-mist text-ink",
  bar: "border-y border-rule bg-white",
  brand: "font-code text-2xl font-semibold tracking-[0.08em]",
  card: "rounded-3xl bg-white",
  mustCard: "rounded-3xl bg-white ring-2 ring-signal",
  input: "rounded-xl border border-rule bg-white px-3 py-2.5",
  primary: "rounded-full bg-ink px-6 py-3 text-sm font-bold leading-none text-white disabled:opacity-40",
  quiet: "rounded-full border border-rule bg-white px-4 py-2.5 text-sm font-bold leading-none disabled:opacity-40",
  score: "font-code text-3xl font-semibold tabular-nums",
};
