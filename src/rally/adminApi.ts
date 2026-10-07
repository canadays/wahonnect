// 管理画面のサーバー側。パスワードを確かめてから、Firestoreを読み書きする。
import { createHash, timingSafeEqual } from "node:crypto";
import { getAdminDb, missingAdminEnv } from "@/lib/firebaseAdmin";
import type { Mission, Team } from "./types";

type Config = { missionsCollection: string; teamsCollection: string; passwordEnv: string };

const digest = (s: string) => createHash("sha256").update(s).digest();
const json = (body: unknown, status = 200) => Response.json(body, { status });

function cleanMissions(input: unknown): Omit<Mission, "order">[] | null {
  if (!Array.isArray(input) || input.length > 100) return null;
  const out: Omit<Mission, "order">[] = [];
  for (const m of input) {
    if (!m || typeof m !== "object") return null;
    const { id, title, detail, points, isMust, isActive } = m as Record<string, unknown>;
    if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,60}$/.test(id)) return null;
    if (typeof title !== "string" || !title.trim() || title.length > 60) return null;
    if (detail !== undefined && (typeof detail !== "string" || detail.length > 400)) return null;
    if (typeof points !== "number" || !Number.isInteger(points) || points < 0 || points > 99) return null;
    out.push({ id, title: title.trim(), detail: typeof detail === "string" ? detail.trim() : "", points, isMust: isMust === true, isActive: isActive !== false });
  }
  if (new Set(out.map((m) => m.id)).size !== out.length) return null;
  // 必須は必ず1つだけにそろえる
  const first = out.findIndex((m) => m.isMust);
  out.forEach((m, i) => (m.isMust = i === (first < 0 ? 0 : first)));
  return out;
}

export function createAdminHandler({ missionsCollection, teamsCollection, passwordEnv }: Config) {
  return async function POST(request: Request) {
    const password = process.env[passwordEnv];
    const missing = [...(password ? [] : [passwordEnv]), ...missingAdminEnv()];
    if (missing.length) return json({ error: "not-configured", missing }, 503);

    const given = request.headers.get("x-admin-password") ?? "";
    if (!timingSafeEqual(digest(given), digest(password!))) {
      await new Promise((r) => setTimeout(r, 700)); // 総当たりを遅くする
      return json({ error: "wrong-password" }, 401);
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    try {
      const db = getAdminDb();
      switch (body?.action) {
        case "load": {
          const [m, t] = await Promise.all([db.collection(missionsCollection).get(), db.collection(teamsCollection).limit(500).get()]);
          const missions = m.docs.map((d) => ({ id: d.id, ...d.data() }) as Mission).sort((a, b) => a.order - b.order);
          const teams = t.docs.map((d) => ({ id: d.id, teamName: "", photos: {}, updatedAt: 0, ...d.data() }) as Team);
          return json({ missions, teams });
        }
        case "save": {
          const missions = cleanMissions(body.missions);
          if (!missions) return json({ error: "invalid" }, 400);
          const keep = new Set(missions.map((m) => m.id));
          const existing = await db.collection(missionsCollection).get();
          const batch = db.batch();
          missions.forEach(({ id, ...rest }, order) => batch.set(db.collection(missionsCollection).doc(id), { ...rest, order }));
          existing.docs.filter((d) => !keep.has(d.id)).forEach((d) => batch.delete(d.ref));
          await batch.commit();
          return json({ ok: true });
        }
        case "deleteTeam": {
          if (typeof body.id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(body.id)) return json({ error: "invalid" }, 400);
          await db.collection(teamsCollection).doc(body.id).delete();
          return json({ ok: true });
        }
        default:
          return json({ error: "invalid" }, 400);
      }
    } catch (e) {
      console.error("管理画面の処理に失敗しました:", e);
      return json({ error: "server" }, 500);
    }
  };
}
