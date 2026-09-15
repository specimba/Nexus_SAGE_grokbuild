import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CADENCE_MS, nextDue, kept, renderPlan, compileFromLive, renderHumanBrief } from "./digest-pack.ts";

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
  it("keeps lead file", () => {
    const lead = kept().find((i) => i.kind === "lead");
    assert.equal(lead?.file, "hf-incident");
  });
  it("plan has steps", () => {
    assert.ok(renderPlan().every((p) => p.steps.length > 0));
  });
  it("Fortune addendum stays on hf-incident", () => {
    const add = kept().find((i) => i.id === "altman-fortune-hf");
    assert.equal(add?.file, "hf-incident");
    assert.equal(add?.kind, "addendum");
  });
  it("router dump is not lead", () => {
    const r = kept().find((i) => i.id === "shou-6tb-router");
    assert.equal(r?.file, "router");
    assert.notEqual(r?.kind, "lead");
  });
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
    const md = renderHumanBrief();
    assert.match(md, /90 seconds/);
    assert.match(md, /Hugging Face swarm/);
    assert.match(md, /METR security/i);
    assert.doesNotMatch(md, /hf-incident/);
    assert.doesNotMatch(md, /briefEligible/);
    assert.doesNotMatch(md, /unlock-only/);
  });
  it("METR security is related, not the lead", () => {
    const item = kept().find((i) => i.id === "metr-security");
    assert.equal(item?.kind, "companion");
    assert.notEqual(item?.kind, "lead");
  });
});
