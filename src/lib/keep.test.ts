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
  it("shelves transmodal retrieval even if the board is hot", () => {
    assert.equal(keepPaper("2609.16591", "FLAT: Resampling Image and Text into 1D Flexible-Length Aligned Transmodal Tokens for Retrieval and Generation"), false);
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
  it("shelves OpenAI Astra product RSS", () => {
    assert.equal(keepWire("ChatGPT for Financial Services with GPT-6 Astra", "", "OpenAI"), false);
    assert.equal(keepWire("Astra in Perplexity, Cognition, Legora and Playco", "", "OpenAI"), false);
  });
  it("keeps OpenAI incident and eval RSS", () => {
    assert.equal(keepWire("Our investigation of the Hugging Face incident", "", "OpenAI"), true);
    assert.equal(keepWire("Astra alignment eval and monitoring", "", "OpenAI"), true);
  });
  it("still keeps HuggingNews Astra titles that are eval texture", () => {
    assert.equal(keepWire("Astra recurrent depth hides the CoT", "", "HuggingNews"), true);
  });
  it("shelves a HuggingNews Astra bake-off", () => {
    assert.equal(keepWire("Periodic Labs 1 Trillion Parameter Neon Model Beats GPT-6 Astra in Science", "", "HuggingNews"), false);
  });
  it("keeps HuggingNews Astra product usage", () => {
    assert.equal(keepWire("Astra take the wheel for ChatGPT Financial Services", "", "HuggingNews"), true);
  });
  it("does not keep a Sol product launch", () => {
    assert.equal(keepWire("OpenAI Launches GPT 6 Sol This Week Prior to DevDay", "", "HuggingNews"), false);
  });
  it("keeps OpenAI-bars-METR as wire, still ranked later", () => {
    assert.equal(keepWire("OpenAI Bars METR From Probing Supercomputer Breach After 1,200 Agent Escape", "", "HuggingNews"), true);
  });
});
