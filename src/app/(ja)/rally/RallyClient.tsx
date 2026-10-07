"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/data/site";
import { defaultMissions, rally } from "@/rally/config";
import { thumb } from "@/rally/types";
import { useRally } from "@/rally/useRally";

export default function RallyClient() {
  const r = useRally({ ...rally, defaults: defaultMissions });
  const fileRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<string | null>(null);
  const [name, setName] = useState(r.teamName);
  const [openId, setOpenId] = useState<string | null>(null);
  const opened = openId ? r.missions.find((m) => m.id === openId) : undefined;

  const pick = (id: string) => {
    if (r.uploadingId || !fileRef.current) return;
    targetRef.current = id;
    fileRef.current.value = "";
    fileRef.current.click();
  };

  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <header className="border-b border-rule bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <Link href="/" className="font-code text-2xl font-semibold tracking-[0.08em]">
            WAHONNECT<span className="text-signal">.</span>
          </Link>
          <span className="rounded-full bg-ink px-3.5 py-1.5 font-code text-base font-semibold tracking-[0.06em] text-white">Photo Rally</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-16 pt-8">
        {!r.started ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              r.start(name);
            }}
            className="mx-auto mt-6 max-w-md rounded-3xl bg-white p-7 shadow-[0_30px_60px_-30px_rgba(15,27,64,0.35)]"
          >
            <h1 className="font-display text-3xl font-semibold">街を歩いて、写真を集めよう。</h1>
            <p className="mt-3 text-sm text-sub">ミッションの写真を撮ると点数が入ります。まずはチーム名を決めてください。</p>
            <label htmlFor="team" className="mt-6 block text-sm font-bold">チーム名</label>
            <input
              id="team"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：たこ焼き探検隊"
              maxLength={30}
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-rule px-4 py-3.5 text-lg font-bold"
            />
            <button type="submit" disabled={!name.trim()} className="mt-5 w-full rounded-full bg-signal py-4 text-base font-bold leading-none shadow-[0_6px_0_#c99700] disabled:opacity-40 disabled:shadow-none">
              ラリーをはじめる
            </button>
          </form>
        ) : (
          <>
            {/* 得点：搭乗券の半券 */}
            <section className="overflow-hidden rounded-3xl bg-ink text-white">
              <div className="flex flex-wrap items-end gap-x-8 gap-y-4 p-6">
                <div>
                  <p className="text-xs font-bold text-white/70">得点</p>
                  <p className="font-code text-7xl font-semibold leading-[0.9] tabular-nums">
                    {r.score}
                    <span className="text-2xl text-white/70"> / {r.maxScore} pt</span>
                  </p>
                </div>
                <div className="min-w-[200px] flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-lg font-bold">{r.teamName}</p>
                    <button onClick={r.editName} className="shrink-0 text-xs font-bold underline underline-offset-4">名前を変える</button>
                  </div>
                  <div className="my-2 h-2 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${r.missions.length ? (r.doneCount / r.missions.length) * 100 : 0}%` }} />
                  </div>
                  <p className="text-xs font-bold tabular-nums text-white/80">
                    {r.doneCount} / {r.missions.length} ミッション
                  </p>
                </div>
              </div>
              {r.mustMission && (
                <p className={`border-t-2 border-dashed border-white/25 px-6 py-3 text-sm font-bold ${r.mustCleared ? "text-signal" : ""}`}>
                  {r.mustCleared ? "必須ミッションをクリア。記録が有効になりました。" : "必須ミッションをクリアしないと、記録になりません。"}
                </p>
              )}
            </section>

            <p className="mt-5 text-sm text-sub">写真の枠を押すと、撮影または写真の選択ができます。アップロードするとクリアです。</p>
            {r.uploadFailed && <p role="alert" className="mt-2 text-sm font-bold text-[#a3261c]">写真をアップロードできませんでした。通信環境を確認して、もう一度お試しください。</p>}

            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {r.missions.map((m) => {
                const photo = r.photos[m.id];
                const uploading = r.uploadingId === m.id;
                return (
                  <li key={m.id} className={`flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white ${m.isMust ? "ring-[3px] ring-signal" : ""}`}>
                    <button
                      onClick={() => pick(m.id)}
                      disabled={!!r.uploadingId}
                      aria-label={`${photo ? "撮り直す" : "写真を追加"}：${m.title}`}
                      className="relative flex aspect-[4/3] w-full items-center justify-center bg-[#dde5f6] text-xs font-bold text-sub"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {photo && <img src={thumb(photo, 480)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
                      {!photo && !uploading && <span className="rounded-full border border-dashed border-sub/60 px-3 py-1.5">写真を追加</span>}
                      {uploading && <span className="absolute inset-0 flex items-center justify-center bg-white/85">アップロード中…</span>}
                      {m.isMust && <span className="absolute left-2 top-2 rounded-full bg-signal px-2.5 py-1 text-[11px] font-bold leading-none text-ink">必須</span>}
                      {photo && (
                        <span className="absolute bottom-2 right-2 flex h-14 w-14 -rotate-12 items-center justify-center rounded-full border-[3px] border-signal bg-ink/80 font-code text-sm font-semibold tracking-wider text-signal">
                          CLEAR
                        </span>
                      )}
                    </button>
                    <button onClick={() => setOpenId(m.id)} className="flex flex-1 items-start gap-2 px-3 py-2.5 text-left">
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-bold leading-snug">{m.title}</span>
                        {m.detail && <span className="mt-1 block text-xs font-bold text-sub underline underline-offset-2">くわしく見る</span>}
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 font-code text-base font-semibold tabular-nums ${photo ? "bg-signal" : "bg-mist"}`}>{m.points}pt</span>
                    </button>
                    {photo && (
                      <button onClick={() => r.removePhoto(m.id)} className="px-3 pb-2.5 text-left text-xs font-bold text-sub underline underline-offset-2">写真を外す</button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  if (window.confirm("このチームの写真をすべて外しますか？")) r.removeAll();
                }}
                className="text-xs font-bold text-sub underline underline-offset-2"
              >
                すべての写真を外す
              </button>
            </div>

            <div className="mt-10 rounded-3xl bg-white p-7 text-center">
              <p className="font-bold">おつかれさまでした。次のイベントのお知らせは公式LINEで届きます。</p>
              <a href={site.line} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-line px-7 py-3.5 text-sm font-bold leading-none text-white">
                公式LINEを追加する
              </a>
            </div>
          </>
        )}
      </main>

      {opened && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center" onClick={() => setOpenId(null)}>
          <div role="dialog" aria-modal="true" aria-label={opened.title} onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-3xl bg-white p-6">
            <div className="flex items-start gap-3">
              <h2 className="min-w-0 flex-1 break-words text-xl font-bold leading-snug">
                {opened.isMust && <span className="mr-2 inline-block rounded-full bg-signal px-2.5 py-1 align-middle text-[11px] font-bold leading-none">必須</span>}
                {opened.title}
              </h2>
              <span className="shrink-0 rounded-full bg-mist px-2.5 py-0.5 font-code text-lg font-semibold tabular-nums">{opened.points}pt</span>
            </div>
            {opened.detail && <p className="whitespace-pre-line break-words text-sub">{opened.detail}</p>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {r.photos[opened.id] && <img src={thumb(r.photos[opened.id], 480)} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />}
            <button
              onClick={() => {
                const id = opened.id;
                setOpenId(null);
                pick(id);
              }}
              disabled={!!r.uploadingId}
              className="rounded-full bg-signal py-4 font-bold leading-none disabled:opacity-40"
            >
              {r.photos[opened.id] ? "撮り直す" : "写真を追加"}
            </button>
            <button onClick={() => setOpenId(null)} className="rounded-full border border-rule py-3.5 font-bold leading-none">閉じる</button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && targetRef.current) r.upload(targetRef.current, file);
        }}
      />
    </div>
  );
}
