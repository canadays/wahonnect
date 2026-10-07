"use client";

import dynamic from "next/dynamic";
import { cloudinary, firebaseConfig } from "@/lib/photoConfig";

// スマホに保存した続きから始めるため、ブラウザ側だけで描画する
const RallyClient = dynamic(() => import("./RallyClient"), { ssr: false });

export default function RallyLoader() {
  const ready = firebaseConfig.apiKey && firebaseConfig.projectId && cloudinary.cloudName && cloudinary.uploadPreset;
  if (!ready) {
    return <p className="mx-auto max-w-md px-5 py-24 text-center font-bold">フォトラリーは準備中です。</p>;
  }
  return <RallyClient />;
}
