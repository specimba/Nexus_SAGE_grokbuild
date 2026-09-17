export const KEEP_IDS = new Set([
  "2609.08572",
  "2609.05903",
  "2609.08149",
  "2609.08126",
  "2609.11155",
  "2609.11561",
  "2609.09076",
  "2609.10016",
  "2609.08418",
  "2609.05824",
  "2609.11682",
  "2609.11115",
  "2609.15134",
  "2609.15029",
  "2609.15364",
  "2609.15309",
]);

export const KEEP_RE = /agent|harness|sandbox|schem|multi-agent|planning|bench|\beval|cyber|secur|backdoor|threat/i;

/** Hype and off-beat titles that match /agent/ but are not this desk. */
export const SHELF_RE =
  /atria dawn|superintelligence|speech recognizer|world modeling|video generation|physical foundation|3d generator|panoramic states|transmodal|visual generation|music technical|audio 3 gen|realtime technical/i;

export function keepPaper(id: string, title: string) {
  if (SHELF_RE.test(title) && !/sandbox|\beval|secur|cyber|backdoor|threat/i.test(title)) return false;
  return KEEP_IDS.has(id) || KEEP_RE.test(title);
}

export function keepWhy(id: string, title: string) {
  if (!keepPaper(id, title)) return "Wrong beat for this desk, even if it leads the Hugging Face board.";
  if (/cyber|sandbox|harness|secur|backdoor|threat/i.test(title) || KEEP_IDS.has(id)) {
    return "Agent-security. This desk’s beat — keep even at 1 upvote.";
  }
  if (/agent|planning|schem/i.test(title)) return "Agent systems. Keep as measurement.";
  if (/eval|bench/i.test(title)) return "Evaluation. Rank is not upvote.";
  return "Matches this desk’s beat.";
}

/** Incident, eval, monitor. A lab name or the word “Astra” alone is not enough. */
export const WIRE_CORE_RE =
  /eval|harness|sandbox|hack|kill switch|situational|monitor|align|metr|incident|escape|swarm|slowdown|oversight|fable|loss.of.control|privileged identit|chain of thought|controllab|hugging\s*face|huggingface|pace the frontier|embedded evaluator|schem|cyberattack|breach|superintelligence ban|recursive self-improvement|\brsi\b|safety evaluat/i;

export const WIRE_KEEP_RE = WIRE_CORE_RE;

export const WIRE_LAB_RE = /\banthropic\b|\bopenai\b|\bclaude\b|\bgpt-6\b|\bmythos\b/i;
export const WIRE_LAB_HOOK_RE =
  /agent|eval|hack|incident|unauthorized|misalign|schem|monitor|sandbox|escape|swarm|oversight|safety case/i;

export const WIRE_SHELF_RE =
  /stock|nasdaq|robotaxi|waymo|gift card|voice price|fake citation|chip revenue|chip design|computing technology|broadcom|coreweave|softbank|elevenlabs|music v2/i;

/** OpenAI Astra product usage — related, not a HuggingNews bake-off. */
export const ASTRA_PRODUCT_RE = /\bastra\b/i;
export const ASTRA_HOOK_RE = /take the wheel|financial services|chatgpt|recurrent depth|hides the cot|alignment eval|monitor/i;

/** OpenAI’s own RSS ships product. Keep only incident / eval / alignment — not Astra product. */
export const OPENAI_KEEP_RE =
  /incident|eval|align|safety|monitor|hack|sandbox|escape|swarm|metr|kill switch|oversight|schem|pace the frontier|containment|misalign/i;

export function keepWire(title: string, summary = "", outlet = "") {
  const hay = outlet === "HuggingNews" || outlet === "OpenAI" ? title : `${title} ${summary}`;
  if (WIRE_SHELF_RE.test(`${title} ${summary}`) && !/hack|sandbox|escape|incident|swarm|metr/i.test(title)) return false;
  if (outlet === "OpenAI") return OPENAI_KEEP_RE.test(title);
  if (WIRE_CORE_RE.test(hay)) return true;
  if (ASTRA_PRODUCT_RE.test(hay) && ASTRA_HOOK_RE.test(hay)) return true;
  if (/\bagents?\b/i.test(hay) && WIRE_LAB_HOOK_RE.test(hay)) return true;
  if (WIRE_LAB_RE.test(hay) && WIRE_LAB_HOOK_RE.test(hay)) return true;
  return false;
}

export function keepWireWhy(title: string, summary = "") {
  if (!keepWire(title, summary)) return "Off this desk’s beat. Markets, robotaxis, and chip-design policy are not the briefing.";
  if (/hack|sandbox|escape|incident|swarm|metr|loss.of.control/i.test(`${title} ${summary}`)) return "Agent-security or eval. Keep.";
  if (/kill switch|situational|monitor|align|controllab|pace the frontier/i.test(`${title} ${summary}`)) return "Monitor class. Keep.";
  return "Lab or eval on this desk’s beat.";
}
