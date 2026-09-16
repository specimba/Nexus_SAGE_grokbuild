export const WATCH_AT = "2026-09-16T02:20:00Z";

/** Accounts first. Tags come from the post, not a frozen topic list. */
export const WATCH_ACCOUNTS = [
  { handle: "AndrewCurran_", role: "wire" },
  { handle: "btibor91", role: "changelog" },
  { handle: "METR_Evals", role: "eval-primary" },
  { handle: "EpochAIResearch", role: "measurement" },
  { handle: "jackclarkSF", role: "policy-primary" },
  { handle: "ApolloResearch", role: "eval-primary" },
  { handle: "DKokotajlo", role: "policy" },
  { handle: "TheZvi", role: "policy" },
  { handle: "natolambert", role: "changelog" },
  { handle: "karpathy", role: "lab-observer" },
  { handle: "sama", role: "lab-exec" },
  { handle: "AnthropicAI", role: "lab-primary" },
  { handle: "OpenAI", role: "lab-primary" },
  { handle: "AIatMeta", role: "lab-primary" },
  { handle: "GoogleDeepMind", role: "lab-primary" },
  { handle: "DeepSeek_AI", role: "lab-primary" },
  { handle: "huggingface", role: "infra" },
  { handle: "dair_ai", role: "papers-week" },
  { handle: "TheAlphaSignal", role: "mail-bond" },
  { handle: "TestingCatalog", role: "mail-bond" },
];

export const WATCH_RULE =
  "Curran-class first: people who surface primaries. A post is unconfirmed until METR, Hugging Face, OpenAI, or Anthropic is the source. Arena ticks and rumor accounts stay off this list.";
