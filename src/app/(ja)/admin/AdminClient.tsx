"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import { PHOTOS_COLLECTION, SLOTS, cloudinary, isAdminEmail, missingEnv, type Slot } from "@/lib/photoConfig";

type Photo = { id: string; slot: Slot; url: string; createdAt: number };
type Fb = typeof import("@/lib/firebase") & typeof import("firebase/auth") & typeof import("firebase/firestore");

const MAX_MB = 15;
const timestamp = () => Date.now();

export default function AdminClient() {
  const [fb, setFb] = useState<Fb | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState<Slot | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const configured = missingEnv.length === 0;
  const isAdmin = isAdminEmail(user?.email);

  // Firebaseはこのページを開いたときだけ読み込む
  useEffect(() => {
    if (!configured) return;
    let off = () => {};
    (async () => {
      const [lib, authMod, storeMod] = await Promise.all([
        import("@/lib/firebase"),
        import("firebase/auth"),
        import("firebase/firestore"),
      ]);
      const all = { ...lib, ...authMod, ...storeMod } as Fb;
      setFb(all);
      off = all.onAuthStateChanged(all.auth, (u) => {
        setUser(u);
        setReady(true);
      });
    })();
    return () => off();
  }, [configured]);

  // ログイン中の管理者にだけ、写真の一覧をリアルタイムで同期
  useEffect(() => {
    if (!fb || !isAdmin) return;
    return fb.onSnapshot(
      fb.collection(fb.db, PHOTOS_COLLECTION),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Photo, "id">) }));
        setPhotos(list.sort((a, b) => b.createdAt - a.createdAt));
      },
      () => setNotice({ kind: "error", text: "写真の一覧を読み込めませんでした。Firestoreのルールを確認してください。" }),
    );
  }, [fb, isAdmin]);

  async function login() {
    if (!fb) return;
    setNotice(null);
    try {
      const result = await fb.signInWithPopup(fb.auth, new fb.GoogleAuthProvider());
      if (!isAdminEmail(result.user.email)) {
        await fb.signOut(fb.auth);
        setNotice({ kind: "error", text: "このGoogleアカウントには管理者権限がありません。" });
      }
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      if (!code.includes("popup-closed") && !code.includes("cancelled-popup")) {
        setNotice({ kind: "error", text: "ログインできませんでした。もう一度お試しください。" });
      }
    }
  }

  // 公開ページのキャッシュを更新して、変更をすぐ反映させる
  async function publish() {
    if (!fb?.auth.currentUser) return false;
    const idToken = await fb.auth.currentUser.getIdToken();
    const res = await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    return res.ok;
  }

  async function finish(action: string) {
    const ok = await publish().catch(() => false);
    setNotice(
      ok
        ? { kind: "ok", text: `${action}。サイトに反映しました。` }
        : { kind: "error", text: `${action}が、サイトへの反映に失敗しました。1時間以内に自動で反映されます。` },
    );
  }

  async function upload(slot: Slot, multiple: boolean, files: File[]) {
    if (!fb || !isAdmin || files.length === 0) return;
    const tooBig = files.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      setNotice({ kind: "error", text: `「${tooBig.name}」は${MAX_MB}MBを超えています。小さくしてからアップロードしてください。` });
      return;
    }
    setBusy(slot);
    setNotice(null);
    try {
      const previous = multiple ? [] : photos.filter((p) => p.slot === slot);
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", cloudinary.uploadPreset!);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("upload");
        const data = await res.json();
        await fb.addDoc(fb.collection(fb.db, PHOTOS_COLLECTION), {
          slot,
          url: String(data.secure_url).replace("/upload/", "/upload/q_auto,f_auto/"),
          createdAt: timestamp(),
          adminUid: fb.auth.currentUser?.uid ?? null,
        });
      }
      // 1枚だけの枠は、新しい写真が入ってから古い写真を外す
      for (const old of previous) await fb.deleteDoc(fb.doc(fb.db, PHOTOS_COLLECTION, old.id));
      await finish(multiple ? `${files.length}枚を追加しました` : "写真を変更しました");
    } catch {
      setNotice({ kind: "error", text: "アップロードに失敗しました。写真は変更されていません。通信環境を確認して、もう一度お試しください。" });
    } finally {
      setBusy(null);
    }
  }

  async function remove(photo: Photo) {
    if (!fb || !isAdmin) return;
    if (!window.confirm("この写真をサイトから外しますか？")) return;
    setBusy(photo.slot);
    setNotice(null);
    try {
      await fb.deleteDoc(fb.doc(fb.db, PHOTOS_COLLECTION, photo.id));
      await finish("写真を外しました");
    } catch {
      setNotice({ kind: "error", text: "写真を外せませんでした。権限を確認してください。" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-rule bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <p className="font-bold">
            <span className="font-code text-2xl font-semibold tracking-[0.08em]">WAHONNECT</span>
            <span className="ml-3 text-sm text-sub">管理ページ</span>
          </p>
          <div className="flex items-center gap-4 text-sm font-bold">
            <Link href="/" className="underline underline-offset-4">サイトを見る</Link>
            {user && (
              <button onClick={() => fb?.signOut(fb.auth)} className="rounded-full border border-rule bg-white px-4 py-2 leading-none">
                ログアウト
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        {notice && (
          <p
            role="status"
            className={`mb-6 rounded-2xl px-5 py-4 text-sm font-bold ${notice.kind === "ok" ? "bg-ink text-white" : "bg-[#fde8e8] text-[#8a1c1c]"}`}
          >
            {notice.text}
          </p>
        )}

        {!configured ? (
          <section className="rounded-3xl bg-white p-8">
            <h1 className="text-2xl font-bold">まだ設定が終わっていません</h1>
            <p className="mt-3 text-sub">Vercelの環境変数に、次の値を設定して再デプロイしてください。手順はREADMEにあります。</p>
            <ul className="mt-4 space-y-1 font-mono text-sm">
              {missingEnv.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </section>
        ) : !ready ? (
          <p className="text-sub">読み込んでいます…</p>
        ) : !isAdmin ? (
          <section className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center">
            <h1 className="text-2xl font-bold">管理者ログイン</h1>
            <p className="mt-3 text-sm text-sub">許可されたGoogleアカウントでログインしてください。</p>
            <button onClick={login} className="mt-6 w-full rounded-full bg-ink px-6 py-4 font-bold leading-none text-white">
              Googleでログイン
            </button>
          </section>
        ) : (
          <>
            <h1 className="text-3xl font-bold">写真の管理</h1>
            <p className="mt-2 text-sub">写真を選ぶとすぐにサイトへ反映されます。写っている人に、掲載してよいか確認してから載せてください。</p>

            <div className="mt-8 space-y-6">
              {SLOTS.map((slot) => {
                const items = photos.filter((p) => p.slot === slot.id);
                const working = busy === slot.id;
                return (
                  <section key={slot.id} className="rounded-3xl bg-white p-6 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">{slot.label}</h2>
                        <p className="mt-1 text-sm text-sub">
                          {slot.where}。{slot.shape}。
                        </p>
                      </div>
                      <label
                        className={`cursor-pointer rounded-full bg-signal px-5 py-3 text-sm font-bold leading-none text-ink focus-within:outline focus-within:outline-3 focus-within:outline-ink ${busy ? "pointer-events-none opacity-50" : ""}`}
                      >
                        {working ? "アップロード中…" : slot.multiple ? "写真を追加する" : items.length ? "写真を変更する" : "写真を選ぶ"}
                        <input
                          type="file"
                          accept="image/*"
                          multiple={slot.multiple}
                          disabled={!!busy}
                          className="sr-only"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            e.target.value = "";
                            upload(slot.id, slot.multiple, files);
                          }}
                        />
                      </label>
                    </div>

                    {items.length === 0 ? (
                      <p className="mt-5 rounded-2xl border-2 border-dashed border-rule px-5 py-8 text-center text-sm text-sub">
                        まだ写真がありません。写真を入れるまで、この枠はサイトに表示されません。
                      </p>
                    ) : (
                      <ul className={`mt-5 grid gap-3 ${slot.multiple ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}>
                        {(slot.multiple ? items : items.slice(0, 1)).map((p) => (
                          <li key={p.id} className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.url.replace("/upload/q_auto,f_auto/", "/upload/q_auto,f_auto,w_400,h_400,c_fill/")}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                            <button
                              onClick={() => remove(p)}
                              disabled={!!busy}
                              className="absolute right-2 top-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold leading-none text-[#8a1c1c] shadow disabled:opacity-50"
                            >
                              外す
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
