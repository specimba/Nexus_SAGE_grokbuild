import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compileDigest } from "./compile.ts";
import { diffPull, titleKey } from "./delta.ts";
import { lastSeedEdition } from "./seed.ts";

function wire(id: string, title: string, outlet = "HuggingNews") {
  return {
    id,
    title,
    summary: "",
    href: "https://example.com/" + id,
    at: "2026-09-16T12:00:00Z",
    keep: true,
    rank: "rest" as const,
    reason: "test",
    outlet,
  };
}

describe("diffPull", () => {
  it("names wires that were not in the previous edition", () => {
    const prev = compileDigest({
      at: "2026-09-16T12:00:00Z",
      wires: [wire("a", "Raindrop Raises $50 Million Series A For AI Agent Simulation Tools")],
      liveWires: true,
    });
    const next = compileDigest({
      at: "2026-09-16T18:00:00Z",
      wires: [
        wire("a", "Raindrop Raises $50 Million Series A For AI Agent Simulation Tools"),
        wire("b", "Goodfire AI Cuts LLM Monitoring Cost 90% to Block AI Reward Hacking"),
      ],
      liveWires: true,
    });
    const d = diffPull(prev, next);
    assert.equal(d.newWires.length, 1);
    assert.match(d.newWires[0]!.title, /Goodfire/);
    assert.equal(d.goneWires, 0);
  });

  it("returns empty when there is no previous pack", () => {
    const next = compileDigest({ at: "2026-09-16T18:00:00Z", wires: [wire("a", "Hello")], liveWires: true });
    const d = diffPull(null, next);
    assert.equal(d.newWires.length, 0);
  });
});

describe("last seed", () => {
  it("first paint is the last live compile, not an empty snapshot", () => {
    const ed = lastSeedEdition();
    assert.equal(ed.lead.id, "hf-swarm");
    assert.ok(ed.wiresKeep.length >= 8);
    assert.ok(ed.hn.length >= 1);
    assert.match(ed.skim[0]!, /HuggingNews|Goodfire|Raindrop|METR/i);
    assert.doesNotMatch(ed.skim[0]!, /1,200 eval agents/);
    assert.doesNotMatch(ed.skim[0]!, /No live headline/);
    assert.equal(titleKey("Hello"), "hello");
  });
});
