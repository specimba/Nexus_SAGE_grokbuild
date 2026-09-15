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
});
