// サーバー専用。管理画面（パスワード方式）からの書き込みは、すべてここを通します。
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export const missingAdminEnv = () =>
  ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"].filter((k) => !process.env[k]);

export function getAdminDb(): Firestore {
  if (!getApps().length) {
    const missing = missingAdminEnv();
    if (missing.length) throw new Error(`missing-env:${missing.join(",")}`);
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}
