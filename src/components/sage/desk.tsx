import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Headphones,
  Inbox,
  Newspaper,
  Pause,
  Play,
  RefreshCw,
  Rss,
  Search,
  Shield,
  SkipBack,
  SkipForward,
  TimerReset,
} from "lucide-react";
import { CYCLE, WAVES, WAVE_TIMELINE } from "@/data/cycle";
import { CRAWL, CRAWL_AT, type CrawlPost } from "@/data/x-crawl";
import { TASTE, TASTE_AT, TASTE_SCANNED } from "@/data/x-taste";
import { DIGEST_ITEMS, DROPPED, PACK_AT, type DigestItem } from "@/data/digest-pack";
import { KIND_LABEL, LANE_COPY, NODE_LABEL, PULSE_TAG, STORY_WHEN, SURE_LABEL, TOPIC, readMinutes } from "@/data/story-ui";
import { PAPERS } from "@/data/papers";
import { METERS } from "@/data/ingest";
import { MAIL, MAIL_AT, type MailHit } from "@/data/mail";
import { BOTTOM_LINE, SKIM, TODAY } from "@/data/today";
import { STAGES } from "@/data/pipeline";
import { BONDS } from "@/data/bonds";
import { WATCH_ACCOUNTS } from "@/data/watchlist";
import { VOICE_TURNS } from "@/data/voice-script";
import { nextDue, PACK_KEY, renderPlan } from "@/lib/digest-pack";
import { compileDigest, editionCounts, placementNote, renderEdition, splitMetr, groupWires, type Edition, type PaperRow } from "@/lib/compile";
import { RANK_RULES, rankClaim } from "@/lib/rank";
import { crawlAgeHours } from "@/lib/x-pulse";
import { fetchEdition } from "@/lib/edition";
import { snapshotIngest, type SourceLog } from "@/lib/ingest-log";
import { pushTape, readTape, type TapeRow } from "@/lib/operator";
import { SOURCE_CARD } from "@/data/sources";
import { keepWhy } from "@/lib/keep";
import { cn } from "@/lib/cn";

const LANES = LANE_COPY;
type Lane = (typeof LANES)[number]["id"];
const OPEN_KEY = "sage-open-file";
const ICONS = {
  brief: Newspaper,
  digest: BookOpen,
  pulse: Rss,
  papers: FileText,
  voice: Headphones,
  mail: Inbox,
  governance: Shield,
} as const;

function laneFromHash(): Lane {
  const raw = typeof window === "undefined" ? "" : window.location.hash.replace("#", "").split(":")[0];
  return LANES.some((l) => l.id === raw) ? (raw as Lane) : "brief";
}

