/** HN Algolia — Pulse chatter only. Never a briefing card. Free, no key. */

export type HnHit = {
  id: string;
  title: string;
  href: string;
  at: string;
  points: number;
  author: string;
  comments: number;
  query: string;
};

const UA = "NEXUS-SAGE-desk/0.2 (free-ingest; HN Algolia)";
const API = "https://hn.algolia.com/api/v1/search";

/** Standing watchlist. No Sol, no Astra, no incident nouns as queries. */
export const HN_WATCHLIST = [
  "OpenAI",
  "Anthropic",
  "Hugging Face",
  "agents",
  "eval",
  "LLM",
  "METR",
  "ML security",
  "open weights",
  "inference",
  "benchmark",
  "agent tooling",
] as const;

export const HN_BAN = ["sol", "astra", "jailbreak", "hf breach", "persistent sol"] as const;
export const HN_PER_TICK = 3;
export const HN_CAP = 12;
export const HN_MAX_AGE_MS = 21 * 24 * 60 * 60 * 1000;

export function hnQuerySafe(query: string) {
  const lower = query.trim().toLowerCase();
  if (!lower) return false;
  return !HN_BAN.some((b) => lower === b || lower === b.replace(/\s+/g, "-"));
}

export function pickHnQueries(now = Date.now(), list: readonly string[] = HN_WATCHLIST): string[] {
  const safe = list.filter(hnQuerySafe);
  if (!safe.length) return [];
  const n = Math.min(HN_PER_TICK, safe.length);
  const start = Math.floor(now / 86_400_000) % safe.length;
  return Array.from({ length: n }, (_, i) => safe[(start + i) % safe.length]!);
}

export function hnSearchUrl(query: string, now = Date.now()) {
  const since = Math.floor((now - HN_MAX_AGE_MS) / 1000);
  return `${API}?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=8&numericFilters=${encodeURIComponent(`created_at_i>${since}`)}`;
}

type AlgoliaHit = {
  objectID?: string;
  title?: string | null;
  url?: string | null;
  story_url?: string | null;
  author?: string | null;
  points?: number | null;
  num_comments?: number | null;
  created_at?: string | null;
};

export function mapHnHits(raw: AlgoliaHit[], query = ""): HnHit[] {
  const out: HnHit[] = [];
  const seen = new Set<string>();
  for (const h of raw) {
    const title = (h.title || "").trim();
    if (!title) continue;
    const href = h.url || h.story_url || `https://news.ycombinator.com/item?id=${h.objectID}`;
    const id = String(h.objectID || href);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      title,
      href,
      at: h.created_at || "",
      points: Number(h.points) || 0,
      author: h.author || "",
      comments: Number(h.num_comments) || 0,
      query,
    });
  }
  return out;
}

async function search(query: string): Promise<HnHit[]> {
  const r = await fetch(hnSearchUrl(query), {
    headers: { Accept: "application/json", "User-Agent": UA },
    signal: AbortSignal.timeout(5000),
  });
  if (!r.ok) return [];
  const body = (await r.json()) as { hits?: AlgoliaHit[] };
  return mapHnHits(Array.isArray(body.hits) ? body.hits : [], query);
}

export async function loadHn(): Promise<{ hits: HnHit[]; ok: boolean; ms: number; at: string; note: string; queries: string[] }> {
  const t0 = Date.now();
  const at = new Date().toISOString();
  const queries = pickHnQueries();
  try {
    const packs = await Promise.all(queries.map(search));
    const seen = new Set<string>();
    const hits: HnHit[] = [];
    for (const h of packs.flat().sort((a, b) => b.points - a.points || b.at.localeCompare(a.at))) {
      if (seen.has(h.id)) continue;
      seen.add(h.id);
      hits.push(h);
      if (hits.length >= HN_CAP) break;
    }
    const ok = hits.length > 0;
    return {
      hits,
      ok,
      ms: Date.now() - t0,
      at: hits[0]?.at || at,
      queries,
      note: ok
        ? `${hits.length} stories · last 21 days · ${queries.join(" · ")} · Pulse only · never the briefing`
        : "Unreachable · no snapshot",
    };
  } catch {
    return { hits: [], ok: false, ms: Date.now() - t0, at, queries, note: "Unreachable · no snapshot" };
  }
}
