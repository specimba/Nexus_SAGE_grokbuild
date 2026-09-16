export const KIND_LABEL = {
  lead: "Lead",
  update: "Update",
  related: "Related",
  also: "Also",
  rumor: "Unconfirmed",
} as const;

export const PULSE_TAG: Record<string, string> = {
  "lead-bond": "Tied to lead",
  companion: "Related",
  rest: "Also",
  rumor: "Unconfirmed",
};

export const LANE_COPY = [
  { id: "brief", label: "Briefing", hint: "90 sec" },
  { id: "digest", label: "Stories", hint: "This pull" },
  { id: "pulse", label: "Live feed", hint: "METR / Wire / HN" },
  { id: "papers", label: "Papers", hint: "Keep ≠ upvote" },
  { id: "voice", label: "Read aloud", hint: "This edition" },
  { id: "mail", label: "Inbox", hint: "Snapshot" },
  { id: "governance", label: "Desk", hint: "How we rank" },
] as const;

export function readMinutes(...chunks: string[]) {
  const words = chunks.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
