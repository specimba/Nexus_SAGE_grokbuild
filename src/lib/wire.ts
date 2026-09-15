import { keepWire } from "./keep.ts";
import { rankClaim, tagFromRank, type PulseTag } from "./rank.ts";

export type WireBeat = "security" | "investigation" | "measurement" | "org";

export type WireStory = {
  id: string;
  title: string;
  summary: string;
  href: string;
  at: string;
  keep: boolean;
  rank: PulseTag;
  reason: string;
  outlet: string;
  beat?: WireBeat;
};

const MAX_AGE_MS = 21 * 24 * 60 * 60 * 1000;
const EVAL_DESKS = new Set(["Redwood", "Alignment Forum", "AI Snake Oil", "Transformer", "UK AISI", "Import AI", "Epoch", "Zvi"]);

const FEEDS: { name: string; url: string; kind: "atom" | "rss"; titlesOnly?: boolean; timeout?: number }[] = [
  { name: "HuggingNews", url: "https://huggingnews.com/feed.xml", kind: "atom" },
  { name: "Alignment Forum", url: "https://www.alignmentforum.org/feed.xml", kind: "rss" },
  { name: "Transformer", url: "https://www.transformernews.ai/feed", kind: "rss" },
  { name: "Redwood", url: "https://blog.redwoodresearch.org/feed", kind: "rss" },
  { name: "AI Snake Oil", url: "https://www.aisnakeoil.com/feed", kind: "rss" },
  { name: "Import AI", url: "https://jack-clark.net/feed/", kind: "rss" },
  { name: "Epoch", url: "https://epochai.substack.com/feed", kind: "rss", titlesOnly: true },
  { name: "Zvi", url: "https://thezvi.substack.com/feed", kind: "rss", titlesOnly: true, timeout: 12000 },
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", kind: "rss", titlesOnly: true },
];

function decode(s: string) {
  const amp = ["&", "amp", ";"].join("");
  const quot = ["&", "quot", ";"].join("");
  const apos = ["&", "apos", ";"].join("");
  const lt = ["&", "lt", ";"].join("");
  const gt = ["&", "gt", ";"].join("");
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(new RegExp(quot, "gi"), '"')
    .replace(/&#39;/g, "'")
    .replace(new RegExp(apos, "gi"), "'")
    .replace(new RegExp(lt, "gi"), "<")
    .replace(new RegExp(gt, "gi"), ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(new RegExp(amp, "gi"), "&")
    .replace(/\s+/g, " ")
    .trim();
}

function field(block: string, tag: string) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decode(m[1]) : "";
}

function hrefOf(block: string) {
  const alt = block.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i);
  if (alt?.[1]) return alt[1];
  const any = block.match(/<link[^>]*href="([^"]+)"/i);
  if (any?.[1]) return any[1];
  return field(block, "link");
}

function toIso(raw: string) {
  const t = Date.parse(raw);
  return Number.isFinite(t) ? new Date(t).toISOString() : raw;
}

function keepEvalDesk(outlet: string, title: string, summary: string) {
  const t = `${title} ${summary}`;
  if (keepWire(title, summary, outlet)) return true;
  if (!EVAL_DESKS.has(outlet)) return false;
  if (/gdp statistics|nvidia-sized hole|music v2|voice price/i.test(t)) return false;
  return /brief|benchmark|compute|capability|horizon|rsi|eval|incident|agent|metr|pace the frontier|oversight|monitor/i.test(t);
}

function storyOf(title: string, summary: string, href: string, at: string, id: string, outlet: string): WireStory | null {
  if (!title) return null;
  let verdict = rankClaim(`${title} ${summary}`);
  if (verdict.rank === "unconfirmed" && EVAL_DESKS.has(outlet)) {
    verdict = { rank: "also", reason: "Eval-desk writing. Not a rumor — and not a replacement for the lead." };
  }
  return {
    id: id || href || title,
    title,
    summary: summary.slice(0, 420),
    href,
    at: toIso(at),
    keep: keepEvalDesk(outlet, title, summary),
    rank: tagFromRank(verdict.rank),
    reason: verdict.reason,
    outlet,
  };
}

function fresh(stories: WireStory[]) {
  const cutoff = Date.now() - MAX_AGE_MS;
  return stories.filter((s) => {
    const t = Date.parse(s.at);
    return !Number.isFinite(t) || t >= cutoff;
  });
}

function capPerOutlet(stories: WireStory[], n: number) {
  const seen: Record<string, number> = {};
  return stories.filter((s) => {
    seen[s.outlet] = (seen[s.outlet] ?? 0) + 1;
    return seen[s.outlet] <= n;
  });
}

export function parseAtom(xml: string, outlet = "HuggingNews"): WireStory[] {
  const chunks = xml.split(/<entry[\s>]/i).slice(1);
  const stories = chunks
    .map((raw) => {
      const block = raw.split(/<\/entry>/i)[0] ?? raw;
      return storyOf(
        field(block, "title"),
        field(block, "summary") || field(block, "content"),
        hrefOf(block),
        field(block, "published") || field(block, "updated") || "",
        field(block, "id") || hrefOf(block),
        outlet,
      );
    })
    .filter((s): s is WireStory => Boolean(s));
  return fresh(stories);
}

export function parseRss(xml: string, outlet: string, titlesOnly = false): WireStory[] {
  const chunks = xml.split(/<item[\s>]/i).slice(1);
  const stories = chunks
    .map((raw) => {
      const block = raw.split(/<\/item>/i)[0] ?? raw;
      const href = hrefOf(block);
      const summary = titlesOnly ? "" : field(block, "description") || field(block, "content:encoded");
      return storyOf(field(block, "title"), summary, href, field(block, "pubDate") || field(block, "dc:date") || "", field(block, "guid") || href, outlet);
    })
    .filter((s): s is WireStory => Boolean(s));
  return fresh(stories);
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<{ stories: WireStory[]; ok: boolean; ms: number }> {
  const t0 = Date.now();
  try {
    const r = await fetch(feed.url, {
      headers: { Accept: "application/atom+xml, application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(feed.timeout ?? 8000),
    });
    const ms = Date.now() - t0;
    if (!r.ok) return { stories: [], ok: false, ms };
    const xml = await r.text();
    const stories = feed.kind === "atom" ? parseAtom(xml, feed.name) : parseRss(xml, feed.name, feed.titlesOnly);
    return { stories, ok: stories.length > 0, ms };
  } catch {
    return { stories: [], ok: false, ms: Date.now() - t0 };
  }
}

export async function loadWires(): Promise<{ stories: WireStory[]; ok: boolean; ms: number; at: string; note: string }> {
  const t0 = Date.now();
  const packs = await Promise.all(FEEDS.map(fetchFeed));
  const stories = capPerOutlet(
    packs
      .flatMap((p) => p.stories)
      .sort((a, b) => {
        if (a.keep !== b.keep) return a.keep ? -1 : 1;
        return Date.parse(b.at) - Date.parse(a.at);
      }),
    6,
  );
  const ok = packs.some((p) => p.ok);
  const kept = stories.filter((s) => s.keep);
  const outlets = [...new Set(kept.map((s) => s.outlet))];
  const at = stories[0]?.at || new Date().toISOString();
  return {
    stories,
    ok,
    ms: Date.now() - t0,
    at,
    note: ok
      ? `${kept.length} kept of ${stories.length} · ${outlets.join(" · ") || "no keep"} · ranked, not a lab primary`
      : "Unreachable · no snapshot",
  };
}

/** @deprecated use loadWires */
export const loadHuggingNews = loadWires;
