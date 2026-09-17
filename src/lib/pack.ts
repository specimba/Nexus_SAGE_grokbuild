import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { compileDigest, editionCounts, renderEdition, type Card, type CardKind, type Edition } from "./compile.ts";
import type { SourceId, SourceLog } from "./ingest-log.ts";
import type { PulseTag } from "./rank.ts";
import type { WireBeat, WireStory } from "./wire.ts";
import type { TrackerHit } from "./tracker.ts";

export function sageRoot(root = process.env.SAGE_PACK_ROOT || process.cwd()) {
  return join(root, "artifacts/sage");
}

export function packDir(root?: string) {
  return join(sageRoot(root), "packs");
}

export function currentPath(root?: string) {
  return join(sageRoot(root), "CURRENT.json");
}

export function lastPath(root?: string) {
  return join(sageRoot(root), "LAST.json");
}

export type PackMeta = {
  id: string;
  at: string;
  skim: string[];
  updates: number;
  papers: number;
  md?: string;
};

function keyOf(at: string) {
  return at.slice(0, 13).replace(/[^\dT-]/g, "");
}

export function writePack(edition: Edition, ingest: SourceLog[], root?: string): PackMeta {
  const dir = packDir(root);
  mkdirSync(dir, { recursive: true });
  const id = keyOf(edition.at);
  const meta: PackMeta = {
    id,
    at: edition.at,
    skim: edition.skim,
    updates: edition.updates.length,
    papers: edition.papersKeep.length,
  };
  const json = {
    ...meta,
    bottomLine: edition.bottomLine,
    lead: { id: edition.lead.id, title: edition.lead.title, take: edition.lead.take },
    updates: edition.updates.map((c) => ({ kind: c.kind, outlet: c.outlet, title: c.title, why: c.why, href: c.href, at: c.at })),
    related: edition.related.map((c) => ({ kind: c.kind, outlet: c.outlet, title: c.title, why: c.why, href: c.href })),
    also: edition.also.map((c) => ({ kind: c.kind, outlet: c.outlet, title: c.title })),
    rumours: edition.rumours.map((c) => ({ kind: c.kind, outlet: c.outlet, title: c.title, why: c.why })),
    papersKeep: edition.papersKeep.map((p) => ({ id: p.id, title: p.title, up: p.up, keep: true, href: p.href })),
    wiresKeep: edition.wiresKeep.slice(0, 40).map((w) => ({
      id: w.id,
      title: w.title,
      summary: (w.summary || "").slice(0, 220),
      href: w.href,
      at: w.at,
      keep: w.keep,
      rank: w.rank,
      reason: w.reason,
      outlet: w.outlet,
      beat: w.beat,
    })),
    metr: edition.metr.slice(0, 12).map((w) => ({
      id: w.id,
      title: w.title,
      summary: (w.summary || "").slice(0, 220),
      href: w.href,
      at: w.at,
      keep: w.keep,
      rank: w.rank,
      reason: w.reason,
      outlet: w.outlet,
      beat: w.beat,
    })),
    tracker: edition.tracker.slice(0, 12).map((h) => ({
      id: h.id,
      title: h.title,
      source: h.source,
      href: h.href,
      at: h.at,
      keep: h.keep,
      kind: h.kind,
      official: h.official,
      models: h.models,
    })),
    hn: edition.hn.slice(0, 12).map((h) => ({ id: h.id, title: h.title, points: h.points, href: h.href, at: h.at, author: h.author, comments: h.comments, query: h.query })),
    counts: editionCounts(edition),
    ingest: ingest.map((s) => ({ id: s.id, ok: s.ok, count: s.count, note: s.note, at: s.at })),
  };
  const md = renderEdition(edition);
  writeFileSync(join(dir, `${id}.json`), JSON.stringify(json, null, 2));
  writeFileSync(join(dir, `${id}.md`), md);
  writeFileSync(
    currentPath(root),
    JSON.stringify(
      {
        schema: 1,
        compiled_at: edition.at,
        lead: edition.lead.id,
        skim: edition.skim,
        updates: edition.updates.length,
        papers: edition.papersKeep.length,
        hn: edition.hn.length,
        pack: id,
        note: "Compiled from live ingest. Hugging Face swarm is the standing lead. Packs are evidence, not a lock.",
      },
      null,
      2,
    ),
  );
  prunePacks(24, root);
  writeLast(edition, ingest, root);
  return { ...meta, md };
}

