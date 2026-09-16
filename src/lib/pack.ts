import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { editionCounts, renderEdition, type Edition } from "./compile.ts";
import type { SourceLog } from "./ingest-log.ts";

export function sageRoot(root = process.env.SAGE_PACK_ROOT || process.cwd()) {
  return join(root, "artifacts/sage");
}

export function packDir(root?: string) {
  return join(sageRoot(root), "packs");
}

export function currentPath(root?: string) {
  return join(sageRoot(root), "CURRENT.json");
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
    papersKeep: edition.papersKeep.map((p) => ({ id: p.id, title: p.title, up: p.up })),
    hn: edition.hn.slice(0, 12).map((h) => ({ id: h.id, title: h.title, points: h.points, href: h.href })),
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
  return { ...meta, md };
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
        const raw = JSON.parse(readFileSync(join(dir, f), "utf8")) as PackMeta;
        const md = includeMd ? readPackMarkdown(id, root) : undefined;
        return {
          id: raw.id || id,
          at: raw.at || "",
          skim: Array.isArray(raw.skim) ? raw.skim : [],
          updates: raw.updates ?? 0,
          papers: raw.papers ?? 0,
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
