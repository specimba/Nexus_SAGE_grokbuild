import { DIGEST_ITEMS, type DigestItem } from "../data/digest-pack.ts";
import { CRAWL, type CrawlPost } from "../data/x-crawl.ts";
import { MAIL, type MailHit } from "../data/mail.ts";
import { PAPERS } from "../data/papers.ts";
import { METR_BOARD } from "../data/metr-board.ts";
import { SKIM, BOTTOM_LINE } from "../data/today.ts";
import { KIND_LABEL, TOPIC } from "../data/story-ui.ts";
import { keepPaper } from "./keep.ts";
import { rankClaim, tagFromRank } from "./rank.ts";
import { sortMetr } from "./metr.ts";
import type { WireStory } from "./wire.ts";
import type { TrackerHit } from "./tracker.ts";

export type PaperRow = {
  id: string;
  title: string;
  up: number;
  keep: boolean;
  abstract?: string;
  href: string;
};

export type Edition = {
  at: string;
  lead: DigestItem;
  updates: DigestItem[];
  related: DigestItem[];
  also: DigestItem[];
  noise: DigestItem[];
  papersKeep: PaperRow[];
  papersShelf: PaperRow[];
  confirmed: CrawlPost[];
  rumors: CrawlPost[];
  mail: MailHit[];
  wiresKeep: WireStory[];
  wiresShelf: WireStory[];
  tracker: TrackerHit[];
  metr: WireStory[];
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

export function compileDigest(input?: {
  items?: DigestItem[];
  papers?: PaperRow[];
  crawl?: CrawlPost[];
  mail?: MailHit[];
  wires?: WireStory[];
  tracker?: TrackerHit[];
  metr?: WireStory[];
  at?: string;
}): Edition {
  const items = input?.items ?? DIGEST_ITEMS;
  const papers = (input?.papers ?? PAPERS).map((p) => ({
    ...p,
    keep: p.keep || keepPaper(p.id, p.title),
  }));
  const crawl = rankCrawl(input?.crawl ?? CRAWL);
  const mail = input?.mail ?? MAIL;
  const wires = input?.wires ?? [];
  const tracker = (input?.tracker ?? []).filter((h) => h.keep);
  const metrSrc = input?.metr && input.metr.length ? input.metr : METR_BOARD;
  const metr = sortMetr(metrSrc.filter((m) => m.keep));
  const leads = items.filter((i) => i.kind === "lead");
  const lead = leads[0];
  if (!lead) throw new Error("edition needs a lead story");
  return {
    at: input?.at ?? new Date().toISOString(),
    lead,
    updates: items.filter((i) => i.kind === "addendum"),
    related: items.filter((i) => i.kind === "companion"),
    also: items.filter((i) => i.kind === "rest"),
    noise: items.filter((i) => i.kind === "drop"),
    papersKeep: papers.filter((p) => p.keep),
    papersShelf: papers.filter((p) => !p.keep),
    confirmed: crawl.filter((p) => p.tag !== "rumor"),
    rumors: crawl.filter((p) => p.tag === "rumor"),
    mail,
    wiresKeep: wires.filter((w) => w.keep),
    wiresShelf: wires.filter((w) => !w.keep),
    tracker,
    metr,
  };
}

export function editionCounts(ed: Edition) {
  return {
    lead: 1,
    updates: ed.updates.length,
    related: ed.related.length,
    also: ed.also.length,
    noise: ed.noise.length,
    keep: ed.papersKeep.length,
    shelf: ed.papersShelf.length,
    posts: ed.confirmed.length,
    rumors: ed.rumors.length,
    letters: ed.mail.length,
    wires: ed.wiresKeep.length,
    tracker: ed.tracker.length,
    metr: ed.metr.length,
    metrSecurity: ed.metr.filter((m) => m.beat === "security").length,
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
    ...SKIM.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `Bottom line`,
    BOTTOM_LINE,
    ``,
    `Lead`,
    ed.lead.title,
    `Take: ${ed.lead.take}`,
    `Why it matters: ${ed.lead.why}`,
    `Move: ${ed.lead.move}`,
    ``,
    `This window`,
    `Updates ${n.updates} · Related ${n.related} · Also ${n.also} · Unconfirmed ${n.rumors}`,
    ...[...ed.updates, ...ed.related, ...ed.also].map(
      (i) => `- ${KIND_LABEL[i.kind]} · ${TOPIC[i.file]?.label ?? "Also"} · ${i.title}: ${i.take}`,
    ),
    ``,
    `METR security (${metr.security.length}) — governance primary. Not a lead swap.`,
    ...(metr.security.length ? metr.security.map((m) => `- ${m.title}`) : ["- None in this window"]),
    ``,
    `METR on the lead (${metr.onLead.length}) — English investigation. Translations dropped.`,
    ...(metr.onLead.length ? metr.onLead.map((m) => `- ${m.title}`) : ["- None in this window"]),
    ``,
    `Also from METR (${metr.rest.length})`,
    ...metr.rest.slice(0, 4).map((m) => `- ${m.title}`),
    ``,
    `Wire kept (${n.wires}) — HuggingNews + eval desks. Ranked.`,
    ...ed.wiresKeep.slice(0, 10).map((w) => `- ${w.outlet} · ${w.title}`),
    ``,
    `Papers kept (${n.keep}) — keep is not upvote`,
    ...ed.papersKeep.map((p) => `- ${p.id} · ${p.title} · ${p.up} upvotes`),
    ``,
    `Shelved (${n.shelf})`,
    ...ed.papersShelf.slice(0, 8).map((p) => `- ${p.id} · ${p.title} · ${p.up} upvotes`),
  ].join("\n");
}

export function placementNote(item: DigestItem) {
  if (item.kind === "lead") return "Lead. Confirmed production incident. New quotes about it update this story.";
  if (item.kind === "addendum") return "Update to the lead. Same incident, more texture — not a new attack.";
  if (item.kind === "companion") return "Related. Same class of problem, different actor or product. Not a replacement.";
  if (item.kind === "drop") return "Off-beat. Logged so it does not sneak onto the front page.";
  if (item.file === "router") return "Separate attacker: the router. Not the Hugging Face swarm.";
  if (item.file === "anthropic") return "Different lab. Useful pattern, not a fourth wave.";
  return "Also this window. Policy, papers, or measurement.";
}
