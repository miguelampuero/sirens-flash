import { getStore } from "@netlify/blobs";

// Salas de VS: cada jugador envía su estado ~1 vez por segundo.
export default async (req) => {
  const store = getStore({ name: "vs", consistency: "strong" });
  const now = Date.now();
  let b = null;
  try { b = JSON.parse(await req.text()); } catch {}
  if (!b || !/^[A-Z0-9]{4}$/.test(b.code || "") || !/^[a-z0-9]{4,16}$/.test(b.id || "")) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const pre = b.code + "/";
  if (b.leave) {
    await store.delete(pre + b.id);
  } else {
    const num = (v, max) => Math.max(0, Math.min(max, Number(v) || 0));
    await store.setJSON(pre + b.id, {
      id: b.id,
      n: String(b.n || "Jugador").slice(0, 20),
      host: !!b.host,
      song: String(b.song || "").slice(0, 40),
      diff: String(b.diff || "").slice(0, 10),
      mode: b.mode === "synth" ? "synth" : "song",
      ready: !!b.ready,
      go: num(b.go, 9e15),
      sc: Math.round(num(b.sc, 3000000)),
      combo: Math.round(num(b.combo, 100000)),
      acc: num(b.acc, 100),
      done: !!b.done,
      ts: now,
    });
  }
  const { blobs } = await store.list({ prefix: pre });
  const all = (await Promise.all(blobs.map((x) => store.get(x.key, { type: "json" })))).filter(Boolean);
  const stale = all.filter((p) => now - p.ts > 60000);
  if (stale.length) await Promise.all(stale.map((p) => store.delete(pre + p.id)));
  const players = all.filter((p) => now - p.ts < 15000).map(({ ts, ...p }) => p);
  return Response.json({ now, players }, { headers: { "cache-control": "no-store" } });
};

export const config = { path: "/api/vs" };
