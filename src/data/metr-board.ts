import type { WireStory } from "../lib/wire.ts";

/** Last English METR board. First paint uses this; live fetch replaces it. */
export const METR_BOARD: WireStory[] = [
  {
    id: "metr-security-update",
    title: "Update on Security at METR",
    summary: "METR was itself attacked. Same agent-attack class, different target. Governance primary — not a lead swap.",
    href: "https://metr.org/blog/2026-08-31-security-update/",
    at: "2026-08-31T07:00:00Z",
    keep: true,
    rank: "companion",
    reason: "METR was itself attacked. Same agent-attack class, different target. Governance primary — not a lead swap.",
    outlet: "METR",
    beat: "security",
  },
  {
    id: "metr-hf-investigation",
    title: "Brief independent investigation of agents’ behavior, reasoning and collaboration in the OpenAI / Hugging Face hacking incident",
    summary: "METR primary on the known escape. Update the lead — do not replace it.",
    href: "https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/",
    at: "2026-08-26T07:00:00Z",
    keep: true,
    rank: "lead-bond",
    reason: "METR primary on the known escape. Update the lead — do not replace it.",
    outlet: "METR",
    beat: "investigation",
  },
  {
    id: "metr-funding",
    title: "Funding update",
    summary: "METR primary. Independent evaluator. Not a rumor.",
    href: "https://metr.org/blog/2026-08-14-funding-update/",
    at: "2026-08-14T07:00:00Z",
    keep: true,
    rank: "rest",
    reason: "METR primary. Independent evaluator. Not a rumor.",
    outlet: "METR",
    beat: "org",
  },
];
