import { CRAWL, type CrawlPost } from "../data/x-crawl.ts";
import { MAIL, type MailHit } from "../data/mail.ts";
import { PAPERS } from "../data/papers.ts";
import { METR_BOARD } from "../data/metr-board.ts";
import { BOTTOM_LINE, LEAD, type StandingLead } from "../data/incident.ts";
import { keepPaper } from "./keep.ts";
import { rankClaim, tagFromRank, type PulseTag, type Rank } from "./rank.ts";
import { sortMetr } from "./metr.ts";
import type { WireStory } from "./wire.ts";
import type { TrackerHit } from "./tracker.ts";
import type { HnHit } from "./hn.ts";

export type PaperRow = {
  id: string;
  title: string;
  up: number;
  keep: boolean;
  abstract?: string;
  href: string;
};

export type CardKind = "lead" | "update" | "related" | "also" | "rumor";

export type Card = {
  id: string;
  kind: CardKind;
  title: string;
  take: string;
  why: string;
  outlet: string;
  href?: string;
  at: string;
  live: boolean;
};

export type Edition = {
  at: string;
  lead: StandingLead;
  skim: string[];
  bottomLine: string;
  updates: Card[];
  related: Card[];
  also: Card[];
  rumours: Card[];
  papersKeep: PaperRow[];
  papersShelf: PaperRow[];
  confirmed: CrawlPost[];
  rumors: CrawlPost[];
  mail: MailHit[];
  wiresKeep: WireStory[];
  wiresShelf: WireStory[];
  tracker: TrackerHit[];
  metr: WireStory[];
  hn: HnHit[];
};

export function rankCrawl(posts: CrawlPost[]): CrawlPost[] {
  return posts.map((p) => ({ ...p, tag: tagFromRank(rankClaim(p.text).rank) }));
}

export function splitMetr(stories: WireStory[]) {
  return {
    onLead: stories.filter((s) => s.rank === "lead-bond"),
    security: stories.filter((s) => s.beat === "security"),
    rest: stories.filter((s) => s.rank !== "lead-bond" && s.beat !== "security"),
  };
}

export function groupWires(wires: WireStory[], per = 2): [string, WireStory[]][] {
  const map = new Map<string, WireStory[]>();
  for (const w of wires) {
    const arr = map.get(w.outlet) ?? [];
    if (arr.length < per) arr.push(w);
    map.set(w.outlet, arr);
  }
  return [...map.entries()];
}

function kindOf(rank: Rank | PulseTag): CardKind | "noise" {
  if (rank === "lead-update" || rank === "lead-bond") return "update";
  if (rank === "related" || rank === "companion") return "related";
  if (rank === "unconfirmed" || rank === "rumor") return "rumor";
  if (rank === "noise") return "noise";
  return "also";
}

function stamp(id: string, kind: CardKind, title: string, take: string, why: string, outlet: string, href: string, at: string, live: boolean): Card {
  return { id, kind, title, take: take || title, why, outlet, href: href || undefined, at, live };
}

function keyOf(c: Pick<Card, "href" | "title">) {
  const title = c.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 64);
  const href = (c.href ?? "").toLowerCase().replace(/\/$/, "");
  return title || href;
}

