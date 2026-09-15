export type SourceRole = "primary" | "wire" | "tracker" | "mail" | "snapshot" | "deny";

export type SourceCard = {
  id: string;
  name: string;
  href: string;
  role: SourceRole;
  live: boolean;
  note: string;
};

/** Roster the compiler actually uses. Not a wish list. */
export const SOURCE_CARD: SourceCard[] = [
  {
    id: "metr",
    name: "METR",
    href: "https://metr.org/",
    role: "primary",
    live: true,
    note: "Independent evaluator. English only. Their 31 Aug security post is a governance primary — they were attacked, same class as the swarm, different target. Lab staff moving in raises the weight. Still not a lead swap.",
  },
  {
    id: "wire",
    name: "HuggingNews",
    href: "https://huggingnews.com/",
    role: "wire",
    live: true,
    note: "Atom feed written from X, filings, papers. Through the day. Not a lab primary — we still rank.",
  },
  {
    id: "eval-desks",
    name: "Eval desks",
    href: "https://www.alignmentforum.org/",
    role: "primary",
    live: true,
    note: "Alignment Forum, Transformer, Redwood, AI Snake Oil, Import AI, Epoch, Zvi, UK AISI. Titles-only on the long Substacks. Last 21 days unless named.",
  },
  {
    id: "hf",
    name: "Hugging Face daily papers",
    href: "https://huggingface.co/papers",
    role: "primary",
    live: true,
    note: "Keep is not upvote. Agent-security stays at 1 upvote.",
  },
  {
    id: "tracker",
    name: "AI Change Radar",
    href: "https://ai-tracker.ssh.codes/",
    role: "tracker",
    live: true,
    note: "First-hand model and docs diffs. Leaderboard ticks are noise.",
  },
  {
    id: "x",
    name: "X watchlist",
    href: "https://x.com/AndrewCurran_",
    role: "snapshot",
    live: false,
    note: "Curran-class accounts. No paid firehose. Ranked on compile.",
  },
  {
    id: "mail",
    name: "Inbox newsletters",
    href: "https://www.theinformation.com/",
    role: "mail",
    live: false,
    note: "The Information, Axios AI+, AlphaSignal, BenchLM Radar, Hugging Face digest.",
  },
  {
    id: "bookmarks",
    name: "Bookmarks",
    href: "https://x.com/",
    role: "deny",
    live: false,
    note: "Taste only. Never the lead.",
  },
];
