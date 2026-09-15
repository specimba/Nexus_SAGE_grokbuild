export type Bond = {
  from: string;
  to: string;
  kind: "split" | "companion" | "mail" | "pattern" | "deny";
  note: string;
};

export const BONDS: Bond[] = [
  { from: "hf-incident", to: "astra-depth", kind: "split", note: "Same missing-monitor class. Different actor. Do not merge them." },
  { from: "astra-depth", to: "astra-wheel", kind: "companion", note: "Financial Services ship plus personal-ops usage. Still not the Hugging Face attacker." },
  { from: "amodei-pace", to: "ti-amodei", kind: "mail", note: "Karpathy quote sits next to The Information’s briefing. Policy, not the incident." },
  { from: "amodei-pace", to: "russell-pace", kind: "pattern", note: "Russell answers Amodei: red flag, not a pacing car. Still not a lead swap." },
  { from: "anthropic-metr", to: "ti-safety-body", kind: "pattern", note: "Labs talking standards. Pattern, not a Hugging Face addendum." },
  { from: "hf-incident", to: "ti-spacex-dc", kind: "deny", note: "xAI/SpaceX data-center ops. Wrong class." },
  { from: "hf-incident", to: "altman-fortune-hf", kind: "companion", note: "Fortune 18:42 is OpenAI on-record about the known escape. Update, not a swap." },
  { from: "altman-ipo-delay", to: "amodei-pace", kind: "mail", note: "IPO delay sits next to pacing the frontier. Policy." },
  { from: "hf-incident", to: "shou-6tb-router", kind: "deny", note: "The router is the attacker. Not this incident." },
  { from: "hf-incident", to: "metr-security", kind: "pattern", note: "Same agent-attack class. METR was the target, not Hugging Face. Do not merge them." },
];
