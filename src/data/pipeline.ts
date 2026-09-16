export type StageId = "ingest" | "rank" | "brief" | "voice";

export type Stage = {
  id: StageId;
  label: string;
  status: "ok" | "hold" | "due" | "skip";
  note: string;
};

export const STAGES: Stage[] = [
  { id: "ingest", label: "Ingest", status: "ok", note: "Live METR / wire / papers / tracker / HN · snapshot X / mail" },
  { id: "rank", label: "Rank", status: "ok", note: "Incident > product > rumor. Keep ≠ upvote. HN never briefs." },
  { id: "brief", label: "Edition", status: "ok", note: "Compiled from this pull · written to disk" },
  { id: "voice", label: "Read aloud", status: "ok", note: "Browser voice reads this edition" },
];
