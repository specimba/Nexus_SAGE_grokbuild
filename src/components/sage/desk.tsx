import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Inbox,
  Newspaper,
  Pause,
  Play,
  RefreshCw,
  Rss,
  Search,
  Shield,
  Square,
  Volume2,
} from "lucide-react";
import { CRAWL_AT, type CrawlPost } from "@/data/x-crawl";
import { TASTE, TASTE_AT, TASTE_SCANNED } from "@/data/x-taste";
import { KIND_LABEL, LANE_COPY, PULSE_TAG, readMinutes } from "@/data/story-ui";
import { PAPERS } from "@/data/papers";
import { METERS } from "@/data/ingest";
import { MAIL_AT, type MailHit } from "@/data/mail";
import { STAGES } from "@/data/pipeline";
import { LEAD, TRUST } from "@/data/incident";
import { PACK_KEY } from "@/lib/digest-pack";
import {
  briefingBeats,
  compileDigest,
  editionCounts,
  editionStories,
  placementNote,
  renderEdition,
  splitMetr,
  groupWires,
  type Edition,
  type PaperRow,
} from "@/lib/compile";
import { RANK_RULES, rankClaim } from "@/lib/rank";
import { crawlAgeHours } from "@/lib/x-pulse";
import { fetchEdition, type PackMeta } from "@/lib/edition";
import { snapshotIngest, type SourceLog } from "@/lib/ingest-log";
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
  voice: Volume2,
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

function when(at: string) {
  return at ? at.slice(0, 10) : LEAD.window;
}

const EMPTY_EDITION = compileDigest({ at: new Date().toISOString().slice(0, 19) + "Z" });
const EMPTY_INGEST = snapshotIngest();

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
  const [cmd, setCmd] = useState(false);
  const [focus, setFocus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readPct, setReadPct] = useState(0);
  const [edition, setEdition] = useState<Edition>(EMPTY_EDITION);
  const [ingest, setIngest] = useState<SourceLog[]>(EMPTY_INGEST);
  const [packs, setPacks] = useState<PackMeta[]>([]);
  const [compiling, setCompiling] = useState(false);
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().slice(11, 19));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    setCompiling(true);
    fetchEdition()
      .then((pack) => {
        setEdition(pack.edition);
        setIngest(pack.ingest);
        setPacks(pack.packs ?? []);
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
      setPacks(pack.packs ?? []);
      try {
        localStorage.setItem(PACK_KEY, pack.edition.at);
      } catch {
        /* ignore */
      }
    } catch {
      setEdition(compileDigest({ at: new Date().toISOString() }));
    } finally {
      setCompiling(false);
    }
  };

  const counts = editionCounts(edition);
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
        <span className="live-pill">
          <span className="live-dot" aria-hidden />
          {compiling ? "Refreshing" : "Live"}
        </span>
        <span className={cn("desk-chip", feedAge.stale ? "sage-stale" : "desk-chip-live")}>
          {feedAge.stale ? `X ${feedAge.hours.toFixed(0)}h old` : "X snapshot"}
        </span>
        <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">{LEAD.window}</p>
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
        <header className="relative z-20 border-b border-line px-4 py-3 md:px-6">
          <p className="desk-ticker">
            {compiling ? "Refreshing live sources" : edition.at.slice(0, 10)}
            {" · "}
            {LEAD.kicker}
            {counts.updates ? ` · ${counts.updates} updates` : ""}
            {counts.metrSecurity ? " · METR security" : ""}
            {` · ${counts.keep} papers`}
            {counts.hn ? ` · ${counts.hn} HN` : ""}
            {counts.rumours ? ` · ${counts.rumours} unconfirmed` : ""}
          </p>
          <div className="desk-toolbar mt-3 flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="sage-q">
              Search stories
            </label>
            <div className="relative min-w-48 flex-1">
              <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle" aria-hidden />
              <input id="sage-q" className="sage-search w-full pl-9" placeholder="Search this pull" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <button type="button" className="desk-lane-btn desk-cta" onClick={() => void compileNow()} disabled={compiling}>
              <RefreshCw size={14} aria-hidden /> {compiling ? "Refreshing…" : "Refresh"}
            </button>
            <button type="button" className="desk-lane-btn" aria-pressed={focus} onClick={() => setFocus((v) => !v)}>
              {focus ? "Focus on" : "Focus"}
            </button>
            <button type="button" className="desk-lane-btn" onClick={copyBrief}>
              <Copy size={14} aria-hidden /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </header>
        <main id="desk-main" className="relative z-20 mx-auto max-w-7xl px-4 py-5 md:px-6">
          {lane === "brief" ? (
            <Brief
              q={q}
              edition={edition}
              packs={packs}
              compiling={compiling}
              onOpenStory={(id) => {
                try {
                  localStorage.setItem(OPEN_KEY, id);
                } catch {
                  /* ignore */
                }
                go("digest");
              }}
              onListen={() => go("voice")}
              onFeed={() => go("pulse")}
              onPapers={() => go("papers")}
            />
          ) : null}
          {lane === "pulse" ? <Pulse q={q} edition={edition} ingest={ingest} /> : null}
          {lane === "digest" ? <Stories q={q} edition={edition} /> : null}
          {lane === "papers" ? <Papers q={q} papers={edition.papersKeep.concat(edition.papersShelf)} /> : null}
          {lane === "voice" ? <Voice edition={edition} /> : null}
          {lane === "mail" ? <MailLane q={q} mail={edition.mail} at={ingest.find((s) => s.id === "mail")?.at ?? MAIL_AT} /> : null}
          {lane === "governance" ? <Gov edition={edition} ingest={ingest} packs={packs} onCompile={() => void compileNow()} compiling={compiling} /> : null}
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

