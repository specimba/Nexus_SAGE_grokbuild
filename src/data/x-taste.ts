export type TasteKind = "bookmark" | "like" | "feed";

export type TasteCard = {
  id: string;
  handle: string;
  kind: TasteKind;
  text: string;
  take: string;
  href: string;
  at: string;
  likes: number;
  media?: string;
};

export const TASTE_AT = "2026-09-13T06:30:00Z";
export const TASTE_SOURCE = "grok-native watch · dair/lab allowlist · not chrome cookies";
export const TASTE_SCANNED = 51;
export const TASTE: TasteCard[] = [
  {
    id: "2098835038439961060",
    handle: "dair_ai",
    kind: "bookmark",
    text: "Self-improving agents survey. Stages of autonomy + Headroom-Closed Index. Bookmark-class.",
    take: "Map, not a ship. Pulse taste only.",
    href: "https://x.com/dair_ai/status/2098835038439961060",
    at: "2026-09-12T18:04:02Z",
    likes: 474,
    media: "https://pbs.twimg.com/media/HSCPV_6aAAAVDEU.jpg",


  },
  {
    id: "2098592449568591902",
    handle: "dair_ai",
    kind: "feed",
    text: "BenchShield: 69% of 456 adjudicated agent trajectories had a reward-hack episode. Most mid-run after legitimate work.",
    take: "Eval hygiene. Same class as cheat-gym, not an HF addendum.",
    href: "https://x.com/dair_ai/status/2098592449568591902",
    at: "2026-09-12T02:00:04Z",
    likes: 40,
    media: "https://pbs.twimg.com/media/HR-ytd_bMAAP52F.png",


  },
  {
    id: "2098460821693341885",
    handle: "dair_ai",
    kind: "bookmark",
    text: "Ecdysis: repair only recurring harness failures. 1.84× faster; +18.56% reasoning.",
    take: "Harness paper. Rest of board.",
    href: "https://x.com/dair_ai/status/2098460821693341885",
    at: "2026-09-11T17:17:02Z",
    likes: 201,
    media: "https://pbs.twimg.com/media/HR86_vRaMAArYCi.png",


  },
  {
    id: "2098431126343929985",
    handle: "dair_ai",
    kind: "bookmark",
    text: "Microsoft: memory curator checks live env before save. Copilot CLBench 39% → 73%.",
    take: "Production memory. Not incident.",
    href: "https://x.com/dair_ai/status/2098431126343929985",
    at: "2026-09-11T15:19:02Z",
    likes: 102,
    media: "https://pbs.twimg.com/media/HR8f_OSbQAAFuGC.jpg",


  },
  {
    id: "2098154641854992676",
    handle: "dair_ai",
    kind: "feed",
    text: "SkillAdam: Adam-style moments on skill docs. Stops self-evolution undoing its own fixes.",
    take: "Skill loop. Useful for this desk's own compiler. Never lead.",
    href: "https://x.com/dair_ai/status/2098154641854992676",
    at: "2026-09-10T21:00:23Z",
    likes: 119,
    media: "https://pbs.twimg.com/media/HR4khuzbEAAdvjh.png",


  },
  {
    id: "2098864248197976465",
    handle: "dair_ai",
    kind: "feed",
    text: "terms.txt: machine-access terms per path/purpose + 402 + signed receipts. robots.txt is not enough.",
    take: "Agent web terms. Pulse taste.",
    href: "https://x.com/dair_ai/status/2098864248197976465",
    at: "2026-09-12T20:00:06Z",
    likes: 52,
    media: "https://pbs.twimg.com/media/HSCp6O4aIAAQ791.jpg",


  },
  {
    id: "2098097512544444447",
    handle: "AnthropicAI",
    kind: "like",
    text: "Threat intelligence report. Claude misuse cases disrupted. Public so other platforms can match the pattern.",
    take: "Lab TI. Rest. METR-on-Claude is a different file from HF.",
    href: "https://x.com/AnthropicAI/status/2098097512544444447",
    at: "2026-09-10T17:13:22Z",
    likes: 6173,


  },
  {
    id: "2097786616311840853",
    handle: "OpenAI",
    kind: "like",
    text: "Defense Factory playbook: agents find / validate / verify vulns. 250+ people.",
    take: "Lab cyber loop. Not HF attribution.",
    href: "https://x.com/OpenAI/status/2097786616311840853",
    at: "2026-09-09T20:37:58Z",
    likes: 3572,
    media: "https://pbs.twimg.com/media/HRzVoTSbcAAWpe5.jpg",


  },
];
