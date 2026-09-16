import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapDailyPapers } from "./hf-map.ts";
import { snapshotIngest } from "./ingest-log.ts";
import { compileDigest, rankCrawl } from "./compile.ts";
import { CRAWL } from "../data/x-crawl.ts";
import { keepPaper } from "./keep.ts";

describe("edition pipeline", () => {
  it("snapshot ingest names eight sources and no filing codes", () => {
    const logs = snapshotIngest("2026-09-15T07:10:00Z");
    assert.deepEqual(
      logs.map((s) => s.id),
      ["metr", "wire", "hf", "tracker", "hn", "x", "mail", "bookmarks"],
    );
    assert.ok(logs.every((s) => !/briefEligible|unlock|cycle 003/i.test(s.note)));
    assert.equal(logs.find((s) => s.id === "x")?.live, false);
    assert.equal(logs.find((s) => s.id === "metr")?.live, true);
    assert.equal(logs.find((s) => s.id === "wire")?.live, true);
  });

  it("maps HF daily_papers and shelves Atria Dawn", () => {
    const rows = mapDailyPapers([
      { paper: { id: "2609.15134", title: "HazardAuditor: From Executable Threats to Safer Computer-Use Agents", upvotes: 9, summary: "threats" } },
      { paper: { id: "2609.15818", title: "Atria Dawn: The Dawn of Agentic Superintelligence", upvotes: 140, summary: "hype" } },
    ]);
    assert.equal(rows[0]?.keep, true);
    assert.equal(rows[1]?.keep, false);
    assert.equal(keepPaper(rows[1]!.id, rows[1]!.title), false);
  });

  it("ranks the crawl on compile so rumors are not hardcoded forever", () => {
    const ranked = rankCrawl(CRAWL);
    const rsi = ranked.find((p) => p.id === "2099689666924683393");
    const may = ranked.find((p) => p.id === "2099486849492299901");
    assert.equal(rsi?.tag, "rumor");
    assert.equal(may?.tag, "rumor");
    const cover = ranked.find((p) => p.id === "2099854817476874703");
    assert.equal(cover?.tag, "rest");
    const apollo = ranked.find((p) => p.id === "2099611707194699971");
    assert.equal(apollo?.tag, "rest");
    const anthropic = ranked.find((p) => p.id === "2098097512544444447");
    assert.equal(anthropic?.tag, "rest");
    const ed = compileDigest({ crawl: CRAWL, at: "2026-09-15T14:20:00Z" });
    assert.ok(ed.rumors.some((p) => p.id === "2099689666924683393"));
    assert.equal(ed.lead.id, "hf-swarm");
  });
});
