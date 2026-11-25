import { getStore } from "@netlify/blobs";

// Jugadores conectados: cada navegador envía un latido cada 4 s.
export default async (req) => {
  const store = getStore({ name: "presence", consistency: "strong" });
  const now = Date.now();

  if (req.method === "POST") {
    let b = null;
    try { b = JSON.parse(await req.text()); } catch {}
    if (b && typeof b.id === "string" && /^[a-z0-9]{4,16}$/.test(b.id)) {
      if (b.leave) await store.delete(b.id);
      else await store.setJSON(b.id, {
        id: b.id,
        n: String(b.n || "Anónimo").slice(0, 20),
        st: b.st === "play" ? "play" : "menu",
        sg: String(b.sg || "").slice(0, 40),
        df: String(b.df || "").slice(0, 10),
        sc: Math.max(0, Math.min(3000000, Math.round(Number(b.sc) || 0))),
        ts: now,
      });
    }
  }

  const { blobs } = await store.list();
  const all = (await Promise.all(blobs.map((x) => store.get(x.key, { type: "json" })))).filter(Boolean);
  const stale = all.filter((p) => now - p.ts > 60000);
  if (stale.length) await Promise.all(stale.map((p) => store.delete(p.id)));
  const live = all.filter((p) => now - p.ts < 15000).map(({ ts, ...p }) => p);
  return Response.json(live, { headers: { "cache-control": "no-store" } });
};

export const config = { path: "/api/presence" };
