export type StageId = "ingest" | "rank" | "brief" | "voice";

export type Stage = {
  id: StageId;
  label: string;
  status: "ok" | "hold" | "due" | "skip";
  note: string;
};

export const PIPE_AT = "2026-09-15T07:10:00Z";
export const PIPE_CADENCE = "6h";

export const STAGES: Stage[] = [
  { id: "ingest", label: "Ingest", status: "ok", note: "METR security · HuggingNews · Epoch · papers · tracker · X snapshot" },
  { id: "rank", label: "Rank", status: "ok", note: "Incident > product > rumor. Keep ≠ upvote." },
  { id: "brief", label: "Edition", status: "ok", note: "90-second brief + stories" },
  { id: "voice", label: "Listen", status: "ok", note: "Eve and Orion · 14 Sep tape" },
];