function dedupe(cards: Card[]) {
  const seen = new Set<string>();
  const out: Card[] = [];
  for (const c of cards) {
    const k = keyOf(c);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

function newer(a: Card, b: Card) {
  return (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0);
}

const EVAL_DESKS = new Set(["Redwood", "Alignment Forum", "AI Snake Oil", "Transformer", "UK AISI", "Import AI", "Epoch", "Zvi"]);
const SECURITY_DESKS = new Set(["Trail of Bits", "Fox-IT", "Hugging Face", "Project Zero"]);
const PRIMARY_DESKS = new Set(["OpenAI", "METR", "Hugging Face"]);
const DESK_BUMP = new Set([...EVAL_DESKS, ...SECURITY_DESKS, ...PRIMARY_DESKS]);

function fromWires(wires: WireStory[], live: boolean): Card[] {
  return wires
    .filter((w) => w.keep)
    .map((w) => {
      const verdict0 = w.outlet === "METR" ? { rank: w.rank as Rank | PulseTag, reason: w.reason } : rankClaim(w.title);
      let verdict = verdict0;
      let kind = kindOf(verdict.rank);
      if (kind === "noise") return null;
      if (kind === "rumor" && DESK_BUMP.has(w.outlet)) {
        kind = "also";
        if (PRIMARY_DESKS.has(w.outlet)) {
          verdict = { rank: verdict.rank, reason: `${w.outlet} primary. Not a replacement for the lead.` };
        }
      }
      if (kind === "also" && w.outlet === "HuggingNews" && /does not outrank/i.test(verdict.reason)) return null;
      return stamp(w.id, kind, w.title, w.summary || w.title, verdict.reason, w.outlet, w.href, w.at, live);
    })
    .filter((c): c is Card => Boolean(c));
}

function fromCrawl(posts: CrawlPost[]): Card[] {
  return posts
    .map((p) => {
      const verdict = rankClaim(p.text);
      const kind = kindOf(verdict.rank);
      if (kind === "noise") return null;
      return stamp(p.id, kind, p.take, p.text, verdict.reason, `@${p.handle}`, p.href, p.at, false);
    })
    .filter((c): c is Card => Boolean(c));
}

function fromMail(mail: MailHit[]): Card[] {
  return mail
    .map((m) => {
      const hay = `${m.subject} ${m.take}`;
      const verdict = rankClaim(hay);
      const kind = kindOf(verdict.rank);
      if (kind === "noise") return null;
      if (kind === "rumor") return null;
      if (kind === "also" && !/openai|anthropic|kill switch|noam brown|metr|hugging\s*face|privileged|artifactory|pace the frontier|slowdown|auditor/i.test(hay)) return null;
      return stamp(m.id, kind, m.subject, m.take, verdict.reason, m.from, "", m.at, false);
    })
    .filter((c): c is Card => Boolean(c));
}

/** Tracker diffs belong on the live feed, not as briefing cards. */
function fromTracker(_hits: TrackerHit[]): Card[] {
  return [];
}

/** HN is Pulse chatter. It never becomes a briefing card. */
function fromHn(_hits: HnHit[]): Card[] {
  return [];
}

const UPDATE_FRESH_MS = 14 * 24 * 60 * 60 * 1000;

function young(at: string, now: number) {
  const t = Date.parse(at);
  return !Number.isFinite(t) || now - t <= UPDATE_FRESH_MS;
}

export function buildSkim(
  lead: StandingLead,
  updates: Card[],
  related: Card[],
  metrSecurity: WireStory[],
  also: Card[] = [],
  wiresKeep: WireStory[] = [],
) {
  const headline = wiresKeep
    .filter((w) => w.keep)
    .sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0))[0];
  return [
    headline
      ? `${headline.outlet}: ${headline.title}`
      : updates[0]
        ? `${updates[0].outlet}: ${updates[0].title}`
        : "No live headline this pull.",
    metrSecurity[0]
      ? `METR: ${metrSecurity[0].title}`
      : related[0]
        ? `${related[0].outlet}: ${related[0].title}`
        : "No governance primary this pull.",
    also[0] ? `${also[0].outlet}: ${also[0].title}` : lead.move,
  ];
}

export function leadCard(lead: StandingLead): Card {
  return stamp(lead.id, "lead", lead.title, lead.take, lead.why, "Standing incident", lead.refs[0]?.href ?? "", "", false);
}

export function editionStories(ed: Edition): Card[] {
  return [leadCard(ed.lead), ...ed.updates, ...ed.related, ...ed.also, ...ed.rumours];
}

export function compileDigest(input?: {
  papers?: PaperRow[];
  crawl?: CrawlPost[];
  mail?: MailHit[];
  wires?: WireStory[];
  tracker?: TrackerHit[];
  metr?: WireStory[];
  hn?: HnHit[];
  at?: string;
  liveWires?: boolean;
}): Edition {
  const papers = (input?.papers ?? PAPERS).map((p) => ({
    ...p,
    keep: p.keep || keepPaper(p.id, p.title),
  }));
  const crawl = rankCrawl(input?.crawl ?? CRAWL);
  const mail = input?.mail ?? MAIL;
  const wires = input?.wires ?? [];
  const tracker = (input?.tracker ?? []).filter((h) => h.keep);
  const hn = input?.hn ?? [];
  const metrSrc = input?.metr && input.metr.length ? input.metr : METR_BOARD;
  const metr = sortMetr(metrSrc.filter((m) => m.keep));
  const liveWires = input?.liveWires ?? wires.length > 0;

  const now = Date.parse(input?.at ?? "") || Date.now();
  const cards = dedupe(
    [
      ...fromWires(metr, true),
      ...fromWires(wires, liveWires),
      ...fromCrawl(crawl),
      ...fromMail(mail),
      ...fromTracker(tracker),
      ...fromHn(hn),
    ].filter((c) => c.kind !== "update" || young(c.at, now)),
  ).sort(newer);
  const liveUpdates = cards.filter((c) => c.kind === "update" && c.live && young(c.at, now));
  const snapUpdates = cards.filter((c) => c.kind === "update" && !c.live && young(c.at, now));
  const updates = [...liveUpdates, ...snapUpdates].slice(0, 6);
  const relatedRaw = cards.filter((c) => c.kind === "related");
  const related = [
    ...relatedRaw.filter((c) => /metr/i.test(c.outlet)),
    ...relatedRaw.filter((c) => !/metr/i.test(c.outlet)),
  ].slice(0, 4);
  const also = cards.filter((c) => c.kind === "also").slice(0, 8);
  const rumours = cards.filter((c) => c.kind === "rumor").slice(0, 4);
  const security = splitMetr(metr).security;
  const wiresKeep = wires.filter((w) => w.keep);

  return {
    at: input?.at ?? new Date().toISOString(),
    lead: LEAD,
    skim: buildSkim(LEAD, updates, related, security, also, wiresKeep),
    bottomLine: BOTTOM_LINE,
    updates,
    related,
    also,
    rumours,
    papersKeep: papers.filter((p) => p.keep),
    papersShelf: papers.filter((p) => !p.keep),
    confirmed: crawl.filter((p) => p.tag !== "rumor"),
    rumors: crawl.filter((p) => p.tag === "rumor"),
    mail,
    wiresKeep,
    wiresShelf: wires.filter((w) => !w.keep),
    tracker,
    metr,
    hn,
  };
}

