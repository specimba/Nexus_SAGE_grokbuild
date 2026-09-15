/** Editorial rank — a judgment, not a seal. */

export type Rank = "lead-update" | "related" | "also" | "unconfirmed" | "noise";

export type RankVerdict = {
  rank: Rank;
  reason: string;
};

export type PulseTag = "lead-bond" | "companion" | "rest" | "rumor";

export function tagFromRank(rank: Rank): PulseTag {
  if (rank === "lead-update") return "lead-bond";
  if (rank === "related") return "companion";
  if (rank === "unconfirmed" || rank === "noise") return "rumor";
  return "rest";
}

export function rankClaim(text: string): RankVerdict {
  const t = text.toLowerCase();
  if (/missed-?dna|x ads|paid api/.test(t)) {
    return { rank: "noise", reason: "Not a news source for this desk." };
  }
  if (/uncensored|abliterat/.test(t)) {
    return { rank: "noise", reason: "Community checkpoint. Not a lab release." };
  }
  if (/stock|nasdaq|chipmaker|coreweave|broadcom/.test(t) && !/eval|sandbox|incident|escape/.test(t)) {
    return { rank: "noise", reason: "Market move. Not a production fact." };
  }
  if (/waymo|robotaxi|gift card|voice prices/.test(t)) {
    return { rank: "noise", reason: "Off-beat product. Not this desk." };
  }
  if (/navier stokes|millennium prize|lean proof/.test(t)) {
    return { rank: "also", reason: "Capability demo. A Hugging Face mention here is context, not a new production fact." };
  }
  if (/loss.of.control|privileged identit/.test(t)) {
    return { rank: "also", reason: "Measurement of control failure. Same class as the swarm — not a replacement." };
  }
  if (/kill switch|situational awareness|game evaluations|hide misalignment/.test(t)) {
    return { rank: "also", reason: "Eval and control. Same class as the swarm — not a replacement." };
  }
  if (/0%|zero percent/.test(t) && /hack|intrusion|live systems/.test(t)) {
    return { rank: "also", reason: "Anthropic eval texture. Different lab. Not a fourth wave." };
  }
  if (/6tb|llm router|fable dump|fable dataset/.test(t)) {
    return { rank: "also", reason: "Supply-chain dump. Different attacker than the Hugging Face swarm." };
  }
  if (/(take the wheel|financial services)/.test(t) && !/hugging\s*face/.test(t)) {
    return { rank: "related", reason: "OpenAI product or usage. Related monitor class — not the Hugging Face attacker." };
  }
  if (/\bastra\b/.test(t) && !/hugging\s*face|production|incident|escape/.test(t)) {
    return { rank: "related", reason: "Astra is a product story. Do not merge it into the Hugging Face swarm." };
  }
  if (/update on security at metr|metr.{0,40}(api key|stolen|probed|infrastructure)/.test(t)) {
    return { rank: "related", reason: "METR was itself attacked. Same agent-attack class, different target. Not a lead swap." };
  }
  if (/ipo|pace the frontier|amodei|muse\b/.test(t) && !/hugging\s*face/.test(t)) {
    return { rank: "also", reason: "Policy or product. It does not change what happened in production." };
  }
  if (/noam brown|automat(?:e|ing) ai research/.test(t)) {
    return { rank: "also", reason: "Capability target. Not a new production escape." };
  }
  if (/(nvidia|palantir|booz allen).{0,80}anthropic|anthropic.{0,80}(restrict|data fear)/.test(t)) {
    return { rank: "also", reason: "Vendor policy. Commercial, not an eval incident." };
  }
  if (/recursive self-improvement|breakthrough at google/.test(t) && !/metr|hugging\s*face/.test(t)) {
    return { rank: "unconfirmed", reason: "Rumor until Google or DeepMind publishes a primary." };
  }
  if (/(new evidence|pushes the timeline|weeks before|early may)/.test(t) && !/metr (said|found|report)|huggingface (said|disclosed)|openai (said|confirmed)/.test(t)) {
    return { rank: "unconfirmed", reason: "New timeline claim without a METR, Hugging Face, or OpenAI primary." };
  }
  const primary = /metr|hugging\s*face|huggingface|\bopenai\b|\banthropic\b/.test(t);
  if (!primary) {
    return { rank: "unconfirmed", reason: "No METR, Hugging Face, OpenAI, or Anthropic primary. Treat as rumor." };
  }
  if (/hugging\s*face/.test(t) && /incident|production|escape|swarm|sandbox|breach/.test(t) && !/timeline|weeks before|new evidence|navier/.test(t)) {
    return { rank: "lead-update", reason: "On-record restatement of the known escape. Update the lead — do not replace it." };
  }
  return { rank: "also", reason: "Does not outrank a confirmed production escape." };
}

export const RANK_RULES = [
  "Confirmed lab or METR primary beats a rumor.",
  "METR security is a governance primary. Lab staff moving there raise its weight — they do not replace the lead.",
  "A production incident beats a product ship and a policy essay.",
  "Related is not the same story. Astra is OpenAI product. The swarm is the eval-agent escape.",
  "Keep is not upvote. A one-upvote security paper stays; a 50-upvote robotics paper shelves.",
  "Bookmarks, ads, and market ticks are not news.",
];
