import { revalidateTag } from "next/cache";
import { PHOTOS_TAG, firebaseConfig, isAdminEmail } from "@/lib/photoConfig";

// adminページで写真を変更した直後に呼ばれ、公開ページのキャッシュを更新する。
// 呼び出し元がログイン中の管理者かどうかを、GoogleのIDトークンで確かめます。
export async function POST(request: Request) {
  const { idToken } = await request.json().catch(() => ({}));
  if (typeof idToken !== "string" || !firebaseConfig.apiKey) {
    return Response.json({ ok: false }, { status: 400 });
  }
  let user: { email?: string; emailVerified?: boolean } | null = null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    user = res.ok ? ((await res.json()).users?.[0] ?? null) : null;
  } catch {
    user = null;
  }
  if (!user?.emailVerified || !isAdminEmail(user.email)) {
    return Response.json({ ok: false }, { status: 403 });
  }
  revalidateTag(PHOTOS_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