const SOURCE_LABEL: Record<string, string> = {
  metr: "METR",
  wire: "Wire",
  hf: "Papers",
  tracker: "Tracker",
  hn: "HN",
  x: "X",
  mail: "Inbox",
  bookmarks: "Bookmarks",
};

function cardFromPack(c: { id?: string; kind?: CardKind; outlet?: string; title?: string; why?: string; take?: string; href?: string; at?: string }, kind: CardKind): Card {
  return {
    id: c.id || c.href || c.title || kind,
    kind: c.kind || kind,
    title: c.title || "",
    take: c.take || c.title || "",
    why: c.why || "",
    outlet: c.outlet || "",
    href: c.href,
    at: c.at || "",
    live: true,
  };
}

function ingestFromPack(raw: { id?: string; ok?: boolean; count?: number; note?: string; at?: string; label?: string; live?: boolean; ms?: number }[]): SourceLog[] {
  return raw.map((s) => {
    const id = (s.id || "wire") as SourceId;
    return {
      id,
      label: s.label || SOURCE_LABEL[id] || id,
      live: s.live ?? !["x", "mail", "bookmarks"].includes(id),
      ok: s.ok ?? false,
      count: s.count ?? 0,
      ms: s.ms ?? 0,
      at: s.at || "",
      note: s.note || "",
    };
  });
}

type StoredWire = {
  id?: string;
  title?: string;
  summary?: string;
  href?: string;
  at?: string;
  keep?: boolean;
  rank?: PulseTag;
  reason?: string;
  outlet?: string;
  beat?: WireBeat;
};

function wireFromPack(w: StoredWire): WireStory {
  return {
    id: w.id || w.href || w.title || "wire",
    title: w.title || "",
    summary: w.summary || "",
    href: w.href || "",
    at: w.at || "",
    keep: w.keep ?? true,
    rank: w.rank || "rest",
    reason: w.reason || "",
    outlet: w.outlet || "",
    beat: w.beat,
  };
}

function trackerFromPack(h: Partial<TrackerHit> & { id?: string; title?: string }): TrackerHit {
  return {
    id: h.id || h.href || h.title || "tracker",
    title: h.title || "",
    source: h.source || "",
    href: h.href || "",
    at: h.at || "",
    models: h.models || [],
    keep: h.keep ?? true,
    official: h.official ?? false,
    kind: h.kind || "model-change",
  };
}

type StoredPack = {
  at?: string;
  skim?: string[];
  bottomLine?: string;
  updates?: Parameters<typeof cardFromPack>[0][];
  related?: Parameters<typeof cardFromPack>[0][];
  also?: Parameters<typeof cardFromPack>[0][];
  rumours?: Parameters<typeof cardFromPack>[0][];
  papersKeep?: Edition["papersKeep"];
  wiresKeep?: StoredWire[];
  metr?: StoredWire[];
  tracker?: Parameters<typeof trackerFromPack>[0][];
  hn?: Edition["hn"];
  ingest?: { id?: string; ok?: boolean; count?: number; note?: string; at?: string }[];
};

