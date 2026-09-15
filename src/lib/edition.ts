import { createServerFn } from "@tanstack/react-start";
import { PAPERS } from "@/data/papers";
import { CRAWL, CRAWL_AT } from "@/data/x-crawl";
import { MAIL, MAIL_AT } from "@/data/mail";
import { TASTE, TASTE_AT } from "@/data/x-taste";
import { DIGEST_ITEMS } from "@/data/digest-pack";
import { compileDigest, type Edition, type PaperRow } from "@/lib/compile";
import { mapDailyPapers } from "@/lib/hf-map";
import { type SourceLog } from "@/lib/ingest-log";
import { loadWires } from "@/lib/wire";
import { loadTracker } from "@/lib/tracker";
import { loadMetr } from "@/lib/metr";

export type { SourceLog } from "@/lib/ingest-log";
export { snapshotIngest } from "@/lib/ingest-log";

export type EditionPack = {
  edition: Edition;
  ingest: SourceLog[];
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
      log: {
        id: "hf",
        label: "Papers",
        live: true,
        ok: false,
        count: 0,
        ms,
        at,
        note: "Unreachable · using last board",
      },
    };
  }
}

export const fetchEdition = createServerFn({ method: "GET" }).handler(async (): Promise<EditionPack> => {
  const [paperPack, wirePack, trackerPack, metrPack] = await Promise.all([
    loadLivePapers(),
    loadWires(),
    loadTracker(),
    loadMetr(),
  ]);
  const at = new Date().toISOString();
  const edition = compileDigest({
    items: DIGEST_ITEMS,
    papers: paperPack.papers,
    crawl: CRAWL,
    mail: MAIL,
    wires: [...wirePack.stories, ...metrPack.aisi],
    tracker: trackerPack.hits,
    metr: metrPack.stories,
    at,
  });
  return {
    edition,
    ingest: [
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
        note: "Newsletter highlights · last pull 15 Sep",
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
    ],
  };
});
