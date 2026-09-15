import type { PulseTag } from "./rank.ts";
import type { WireBeat, WireStory } from "./wire.ts";

const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const CAP = 8;
const METR_FEED = "https://metr.org/feed.xml";
const AISI_FEED = "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_aisi.xml";

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

/** Drop METR translations of the same English post. */
export function isEnglishMetr(href: string, title: string) {
  if (/\/(zh-Hans|zh-hant|zh|es|ja|ko|fr|de|pt-br|pt|ru)\//i.test(href)) return false;
  if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(title)) return false;
  return true;
}

export function metrRank(title: string, href = ""): { rank: PulseTag; reason: string; beat: WireBeat } {
  const t = `${title} ${href}`.toLowerCase();
  if (/hugging.?face|openai-hugging-face-incident/.test(t)) {
    return {
      rank: "lead-bond",
      beat: "investigation",
      reason: "METR primary on the known escape. Update the lead — do not replace it.",
    };
  }
  if (/security|api key|stole|stolen|probed|infrastructure/.test(t)) {
    return {
      rank: "companion",
      beat: "security",
      reason: "METR was itself attacked. Same agent-attack class, different target. Governance primary — not a lead swap.",
    };
  }
  if (/funding|raised|hiring|staff/.test(t)) {
    return {
      rank: "rest",
      beat: "org",
      reason: "METR capacity. Lab transfers raise the weight. Not a production fact.",
    };
  }
  return {
    rank: "rest",
    beat: "measurement",
    reason: "METR primary. Independent evaluator. Not a rumor.",
  };
}

/** Lead-bond first, then METR’s own security, then the rest. */
export function sortMetr(stories: WireStory[]): WireStory[] {
  const weight = (s: WireStory) => {
    if (s.rank === "lead-bond") return 0;
    if (s.beat === "security") return 1;
    return 2;
  };
  return [...stories].sort((a, b) => weight(a) - weight(b) || Date.parse(b.at) - Date.parse(a.at));
}

export function parseMetrRss(xml: string): WireStory[] {
  const cutoff = Date.now() - MAX_AGE_MS;
  const chunks = xml.split(/<item[\s>]/i).slice(1);
  const stories: WireStory[] = [];
  for (const raw of chunks) {
    const block = raw.split(/<\/item>/i)[0] ?? raw;
    const title = field(block, "title");
    if (!title) continue;
    const href = hrefOf(block);
    if (!isEnglishMetr(href, title)) continue;
    const at = toIso(field(block, "pubDate") || field(block, "dc:date") || "");
    const ts = Date.parse(at);
    if (Number.isFinite(ts) && ts < cutoff) continue;
    const verdict = metrRank(title, href);
    stories.push({
      id: field(block, "guid") || href || title,
      title,
      summary: verdict.reason,
      href,
      at,
      keep: true,
      rank: verdict.rank,
      reason: verdict.reason,
      outlet: "METR",
      beat: verdict.beat,
    });
    if (stories.length >= CAP) break;
  }
  return sortMetr(stories);
}

export function parseAisiRss(xml: string): WireStory[] {
  const cutoff = Date.now() - MAX_AGE_MS;
  const chunks = xml.split(/<item[\s>]/i).slice(1);
  const stories: WireStory[] = [];
  for (const raw of chunks) {
    const block = raw.split(/<\/item>/i)[0] ?? raw;
    const title = field(block, "title");
    if (!title) continue;
    const href = hrefOf(block);
    const at = toIso(field(block, "pubDate") || field(block, "dc:date") || "");
    const ts = Date.parse(at);
    if (Number.isFinite(ts) && ts < cutoff) continue;
    const t = title.toLowerCase();
    const keep = /incident|agent|eval|monitor|control|cyber|optstop|stopping/.test(t);
    if (!keep) continue;
    stories.push({
      id: field(block, "guid") || href || title,
      title,
      summary: "UK AISI primary. Independent of the labs. Not a Hugging Face replacement.",
      href,
      at,
      keep: true,
      rank: "rest",
      reason: "UK AISI primary. Not a rumor.",
      outlet: "UK AISI",
      beat: "measurement",
    });
    if (stories.length >= 6) break;
  }
  return stories;
}

async function fetchXml(url: string, timeout = 15000): Promise<{ xml: string; ok: boolean; ms: number }> {
  const t0 = Date.now();
  try {
    const r = await fetch(url, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
      signal: AbortSignal.timeout(timeout),
    });
    const ms = Date.now() - t0;
    if (!r.ok) return { xml: "", ok: false, ms };
    return { xml: await r.text(), ok: true, ms };
  } catch {
    return { xml: "", ok: false, ms: Date.now() - t0 };
  }
}

export async function loadMetr(): Promise<{
  stories: WireStory[];
  aisi: WireStory[];
  ok: boolean;
  ms: number;
  at: string;
  note: string;
}> {
  const t0 = Date.now();
  const [metrPack, aisiPack] = await Promise.all([fetchXml(METR_FEED, 15000), fetchXml(AISI_FEED, 8000)]);
  const stories = metrPack.ok ? parseMetrRss(metrPack.xml) : [];
  const aisi = aisiPack.ok ? parseAisiRss(aisiPack.xml) : [];
  const ok = stories.length > 0;
  const at = stories[0]?.at || new Date().toISOString();
  const security = stories.filter((s) => s.beat === "security").length;
  const note = ok
    ? `${stories.length} English · ${security} security · translations dropped · AISI ${aisi.length} · governance primary`
    : metrPack.ok
      ? "METR reachable · no English posts in window"
      : "Unreachable · no snapshot";
  return { stories, aisi, ok, ms: Date.now() - t0, at, note };
}
