import { PAPERS } from "../data/papers.ts";
import { CRAWL, CRAWL_AT } from "../data/x-crawl.ts";
import { MAIL, MAIL_AT } from "../data/mail.ts";
import { TASTE, TASTE_AT } from "../data/x-taste.ts";

export type SourceId = "metr" | "wire" | "hf" | "tracker" | "hn" | "x" | "mail" | "bookmarks";

export type SourceLog = {
  id: SourceId;
  label: string;
  live: boolean;
  ok: boolean;
  count: number;
  ms: number;
  at: string;
  note: string;
};

export function snapshotIngest(at = new Date().toISOString()): SourceLog[] {
  return [
    { id: "metr", label: "METR", live: true, ok: true, count: 0, ms: 0, at, note: "Waiting on last pack" },
    { id: "wire", label: "Wire", live: true, ok: true, count: 0, ms: 0, at, note: "Waiting on last pack" },
    { id: "hf", label: "Papers", live: true, ok: true, count: PAPERS.length, ms: 0, at, note: "Hugging Face daily_papers" },
    { id: "tracker", label: "Tracker", live: true, ok: true, count: 0, ms: 0, at, note: "Waiting on last pack" },
    { id: "hn", label: "HN", live: true, ok: true, count: 0, ms: 0, at, note: "Waiting on last pack" },
    { id: "x", label: "X", live: false, ok: true, count: CRAWL.length, ms: 0, at: CRAWL_AT, note: "Watchlist snapshot · no paid firehose" },
    { id: "mail", label: "Inbox", live: false, ok: true, count: MAIL.length, ms: 0, at: MAIL_AT, note: "Newsletter highlights" },
    { id: "bookmarks", label: "Bookmarks", live: false, ok: true, count: TASTE.length, ms: 0, at: TASTE_AT, note: "Never the lead" },
  ];
}
