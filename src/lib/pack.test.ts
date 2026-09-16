import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compileDigest } from "./compile.ts";
import { listPacks, readPackMarkdown, writePack } from "./pack.ts";

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
});
