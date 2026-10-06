// 写真管理の共通設定（サーバー・クライアント両方から読む）

export const PHOTOS_COLLECTION = "wahonnect_photos";
export const PHOTOS_TAG = "photos";

export type Slot = "hero" | "team" | "founder" | "gallery";

export const SLOTS: { id: Slot; label: string; where: string; shape: string; multiple: boolean }[] = [
  { id: "hero", label: "トップの写真", where: "トップページ上部の大きな1枚", shape: "横長（16:9）がおすすめ", multiple: false },
  { id: "gallery", label: "イベントの様子", where: "「イベントの様子」の一覧。新しい順に並び、1枚目が大きく表示されます", shape: "正方形に切り抜かれます", multiple: true },
  { id: "team", label: "運営チームの写真", where: "「なぜ、WAHONNECTをつくったのか」の横", shape: "縦長（4:5）がおすすめ", multiple: false },
  { id: "founder", label: "代表の写真", where: "代表の文章の署名の横（丸く表示）", shape: "正方形がおすすめ", multiple: false },
];

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const cloudinary = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

// 管理者のGoogleアカウント（カンマ区切り）。Firestoreのルールにも同じアドレスを書きます。
export const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email?: string | null) => !!email && adminEmails.includes(email.toLowerCase());

export const missingEnv = [
  ["NEXT_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", cloudinary.cloudName],
  ["NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", cloudinary.uploadPreset],
  ["NEXT_PUBLIC_ADMIN_EMAILS", adminEmails.length ? "ok" : ""],
]
  .filter(([, v]) => !v)
  .map(([k]) => k as string);