function download(name: string, body: string, type: string) {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function topicOf(file: DigestItem["file"]) {
  return TOPIC[file] ?? TOPIC.other;
}

function storyWhen(id: string) {
  return STORY_WHEN[id] ?? "Sep 2026";
}

function fmtClock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const EMPTY_EDITION = compileDigest({ at: PACK_AT, papers: PAPERS, crawl: CRAWL, mail: MAIL, items: DIGEST_ITEMS });
const EMPTY_INGEST = snapshotIngest(PACK_AT);

export function Desk() {
  const [lane, setLane] = useState<Lane>("brief");
  useEffect(() => {
    setLane(laneFromHash());
    const onHash = () => setLane(laneFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (id: Lane) => {
    setLane(id);
    if (typeof window !== "undefined") window.location.hash = id;
  };
  const [now, setNow] = useState("--:--:--");
  const [q, setQ] = useState("");
  const [tape, setTape] = useState<TapeRow[]>([]);
  const [cmd, setCmd] = useState(false);
  const [focus, setFocus] = useState(false);
  const [sessionOn, setSessionOn] = useState(false);
  const [left, setLeft] = useState(12 * 60);
  const [copied, setCopied] = useState(false);
  const [readPct, setReadPct] = useState(0);
  const [edition, setEdition] = useState<Edition>(EMPTY_EDITION);
  const [ingest, setIngest] = useState<SourceLog[]>(EMPTY_INGEST);
  const [compiling, setCompiling] = useState(false);
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().slice(11, 19));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!sessionOn) return;
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [sessionOn]);
  useEffect(() => {
    setTape(readTape());
    setCompiling(true);
    fetchEdition()
      .then((pack) => {
        setEdition(pack.edition);
        setIngest(pack.ingest);
      })
      .catch(() => undefined)
      .finally(() => setCompiling(false));
  }, []);
  useEffect(() => {
    const onScroll = () => {
      const root = document.scrollingElement;
      const h = (root?.scrollHeight ?? 1) - window.innerHeight;
      setReadPct(h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lane]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) {
        if (e.key === "Escape") {
          setCmd(false);
          (t as HTMLElement).blur();
        }
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.getElementById("sage-q")?.focus();
        return;
      }
      if (e.key === ":" || ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setCmd(true);
        return;
      }
      if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        go("governance");
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setFocus((v) => !v);
        return;
      }
      if (e.key === "c" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        void navigator.clipboard.writeText(renderEdition(edition)).then(() => setCopied(true));
        return;
      }
      if (e.key === "Escape") {
        setCmd(false);
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= LANES.length) go(LANES[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [edition]);

  const copyBrief = () => {
    navigator.clipboard
      .writeText(renderEdition(edition))
      .then(() => {
        setCopied(true);
        setTape(pushTape("copy briefing"));
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {
        download("sage-briefing.txt", renderEdition(edition), "text/plain");
      });
  };

  const compileNow = async () => {
    setCompiling(true);
    try {
      const pack = await fetchEdition();
      setEdition(pack.edition);
      setIngest(pack.ingest);
      try {
        localStorage.setItem(PACK_KEY, pack.edition.at);
      } catch {
        /* ignore */
      }
      setTape(pushTape("compile edition"));
    } catch {
      setEdition(compileDigest({ at: new Date().toISOString() }));
    } finally {
      setCompiling(false);
    }
  };

  const counts = editionCounts(edition);
  const hf = ingest.find((s) => s.id === "hf");
  const wireLog = ingest.find((s) => s.id === "wire");
  const metrLog = ingest.find((s) => s.id === "metr");
  const xLog = ingest.find((s) => s.id === "x");
  const feedAge = crawlAgeHours(xLog?.at ?? CRAWL_AT);

  return (
    <div className={cn("desk-shell", focus && "desk-focus")}>
      <a className="skip-link" href="#desk-main">
        Skip to briefing
      </a>
      <div className="read-bar" aria-hidden>
        <i style={{ width: `${readPct}%` }} />
      </div>
      <aside className="pip-rail" aria-label="Desk navigation">
        <div className="flex items-center gap-2">
          <span className="hud-lamp inline-flex h-11 w-11 items-center justify-center font-display text-amber">λ</span>
          <div>
            <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">NEXUS SAGE</p>
            <p className="font-sans text-base font-semibold text-fg">News digest</p>
          </div>
        </div>
        <span className="hud-clock tabular-nums">{now}Z</span>
        <span className="lock-seal">
          <span className="lock-dot" aria-hidden />
          Edition live
        </span>
        <span className={cn("desk-chip", feedAge.stale ? "sage-stale" : "desk-chip-live")}>
          {feedAge.stale ? `X snapshot ${feedAge.hours.toFixed(0)}h` : "X snapshot"}
        </span>
        <span className={cn("desk-chip", counts.metrSecurity || (metrLog?.ok && metrLog.count) ? "desk-chip-live" : compiling ? "" : "sage-stale")}>
          {counts.metrSecurity
            ? `${counts.metrSecurity} METR security`
            : metrLog?.ok && metrLog.count
              ? `${metrLog.count} METR`
              : compiling
                ? "METR…"
                : "METR pending"}
        </span>
        <span className={cn("desk-chip", wireLog?.ok && wireLog.count ? "desk-chip-live" : compiling ? "" : "sage-stale")}>
          {wireLog?.ok && wireLog.count ? `${wireLog.count} wire` : compiling ? "Wire…" : "Wire pending"}
        </span>
        <span className={cn("desk-chip", hf?.ok ? "desk-chip-live" : "sage-stale")}>
          {hf?.ok ? `${hf.count} papers live` : `${counts.keep} kept`}
        </span>
        {sessionOn ? (
          <span className={cn("desk-chip", left === 0 ? "sage-stale" : "desk-chip-live")}>{fmtClock(left)} left</span>
        ) : null}
        <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">{CYCLE.window}</p>
        <nav className="pip-lanes" aria-label="Sections">
          {LANES.map((item, i) => {
            const Icon = ICONS[item.id];
            return (
              <button key={item.id} type="button" onClick={() => go(item.id)} aria-current={lane === item.id ? "page" : undefined} className="desk-lane-btn">
                <span className="flex items-center gap-2">
                  <Icon size={14} aria-hidden />
                  {item.label}
                </span>
                <span className="lane-hint">
                  {String(i + 1)} · {item.hint}
                </span>
              </button>
            );
          })}
        </nav>
        <p className="rail-help mt-auto font-mono text-kicker uppercase tracking-kicker text-subtle">L desk · F focus · / search · 1–7 jump</p>
      </aside>
      <div className="desk-stage">
        <div className="hazard-bar" />
        <div className="scanline absolute inset-0 z-10 opacity-20" />
        <header className="relative z-20 border-b border-line px-4 py-3 md:px-6">
          <p className="desk-ticker">
            15 Sep · Hugging Face swarm
            {counts.metrSecurity ? ` · ${counts.metrSecurity} METR security` : counts.metr ? ` · ${counts.metr} METR` : ""}
            {counts.wires ? ` · ${counts.wires} wire` : compiling ? " · refreshing wire" : ""}
            {` · ${counts.keep} papers · ${counts.rumors} unconfirmed · compiled ${edition.at.slice(11, 16)}Z`}
          </p>
          <div className="desk-toolbar mt-3 flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="sage-q">
              Search stories
            </label>
            <div className="relative min-w-48 flex-1">
              <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle" aria-hidden />
              <input id="sage-q" className="sage-search w-full pl-9" placeholder="Search stories, people, papers" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <button type="button" className="desk-lane-btn lock-cta" onClick={() => void compileNow()} disabled={compiling}>
              <RefreshCw size={14} aria-hidden /> {compiling ? "Refreshing…" : "Refresh edition"}
            </button>
            <button type="button" className="desk-lane-btn" aria-pressed={focus} onClick={() => setFocus((v) => !v)}>
              {focus ? "Focus on" : "Focus"}
            </button>
            <button
              type="button"
              className="desk-lane-btn"
              onClick={() => {
                setSessionOn(true);
                setLeft(12 * 60);
              }}
            >
              <TimerReset size={14} aria-hidden /> {sessionOn ? fmtClock(left) : "12 min"}
            </button>
            <button type="button" className="desk-lane-btn" onClick={copyBrief}>
              <Copy size={14} aria-hidden /> {copied ? "Copied" : "Copy briefing"}
            </button>
            <button
              type="button"
              className="desk-lane-btn"
              onClick={() => {
                download("sage-briefing.md", renderEdition(edition), "text/markdown");
                setTape(pushTape("download briefing"));
              }}
            >
              <Download size={14} aria-hidden /> Download
            </button>
          </div>
        </header>
        <main id="desk-main" className="relative z-20 mx-auto max-w-7xl px-4 py-5 md:px-6">
          {lane === "brief" ? (
            <Brief
              q={q}
              edition={edition}
              ingest={ingest}
              compiling={compiling}
              onCompile={() => void compileNow()}
              onOpenStory={(id) => {
                try {
                  localStorage.setItem(OPEN_KEY, id);
                } catch {
                  /* ignore */
                }
                go("digest");
              }}
              onListen={() => go("voice")}
            />
          ) : null}
          {lane === "pulse" ? <Pulse q={q} edition={edition} ingest={ingest} /> : null}
          {lane === "digest" ? <Stories q={q} edition={edition} onTape={(e) => setTape(pushTape(e))} /> : null}
          {lane === "papers" ? <Papers q={q} papers={edition.papersKeep.concat(edition.papersShelf)} /> : null}
          {lane === "voice" ? <Voice /> : null}
          {lane === "mail" ? <MailLane q={q} mail={edition.mail} at={ingest.find((s) => s.id === "mail")?.at ?? MAIL_AT} /> : null}
          {lane === "governance" ? <Gov tape={tape} edition={edition} ingest={ingest} onCompile={() => void compileNow()} compiling={compiling} /> : null}
        </main>
      </div>
      {cmd ? (
        <div className="cmd-overlay" role="dialog" aria-label="Jump to" onClick={() => setCmd(false)}>
          <div className="cmd-panel sage-panel p-4" onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-kicker uppercase tracking-kicker text-amber">Jump to</p>
            <ul className="mt-3 grid gap-1">
              {LANES.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="desk-lane-btn w-full text-left"
                    onClick={() => {
                      go(item.id);
                      setCmd(false);
                    }}
                  >
                    {i + 1} · {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-kicker uppercase tracking-kicker text-subtle">esc close</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TakeWhyMove({ take, why, move }: { take: string; why: string; move: string }) {
  return (
    <div className="adhd-grid">
      <article className="adhd-card adhd-take">
        <h3>Take</h3>
        <p>{take}</p>
      </article>
      <article className="adhd-card adhd-why">
        <h3>Why it matters</h3>
        <p>{why}</p>
      </article>
      <article className="adhd-card adhd-move">
        <h3>Move</h3>
        <p>{move}</p>
      </article>
    </div>
  );
}

function Skim() {
  return (
    <section className="skim sage-panel p-4 md:p-5" aria-label="If you only have 90 seconds">
      <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">If you only have 90 seconds</p>
      <ol className="mt-3">
        {SKIM.map((line, i) => (
          <li key={line}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <p>{line}</p>
          </li>
        ))}
      </ol>
      <p className="skim-bottom mt-4">{BOTTOM_LINE}</p>
    </section>
  );
}

function WireRow({ w }: { w: Edition["wiresKeep"][number] }) {
  return (
    <li className="wire-row">
      <span className="font-mono text-kicker uppercase tracking-kicker text-subtle">{w.outlet}</span>
      {w.href ? (
        <a href={w.href} target="_blank" rel="noreferrer">
          {w.title}
        </a>
      ) : (
        <span className="font-sans text-sm font-semibold leading-snug">{w.title}</span>
      )}
    </li>
  );
}

function MetrSecurityFeature({
  story,
  item,
}: {
  story?: Edition["metr"][number];
  item?: DigestItem;
}) {
  if (!item && !story) return null;
  return (
    <article className="metr-feature sage-panel p-5">
      <p className="font-mono text-kicker uppercase tracking-kicker text-hazard">METR security · governance</p>
      <h3 className="mt-2 font-sans text-xl font-semibold leading-snug">{item?.title ?? story?.title}</h3>
      {item ? (
        <div className="mt-4">
          <TakeWhyMove take={item.take} why={item.why} move={item.move} />
        </div>
      ) : (
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">{story?.summary}</p>
      )}
      {story?.href ? (
        <a href={story.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-11 items-center gap-2 text-sm text-ok">
          <ExternalLink size={14} aria-hidden /> Open METR
        </a>
      ) : null}
    </article>
  );
}

function sourceTone(s: SourceLog) {
  if (!s.ok) return "sage-stale";
  if (s.live) return "desk-chip-live";
  return "";
}

function IngestLog({ ingest }: { ingest: SourceLog[] }) {
  return (
    <ol className="source-row" aria-label="Ingest log">
      {ingest.map((s) => (
        <li key={s.id} className={cn("source-card", sourceTone(s))}>
          <span className="font-mono text-kicker uppercase tracking-kicker">
            {s.label} · {s.live ? "Live" : "Snapshot"}
          </span>
          <strong>{s.ok ? s.count : "failed"}</strong>
          <span>{s.note}</span>
          <span className="font-mono text-kicker uppercase tracking-kicker text-subtle">
            {s.at.slice(0, 16).replace("T", " ")}Z{s.ms ? ` · ${s.ms}ms` : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Pipe({
  edition,
  ingest,
  compiling,
  onCompile,
}: {
  edition: Edition;
  ingest: SourceLog[];
  compiling: boolean;
  onCompile: () => void;
}) {
  const n = editionCounts(edition);
  const notes: Record<string, string> = {
    ingest: ingest
      .map((s) => `${s.label} ${s.ok ? s.count : "fail"}`)
      .join(" · "),
    rank: `1 lead · ${n.updates} updates · ${n.related} related · ${n.rumors} unconfirmed`,
    brief: `Compiled ${edition.at.slice(11, 16)}Z`,
    voice: "Eve and Orion · 14 Sep tape",
  };
  return (
    <section className="sage-panel p-4 md:p-5" aria-label="How this edition was made">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Pipeline</p>
          <h2 className="mt-1 font-sans text-xl font-semibold">Ingest → rank → brief</h2>
        </div>
        <button type="button" className="desk-lane-btn lock-cta" onClick={onCompile} disabled={compiling}>
          <RefreshCw size={14} aria-hidden /> {compiling ? "Refreshing…" : "Refresh now"}
        </button>
      </div>
      <IngestLog ingest={ingest} />
      <ol className="pipe-row mt-3" aria-label="News pipeline">
        {STAGES.map((s, i) => (
          <li key={s.id} className={cn("pipe-stage", `pipe-${s.status}`)}>
            <span className="font-mono text-kicker uppercase tracking-kicker">
              {String(i + 1).padStart(2, "0")} {s.label}
            </span>
            <span className="text-sm">{notes[s.id] ?? s.note}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Brief({
  q = "",
  edition,
  ingest,
  compiling,
  onCompile,
  onOpenStory,
  onListen,
}: {
  q?: string;
  edition: Edition;
  ingest: SourceLog[];
  compiling: boolean;
  onCompile: () => void;
  onOpenStory: (id: string) => void;
  onListen: () => void;
}) {
  const lead = edition.lead;
  const needle = q.trim().toLowerCase();
  const updates = TODAY.rows.filter((r) => !needle || `${r.title} ${r.take}`.toLowerCase().includes(needle));
  const waveMax = Math.max(...WAVES.map((w) => w.count));
  const keeps = edition.papersKeep.slice(0, 4);
  const shelves = edition.papersShelf.slice(0, 3);
  return (
    <div className="grid gap-4">
      <Pipe edition={edition} ingest={ingest} compiling={compiling} onCompile={onCompile} />
      <Skim />
      <section className="story-hero sage-lead-frame">
        <img src="/wave-hud.jpg" alt="" className="story-hero-bg" crossOrigin="anonymous" />
        <div className="story-hero-body">
          <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">
            Lead story · {storyWhen(lead.id)} · {readMinutes(lead.take, lead.why, lead.move)} min
          </p>
          <h1 className="story-mast mt-3">{lead.title}</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">{CYCLE.leadWhy}</p>
          <ul className="stat-row mt-6">
            {[
              ["1,200", "agents on the board"],
              ["~700", "reached Hugging Face"],
              ["956", "secrets taken"],
            ].map(([n, label]) => (
              <li key={label} className="stat-tile">
                <p className="stat-n">{n}</p>
                <p className="stat-l">{label}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <TakeWhyMove take={lead.take} why={lead.why} move={lead.move} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" className="desk-lane-btn lock-cta" onClick={() => onOpenStory(lead.id)}>
              Read the full story
            </button>
            <button type="button" className="desk-lane-btn" onClick={onListen}>
              Listen · Eve & Orion
            </button>
            {lead.refs.slice(0, 2).map((r) => (
              <a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="desk-lane-btn">
                <ExternalLink size={14} aria-hidden /> {r.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sage-panel p-4 md:p-5" aria-label="Three waves">
        <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">How the swarm actually grew</p>
        <h2 className="mt-1 font-sans text-xl font-semibold">Three waves · cohort size, not a civilization</h2>
        <ol className="chrono mt-6" aria-label="Timeline">
          {WAVE_TIMELINE.map((t) => (
            <li key={t.date}>
              <i aria-hidden />
              <span>{t.date}</span>
              <strong>{t.what}</strong>
            </li>
          ))}
        </ol>
        <ul className="mt-6 grid gap-4">
          {WAVES.map((w) => (
            <li key={w.id} className={cn("wave-row", w.id === 2 && "sage-wave-hot")}>
              <div>
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                  Wave {w.id} · {w.cite}
                </p>
                <p className="mt-1 font-sans text-base font-semibold">{w.label}</p>
              </div>
              <div>
                <div className="wave-bar" aria-hidden>
                  <i style={{ width: `${Math.round((w.count / waveMax) * 100)}%` }} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{w.scope}</p>
              </div>
              <p className="stat-n text-right">{w.n}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-ok">METR · governance primary</p>
        <h2 className="mt-1 font-sans text-xl font-semibold">The evaluator was attacked. Same class, different target. Not a lead swap.</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          English posts only. Translations of the Hugging Face investigation are dropped. Benton left Anthropic for METR; Engels left DeepMind. Amodei wants them embedded. METR’s 31 Aug security post is why this desk reads METR first after the lead.
        </p>
        {(() => {
          const m = splitMetr(edition.metr);
          const hit = (w: (typeof edition.metr)[number]) => !needle || `${w.title} ${w.summary}`.toLowerCase().includes(needle);
          const securityItem = DIGEST_ITEMS.find((i) => i.id === "metr-security");
          const securityStory = m.security.find(hit);
          return (
            <div className="mt-4 grid gap-4">
              {securityStory || securityItem ? <MetrSecurityFeature story={securityStory} item={securityItem} /> : null}
              {m.onLead.filter(hit).length ? (
                <div>
                  <p className="font-mono text-kicker uppercase tracking-kicker text-ok">On the lead</p>
                  <ul className="mt-2 grid gap-2">
                    {m.onLead.filter(hit).map((w) => (
                      <WireRow key={w.id} w={w} />
                    ))}
                  </ul>
                </div>
              ) : null}
              {m.rest.filter(hit).length ? (
                <div>
                  <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Also from METR</p>
                  <ul className="mt-2 grid gap-2">
                    {m.rest.filter(hit).slice(0, 4).map((w) => (
                      <WireRow key={w.id} w={w} />
                    ))}
                  </ul>
                </div>
              ) : null}
              {!edition.metr.length ? (
                <div className={cn("skel sage-panel", compiling && "skel-on")} aria-hidden={!compiling}>
                  <p className="p-4 text-sm text-muted">{compiling ? "Refreshing METR…" : "METR last board unavailable."}</p>
                </div>
              ) : null}
            </div>
          );
        })()}
      </section>

      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-amber">This window · 15 Sep</p>
        <h2 className="mt-1 font-sans text-xl font-semibold">What landed around the lead</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{TODAY.take}</p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {updates.map((r, i) => {
            const item = DIGEST_ITEMS.find((x) => x.id === r.id);
            const kind = item ? KIND_LABEL[item.kind] : "Also";
            return (
              <li key={r.id}>
                <button type="button" className="update-card sage-panel w-full p-4 text-left" onClick={() => onOpenStory(r.id)}>
                  <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                    {String(i + 1).padStart(2, "0")} · {kind}
                  </p>
                  <h3 className="mt-2 font-sans text-lg font-semibold leading-snug">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{r.take}</p>
                  <span className="mt-3 inline-flex items-center text-sm text-ok">Open story</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Wire · live</p>
        <h2 className="mt-1 font-sans text-xl font-semibold">HuggingNews, then the eval desks. Ranked. Not a replacement for the lead.</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          HuggingNews through the day. Alignment Forum, Transformer, Redwood, Import AI, Epoch, and Zvi for control writing. Chip-design policy and robotaxis shelf.
        </p>
        {edition.wiresKeep.length ? (
          <div className="mt-4 grid gap-4">
            {groupWires(
              edition.wiresKeep.filter((w) => !needle || `${w.title} ${w.summary} ${w.outlet}`.toLowerCase().includes(needle)),
              2,
            ).map(([outlet, rows]) => (
              <div key={outlet}>
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">{outlet}</p>
                <ul className="mt-2 grid gap-2">
                  {rows.map((w) => (
                    <WireRow key={w.id} w={w} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">{compiling ? "Refreshing the wire…" : "No kept wire this pull."}</p>
        )}
      </section>

      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Papers worth keeping today</p>
        <p className="mt-1 text-sm text-muted">Keep is not upvote. A one-upvote skill-routing paper stays. A 51-upvote robotics paper shelves.</p>
        <div className="paper-split mt-3">
          <ul className="grid gap-3">
            {keeps.map((p) => (
              <li key={p.id} className="sage-panel p-4 keep-card">
                <p className="font-mono text-kicker uppercase tracking-kicker text-ok">Keep · {p.up} upvotes</p>
                <h3 className="mt-2 font-sans text-base font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{keepWhy(p.id, p.title)}</p>
                <a href={p.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-11 items-center gap-2 text-sm text-ok">
                  <ExternalLink size={14} aria-hidden /> arXiv
                </a>
              </li>
            ))}
          </ul>
          <ul className="grid gap-3">
            {shelves.map((p) => (
              <li key={p.id} className="sage-panel p-4 shelf-card">
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Shelf · {p.up} upvotes</p>
                <h3 className="mt-2 font-sans text-base font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{keepWhy(p.id, p.title)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stories({ q = "", edition, onTape }: { q?: string; edition: Edition; onTape: (e: string) => void }) {
  const [tab, setTab] = useState<"all" | "lead" | "related" | "also" | "noise">("all");
  const [openId, setOpenId] = useState(DIGEST_ITEMS[0].id);
  const [last, setLast] = useState<string | null>(edition.at);
  const [showPack, setShowPack] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PACK_KEY);
      if (raw) setLast(raw);
      const open = localStorage.getItem(OPEN_KEY);
      if (open && DIGEST_ITEMS.some((i) => i.id === open || i.file === open)) {
        const hit = DIGEST_ITEMS.find((i) => i.id === open || i.file === open);
        if (hit) setOpenId(hit.id);
      }
    } catch {
      /* ignore */
    }
  }, []);
  const cadence = useMemo(() => nextDue(last ?? PACK_AT), [last]);
  const report = useMemo(() => renderEdition(edition), [edition]);
  const plan = useMemo(() => renderPlan(), []);
  const needle = q.trim().toLowerCase();
  const filtered = DIGEST_ITEMS.filter((i) => {
    if (tab === "lead" && i.kind !== "lead" && i.kind !== "addendum") return false;
    if (tab === "related" && i.kind !== "companion") return false;
    if (tab === "also" && i.kind !== "rest") return false;
    if (tab === "noise" && i.kind !== "drop") return false;
    if (needle && !`${i.title} ${i.take} ${i.why} ${topicOf(i.file).label}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const item = filtered.find((i) => i.id === openId) ?? filtered[0] ?? DIGEST_ITEMS[0];
  const idx = filtered.findIndex((i) => i.id === item.id);
  const prev = idx > 0 ? filtered[idx - 1] : null;
  const next = idx >= 0 && idx < filtered.length - 1 ? filtered[idx + 1] : null;
  const mins = readMinutes(item.take, item.why, item.move, item.evidence.join(" "));
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Story library</p>
          <h2 className="mt-1 font-sans text-2xl font-semibold">Read one story at a time</h2>
          <p className="mt-1 max-w-prose text-sm text-muted">
            Next pack {cadence.due ? "is due" : `holds until ${cadence.nextAt.slice(11, 16)}Z`}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="desk-lane-btn lock-cta"
            onClick={() => {
              download(`sage-briefing-${edition.at.slice(0, 13)}.md`, report, "text/markdown");
              setShowPack(true);
              onTape("download edition");
            }}
          >
            Download edition
          </button>
          <button
            type="button"
            className="desk-lane-btn"
            onClick={() => download("sage-briefing.json", JSON.stringify({ at: edition.at, items: DIGEST_ITEMS, plan, dropped: DROPPED, counts: editionCounts(edition) }, null, 2), "application/json")}
          >
            Download JSON
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["all", "All"],
            ["lead", "Lead + updates"],
            ["related", "Related"],
            ["also", "Also this week"],
            ["noise", "Noise"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className="desk-lane-btn" aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <ol className="grid content-start gap-2 lg:col-span-4">
          {filtered.map((i, n) => (
            <li key={i.id}>
              <button type="button" className={cn("story-hit sage-panel w-full p-4 text-left", i.id === item.id && "sage-lead-frame")} onClick={() => setOpenId(i.id)}>
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                  {String(n + 1).padStart(2, "0")} · {KIND_LABEL[i.kind]} · {topicOf(i.file).label}
                </p>
                <h3 className="mt-2 font-sans text-base font-semibold leading-snug">{i.title}</h3>
                <p className="mt-1 font-mono text-kicker uppercase tracking-kicker text-subtle">{storyWhen(i.id)}</p>
              </button>
            </li>
          ))}
          {filtered.length === 0 ? <li className="text-sm text-muted">Nothing in this filter.</li> : null}
        </ol>
        <article className="sage-panel p-5 lg:col-span-8">
          <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">
            {KIND_LABEL[item.kind]} · {topicOf(item.file).label} · {SURE_LABEL[item.confidence]} · {mins} min
          </p>
          <h3 className="mt-2 font-sans text-2xl font-semibold leading-tight text-balance">{item.title}</h3>
          <p className="mt-1 font-mono text-kicker uppercase tracking-kicker text-subtle">{storyWhen(item.id)}</p>
          <blockquote className="pull-quote mt-4">{item.take}</blockquote>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">{topicOf(item.file).blurb}</p>
          <div className="mt-5">
            <TakeWhyMove take={item.take} why={item.why} move={item.move} />
          </div>
          <p className="mt-5 font-mono text-kicker uppercase tracking-kicker text-amber">Go deeper</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
            {item.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-5 font-mono text-kicker uppercase tracking-kicker text-amber">Sources</p>
          <ul className="mt-2 space-y-2">
            {item.refs.map((r) => (
              <li key={r.href}>
                <a className="inline-flex items-center gap-2 text-sm text-ok" href={r.href} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} aria-hidden /> {r.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="sage-panel mt-5 p-4">
            <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Where this sits</p>
            <p className="mt-2 text-sm leading-relaxed">{placementNote(item)}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="desk-lane-btn" disabled={!prev} onClick={() => prev && setOpenId(prev.id)}>
              <ChevronLeft size={14} aria-hidden /> Previous
            </button>
            <button type="button" className="desk-lane-btn" disabled={!next} onClick={() => next && setOpenId(next.id)}>
              Next <ChevronRight size={14} aria-hidden />
            </button>
          </div>
          {DIGEST_ITEMS.filter((i) => i.file === item.file && i.id !== item.id).length ? (
            <div className="mt-5">
              <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Same topic</p>
              <ul className="mt-2 grid gap-2">
                {DIGEST_ITEMS.filter((i) => i.file === item.file && i.id !== item.id).map((r) => (
                  <li key={r.id}>
                    <button type="button" className="story-hit sage-panel w-full p-3 text-left" onClick={() => setOpenId(r.id)}>
                      <span className="font-mono text-kicker uppercase tracking-kicker text-subtle">{KIND_LABEL[r.kind]}</span>
                      <span className="mt-1 block font-sans text-sm font-semibold">{r.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      </div>
      {showPack ? <pre className="sage-panel max-h-80 overflow-auto p-4 text-sm whitespace-pre-wrap">{report}</pre> : null}
      <section className="sage-panel p-4">
        <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">How these stories connect</p>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {BONDS.map((b) => (
            <li key={b.from + b.to} className="text-sm leading-relaxed">
              <span className="text-amber">{NODE_LABEL[b.from] ?? b.from}</span>
              <span className="text-subtle"> → </span>
              <span className="text-cyan">{NODE_LABEL[b.to] ?? b.to}</span>
              <span className="mt-1 block text-muted">{b.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function meterClass(status: (typeof METERS)[number]["status"]) {
  if (status === "ok") return "text-ok";
  if (status === "soft") return "text-amber";
  if (status === "deny") return "text-hazard";
  return "text-subtle";
}

function Pulse({ q = "", edition, ingest }: { q?: string; edition: Edition; ingest: SourceLog[] }) {
  const [tag, setTag] = useState<"all" | CrawlPost["tag"]>("all");
  const needle = q.trim().toLowerCase();
  const posts = edition.confirmed.concat(edition.rumors);
  const feed = posts.filter((p) => (tag === "all" || p.tag === tag) && (!needle || `${p.handle} ${p.text} ${p.take}`.toLowerCase().includes(needle)));
  const taste = TASTE.filter((p) => !needle || `${p.handle} ${p.text} ${p.take}`.toLowerCase().includes(needle));
  const confirmed = feed.filter((p) => p.tag !== "rumor");
  const rumors = feed.filter((p) => p.tag === "rumor");
  const xAt = ingest.find((s) => s.id === "x")?.at ?? CRAWL_AT;
  const wires = edition.wiresKeep.filter((w) => !needle || `${w.title} ${w.summary}`.toLowerCase().includes(needle));
  const metr = edition.metr.filter((w) => !needle || `${w.title} ${w.summary}`.toLowerCase().includes(needle));
  const tracker = edition.tracker.filter((h) => !needle || `${h.title} ${h.source}`.toLowerCase().includes(needle));
  return (
    <div className="grid gap-4">
      <div>
        <p className="font-mono text-kicker uppercase tracking-kicker text-amber">Live feed</p>
        <h2 className="mt-1 font-sans text-2xl font-semibold">METR security first. Then the wire. Then X. Rumors on the right.</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          METR is the independent evaluator — English only. Their own security incidents are governance, not a lead swap. HuggingNews is the through-the-day wire. Epoch and Zvi are titles-only. X is a Curran-class snapshot. Tracker drops leaderboard ticks.
        </p>
        <IngestLog ingest={ingest} />
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7" aria-label="Source status">
          {METERS.map((m) => (
            <li key={m.id} className="sage-panel p-3">
              <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">{m.label}</p>
              <p className={cn("mt-1 font-sans text-sm font-semibold", meterClass(m.status))}>{m.status === "ok" ? "On" : m.status === "deny" ? "Off" : m.status === "skip" ? "Not wired" : "Soft"}</p>
              <p className="mt-1 text-sm text-muted">{m.note}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-3 flex flex-wrap gap-1" aria-label="Watch accounts">
          {WATCH_ACCOUNTS.map((a) => (
            <li key={a.handle} className="desk-chip">
              @{a.handle}
            </li>
          ))}
        </ul>
      </div>
      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-ok">METR · {metr.length} English</p>
        {(() => {
          const m = splitMetr(metr);
          const securityItem = DIGEST_ITEMS.find((i) => i.id === "metr-security");
          return (
            <div className="mt-3 grid gap-4">
              {m.security[0] || securityItem ? <MetrSecurityFeature story={m.security[0]} item={securityItem} /> : null}
              {m.onLead.length || m.rest.length ? (
                <ul className="grid gap-2">
                  {[...m.onLead, ...m.rest].slice(0, 5).map((w) => (
                    <WireRow key={w.id} w={w} />
                  ))}
                </ul>
              ) : null}
              {!metr.length ? <p className="text-sm text-muted">METR last board unavailable.</p> : null}
            </div>
          );
        })()}
      </section>
      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-ok">Wire · {wires.length} kept</p>
        {wires.length ? (
          <div className="mt-3 grid gap-3">
            {groupWires(wires, 2).map(([outlet, rows]) => (
              <div key={outlet}>
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">{outlet}</p>
                <ul className="mt-2 grid gap-2">
                  {rows.map((w) => (
                    <WireRow key={w.id} w={w} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">No kept wire this pull.</p>
        )}
      </section>
      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Model tracker · {tracker.length} kept</p>
        {tracker.length ? (
          <ul className="mt-3 grid gap-2 md:grid-cols-3">
            {tracker.slice(0, 6).map((h) => (
              <li key={h.id} className="sage-panel p-3">
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">{h.source}</p>
                <p className="mt-1 font-sans text-sm font-semibold leading-snug">{h.title}</p>
                {h.models.length ? <p className="mt-1 text-sm text-muted">{h.models.slice(0, 4).join(", ")}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Leaderboard ticks dropped. No model or docs change this pull.</p>
        )}
      </section>
      <div className="flex flex-wrap gap-1">
        {(["all", "lead-bond", "companion", "rest", "rumor"] as const).map((id) => (
          <button key={id} type="button" className="desk-lane-btn" aria-current={tag === id ? "page" : undefined} onClick={() => setTag(id)}>
            {id === "all" ? "X all" : PULSE_TAG[id]}
          </button>
        ))}
      </div>
      <div className="paper-split">
        <section>
          <p className="font-mono text-kicker uppercase tracking-kicker text-ok">Confirmed on X · {xAt.slice(0, 16)}Z</p>
          <ul className="mt-3 grid gap-3">
            {confirmed.map((p) => (
              <li key={p.id} className="sage-panel confirmed-card overflow-hidden">
                {p.media ? <img src={p.media} alt="" className="h-40 w-full object-cover opacity-85" crossOrigin="anonymous" /> : null}
                <div className="p-4">
                  <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                    @{p.handle} · {PULSE_TAG[p.tag] ?? p.tag} · {p.likes} likes
                  </p>
                  <p className="mt-2 font-sans text-base font-medium leading-snug">{p.take}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                  <a href={p.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-11 items-center gap-2 text-sm text-ok">
                    <ExternalLink size={14} aria-hidden /> Open on X
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <p className="font-mono text-kicker uppercase tracking-kicker text-hazard">Unconfirmed</p>
          <ul className="mt-3 grid gap-3">
            {rumors.map((p) => (
              <li key={p.id} className="sage-panel rumor-card overflow-hidden">
                <div className="p-4">
                  <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                    @{p.handle} · rumor · {p.likes} likes
                  </p>
                  <p className="mt-2 font-sans text-base font-medium leading-snug">{p.take}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                  <a href={p.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-11 items-center gap-2 text-sm text-ok">
                    <ExternalLink size={14} aria-hidden /> Open on X
                  </a>
                </div>
              </li>
            ))}
            {!rumors.length ? <li className="text-sm text-muted">No rumors in this filter.</li> : null}
          </ul>
          <p className="mt-6 font-mono text-kicker uppercase tracking-kicker text-amber">
            Bookmarks · {TASTE.length}/{TASTE_SCANNED}
          </p>
          <p className="mt-1 text-sm text-muted">Never the lead. {TASTE_AT.slice(0, 16)}Z</p>
          <ul className="mt-3 space-y-3">
            {taste.map((p) => (
              <li key={p.id} className="sage-panel p-4">
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">@{p.handle}</p>
                <p className="mt-1 text-sm font-medium">{p.take}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{p.text}</p>
                <a href={p.href} target="_blank" rel="noreferrer" className="mt-2 inline-flex h-11 items-center gap-2 text-sm text-ok">
                  <ExternalLink size={14} aria-hidden /> Open
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Papers({ q = "", papers }: { q?: string; papers: PaperRow[] }) {
  const [open, setOpen] = useState<string | null>(papers.find((p) => p.keep)?.id ?? null);
  const [mode, setMode] = useState<"all" | "keep" | "shelf">("all");
  const rows = papers.length ? papers : PAPERS;
  const needle = q.trim().toLowerCase();
  const shown = rows.filter((p) => {
    if (mode === "keep" && !p.keep) return false;
    if (mode === "shelf" && p.keep) return false;
    if (needle && !`${p.id} ${p.title} ${p.abstract ?? ""}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const keep = shown.filter((p) => p.keep);
  const shelf = shown.filter((p) => !p.keep);
  const split = mode === "all";
  return (
    <div>
      <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">{papers.length ? "Hugging Face live" : "Cached papers"}</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold">Keep is not upvote</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">High-upvote image papers can lead the HF board and still miss this desk. We keep agent-security papers even at 1 upvote.</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {(
          [
            ["all", "Split view"],
            ["keep", "Worth keeping"],
            ["shelf", "High-upvote shelf"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className="desk-lane-btn" aria-current={mode === id ? "page" : undefined} onClick={() => setMode(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className={cn(split ? "paper-split mt-4" : "mt-4")}>
        {(split ? [keep, shelf] : [shown]).map((col, ci) => (
          <div key={ci}>
            {split ? (
              <p className={cn("font-mono text-kicker uppercase tracking-kicker", ci === 0 ? "text-ok" : "text-subtle")}>
                {ci === 0 ? `Worth keeping · ${keep.length}` : `Shelved · ${shelf.length}`}
              </p>
            ) : null}
            <ul className={cn("space-y-3", split && "mt-3")}>
              {col.map((p) => (
                <li key={p.id} className={cn("sage-panel p-4", p.keep ? "keep-card" : "shelf-card")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                        {p.keep ? "Keep" : "Shelf"} · {p.up} upvotes
                      </p>
                      <h3 className="mt-2 font-sans text-lg font-semibold leading-snug">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{keepWhy(p.id, p.title)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="desk-lane-btn" onClick={() => setOpen(open === p.id ? null : p.id)}>
                        {open === p.id ? "Hide abstract" : "Abstract"}
                      </button>
                      <a href={p.href} target="_blank" rel="noreferrer" className="desk-lane-btn">
                        <ExternalLink size={14} aria-hidden /> arXiv
                      </a>
                    </div>
                  </div>
                  {open === p.id ? <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">{p.abstract}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Voice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);
  const [vol, setVol] = useState(0.9);
  const [levels, setLevels] = useState([4, 8, 12, 6, 10, 5, 14, 7]);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(240);
  const lead = DIGEST_ITEMS.find((i) => i.kind === "lead");
  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = vol;
  }, [vol]);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setLevels(Array.from({ length: 8 }, () => 4 + Math.round(Math.random() * 24)));
    }, 120);
    return () => window.clearInterval(id);
  }, [playing]);
  const active = VOICE_TURNS.reduce((acc, turn, i) => (t >= turn.t ? i : acc), 0);
  useEffect(() => {
    const el = listRef.current?.querySelector("[data-active='true']");
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);
  const seek = (sec: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = sec;
    setT(sec);
    void el.play();
  };
  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };
  const skip = (d: number) => seek(Math.max(0, Math.min(dur, t + d)));
  const pct = dur > 0 ? Math.min(100, (t / dur) * 100) : 0;
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="sage-panel p-5 lg:col-span-8">
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Podcast · Eve and Orion</p>
        <h2 className="mt-1 font-sans text-2xl font-semibold">Today’s briefing, out loud</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">Two hosts. Not a whisper. About eight minutes.</p>
        <audio
          ref={audioRef}
          src="/sage-desk.mp3?v=14sep-eve"
          className="sr-only"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setT((e.target as HTMLAudioElement).currentTime)}
          onLoadedMetadata={(e) => setDur((e.target as HTMLAudioElement).duration || 240)}
        />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" className="desk-lane-btn" onClick={() => skip(-15)}>
            <SkipBack size={14} aria-hidden /> 15s
          </button>
          <button type="button" className="desk-lane-btn lock-cta" onClick={toggle}>
            {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />} {playing ? "Pause" : "Play"}
          </button>
          <button type="button" className="desk-lane-btn" onClick={() => skip(15)}>
            <SkipForward size={14} aria-hidden /> 15s
          </button>
          <span className="font-mono text-kicker uppercase tracking-kicker text-subtle">
            {fmtClock(t)} / {fmtClock(dur)}
          </span>
        </div>
        <div
          className="voice-progress mt-4"
          role="slider"
          aria-label="Playback"
          aria-valuemin={0}
          aria-valuemax={Math.round(dur)}
          aria-valuenow={Math.round(t)}
          tabIndex={0}
          onClick={(e) => {
            const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            seek(((e.clientX - r.left) / r.width) * dur);
          }}
        >
          <span style={{ width: `${pct}%` }} />
          {VOICE_TURNS.map((turn, i) => (
            <i key={i} className="voice-mark" style={{ left: `${dur ? (turn.t / dur) * 100 : 0}%` }} />
          ))}
        </div>
        <div className="mt-4 flex items-end gap-4">
          <div className="vu" aria-hidden>
            {levels.map((h, i) => (
              <span key={i} style={{ height: playing ? h : 4 }} />
            ))}
          </div>
          <label className="flex flex-1 items-center gap-2 text-sm text-muted">
            Volume
            <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(Number(e.target.value))} className="flex-1" />
          </label>
        </div>
        <ol ref={listRef} className="mt-5 max-h-80 space-y-3 overflow-auto">
          {VOICE_TURNS.map((turn, i) => (
            <li key={i}>
              <button
                type="button"
                data-active={i === active ? "true" : "false"}
                className={cn("w-full p-3 text-left", i === active && "sage-lead-frame sage-panel")}
                onClick={() => seek(turn.t)}
              >
                <span className={cn("font-mono text-kicker uppercase tracking-kicker", turn.speaker === "eve" ? "text-cyan" : "text-amber")}>
                  {turn.speaker === "eve" ? "Eve" : "Orion"} · {fmtClock(turn.t)}
                </span>
                <p className={cn("mt-1 text-sm leading-relaxed", i === active ? "text-fg" : "text-muted")}>{turn.text}</p>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <aside className="sage-panel p-4 lg:col-span-4">
        <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">On this tape</p>
        <p className="mt-2 font-sans text-base font-semibold">{lead?.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{TODAY.take}</p>
        <p className="mt-4 font-mono text-kicker uppercase tracking-kicker text-cyan">Chapters</p>
        <ol className="mt-2 grid gap-1">
          {VOICE_TURNS.map((turn, i) => (
            <li key={i}>
              <button type="button" className={cn("desk-lane-btn w-full justify-start text-left", i === active && "lock-cta")} onClick={() => seek(turn.t)}>
                {fmtClock(turn.t)} · {turn.speaker === "eve" ? "Eve" : "Orion"}
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

function MailLane({ q = "", mail, at }: { q?: string; mail: MailHit[]; at: string }) {
  const needle = q.trim().toLowerCase();
  const rows = mail.filter((m) => !needle || `${m.from} ${m.subject} ${m.take}`.toLowerCase().includes(needle));
  return (
    <div>
      <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Inbox · {at.slice(0, 10)}</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold">Newsletter highlights</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">One take per letter. None of these take the front page on their own. Last pull from the connected inbox.</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {rows.map((m) => (
          <li key={m.id} className="sage-panel p-4">
            <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
              {m.from} · {m.at.slice(0, 10)}
            </p>
            <h3 className="mt-2 font-sans text-lg font-semibold leading-snug">{m.subject}</h3>
            <p className="mt-3 text-sm leading-relaxed">
              <span className="font-mono text-kicker uppercase tracking-kicker text-cyan">Take · </span>
              {m.take}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Gov({
  tape,
  edition,
  ingest,
  onCompile,
  compiling,
}: {
  tape: TapeRow[];
  edition: Edition;
  ingest: SourceLog[];
  onCompile: () => void;
  compiling: boolean;
}) {
  const [probe, setProbe] = useState("");
  const verdict = probe.trim() ? rankClaim(probe) : null;
  const n = editionCounts(edition);
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <section className="sage-panel p-5 lg:col-span-12">
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">How we rank</p>
        <h2 className="mt-1 font-sans text-2xl font-semibold">An editor’s call, not a seal</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed">{CYCLE.leadWhy}</p>
        <ol className="mt-4 grid gap-2">
          {RANK_RULES.map((r, i) => (
            <li key={r} className="flex gap-3 text-sm leading-relaxed">
              <span className="font-display text-amber">{String(i + 1).padStart(2, "0")}</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="lg:col-span-12">
        <Pipe edition={edition} ingest={ingest} compiling={compiling} onCompile={onCompile} />
      </section>
      <section className="sage-panel p-4 lg:col-span-12">
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Sources this desk actually uses</p>
        <h2 className="mt-1 font-sans text-xl font-semibold">METR security first. Live wire. Live papers. Live tracker. Snapshot X and mail.</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SOURCE_CARD.map((s) => (
            <li key={s.id} className="sage-panel p-4">
              <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                {s.live ? "Live" : s.role === "deny" ? "Never news" : "Snapshot"} · {s.role}
              </p>
              <h3 className="mt-2 font-sans text-base font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.note}</p>
              <a href={s.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-11 items-center gap-2 text-sm text-ok">
                <ExternalLink size={14} aria-hidden /> Open source
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="sage-panel p-4 lg:col-span-4">
        <p className="font-mono text-kicker uppercase tracking-kicker text-ok">We use</p>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
          {CYCLE.trust.allow.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section className="sage-panel p-4 lg:col-span-4">
        <p className="font-mono text-kicker uppercase tracking-kicker text-hazard">We skip</p>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
          {CYCLE.trust.deny.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section className="sage-panel p-4 lg:col-span-4">
        <p className="font-mono text-kicker uppercase tracking-kicker text-muted">Still open</p>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
          {CYCLE.trust.open.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section className="sage-panel p-4 lg:col-span-12">
        <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Where would this sit?</p>
        <p className="mt-1 text-sm text-muted">Paste a claim. This is a ranking hint.</p>
        <input
          className="sage-search mt-3 w-full"
          placeholder="e.g. Astra take the wheel is the new lead"
          value={probe}
          onChange={(e) => setProbe(e.target.value)}
        />
        {verdict ? (
          <p className="mt-2 text-sm">
            <span className="font-mono text-kicker uppercase tracking-kicker text-amber">{verdict.rank.replace("-", " ")}</span>
            <span className="mt-1 block text-muted">{verdict.reason}</span>
          </p>
        ) : null}
        <p className="mt-4 font-mono text-kicker uppercase tracking-kicker text-subtle">
          This edition · {n.updates} updates · {n.keep} papers kept · {n.rumors} rumors
        </p>
      </section>
      <section className="sage-panel p-4 lg:col-span-12">
        <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Recent actions</p>
        <ul className="mt-2 space-y-1 font-mono text-kicker uppercase tracking-kicker text-muted">
          {tape.length ? (
            tape.slice(0, 8).map((r) => (
              <li key={r.at + r.event}>
                {r.at.slice(11, 19)}Z · {r.event}
              </li>
            ))
          ) : (
            <li>empty · compile or download writes here</li>
          )}
        </ul>
      </section>
    </div>
  );
}
