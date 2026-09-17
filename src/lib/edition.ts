import { createServerFn } from "@tanstack/react-start";
import { PAPERS } from "@/data/papers";
import { CRAWL, CRAWL_AT } from "@/data/x-crawl";
import { MAIL, MAIL_AT } from "@/data/mail";
import { TASTE, TASTE_AT } from "@/data/x-taste";
import { compileDigest, type Edition, type PaperRow } from "@/lib/compile";
import { mapDailyPapers } from "@/lib/hf-map";
import { type SourceLog } from "@/lib/ingest-log";
import { loadWires } from "@/lib/wire";
import { loadTracker } from "@/lib/tracker";
import { loadMetr } from "@/lib/metr";
import { loadHn } from "@/lib/hn";
import { enrichPapers } from "@/lib/arxiv";
import { diffPull, EMPTY_DELTA, type PullDelta } from "@/lib/delta";
import { lastSeedEdition, lastSeedPack } from "@/lib/seed";

export type { SourceLog } from "@/lib/ingest-log";
export { snapshotIngest } from "@/lib/ingest-log";

export type PackMeta = {
  id: string;
  at: string;
  skim: string[];
  updates: number;
  papers: number;
  md?: string;
};

export type EditionPack = {
  edition: Edition;
  ingest: SourceLog[];
  packs: PackMeta[];
  delta: PullDelta;
};

async function loadLivePapers(): Promise<{ papers: PaperRow[]; log: SourceLog }> {
  const t0 = Date.now();
  const at = new Date().toISOString();
  try {
    const r = await fetch("https://huggingface.co/api/daily_papers", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    const ms = Date.now() - t0;
    if (!r.ok) {
      return {
        papers: PAPERS,
        log: { id: "hf", label: "Papers", live: true, ok: false, count: 0, ms, at, note: `Hugging Face HTTP ${r.status} · using last board` },
      };
    }
    const raw = (await r.json()) as Parameters<typeof mapDailyPapers>[0];
    const papers = mapDailyPapers(Array.isArray(raw) ? raw : []);
    if (!papers.length) {
      return {
        papers: PAPERS,
        log: { id: "hf", label: "Papers", live: true, ok: false, count: 0, ms, at, note: "Empty board · using last board" },
      };
    }
    return {
      papers,
      log: {
        id: "hf",
        label: "Papers",
        live: true,
        ok: true,
        count: papers.length,
        ms,
        at,
        note: `${papers.filter((p) => p.keep).length} kept · keep is not upvote`,
      },
    };
  } catch {
    const ms = Date.now() - t0;
    return {
      papers: PAPERS,
      log: { id: "hf", label: "Papers", live: true, ok: false, count: 0, ms, at, note: "Unreachable · using last board" },
    };
  }
}

export const fetchLastPack = createServerFn({ method: "GET" }).handler(async (): Promise<EditionPack> => {
  try {
    const { readLast, listPacks } = await import("@/lib/pack");
    const last = readLast();
    if (last?.edition?.lead?.id) {
      return { edition: last.edition, ingest: last.ingest, packs: listPacks(true), delta: EMPTY_DELTA };
    }
  } catch {
    /* seed */
  }
  return lastSeedPack();
});

export const fetchEdition = createServerFn({ method: "GET" }).handler(async (): Promise<EditionPack> => {
  const papersP = loadLivePapers().then(async (paperPack) => ({
    ...paperPack,
    papers: await enrichPapers(paperPack.papers),
  }));
  const [paperPack, wirePack, trackerPack, metrPack, hnPack] = await Promise.all([
    papersP,
    loadWires(),
    loadTracker(),
    loadMetr(),
    loadHn(),
  ]);
  const at = new Date().toISOString();
  const edition = compileDigest({
    papers: paperPack.papers,
    crawl: CRAWL,
    mail: MAIL,
    wires: [...wirePack.stories, ...metrPack.aisi],
    tracker: trackerPack.hits,
    metr: metrPack.stories,
    hn: hnPack.hits,
    at,
    liveWires: true,
  });
  const ingest: SourceLog[] = [
    {
      id: "metr",
      label: "METR",
      live: true,
      ok: metrPack.ok,
      count: metrPack.stories.length,
      ms: metrPack.ms,
      at: metrPack.at,
      note: metrPack.note,
    },
    {
      id: "wire",
      label: "Wire",
      live: true,
      ok: wirePack.ok,
      count: wirePack.stories.filter((s) => s.keep).length,
      ms: wirePack.ms,
      at: wirePack.at,
      note: wirePack.note,
    },
    paperPack.log,
    {
      id: "tracker",
      label: "Tracker",
      live: true,
      ok: trackerPack.ok,
      count: trackerPack.hits.length,
      ms: trackerPack.ms,
      at: trackerPack.at,
      note: trackerPack.note,
    },
    {
      id: "hn",
      label: "HN",
      live: true,
      ok: hnPack.ok,
      count: hnPack.hits.length,
      ms: hnPack.ms,
      at: hnPack.at,
      note: hnPack.note,
    },
    {
      id: "x",
      label: "X",
      live: false,
      ok: true,
      count: CRAWL.length,
      ms: 0,
      at: CRAWL_AT,
      note: "Curran-class snapshot · ranked on compile · no paid firehose",
    },
    {
      id: "mail",
      label: "Inbox",
      live: false,
      ok: true,
      count: MAIL.length,
      ms: 0,
      at: MAIL_AT,
      note: "Newsletter snapshot · ranked on compile",
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      live: false,
      ok: true,
      count: TASTE.length,
      ms: 0,
      at: TASTE_AT,
      note: "Never the lead",
    },
  ];
  let prev: Edition | null = null;
  try {
    const { readLast } = await import("@/lib/pack");
    prev = readLast()?.edition ?? null;
  } catch {
    prev = null;
  }
  const delta = diffPull(prev ?? lastSeedEdition(), edition);
  let packs: PackMeta[] = [];
  try {
    const { writePack, listPacks } = await import("@/lib/pack");
    writePack(edition, ingest);
    packs = listPacks(true);
  } catch {
    packs = [];
  }
  return { edition, ingest, packs, delta };
});
