import type { FileId, ItemKind } from "./digest-pack";

/** Human labels. Internal file ids stay in data; they never appear in the UI. */
export const TOPIC: Record<FileId, { label: string; blurb: string }> = {
  "hf-incident": {
    label: "Hugging Face swarm",
    blurb: "The confirmed 2026 production escape. New quotes about it are updates, not a new attack.",
  },
  astra: {
    label: "Astra",
    blurb: "OpenAI product and usage. Same missing-monitor class — different actor.",
  },
  anthropic: {
    label: "Anthropic evals",
    blurb: "A different lab. Internet was left on. Not a fourth Hugging Face wave.",
  },
  router: {
    label: "Router leak",
    blurb: "The middle layer is the attacker. Not Hugging Face. Not this incident.",
  },
  split: {
    label: "Also this week",
    blurb: "Policy, papers, measurement.",
  },
  other: {
    label: "Also this week",
    blurb: "Policy, papers, measurement.",
  },
};

export const KIND_LABEL: Record<ItemKind, string> = {
  lead: "Lead",
  companion: "Related",
  addendum: "Update",
  rest: "Also",
  drop: "Noise",
};

export const SURE_LABEL = {
  high: "On the record",
  medium: "Strong",
  low: "Thin",
} as const;

export const STORY_WHEN: Record<string, string> = {
  "hf-swarm": "May–Jul 2026",
  "altman-fortune-hf": "11–12 Sep 2026",
  "greenblatt-volition": "10 Sep 2026",
  "anthropic-align-sep9": "9 Sep 2026",
  "shou-6tb-router": "11 Sep 2026",
  "altman-ipo-delay": "12 Sep 2026",
  "ablit-dsv41": "Sep 2026",
  "astra-depth": "10 Sep 2026",
  "astra-wheel": "13 Sep 2026",
  "ti-safety-body": "13 Sep 2026",
  "ti-spacex-dc": "14 Sep 2026",
  "anthropic-metr": "Sep 2026",
  "aisle-curl": "2 Sep 2026",
  benchshield: "Sep 2026",
  "amodei-pace": "12 Sep 2026",
  "russell-pace": "15 Sep 2026",
  "deepseek-flash": "13 Sep 2026",
  "noam-brown-agents": "15 Sep 2026",
  "nvda-anthropic-restrict": "14 Sep 2026",
  "metr-security": "31 Aug 2026",
};

export const NODE_LABEL: Record<string, string> = {
  "hf-incident": "Hugging Face swarm",
  "astra-depth": "Astra product",
  "astra-wheel": "Astra take-the-wheel",
  "amodei-pace": "Amodei pacing essay",
  "russell-pace": "Russell on pacing",
  "anthropic-metr": "Anthropic × METR",
  "altman-fortune-hf": "Altman on Fortune",
  "altman-ipo-delay": "No IPO in 2026",
  "shou-6tb-router": "6TB router dump",
  "anthropic-align-sep9": "Anthropic Sep 9",
  "ti-spacex-dc": "SpaceX data centers",
  "ti-amodei": "TI on Amodei",
  "ti-safety-body": "Labs safety body",
  "noam-brown-agents": "Automate research",
  "nvda-anthropic-restrict": "Vendors vs Anthropic",
  "metr-security": "METR security",
};

export const PULSE_TAG: Record<string, string> = {
  "lead-bond": "Tied to lead",
  companion: "Related",
  rest: "Also",
  rumor: "Unconfirmed",
};

export function wireKicker(w: { outlet: string; rank: string; beat?: string }) {
  if (w.beat === "security") return `${w.outlet} · Security`;
  if (w.beat === "investigation") return `${w.outlet} · Tied to lead`;
  if (w.beat === "measurement") return `${w.outlet} · Measurement`;
  if (w.beat === "org") return `${w.outlet} · Org`;
  return `${w.outlet} · ${PULSE_TAG[w.rank] ?? w.rank}`;
}

export const LANE_COPY = [
  { id: "brief", label: "Briefing", hint: "90 sec" },
  { id: "digest", label: "Stories", hint: "One at a time" },
  { id: "pulse", label: "Live feed", hint: "METR / Wire / X" },
  { id: "papers", label: "Papers", hint: "Keep ≠ upvote" },
  { id: "voice", label: "Listen", hint: "8 min" },
  { id: "mail", label: "Inbox", hint: "Highlights" },
  { id: "governance", label: "Desk", hint: "How we rank" },
] as const;

export function readMinutes(...chunks: string[]) {
  const words = chunks.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
