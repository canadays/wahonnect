"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { thumb, type Mission, type Team } from "./types";

export type AdminLook = {
  page: string; // ページ全体
  bar: string; // 上部バー
  brand: string; // ロゴ文字
  card: string; // 白いカード
  mustCard: string; // 必須ミッションのカード
  input: string;
  primary: string; // 主ボタン
  quiet: string; // 控えめなボタン
  score: string; // 得点の数字
};

export type AdminWords = {
  brand: string;
  title: string;
  mission: string; // 「ミッション」「クエスト」など
  must: string; // 「必須」「キー」など
  unit: string; // 「pt」など
  playHref: string;
};

type Props = { endpoint: string; defaults: Mission[]; look: AdminLook; words: AdminWords };

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `m${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, "");

export function AdminScreen({ endpoint, defaults, look, words }: Props) {
  const pwKey = `${endpoint}:pw`;
  const [password, setPassword] = useState(() => {
    try {
      return sessionStorage.getItem(pwKey) ?? "";
    } catch {
      return "";
    }
  });
  const [typed, setTyped] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [drafts, setDrafts] = useState<Mission[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const call = useCallback(
    async (pw: string, body: Record<string, unknown>) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pw },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    },
    [endpoint],
  );

  const explain = (status: number, data: { missing?: string[] }) =>
    status === 401
      ? "パスワードが違います。"
      : status === 503
        ? `サーバーの設定が足りません。Vercelの環境変数を確認してください: ${(data.missing ?? []).join(", ")}`
        : "うまくいきませんでした。通信環境を確認して、もう一度お試しください。";

  const load = useCallback(
    async (pw: string) => {
      setBusy(true);
      try {
        const { status, data } = await call(pw, { action: "load" });
        if (status !== 200) {
          setSignedIn(false);
          setMessage(explain(status, data));
          if (status === 401) {
            setPassword("");
            try {
              sessionStorage.removeItem(pwKey);
            } catch {}
          }
          return;
        }
        try {
          sessionStorage.setItem(pwKey, pw);
        } catch {}
        setPassword(pw);
        setSignedIn(true);
        setTeams(data.teams);
        if (data.missions.length > 0) {
          setDrafts(data.missions);
          setDirty(false);
          setMessage("");
        } else {
          setDrafts(defaults);
          setDirty(true);
          setMessage(`まだ保存された${words.mission}がありません。見本を表示しています。「保存する」を押すと公開されます。`);
        }
      } catch {
        setMessage(explain(0, {}));
      } finally {
        setBusy(false);
      }
    },
    [call, defaults, pwKey, words.mission],
  );

  // 同じタブで開き直したときは、入力済みのパスワードでそのまま入る
  useEffect(() => {
    if (!password || signedIn) return;
    const t = setTimeout(() => load(password), 0);
    return () => clearTimeout(t);
  }, [password, signedIn, load]);

  const edit = (id: string, patch: Partial<Mission>) => {
    setDrafts((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    setDirty(true);
  };
  const move = (i: number, dir: -1 | 1) => {
    const to = i + dir;
    if (to < 0 || to >= drafts.length) return;
    const next = [...drafts];
    [next[i], next[to]] = [next[to], next[i]];
    setDrafts(next);
    setDirty(true);
  };
  const add = () => {
    setDrafts((prev) => [...prev, { id: newId(), title: `新しい${words.mission}`, detail: "", points: 1, isMust: prev.length === 0, isActive: true, order: prev.length }]);
    setDirty(true);
  };
  const remove = (id: string) => {
    setDrafts((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (next.length > 0 && !next.some((m) => m.isMust)) next[0] = { ...next[0], isMust: true };
      return next;
    });
    setDirty(true);
  };

  async function save() {
    if (drafts.some((m) => !m.title.trim())) {
      setMessage("タイトルが空のものがあります。");
      return;
    }
    setBusy(true);
    try {
      const { status, data } = await call(password, { action: "save", missions: drafts });
      if (status === 200) {
        setDirty(false);
        setMessage("保存しました。参加者の画面にすぐ反映されます。");
      } else {
        setMessage(status === 400 ? "保存できない内容があります（タイトルは60字、説明は400字、点数は0〜99まで）。" : explain(status, data));
      }
    } catch {
      setMessage(explain(0, {}));
    } finally {
      setBusy(false);
    }
  }

  async function deleteTeam(t: Team) {
    if (!window.confirm(`チーム「${t.teamName || "名前なし"}」を一覧から消しますか？`)) return;
    const { status, data } = await call(password, { action: "deleteTeam", id: t.id });
    if (status === 200) setTeams((prev) => prev.filter((x) => x.id !== t.id));
    else setMessage(explain(status, data));
  }

  function logout() {
    try {
      sessionStorage.removeItem(pwKey);
    } catch {}
    setPassword("");
    setSignedIn(false);
    setTyped("");
    setMessage("");
  }

  const active = drafts.filter((m) => m.isActive);
  const total = active.reduce((sum, m) => sum + m.points, 0);
  const mustId = active.find((m) => m.isMust)?.id;
  const scoreOf = (t: Team) => active.reduce((sum, m) => sum + (t.photos[m.id] ? m.points : 0), 0);
  const ranked = [...teams].sort((a, b) => scoreOf(b) - scoreOf(a));

  return (
    <div className={`min-h-screen ${look.page}`}>
      <header className={look.bar}>
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-5">
          <p className="flex items-baseline gap-3">
            <span className={look.brand}>{words.brand}</span>
            <span className="text-sm opacity-70">{words.title}</span>
          </p>
          <div className="flex items-center gap-4 text-sm font-bold">
            <Link href={words.playHref} className="underline underline-offset-4">参加者の画面</Link>
            {signedIn && <button onClick={logout} className={look.quiet}>ログアウト</button>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-36 pt-10">
        {!signedIn ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typed) load(typed);
            }}
            className={`mx-auto max-w-md p-8 ${look.card}`}
          >
            <h1 className="text-2xl font-bold">管理ページ</h1>
            <label htmlFor="admin-password" className="mt-5 block text-sm font-bold">パスワード</label>
            <input
              id="admin-password"
              type="password"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="current-password"
              className={`mt-2 w-full ${look.input}`}
            />
            <button type="submit" disabled={!typed || busy} className={`mt-5 w-full ${look.primary}`}>
              {busy ? "確認しています…" : "入る"}
            </button>
            {message && <p role="alert" className="mt-4 text-sm font-bold text-[#a3261c]">{message}</p>}
          </form>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{words.mission}の編集</h1>
            <p className="mt-2 text-sm opacity-70">
              表示中 {active.length}件、合計 {total}
              {words.unit}
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {drafts.map((m, i) => (
                <li key={m.id} className={`flex flex-col gap-3 p-4 ${m.isMust ? look.mustCard : look.card}`}>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => edit(m.id, { title: e.target.value })}
                    maxLength={60}
                    placeholder="短いタイトル"
                    aria-label={`${words.mission}のタイトル`}
                    className={`w-full font-bold ${look.input}`}
                  />
                  <textarea
                    value={m.detail || ""}
                    onChange={(e) => edit(m.id, { detail: e.target.value })}
                    maxLength={400}
                    rows={2}
                    placeholder="説明（任意）：条件、ヒント、ルールなど"
                    aria-label={`${words.mission}の説明`}
                    className={`w-full resize-y text-sm ${look.input}`}
                  />
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
                    <label className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={m.points}
                        onChange={(e) => edit(m.id, { points: Math.max(0, Math.min(99, Math.round(Number(e.target.value) || 0))) })}
                        className={`w-20 text-right tabular-nums ${look.input}`}
                      />
                      {words.unit}
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="must"
                        checked={m.isMust}
                        onChange={() => {
                          setDrafts((prev) => prev.map((x) => ({ ...x, isMust: x.id === m.id })));
                          setDirty(true);
                        }}
                      />
                      {words.must}
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={m.isActive} onChange={(e) => edit(m.id, { isActive: e.target.checked })} />
                      表示する
                    </label>
                    <span className="ml-auto flex items-center gap-1">
                      <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="上へ" className={`h-9 w-9 !p-0 ${look.quiet}`}>↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === drafts.length - 1} aria-label="下へ" className={`h-9 w-9 !p-0 ${look.quiet}`}>↓</button>
                      <button onClick={() => remove(m.id)} className="h-9 rounded-lg px-2 text-[#a3261c]">削除</button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <button onClick={add} className="mt-4 w-full rounded-2xl border-2 border-dashed border-current py-3 font-bold opacity-60 hover:opacity-100">
              {words.mission}を追加する
            </button>

            <section className="mt-14">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">
                  チーム <span className="text-sm tabular-nums opacity-60">{teams.length}</span>
                </h2>
                <button onClick={() => load(password)} disabled={busy || dirty} title={dirty ? "先に保存するか、変更を取り消してください" : undefined} className={look.quiet}>
                  {busy ? "読み込み中…" : "最新にする"}
                </button>
              </div>
              {teams.length === 0 && <p className="mt-4 text-sm opacity-70">まだ始めたチームはありません。チーム名を入力すると、ここに表示されます。</p>}
              <ul className="mt-4 flex flex-col gap-4">
                {ranked.map((t) => {
                  const cleared = active.filter((m) => t.photos[m.id]);
                  const mustOk = !!mustId && !!t.photos[mustId];
                  return (
                    <li key={t.id} className={`p-4 ${look.card}`}>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <p className="min-w-0 flex-1 break-words text-lg font-bold">{t.teamName || "（名前なし）"}</p>
                        <p className={look.score}>
                          {scoreOf(t)}
                          <span className="text-xs opacity-60"> {words.unit}</span>
                        </p>
                        <button onClick={() => deleteTeam(t)} className="rounded-lg px-2 py-1 text-xs font-bold text-[#a3261c]">消す</button>
                      </div>
                      <p className="mt-1 text-xs font-bold tabular-nums opacity-70">
                        {cleared.length} / {active.length}件、{words.must}は{mustOk ? "クリア済み" : "まだ"}
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {cleared.map((m) => (
                          <a key={m.id} href={t.photos[m.id]} target="_blank" rel="noopener noreferrer" className="block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumb(t.photos[m.id])} loading="lazy" decoding="async" alt={m.title} className="aspect-square w-full rounded-xl bg-black/5 object-cover" />
                            <span className="mt-1 block break-words text-[11px] font-bold leading-tight opacity-70">{m.title}</span>
                          </a>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div className={`fixed inset-x-0 bottom-0 z-50 px-5 py-3 ${look.bar}`}>
              <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
                <p role="status" className="min-w-0 flex-1 text-xs font-bold">{message || (dirty ? "保存していない変更があります。" : "すべて保存済みです。")}</p>
                <button onClick={() => load(password)} disabled={busy || !dirty} className={look.quiet}>取り消す</button>
                <button onClick={save} disabled={busy || !dirty} className={look.primary}>{busy ? "処理中…" : "保存する"}</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
