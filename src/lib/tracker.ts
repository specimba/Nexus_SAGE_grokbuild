export type TrackerHit = {
  id: string;
  title: string;
  source: string;
  href: string;
  at: string;
  models: string[];
  keep: boolean;
  official: boolean;
  kind: string;
};

type RawEvent = {
  id?: string;
  title?: string;
  summary?: string;
  sourceName?: string;
  url?: string;
  detectedAt?: string;
  category?: string;
  type?: string;
  addedModels?: string[];
  newReleaseModels?: string[];
  officialSignal?: boolean;
  genuineNewRelease?: boolean;
  officialPreview?: boolean;
};

export function keepTracker(e: RawEvent) {
  if (e.category === "benchmark-change" || e.type === "ranked-benchmark") return false;
  if (e.type === "app-bundle-strings") return false;
  if (e.category === "model-change") return true;
  if (e.officialSignal || e.genuineNewRelease || e.officialPreview) return true;
  return false;
}

export function mapTrackerEvents(raw: RawEvent[]): TrackerHit[] {
  return raw.map((e) => {
    const models = [...(e.addedModels ?? []), ...(e.newReleaseModels ?? [])].filter(Boolean).slice(0, 8);
    const title = (e.title || e.summary || (models.length ? `Added ${models.join(", ")}` : e.sourceName) || "Change").trim();
    return {
      id: e.id || `${e.sourceName}-${e.detectedAt}`,
      title,
      source: e.sourceName || "tracker",
      href: e.url || "https://ai-tracker.ssh.codes/",
      at: e.detectedAt || "",
      models,
      keep: keepTracker(e),
      official: Boolean(e.officialSignal || e.genuineNewRelease || e.officialPreview),
      kind: e.category || e.type || "change",
    };
  });
}

export async function loadTracker(): Promise<{ hits: TrackerHit[]; ok: boolean; ms: number; at: string; note: string; sources: number }> {
  const t0 = Date.now();
  const at = new Date().toISOString();
  try {
    const r = await fetch("https://ai-tracker.ssh.codes/api/events?limit=80", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    const ms = Date.now() - t0;
    if (!r.ok) {
      return { hits: [], ok: false, ms, at, note: `Tracker HTTP ${r.status}`, sources: 0 };
    }
    const body = (await r.json()) as { events?: RawEvent[] };
    const hits = mapTrackerEvents(Array.isArray(body.events) ? body.events : []);
    const kept = hits.filter((h) => h.keep);
    return {
      hits: kept,
      ok: true,
      ms,
      at: kept[0]?.at || at,
      note: `${kept.length} model/docs changes · ${hits.length - kept.length} leaderboard ticks dropped`,
      sources: hits.length,
    };
  } catch {
    return { hits: [], ok: false, ms: Date.now() - t0, at, note: "Unreachable · no snapshot", sources: 0 };
  }
}
