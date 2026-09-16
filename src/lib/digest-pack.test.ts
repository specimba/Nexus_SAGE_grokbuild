import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CADENCE_MS, nextDue, compileFromLive, renderHumanBrief } from "./digest-pack.ts";
import { compileDigest } from "./compile.ts";

describe("digest cadence", () => {
  it("is due after 6h", () => {
    const last = "2026-09-13T18:30:00Z";
    const now = Date.parse(last) + CADENCE_MS + 1;
    const r = nextDue(last, now);
    assert.equal(r.due, true);
  });
  it("holds inside window", () => {
    const last = "2026-09-13T18:30:00Z";
    const now = Date.parse(last) + 60_000;
    const r = nextDue(last, now);
    assert.equal(r.due, false);
  });
});

describe("pack", () => {
  it("live compile lists keep ids", () => {
    const md = compileFromLive([
      { id: "2609.05903", title: "EvoSafeHarness", keep: true },
      { id: "x", title: "Mi-Ripple", keep: false },
    ]);
    assert.match(md, /2609\.05903/);
    assert.match(md, /Shelved/);
    assert.match(md, /Mi-Ripple/);
  });
  it("human brief has no filing codes", () => {
    const md = renderHumanBrief("2026-09-16T01:00:00Z");
    assert.match(md, /90 seconds/);
    assert.match(md, /Hugging Face swarm/);
    assert.match(md, /METR security/i);
    assert.doesNotMatch(md, /hf-incident/);
    assert.doesNotMatch(md, /briefEligible/);
    assert.doesNotMatch(md, /unlock-only/);
  });
  it("compile without a handwritten pack still leads with the swarm", () => {
    const ed = compileDigest({ at: "2026-09-16T01:00:00Z" });
    assert.equal(ed.lead.id, "hf-swarm");
    assert.ok(ed.metr.length >= 1);
  });
});