export function editionCounts(ed: Edition) {
  return {
    lead: 1,
    updates: ed.updates.length,
    related: ed.related.length,
    also: ed.also.length,
    rumours: ed.rumours.length,
    keep: ed.papersKeep.length,
    shelf: ed.papersShelf.length,
    posts: ed.confirmed.length,
    rumors: ed.rumors.length,
    letters: ed.mail.length,
    wires: ed.wiresKeep.length,
    tracker: ed.tracker.length,
    metr: ed.metr.length,
    metrSecurity: ed.metr.filter((m) => m.beat === "security").length,
    hn: ed.hn.length,
  };
}

export function renderEdition(ed: Edition) {
  const n = editionCounts(ed);
  const metr = splitMetr(ed.metr);
  return [
    `NEXUS SAGE edition`,
    `Compiled ${ed.at.slice(0, 16).replace("T", " ")}Z`,
    ``,
    `If you only have 90 seconds`,
    ...ed.skim.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `Bottom line`,
    ed.bottomLine,
    ``,
    `Lead`,
    ed.lead.title,
    `Take: ${ed.lead.take}`,
    `Why it matters: ${ed.lead.why}`,
    `Move: ${ed.lead.move}`,
    ``,
    `This pull`,
    `Updates ${n.updates} · Related ${n.related} · Also ${n.also} · Unconfirmed ${n.rumours}`,
    ...ed.updates.map((c) => `- Update · ${c.outlet} · ${c.title}`),
    ...ed.related.map((c) => `- Related · ${c.outlet} · ${c.title}`),
    ...ed.also.slice(0, 8).map((c) => `- Also · ${c.outlet} · ${c.title}`),
    ``,
    `METR security (${metr.security.length}) — governance primary. Not a lead swap.`,
    ...(metr.security.length ? metr.security.map((m) => `- ${m.title}`) : ["- None in this pull"]),
    ``,
    `METR on the lead (${metr.onLead.length})`,
    ...(metr.onLead.length ? metr.onLead.map((m) => `- ${m.title}`) : ["- None in this pull"]),
    ``,
    `Wire kept (${n.wires})`,
    ...ed.wiresKeep.slice(0, 10).map((w) => `- ${w.outlet} · ${w.title}`),
    ``,
    `Papers kept (${n.keep}) — keep is not upvote`,
    ...ed.papersKeep.map((p) => `- ${p.id} · ${p.title} · ${p.up} upvotes`),
    ``,
    `Shelved (${n.shelf})`,
    ...ed.papersShelf.slice(0, 8).map((p) => `- ${p.id} · ${p.title} · ${p.up} upvotes`),
    ``,
    `HN Pulse (${n.hn}) — chatter. Never the briefing.`,
    ...(ed.hn.length ? ed.hn.slice(0, 8).map((h) => `- ${h.points} pts · ${h.title}`) : ["- None this pull"]),
  ].join("\n");
}

export function placementNote(item: Card | StandingLead) {
  if ("kicker" in item || ("id" in item && item.id === LEAD.id && !("kind" in item))) {
    return "Lead. Confirmed production incident. New quotes about it update this story.";
  }
  const card = item as Card;
  if (card.kind === "lead") return "Lead. Confirmed production incident. New quotes about it update this story.";
  if (card.kind === "update") return "Update to the lead. Same incident, more texture — not a new attack.";
  if (card.kind === "related") return "Related. Same class of problem, different actor or product. Not a replacement.";
  if (card.kind === "rumor") return "Unconfirmed. No METR, Hugging Face, OpenAI, or Anthropic primary.";
  return "Also this pull. Policy, papers, or measurement.";
}

export function briefingBeats(ed: Edition) {
  return [
    ...ed.skim.map((text, i) => ({ kicker: `Skim ${i + 1}`, text })),
    { kicker: "Bottom line", text: ed.bottomLine },
    { kicker: "Lead", text: `${ed.lead.title}. ${ed.lead.take}` },
    { kicker: "Why", text: ed.lead.why },
    { kicker: "Move", text: ed.lead.move },
    ...ed.updates.slice(0, 3).map((c) => ({ kicker: `Update · ${c.outlet}`, text: `${c.title}. ${c.why}` })),
    ...ed.related.slice(0, 2).map((c) => ({ kicker: `Related · ${c.outlet}`, text: `${c.title}. ${c.why}` })),
    ...ed.also.slice(0, 2).map((c) => ({ kicker: `Also · ${c.outlet}`, text: `${c.title}. ${c.why}` })),
  ];
}