function Skim({ lines, bottom }: { lines: string[]; bottom: string }) {
  return (
    <section className="skim sage-panel p-4 md:p-5" aria-label="If you only have 90 seconds">
      <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">If you only have 90 seconds</p>
      <ol className="mt-3">
        {lines.map((line, i) => (
          <li key={i}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <p>{line}</p>
          </li>
        ))}
      </ol>
      <p className="skim-bottom mt-4">{bottom}</p>
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
    ingest: ingest.map((s) => `${s.label} ${s.ok ? s.count : "fail"}`).join(" · "),
    rank: `1 lead · ${n.updates} updates · ${n.related} related · ${n.rumors} unconfirmed`,
    brief: `Compiled ${edition.at.slice(11, 16)}Z`,
    voice: "Browser voice reads this edition",
  };
  return (
    <section className="sage-panel p-4 md:p-5" aria-label="How this edition was made">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Pipeline</p>
          <h2 className="mt-1 font-sans text-xl font-semibold">Ingest → rank → brief</h2>
        </div>
        <button type="button" className="desk-lane-btn desk-cta" onClick={onCompile} disabled={compiling}>
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

function hit(q: string, ...parts: string[]) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return parts.join(" ").toLowerCase().includes(needle);
}

function Brief({
  q = "",
  edition,
  packs,
  compiling,
  onOpenStory,
  onListen,
  onFeed,
  onPapers,
}: {
  q?: string;
  edition: Edition;
  packs: PackMeta[];
  compiling: boolean;
  onOpenStory: (id: string) => void;
  onListen: () => void;
  onFeed: () => void;
  onPapers: () => void;
}) {
  const lead = edition.lead;
  const updates = edition.updates.filter((c) => hit(q, c.title, c.take, c.outlet));
  const related = edition.related.filter((c) => hit(q, c.title, c.take, c.outlet));
  const also = edition.also.filter((c) => hit(q, c.title, c.take, c.outlet));
  const rumours = edition.rumours.filter((c) => hit(q, c.title, c.take, c.outlet));
  const featuredUpdate = updates[0];
  const featuredRelated = related.find((c) => /metr/i.test(c.outlet) && /security/i.test(c.title)) ?? related[0];
  const used = new Set([featuredUpdate?.id, featuredRelated?.id].filter(Boolean) as string[]);
  const rest = [...updates, ...related, ...also].filter((c) => !used.has(c.id)).slice(0, 8);
  const keeps = edition.papersKeep.filter((p) => hit(q, p.title)).slice(0, 3);
  const wires = edition.wiresKeep.filter((w) => hit(q, w.title, w.summary, w.outlet));
  return (
    <div className="grid gap-5">
      <Skim lines={edition.skim} bottom={edition.bottomLine} />
      <section className="story-hero sage-lead-frame">
        <img src="/wave-hud.jpg" alt="" className="story-hero-bg" crossOrigin="anonymous" />
        <div className="story-hero-body">
          <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">
            Lead · standing incident · {lead.window} · {readMinutes(lead.take, lead.why, lead.move)} min
          </p>
          <h1 className="story-mast mt-3">{lead.title}</h1>
          <ul className="stat-row mt-5">
            {lead.stats.map((s) => (
              <li key={s.label} className="stat-tile">
                <p className="stat-n">{s.n}</p>
                <p className="stat-l">{s.label}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <TakeWhyMove take={lead.take} why={lead.why} move={lead.move} />
          </div>
          <ol className="chrono mt-6" aria-label="How the swarm grew">
            {lead.timeline.map((t) => (
              <li key={t.date}>
                <i aria-hidden />
                <span>{t.date}</span>
                <strong>{t.what}</strong>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" className="desk-lane-btn desk-cta" onClick={() => onOpenStory(lead.id)}>
              Read the full story
            </button>
            <button type="button" className="desk-lane-btn" onClick={onListen}>
              <Volume2 size={14} aria-hidden /> Read aloud
            </button>
            {lead.refs.slice(0, 2).map((r) => (
              <a key={r.href} href={r.href} target="_blank" rel="noreferrer" className="desk-lane-btn">
                <ExternalLink size={14} aria-hidden /> {r.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-amber">This pull · ranked from ingest</p>
        <h2 className="mt-1 font-sans text-xl font-semibold">What the sources actually sent</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          Updates, related, and also are compiled from METR, the live wire, papers, the tracker, and the X/mail snapshots. They are not a frozen magazine.
        </p>
        {featuredUpdate || featuredRelated ? (
          <div className="brief-pair mt-4">
            {featuredUpdate ? (
              <button type="button" className="update-card deadline-card sage-panel w-full p-4 text-left" onClick={() => onOpenStory(featuredUpdate.id)}>
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                  Update · {featuredUpdate.outlet} · {featuredUpdate.live ? "Live" : "Snapshot"}
                </p>
                <h3 className="mt-2 font-sans text-lg font-semibold leading-snug">{featuredUpdate.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{featuredUpdate.why}</p>
                <span className="mt-3 inline-flex items-center text-sm text-ok">Open</span>
              </button>
            ) : (
              <div className="sage-panel p-4">
                <p className="text-sm text-muted">{compiling ? "Refreshing updates…" : "No update on the lead this pull."}</p>
              </div>
            )}
            {featuredRelated ? (
              <button type="button" className="update-card metr-feature sage-panel w-full p-4 text-left" onClick={() => onOpenStory(featuredRelated.id)}>
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                  Related · {featuredRelated.outlet} · {featuredRelated.live ? "Live" : "Snapshot"}
                </p>
                <h3 className="mt-2 font-sans text-lg font-semibold leading-snug">{featuredRelated.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{featuredRelated.why}</p>
                <span className="mt-3 inline-flex items-center text-sm text-ok">Open</span>
              </button>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">{compiling ? "Refreshing…" : "Nothing new around the lead this pull. The wire is below."}</p>
        )}
        {rest.length ? (
          <ul className="also-today mt-4 grid gap-2">
            {rest.map((c) => (
              <li key={c.id}>
                <button type="button" className="hit-row" onClick={() => onOpenStory(c.id)}>
                  <span className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                    {KIND_LABEL[c.kind]} · {c.outlet}
                  </span>
                  <span>
                    <strong>{c.title}</strong>
                    <em>{c.why}</em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {rumours.length ? (
          <div className="mt-5">
            <p className="font-mono text-kicker uppercase tracking-kicker text-hazard">Unconfirmed this pull</p>
            <p className="mt-1 max-w-prose text-sm text-muted">Wire claims without a METR, Hugging Face, or OpenAI primary. Not the lead.</p>
            <ul className="also-today mt-3 grid gap-2">
              {rumours.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <button type="button" className="hit-row" onClick={() => onOpenStory(c.id)}>
                    <span className="font-mono text-kicker uppercase tracking-kicker text-hazard">
                      Unconfirmed · {c.outlet}
                    </span>
                    <span>
                      <strong>{c.title}</strong>
                      <em>{c.why}</em>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="wire-block">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Wire · live</p>
            <h2 className="mt-1 font-sans text-xl font-semibold">Headlines this pull, ranked.</h2>
          </div>
          <button type="button" className="desk-lane-btn" onClick={onFeed}>
            Open live feed
          </button>
        </div>
        {wires.length ? (
          <ul className="mt-4 grid gap-2">
            {groupWires(wires, 1)
              .slice(0, 8)
              .flatMap(([, rows]) => rows)
              .map((w) => (
                <WireRow key={w.id} w={w} />
              ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{compiling ? "Refreshing the wire…" : "No kept wire this pull."}</p>
        )}
      </section>

      <section className="paper-strip">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Papers worth keeping</p>
            <p className="mt-1 text-sm text-muted">Keep is not upvote. Live Hugging Face board.</p>
          </div>
          <button type="button" className="desk-lane-btn" onClick={onPapers}>
            Open papers
          </button>
        </div>
        {keeps.length ? (
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {keeps.map((p) => (
              <li key={p.id} className="sage-panel keep-card p-4">
                <p className="font-mono text-kicker uppercase tracking-kicker text-ok">Keep · {p.up} upvotes</p>
                <h3 className="mt-2 font-sans text-base font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{keepWhy(p.id, p.title)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{compiling ? "Refreshing papers…" : "No kept papers this pull."}</p>
        )}
      </section>

      <SavedEditions packs={packs} currentAt={edition.at} />
    </div>
  );
}

function SavedEditions({ packs, currentAt }: { packs: PackMeta[]; currentAt: string }) {
  if (!packs.length) return null;
  return (
    <section>
      <p className="font-mono text-kicker uppercase tracking-kicker text-amber">Saved editions</p>
      <h2 className="mt-1 font-sans text-xl font-semibold">What you can actually take away</h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
        Each refresh writes this pull to disk. Same hour overwrites. Download the markdown and use it.
      </p>
      <ul className="mt-3 grid gap-2">
        {packs.slice(0, 8).map((p) => (
          <li key={p.id} className="sage-panel flex flex-wrap items-start justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                {p.at.slice(0, 16).replace("T", " ")}Z{p.id === currentAt.slice(0, 13).replace(/[^\dT-]/g, "") ? " · this pull" : ""}
              </p>
              <p className="mt-1 font-sans text-sm font-semibold leading-snug">{p.skim[1] || p.skim[0] || p.id}</p>
              <p className="mt-1 font-mono text-kicker uppercase tracking-kicker text-subtle">
                {p.updates} updates · {p.papers} papers
              </p>
            </div>
            {p.md ? (
              <button type="button" className="desk-lane-btn" onClick={() => download(`sage-${p.id}.md`, p.md!, "text/markdown")}>
                <Download size={14} aria-hidden /> Download
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stories({ q = "", edition }: { q?: string; edition: Edition }) {
  const cards = useMemo(() => editionStories(edition), [edition]);
  const [tab, setTab] = useState<"all" | "lead" | "related" | "also" | "rumor">("lead");
  const [openId, setOpenId] = useState(cards[0]?.id ?? LEAD.id);
  useEffect(() => {
    try {
      const open = localStorage.getItem(OPEN_KEY);
      if (open && cards.some((c) => c.id === open)) setOpenId(open);
    } catch {
      /* ignore */
    }
  }, [cards]);
  const filtered = cards.filter((c) => {
    if (tab === "lead" && c.kind !== "lead" && c.kind !== "update") return false;
    if (tab === "related" && c.kind !== "related") return false;
    if (tab === "also" && c.kind !== "also") return false;
    if (tab === "rumor" && c.kind !== "rumor") return false;
    if (!hit(q, c.title, c.take, c.why, c.outlet)) return false;
    return true;
  });
  const item = filtered.find((c) => c.id === openId) ?? filtered[0];
  const idx = item ? filtered.findIndex((c) => c.id === item.id) : -1;
  const prev = idx > 0 ? filtered[idx - 1] : null;
  const next = idx >= 0 && idx < filtered.length - 1 ? filtered[idx + 1] : null;
  const isLead = item?.kind === "lead";
  const mins = item ? readMinutes(item.take, item.why, isLead ? LEAD.move : "") : 1;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">This pull</p>
          <h2 className="mt-1 font-sans text-2xl font-semibold">Read one story at a time</h2>
          <p className="mt-1 max-w-prose text-sm text-muted">Lead is standing incident. Everything else is ranked ingest.</p>
        </div>
        <button type="button" className="desk-lane-btn" onClick={() => download(`sage-briefing-${edition.at.slice(0, 13)}.md`, renderEdition(edition), "text/markdown")}>
          <Download size={14} aria-hidden /> Download briefing
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["all", "All"],
            ["lead", "Lead + updates"],
            ["related", "Related"],
            ["also", "Also"],
            ["rumor", "Unconfirmed"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className="desk-lane-btn" aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <ol className="grid content-start gap-2 lg:col-span-4">
          {filtered.map((c, n) => (
            <li key={c.id}>
              <button type="button" data-kind={c.kind} className={cn("story-hit sage-panel w-full p-4 text-left", c.id === item?.id && "sage-lead-frame")} onClick={() => setOpenId(c.id)}>
                <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                  {String(n + 1).padStart(2, "0")} · {KIND_LABEL[c.kind]} · {c.outlet}
                </p>
                <h3 className="mt-2 font-sans text-base font-semibold leading-snug">{c.title}</h3>
                <p className="mt-1 font-mono text-kicker uppercase tracking-kicker text-subtle">{when(c.at)}</p>
              </button>
            </li>
          ))}
          {filtered.length === 0 ? <li className="text-sm text-muted">Nothing in this filter.</li> : null}
        </ol>
        {item ? (
          <article className="sage-panel p-5 lg:col-span-8">
            <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">
              {KIND_LABEL[item.kind]} · {item.outlet} · {item.live ? "Live" : item.kind === "lead" ? "Standing" : "Snapshot"} · {mins} min
            </p>
            <h3 className="mt-2 font-sans text-2xl font-semibold leading-tight text-balance">{item.title}</h3>
            <p className="mt-1 font-mono text-kicker uppercase tracking-kicker text-subtle">{when(item.at)}</p>
            <blockquote className="pull-quote mt-4">{item.take}</blockquote>
            {isLead ? (
              <div className="mt-5">
                <TakeWhyMove take={LEAD.take} why={LEAD.why} move={LEAD.move} />
              </div>
            ) : (
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">{item.why}</p>
            )}
            {item.href ? (
              <a className="mt-5 inline-flex h-11 items-center gap-2 text-sm text-ok" href={item.href} target="_blank" rel="noreferrer">
                <ExternalLink size={14} aria-hidden /> Open source
              </a>
            ) : null}
            {isLead ? (
              <ul className="mt-5 grid gap-2">
                {LEAD.refs.map((r) => (
                  <li key={r.href}>
                    <a className="inline-flex items-center gap-2 text-sm text-ok" href={r.href} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} aria-hidden /> {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="sage-panel mt-5 p-4">
              <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Where this sits</p>
              <p className="mt-2 text-sm leading-relaxed">{placementNote(isLead ? LEAD : item)}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="desk-lane-btn" disabled={!prev} onClick={() => prev && setOpenId(prev.id)}>
                <ChevronLeft size={14} aria-hidden /> Previous
              </button>
              <button type="button" className="desk-lane-btn" disabled={!next} onClick={() => next && setOpenId(next.id)}>
                Next <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          </article>
        ) : null}
      </div>
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
  const posts = edition.confirmed.concat(edition.rumors);
  const feed = posts.filter((p) => (tag === "all" || p.tag === tag) && hit(q, p.handle, p.text, p.take));
  const taste = TASTE.filter((p) => hit(q, p.handle, p.text, p.take));
  const confirmed = feed.filter((p) => p.tag !== "rumor");
  const rumors = feed.filter((p) => p.tag === "rumor");
  const xAt = ingest.find((s) => s.id === "x")?.at ?? CRAWL_AT;
  const wires = edition.wiresKeep.filter((w) => hit(q, w.title, w.summary));
  const metr = edition.metr.filter((w) => hit(q, w.title, w.summary));
  const tracker = edition.tracker.filter((h) => hit(q, h.title, h.source));
  const m = splitMetr(metr);
  const security = m.security[0];
  return (
    <div className="grid gap-5">
      <div>
        <p className="font-mono text-kicker uppercase tracking-kicker text-amber">Live feed</p>
        <h2 className="mt-1 font-sans text-2xl font-semibold">METR first. Then the wire. Then HN. Then X. Rumors on the right.</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          Counts below are this pull. HN is Pulse chatter — it never becomes a briefing card. X and mail are snapshots. Bookmarks never lead.
        </p>
        <IngestLog ingest={ingest} />
      </div>
      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-ok">METR · {metr.length} English</p>
        <div className="mt-3 grid gap-4">
          {security ? (
            <article className="metr-feature sage-panel p-4">
              <p className="font-mono text-kicker uppercase tracking-kicker text-hazard">METR security · governance</p>
              <h3 className="mt-2 font-sans text-lg font-semibold leading-snug">{security.title}</h3>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{security.summary || security.reason}</p>
              {security.href ? (
                <a href={security.href} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-11 items-center gap-2 text-sm text-ok">
                  <ExternalLink size={14} aria-hidden /> Open METR
                </a>
              ) : null}
            </article>
          ) : null}
          {m.onLead.length || m.rest.length ? (
            <ul className="grid gap-2">
              {[...m.onLead, ...m.rest].slice(0, 5).map((w) => (
                <WireRow key={w.id} w={w} />
              ))}
            </ul>
          ) : null}
          {!metr.length ? <p className="text-sm text-muted">METR last board unavailable.</p> : null}
        </div>
      </section>
      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-ok">Wire · {wires.length} kept</p>
        {wires.length ? (
          <ul className="mt-3 grid gap-2">
            {groupWires(wires, 2)
              .flatMap(([, rows]) => rows)
              .map((w) => (
                <WireRow key={w.id} w={w} />
              ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No kept wire this pull.</p>
        )}
      </section>
      <section>
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">HN Pulse · {edition.hn.length} · never the briefing</p>
        {edition.hn.length ? (
          <ul className="mt-3 grid gap-2">
            {edition.hn
              .filter((h) => hit(q, h.title, h.author, h.query))
              .map((h) => (
                <li key={h.id} className="wire-row">
                  <span className="font-mono text-kicker uppercase tracking-kicker text-subtle">
                    {h.points} pts · {h.query || "HN"}
                  </span>
                  <a href={h.href} target="_blank" rel="noreferrer">
                    {h.title}
                  </a>
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No HN chatter this pull.</p>
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
  const shown = rows.filter((p) => {
    if (mode === "keep" && !p.keep) return false;
    if (mode === "shelf" && p.keep) return false;
    if (!hit(q, p.id, p.title, p.abstract ?? "")) return false;
    return true;
  });
  const keep = shown.filter((p) => p.keep);
  const shelf = shown.filter((p) => !p.keep);
  const split = mode === "all";
  return (
    <div>
      <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">{papers.length ? "Hugging Face live" : "Last board"}</p>
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

function pickVoice(voices: SpeechSynthesisVoice[]) {
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const list = en.length ? en : voices;
  return (
    list.find((v) => /google us english|samantha|daniel|alex|microsoft david|microsoft zira/i.test(v.name)) ??
    list.find((v) => /en-US|en_US/i.test(v.lang)) ??
    list[0]
  );
}

function Voice({ edition }: { edition: Edition }) {
  const beats = useMemo(() => briefingBeats(edition), [edition]);
  const listRef = useRef<HTMLOListElement | null>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [copied, setCopied] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const el = listRef.current?.querySelector("[data-active='true']");
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  const speakFrom = (start: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    stopRef.current = false;
    window.speechSynthesis.cancel();
    setPaused(false);
    setActive(start);
    const voice = pickVoice(voices.length ? voices : window.speechSynthesis.getVoices());
    const run = (n: number) => {
      if (stopRef.current || n >= beats.length) {
        setPlaying(false);
        setPaused(false);
        return;
      }
      const beat = beats[n];
      const u = new SpeechSynthesisUtterance(beat.text);
      if (voice) u.voice = voice;
      u.rate = 1;
      u.onstart = () => {
        setActive(n);
        setPlaying(true);
        setPaused(false);
      };
      u.onend = () => run(n + 1);
      u.onerror = () => {
        setPlaying(false);
        setPaused(false);
      };
      window.speechSynthesis.speak(u);
    };
    run(start);
  };

  const stop = () => {
    stopRef.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  };

  const toggle = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (playing && !paused) {
      window.speechSynthesis.pause();
      setPaused(true);
      return;
    }
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
      return;
    }
    speakFrom(active);
  };

  const copyScript = () => {
    const body = beats.map((b) => `${b.kicker}\n${b.text}`).join("\n\n");
    void navigator.clipboard.writeText(body).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  const label = paused ? "Resume" : playing ? "Pause" : "Play";

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <section className="sage-panel p-5 lg:col-span-8">
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">This edition · {edition.at.slice(0, 16).replace("T", " ")}Z</p>
        <h2 className="mt-1 font-sans text-2xl font-semibold">Read it. Or have the browser read it.</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">Same compile as the front page. Refresh the edition, this script changes.</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" className="desk-lane-btn desk-cta" onClick={toggle}>
            {playing && !paused ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />} {label}
          </button>
          <button type="button" className="desk-lane-btn" onClick={stop} disabled={!playing && !paused}>
            <Square size={14} aria-hidden /> Stop
          </button>
          <button type="button" className="desk-lane-btn" onClick={copyScript}>
            <Copy size={14} aria-hidden /> {copied ? "Copied" : "Copy briefing"}
          </button>
          <span className="font-mono text-kicker uppercase tracking-kicker text-subtle">
            {String(active + 1).padStart(2, "0")} / {String(beats.length).padStart(2, "0")}
          </span>
        </div>
        <ol ref={listRef} className="voice-doc mt-5">
          {beats.map((beat, i) => (
            <li key={beat.kicker + i}>
              <button type="button" data-active={i === active ? "true" : "false"} className="script-line" onClick={() => speakFrom(i)}>
                <span className="font-mono text-kicker uppercase tracking-kicker text-cyan">{beat.kicker}</span>
                <p className={cn("mt-1 max-w-prose text-sm leading-relaxed", i === active ? "text-fg" : "text-muted")}>{beat.text}</p>
              </button>
            </li>
          ))}
        </ol>
      </section>
      <aside className="sage-panel p-4 lg:col-span-4">
        <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">On this briefing</p>
        <p className="mt-2 font-sans text-base font-semibold">{edition.bottomLine}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{edition.lead.move}</p>
      </aside>
    </div>
  );
}

function MailLane({ q = "", mail, at }: { q?: string; mail: MailHit[]; at: string }) {
  const rows = mail.filter((m) => hit(q, m.from, m.subject, m.take));
  return (
    <div>
      <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Inbox · snapshot · {at.slice(0, 10)}</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold">Newsletter highlights</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">Last pull from the connected inbox. Ranked on compile. None of these take the front page on their own.</p>
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
  edition,
  ingest,
  packs,
  onCompile,
  compiling,
}: {
  edition: Edition;
  ingest: SourceLog[];
  packs: PackMeta[];
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
        <h2 className="mt-1 font-sans text-2xl font-semibold">An editor’s call, not a scoreboard</h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed">{LEAD.why}</p>
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
      <section className="lg:col-span-12">
        <SavedEditions packs={packs} currentAt={edition.at} />
      </section>
      <section className="sage-panel p-4 lg:col-span-12">
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">What is on</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7" aria-label="Source status">
          {METERS.map((m) => (
            <li key={m.id} className="sage-panel p-3">
              <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">{m.label}</p>
              <p className={cn("mt-1 font-sans text-sm font-semibold", meterClass(m.status))}>{m.status === "ok" ? "On" : m.status === "deny" ? "Off" : m.status === "skip" ? "Not wired" : "Soft"}</p>
              <p className="mt-1 text-sm text-muted">{m.note}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="sage-panel p-4 lg:col-span-12">
        <p className="font-mono text-kicker uppercase tracking-kicker text-cyan">Sources this desk actually uses</p>
        <h2 className="mt-1 font-sans text-xl font-semibold">Live wire and papers. Snapshot X and mail. Bookmarks never lead.</h2>
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
          {TRUST.allow.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section className="sage-panel p-4 lg:col-span-4">
        <p className="font-mono text-kicker uppercase tracking-kicker text-hazard">We skip</p>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
          {TRUST.deny.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section className="sage-panel p-4 lg:col-span-4">
        <p className="font-mono text-kicker uppercase tracking-kicker text-muted">Still open</p>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
          {LEAD.stillOpen.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section className="sage-panel p-4 lg:col-span-12">
        <p className="font-mono text-kicker uppercase tracking-kicker text-subtle">Where would this sit?</p>
        <p className="mt-1 text-sm text-muted">Paste a claim. This is a ranking hint for the next pull — it does not change the lead by itself.</p>
        <input className="sage-search mt-3 w-full" placeholder="e.g. Astra take the wheel is the new lead" value={probe} onChange={(e) => setProbe(e.target.value)} />
        {verdict ? (
          <p className="mt-2 text-sm">
            <span className="font-mono text-kicker uppercase tracking-kicker text-amber">{verdict.rank.replace("-", " ")}</span>
            <span className="mt-1 block text-muted">{verdict.reason}</span>
          </p>
        ) : null}
        <p className="mt-4 font-mono text-kicker uppercase tracking-kicker text-subtle">
          This pull · {n.updates} updates · {n.keep} papers kept · {n.rumors} rumors
        </p>
      </section>
    </div>
  );
}
