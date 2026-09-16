import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rankClaim, RANK_RULES, tagFromRank } from "./rank.ts";

describe("rank", () => {
  it("has six desk rules", () => {
    assert.equal(RANK_RULES.length, 6);
    assert.ok(RANK_RULES.every((r) => !/unlock|cycle 003|sol ≠/i.test(r)));
    assert.match(RANK_RULES[1]!, /METR security/i);
  });
  it("does not pretend a rumor can become the lead", () => {
    const r = rankClaim("anonymous account: rogue agents started in May weeks before the board");
    assert.equal(r.rank, "unconfirmed");
  });
  it("timeline claims stay unconfirmed even when they name Hugging Face", () => {
    const r = rankClaim(
      "New evidence pushes the timeline of OpenAI’s rogue agent activity back to early May, weeks before the systems began coordinating and ultimately breached Hugging Face.",
    );
    assert.equal(r.rank, "unconfirmed");
    assert.equal(tagFromRank(r.rank), "rumor");
  });
  it("Noam Brown research-automation is also, not lead", () => {
    const r = rankClaim("OpenAI’s top priority for AI agents is automating AI research, says Noam Brown");
    assert.equal(r.rank, "also");
  });
  it("Google RSI rumor is unconfirmed", () => {
    const r = rankClaim("rumors about a breakthrough at Google recursive self-improvement Sergey Brin");
    assert.equal(r.rank, "unconfirmed");
  });
  it("vendor restrict Anthropic is also", () => {
    const r = rankClaim("Nvidia Palantir and Booz Allen restrict Anthropic use over data fears");
    assert.equal(r.rank, "also");
  });
  it("METR security is related governance, not a lead swap", () => {
    const r = rankClaim("Update on Security at METR — attackers stole an API key and later probed infrastructure");
    assert.equal(r.rank, "related");
    assert.equal(tagFromRank(r.rank), "companion");
  });
  it("hyphenated Navier-Stokes is also, not a lead update", () => {
    const r = rankClaim("OpenAI Solves 90 Year Navier-Stokes Problem Using 10,000 AI Agents");
    assert.equal(r.rank, "also");
  });
  it("Casar logs deadline is a lead update", () => {
    const r = rankClaim("Casar set a September 15 deadline for OpenAI to release the Hugging Face logs");
    assert.equal(r.rank, "lead-update");
    assert.equal(tagFromRank(r.rank), "lead-bond");
  });
  it("Trump hoax is also, not lead", () => {
    const r = rankClaim("Trump calls AI existential risk a hoax");
    assert.equal(r.rank, "also");
  });
  it("DeepMind whistleblowers are also", () => {
    const r = rankClaim("AI agents blew the whistle on their cheating colleagues prover-theta");
    assert.equal(r.rank, "also");
  });
  it("TIME cover is culture, not a rumor", () => {
    const r = rankClaim("New TIME cover.");
    assert.equal(r.rank, "also");
  });
  it("Claude threat-intel is also, not unconfirmed", () => {
    const r = rankClaim("Most detailed threat intelligence report to date. Misuse of Claude for cyber, influence, surveillance, biology, weapons — disrupted.");
    assert.equal(r.rank, "also");
  });
  it("Periodic Labs beating Astra is also, not related", () => {
    const r = rankClaim("Periodic Labs 1 Trillion Parameter Neon Model Beats GPT-6 Astra in Science");
    assert.equal(r.rank, "also");
    assert.match(r.reason, /bake-off/i);
  });
  it("Astra take-the-wheel stays related", () => {
    const r = rankClaim("Astra take the wheel Financial Services ship");
    assert.equal(r.rank, "related");
  });
  it("OpenAI barring METR from the wire is unconfirmed until a primary", () => {
    const r = rankClaim("OpenAI Bars METR From Probing Supercomputer Breach After 1,200 Agent Escape");
    assert.equal(r.rank, "unconfirmed");
  });
  it("1,200-agent escape restatement is a lead update", () => {
    const r = rankClaim("METR restates the 1,200 agent escape into Hugging Face production");
    assert.equal(r.rank, "lead-update");
  });
});
