export type Meter = {
  id: string;
  label: string;
  status: "ok" | "soft" | "skip" | "deny";
  note: string;
  at: string;
};

export const INGEST_AT = "2026-09-16T02:20:00Z";

export const METERS: Meter[] = [
  { id: "metr", label: "METR", status: "ok", note: "English blog · security is a governance primary", at: "2026-08-31T07:00:00Z" },
  { id: "wire", label: "Wire", status: "ok", note: "HuggingNews + eval desks + security RSS", at: "2026-09-16T02:00:00Z" },
  { id: "hf", label: "Papers", status: "ok", note: "Hugging Face daily · keep ≠ upvote · arXiv abstracts", at: "2026-09-16T01:01:00Z" },
  { id: "tracker", label: "Tracker", status: "ok", note: "AI Change Radar · model/docs diffs", at: "2026-09-16T02:00:00Z" },
  { id: "hn", label: "HN", status: "ok", note: "Algolia Pulse · never the briefing", at: "2026-09-16T04:50:00Z" },
  { id: "x", label: "X", status: "ok", note: "Curran-class snapshot · no paid firehose", at: "2026-09-16T02:20:00Z" },
  { id: "mail", label: "Inbox", status: "ok", note: "The Information, Axios AI+, Hugging Face digest", at: "2026-09-16T01:10:00Z" },
  { id: "taste", label: "Bookmarks", status: "deny", note: "Never the lead", at: "2026-09-13T06:30:00Z" },
];