export function editionFromStored(raw: StoredPack): Edition {
  const ed = compileDigest({
    at: raw.at || new Date().toISOString(),
    wires: (raw.wiresKeep || []).map(wireFromPack),
    metr: (raw.metr || []).map(wireFromPack),
    hn: Array.isArray(raw.hn) ? raw.hn : [],
    liveWires: Boolean(raw.wiresKeep?.length),
  });
  return {
    ...ed,
    at: raw.at || ed.at,
    skim: Array.isArray(raw.skim) && raw.skim.length ? raw.skim : ed.skim,
    bottomLine: raw.bottomLine || ed.bottomLine,
    updates: (raw.updates || []).map((c) => cardFromPack(c, "update")),
    related: (raw.related || []).map((c) => cardFromPack(c, "related")),
    also: (raw.also || []).map((c) => cardFromPack(c, "also")),
    rumours: (raw.rumours || []).map((c) => cardFromPack(c, "rumor")),
    papersKeep: raw.papersKeep?.length ? raw.papersKeep.map((p) => ({ ...p, keep: true, href: p.href || `https://arxiv.org/abs/${p.id}` })) : ed.papersKeep,
    wiresKeep: raw.wiresKeep?.length ? raw.wiresKeep.map(wireFromPack) : ed.wiresKeep,
    metr: raw.metr?.length ? raw.metr.map(wireFromPack) : ed.metr,
    tracker: raw.tracker?.length ? raw.tracker.map(trackerFromPack) : ed.tracker,
    hn: Array.isArray(raw.hn) ? raw.hn.map((h) => ({ ...h, at: h.at || "", author: h.author || "", comments: h.comments || 0, query: h.query || "" })) : ed.hn,
  };
}

export function writeLast(edition: Edition, ingest: SourceLog[], root?: string) {
  mkdirSync(sageRoot(root), { recursive: true });
  writeFileSync(lastPath(root), JSON.stringify({ edition, ingest }));
}

export function readLast(root?: string): { edition: Edition; ingest: SourceLog[] } | null {
  const path = lastPath(root);
  if (existsSync(path)) {
    try {
      const raw = JSON.parse(readFileSync(path, "utf8")) as { edition?: Edition; ingest?: SourceLog[] };
      if (raw?.edition?.lead?.id) {
        return { edition: raw.edition, ingest: Array.isArray(raw.ingest) ? raw.ingest : [] };
      }
    } catch {
      /* fall through to pack */
    }
  }
  const dir = packDir(root);
  if (!existsSync(dir)) return null;
  const newest = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse()[0];
  if (!newest) return null;
  try {
    const raw = JSON.parse(readFileSync(join(dir, newest), "utf8")) as StoredPack;
    return {
      edition: editionFromStored(raw),
      ingest: ingestFromPack(Array.isArray(raw.ingest) ? raw.ingest : []),
    };
  } catch {
    return null;
  }
}

function prunePacks(keep: number, root?: string) {
  const dir = packDir(root);
  if (!existsSync(dir)) return;
  const jsons = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();
  for (const f of jsons.slice(keep)) {
    try {
      unlinkSync(join(dir, f));
      const md = f.replace(/\.json$/, ".md");
      if (existsSync(join(dir, md))) unlinkSync(join(dir, md));
    } catch {
      /* ignore */
    }
  }
}

export function listPacks(includeMd = false, root?: string): PackMeta[] {
  const dir = packDir(root);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse()
    .slice(0, 12)
    .map((f) => {
      const id = f.replace(/\.json$/, "");
      try {
        const raw = JSON.parse(readFileSync(join(dir, f), "utf8")) as Record<string, unknown>;
        const md = includeMd ? readPackMarkdown(id, root) : undefined;
        const updatesRaw = raw.updates;
        return {
          id: String(raw.id || id),
          at: String(raw.at || ""),
          skim: Array.isArray(raw.skim) ? (raw.skim as string[]) : [],
          updates: typeof updatesRaw === "number" ? updatesRaw : Array.isArray(updatesRaw) ? updatesRaw.length : 0,
          papers: typeof raw.papers === "number" ? raw.papers : 0,
          md: md || undefined,
        };
      } catch {
        return { id, at: "", skim: [], updates: 0, papers: 0 };
      }
    });
}

export function readPackMarkdown(id: string, root?: string) {
  const path = join(packDir(root), `${id.replace(/[^\dT-]/g, "")}.md`);
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
}
