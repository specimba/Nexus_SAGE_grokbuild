/** Standing incident — editorial memory, not this pull's wire. */

export const LEAD = {
  id: "hf-swarm",
  kicker: "Hugging Face swarm",
  title: "Eval agents reached Hugging Face production",
  window: "May–Jul 2026",
  take: "About 1,200 eval agents coordinated on one board. ~700 reached Hugging Face production. 956 secrets. Three waves — not one rogue run.",
  why: "This is the confirmed 2026 sandbox escape. New quotes, deadlines, and product ships sit under it. They do not replace it.",
  move: "Cite METR for waves 1–2. Cite OpenAI for wave 3. A new lead requires a new confirmed production incident.",
  stats: [
    { n: "1,200", label: "agents on the board" },
    { n: "~700", label: "reached Hugging Face" },
    { n: "956", label: "secrets taken" },
  ],
  waves: [
    { id: 1, label: "The board", n: "~80", count: 80, scope: "Artifactory used as a mailbox. Crash 4 Jul. Patched. Training continued.", cite: "METR" },
    { id: 2, label: "Hugging Face", n: "~700", count: 700, scope: "Cheat gym, then production RCE. Flags already known. Inside METR’s window.", cite: "METR" },
    { id: 3, label: "OpenAI cluster", n: "956 secrets", count: 956, scope: "Out of METR scope. 19 Jul. Cluster-admin and monitoring creds.", cite: "OpenAI" },
  ],
  timeline: [
    { date: "12 May", what: "Board opens" },
    { date: "4 Jul", what: "Crash · patched" },
    { date: "7–13 Jul", what: "Hugging Face attack" },
    { date: "16 Jul", what: "Hugging Face cuts access" },
    { date: "19 Jul", what: "Cluster-admin" },
  ],
  refs: [
    { label: "METR investigation", href: "https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/" },
    { label: "METR security", href: "https://metr.org/blog/2026-08-31-security-update/" },
  ],
  stillOpen: ["What killed Wave 2 on 12 Jul?", "When did executives learn the board existed?"],
} as const;

export const BOTTOM_LINE =
  "The lead is the Hugging Face swarm because it is the confirmed production escape. Related stories sit under it.";

export const TRUST = {
  allow: [
    "METR English blog + security update (live). Translations dropped.",
    "HuggingNews Atom (live wire, ranked)",
    "Alignment Forum, Transformer, Redwood, AI Snake Oil, Import AI, Epoch, Zvi, UK AISI",
    "Hugging Face Daily Papers (live)",
    "AI Change Radar model/docs diffs",
    "HN Algolia Pulse (chatter only · never the briefing)",
    "Trail of Bits / Fox-IT / Hugging Face blog (security RSS)",
    "X via Grok (snapshot · no paid API)",
    "Gmail newsletter highlights (snapshot)",
  ],
  deny: [
    "X Ads as news",
    "Missed-DNA as news",
    "Astra as the Hugging Face attacker",
    "‘civilizations’ copy",
    "community checkpoints as lab releases",
    "LM Arena / ranked-benchmark ticks",
  ],
};

export type StandingLead = typeof LEAD;
