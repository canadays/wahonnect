"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { cloudinary } from "@/lib/photoConfig";
import { sortForPlay, type Mission } from "./types";

type Saved = { teamName: string; started: boolean; photos: Record<string, string> };
type Options = { missionsCollection: string; teamsCollection: string; storageKey: string; defaults: Mission[] };

const now = () => Date.now();

function readSaved(key: string): Saved {
  try {
    const s = JSON.parse(localStorage.getItem(key) ?? "null") as Partial<Saved> | null;
    if (s) return { teamName: s.teamName || "", started: !!s.started, photos: s.photos && typeof s.photos === "object" ? s.photos : {} };
  } catch {
    /* 保存なし、またはストレージが使えない */
  }
  return { teamName: "", started: false, photos: {} };
}

// 通信量を抑えるため、送る前にスマホ側で写真を縮小する
function shrinkImage(file: File, maxSize = 1280): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * k);
      canvas.height = Math.round(img.height * k);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("image"))), "image/jpeg", 0.8);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

/* 参加者側の動きをまとめたもの。見た目は各ページが自由に組む。 */
export function useRally({ missionsCollection, teamsCollection, storageKey, defaults }: Options) {
  const [initial] = useState(() => readSaved(storageKey));
  const [teamName, setTeamName] = useState(initial.teamName);
  const [started, setStarted] = useState(initial.started);
  const [photos, setPhotos] = useState(initial.photos);
  const [uid, setUid] = useState<string | null>(null);
  const [remote, setRemote] = useState<Mission[] | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);

  // 再読み込みしても続きから遊べるよう、このスマホに保存
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ teamName, started, photos }));
    } catch {
      /* 保存できなくても、ページを閉じるまでは遊べる */
    }
  }, [storageKey, teamName, started, photos]);

  // 匿名でログイン（チームの記録を自分のスマホだけが書けるようにするため）
  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUid(u ? u.uid : null);
        if (!u) signInAnonymously(auth).catch(console.error);
      }),
    [],
  );

  // ミッションは管理画面で保存された瞬間に反映される
  useEffect(
    () =>
      onSnapshot(
        collection(db, missionsCollection),
        (snap) => setRemote(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Mission)),
        (err) => {
          console.error(err);
          setRemote([]);
        },
      ),
    [missionsCollection],
  );

  // 管理画面でチームの写真と得点を見られるよう、記録を送る
  useEffect(() => {
    if (!uid || !started) return;
    setDoc(doc(db, teamsCollection, uid), { teamName, photos, updatedAt: now() }).catch(console.error);
  }, [uid, started, teamName, photos, teamsCollection]);

  const missions = useMemo(() => sortForPlay(remote && remote.length > 0 ? remote : defaults), [remote, defaults]);
  const done = missions.filter((m) => photos[m.id]);
  const mustMission = missions.find((m) => m.isMust);

  async function upload(id: string, file: File) {
    if (uploadingId) return;
    setUploadingId(id);
    setUploadFailed(false);
    try {
      const form = new FormData();
      form.append("file", await shrinkImage(file), "photo.jpg");
      form.append("upload_preset", cloudinary.uploadPreset!);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error("upload");
      const data = await res.json();
      const url = String(data.secure_url).replace("/upload/", "/upload/q_auto,f_auto/");
      setPhotos((prev) => ({ ...prev, [id]: url }));
    } catch (e) {
      console.error(e);
      setUploadFailed(true);
    } finally {
      setUploadingId(null);
    }
  }

  return {
    teamName,
    started,
    photos,
    missions,
    uploadingId,
    uploadFailed,
    doneCount: done.length,
    score: done.reduce((sum, m) => sum + m.points, 0),
    maxScore: missions.reduce((sum, m) => sum + m.points, 0),
    mustMission,
    mustCleared: !!mustMission && !!photos[mustMission.id],
    start: (name: string) => {
      if (!name.trim()) return;
      setTeamName(name.trim());
      setStarted(true);
    },
    editName: () => setStarted(false),
    upload,
    removePhoto: (id: string) =>
      setPhotos((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    removeAll: () => setPhotos({}),
  };
}
