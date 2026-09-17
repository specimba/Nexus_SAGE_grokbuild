import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compileDigest } from "./compile.ts";
import { listPacks, readLast, readPackMarkdown, writePack } from "./pack.ts";

describe("edition packs", () => {
  it("writes json, markdown, and CURRENT, then lists them", () => {
    const root = mkdtempSync(join(tmpdir(), "sage-pack-"));
    const ed = compileDigest({ at: "2026-09-16T07:10:00Z" });
    const meta = writePack(ed, [], root);
    assert.equal(meta.id, "2026-09-16T07");
    const current = JSON.parse(readFileSync(join(root, "artifacts/sage/CURRENT.json"), "utf8")) as { lead: string; pack: string };
    assert.equal(current.lead, "hf-swarm");
    assert.equal(current.pack, meta.id);
    const md = readPackMarkdown(meta.id, root);
    assert.match(md, /Hugging Face swarm/);
    assert.doesNotMatch(md, /unlock-only|briefEligible|cycle 003/i);
    const listed = listPacks(true, root);
    assert.equal(listed.length, 1);
    assert.equal(listed[0]!.id, meta.id);
    assert.ok((listed[0]!.md || "").includes("90 seconds"));
  });

  it("readLast returns the last live ingest, not zeros", () => {
    const root = mkdtempSync(join(tmpdir(), "sage-last-"));
    const ed = compileDigest({ at: "2026-09-17T20:10:00Z" });
    writePack(
      ed,
      [{ id: "wire", label: "Wire", live: true, ok: true, count: 28, ms: 400, at: "2026-09-17T18:56:00Z", note: "28 kept" }],
      root,
    );
    const last = readLast(root);
    assert.ok(last);
    assert.equal(last!.edition.lead.id, "hf-swarm");
    assert.equal(last!.ingest.find((s) => s.id === "wire")?.count, 28);
  });

  it("restores the wire from the hourly pack when LAST.json is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "sage-pack-wire-"));
    const ed = compileDigest({
      at: "2026-09-17T21:10:00Z",
      wires: [
        {
          id: "rain",
          title: "Raindrop Raises $50 Million Series A For AI Agent Simulation Tools",
          summary: "",
          href: "https://huggingnews.com/raindrop",
          at: "2026-09-17T18:00:00Z",
          keep: true,
          rank: "rest",
          reason: "test",
          outlet: "HuggingNews",
        },
      ],
      liveWires: true,
    });
    writePack(ed, [{ id: "wire", label: "Wire", live: true, ok: true, count: 1, ms: 10, at: ed.at, note: "1 kept" }], root);
    unlinkSync(join(root, "artifacts/sage/LAST.json"));
    const last = readLast(root);
    assert.ok(last);
    assert.equal(last!.edition.wiresKeep.length, 1);
    assert.match(last!.edition.wiresKeep[0]!.title, /Raindrop/);
    assert.match(last!.edition.skim[0]!, /Raindrop|HuggingNews/i);
  });
});
