import { getStore } from "@netlify/blobs";

const SONGS = new Set(["kick-me","cant-hang","do-it-now","low","leave-it","better-off-dead","let-love","trophy","ending","roger-rabbit","with-ears","parasites"]);
const DIFFS = new Set(["facil","normal","dificil"]);
const json = (data, status = 200) => Response.json(data, { status, headers: { "cache-control": "no-store" } });

export default async (req) => {
  const store = getStore({ name: "scores", consistency: "strong" });

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const rows = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
    rows.sort((a, b) => b.score - a.score);
    return json(rows.slice(0, 1000));
  }

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
    const name = String(b?.name || "").trim().slice(0, 20);
    const nk = name.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20);
    const score = Math.round(Number(b?.score));
    if (!name || !SONGS.has(b?.song) || !DIFFS.has(b?.diff) || !Number.isFinite(score) || score < 0 || score > 3000000) {
      return json({ error: "invalid" }, 400);
    }
    const key = `${nk}--${b.song}--${b.diff}`;
    const old = await store.get(key, { type: "json" });
    if (old && old.score >= score) return json({ status: "kept", best: old.score });
    await store.setJSON(key, {
      name, nk, song: b.song, diff: b.diff, score,
      acc: Math.max(0, Math.min(100, Number(b.acc) || 0)),
      combo: Math.max(0, Math.round(Number(b.combo) || 0)),
      mode: b.mode === "mp3" ? "mp3" : "synth",
      ts: Date.now(),
    });
    return json({ status: old ? "record" : "new" });
  }

  return json({ error: "method not allowed" }, 405);
};

export const config = { path: "/api/scores" };
