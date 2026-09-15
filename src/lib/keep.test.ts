import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { keepPaper, keepWire } from "./keep.ts";

describe("keepPaper", () => {
  it("keeps eval-security class by id", () => {
    assert.equal(keepPaper("2609.05903", "Unrelated title"), true);
  });
  it("keeps multi-agent by title", () => {
    assert.equal(keepPaper("x", "DRG-MAPPO: Hierarchical Dynamic Role-Graph Multi-Agent Reinforcement Learning"), true);
  });
  it("keeps cyber models by title", () => {
    assert.equal(keepPaper("x", "Feyospace-v1: How the Cyber Mercury Seven Trained Frontier Cyber Models"), true);
  });
  it("shelves Atria Dawn hype despite agent in the title", () => {
    assert.equal(keepPaper("2609.15818", "Atria Dawn: The Dawn of Agentic Superintelligence"), false);
  });
  it("keeps a computer-use threat paper", () => {
    assert.equal(keepPaper("2609.15134", "HazardAuditor: From Executable Threats to Safer Computer-Use Agents"), true);
  });
});

describe("keepWire", () => {
  it("keeps Claude real-world hacking", () => {
    assert.equal(keepWire("Claude Real World Hacking Hits 0%", "unauthorized network"), true);
  });
  it("shelves China chip-design policy", () => {
    assert.equal(keepWire("China Plans to Boost AI Chip Design and Computing Technology", "foundry subsidies"), false);
  });
  it("shelves a Trump advisor quote with no eval hook", () => {
    assert.equal(keepWire("Trump AI Advisor David Sacks Tells CEOs to Step Aside If Unable to Control AI"), false);
  });
  it("keeps a pacing slowdown", () => {
    assert.equal(keepWire("Obama Backs Frontier AI Slowdown and Urges Democratic Oversight for 2028"), true);
  });
  it("does not keep a cyber-valuation headline", () => {
    assert.equal(keepWire("Exein Hits $1.7 Billion Europe's Top Cyber Valuation in $270 Million Raise", "agents openai", "HuggingNews"), false);
  });
});
