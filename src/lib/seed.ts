import { LAST_SEED } from "../data/last-seed.ts";
import { compileDigest, type Edition } from "./compile.ts";
import { EMPTY_DELTA, type PullDelta } from "./delta.ts";
import type { SourceLog } from "./ingest-log.ts";

export function lastSeedEdition(): Edition {
  const ed = compileDigest({
    at: LAST_SEED.at,
    papers: LAST_SEED.papers,
    wires: LAST_SEED.wires,
    metr: LAST_SEED.metr,
    hn: LAST_SEED.hn,
    tracker: LAST_SEED.tracker,
    liveWires: true,
  });
  return {
    ...ed,
    at: LAST_SEED.at,
    skim: LAST_SEED.skim.length ? LAST_SEED.skim : ed.skim,
    wiresKeep: LAST_SEED.wires.length ? LAST_SEED.wires : ed.wiresKeep,
    metr: LAST_SEED.metr.length ? LAST_SEED.metr : ed.metr,
    hn: LAST_SEED.hn.length ? LAST_SEED.hn : ed.hn,
    tracker: LAST_SEED.tracker.length ? LAST_SEED.tracker : ed.tracker,
    papersKeep: LAST_SEED.papers.length ? LAST_SEED.papers : ed.papersKeep,
  };
}

export function lastSeedIngest(): SourceLog[] {
  return LAST_SEED.ingest;
}

export function lastSeedPack(): { edition: Edition; ingest: SourceLog[]; packs: []; delta: PullDelta } {
  return { edition: lastSeedEdition(), ingest: lastSeedIngest(), packs: [], delta: EMPTY_DELTA };
}
