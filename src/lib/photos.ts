import fs from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { site } from "@/data/site";
import { PHOTOS_COLLECTION, PHOTOS_TAG, firebaseConfig, type Slot } from "./photoConfig";

/*
 * 写真の取得元は2つ。
 *  1. adminページからアップロードした写真（Firestoreに記録、画像はCloudinary）
 *  2. public/photos/ に直接置いたファイル（1が無い枠の予備）
 * サーバー側で読むので、訪問者のブラウザにFirebaseは読み込まれません。
 */

type Doc = { slot: Slot; url: string; createdAt: number };

async function fromFirestore(): Promise<Doc[]> {
  const { projectId, apiKey } = firebaseConfig;
  if (!projectId || !apiKey) return [];
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  const base = emulator ? `http://${emulator}/v1` : "https://firestore.googleapis.com/v1";
  const docs: Doc[] = [];
  let pageToken = "";
  try {
    do {
      const res = await fetch(
        `${base}/projects/${projectId}/databases/(default)/documents/${PHOTOS_COLLECTION}?pageSize=300&key=${apiKey}` +
          (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""),
        // APIキーに「ウェブサイトの制限」がかかっていても通るよう、このサイトからのアクセスだと伝える
        { headers: { Referer: `${site.url}/` } },
      );
      if (!res.ok) throw new Error(`Firestore ${res.status}`);
      const json = await res.json();
      for (const d of json.documents ?? []) {
        const f = d.fields ?? {};
        const url = f.url?.stringValue;
        const slot = f.slot?.stringValue as Slot | undefined;
        const createdAt = Number(f.createdAt?.integerValue ?? f.createdAt?.doubleValue ?? 0);
        if (slot && typeof url === "string" && url.startsWith("https://res.cloudinary.com/")) {
          docs.push({ slot, url, createdAt });
        }
      }
      pageToken = json.nextPageToken ?? "";
    } while (pageToken);
  } catch (e) {
    console.error("写真の取得に失敗しました（public/photos の写真で表示します）:", e);
    return [];
  }
  return docs.sort((a, b) => b.createdAt - a.createdAt);
}

const dir = path.join(process.cwd(), "public", "photos");
const isImage = (f: string) => /\.(jpe?g|png|webp|avif)$/i.test(f);

async function list(sub: string) {
  try {
    return (await fs.readdir(path.join(dir, sub))).filter(isImage).sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));
  } catch {
    return [];
  }
}

const local = (...parts: string[]) => "/photos/" + parts.map(encodeURIComponent).join("/");

export async function getPhotos() {
  "use cache";
  cacheTag(PHOTOS_TAG);
  cacheLife("hours");

  const [remote, root, galleryFiles] = await Promise.all([fromFirestore(), list(""), list("gallery")]);
  const single = (slot: Slot) => {
    const r = remote.find((d) => d.slot === slot);
    if (r) return r.url;
    const f = root.find((x) => x.toLowerCase().startsWith(slot + "."));
    return f ? local(f) : null;
  };
  const remoteGallery = remote.filter((d) => d.slot === "gallery").map((d) => d.url);

  return {
    hero: single("hero"),
    teamGroup: single("team"),
    founder: single("founder"),
    gallery: remoteGallery.length ? remoteGallery : galleryFiles.map((f) => local("gallery", f)),
  };
}

export const showGuides = process.env.NODE_ENV === "development";
