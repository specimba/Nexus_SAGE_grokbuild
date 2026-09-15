import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compileDigest, editionCounts, placementNote, renderEdition } from "./compile.ts";
import { DIGEST_ITEMS } from "../data/digest-pack.ts";
import { rankClaim } from "./rank.ts";

describe("compileDigest", () => {
  const ed = compileDigest({
    at: "2026-09-14T13:40:00Z",
    papers: [
      { id: "2609.05824", title: "Diversity-Aware Skill Routing for LLM Agents", up: 1, keep: true, href: "https://arxiv.org/abs/2609.05824" },
      { id: "2609.12641", title: "Latent Interface Training for Robotics Foundation Models", up: 51, keep: false, href: "https://arxiv.org/abs/2609.12641" },
    ],
  });

  it("has exactly one lead and it is the Hugging Face swarm", () => {
    assert.equal(DIGEST_ITEMS.filter((i) => i.kind === "lead").length, 1);
    assert.equal(ed.lead.id, "hf-swarm");
    assert.match(ed.lead.title, /Hugging Face/i);
  });

  it("does not promote Astra or the router dump to lead", () => {
    assert.ok(ed.related.every((i) => i.kind !== "lead"));
    assert.ok(ed.also.every((i) => i.id !== "hf-swarm"));
    const router = DIGEST_ITEMS.find((i) => i.id === "shou-6tb-router");
    assert.equal(router?.kind, "rest");
    const astra = DIGEST_ITEMS.find((i) => i.id === "astra-wheel");
    assert.equal(astra?.kind, "companion");
  });

  it("splits papers by beat, not upvote", () => {
    assert.equal(ed.papersKeep.some((p) => p.up === 1), true);
    assert.equal(ed.papersShelf.some((p) => p.up === 51), true);
  });

  it("splits the feed into confirmed vs rumor", () => {
    assert.ok(ed.rumors.length >= 1);
    assert.ok(ed.confirmed.length >= 1);
    assert.ok(ed.rumors.every((p) => p.tag === "rumor"));
  });

  it("edition markdown has no filing codes", () => {
    const md = renderEdition(ed);
    const n = editionCounts(ed);
    assert.match(md, /90 seconds/);
    assert.match(md, /Keep is not upvote/i);
    assert.match(md, /METR security/);
    assert.doesNotMatch(md, /hf-incident/);
    assert.doesNotMatch(md, /Sol ≠/);
    assert.doesNotMatch(md, /unlock-only/);
    assert.ok(n.keep >= 1);
  });

  it("METR security is related, not the lead", () => {
    const item = DIGEST_ITEMS.find((i) => i.id === "metr-security");
    assert.equal(item?.kind, "companion");
    assert.notEqual(ed.lead.id, "metr-security");
    assert.ok(ed.related.some((i) => i.id === "metr-security"));
  });

  it("seeds a METR last board so the briefing is not empty", () => {
    assert.ok(ed.metr.some((m) => m.beat === "security"));
    assert.equal(ed.lead.id, "hf-swarm");
    assert.ok(editionCounts(ed).metrSecurity >= 1);
  });
});

describe("rankClaim", () => {
  it("Fortune restatement is a lead update, not a new lead", () => {
    const r = rankClaim("Altman on Fortune talks about the Hugging Face sandbox escape");
    assert.equal(r.rank, "lead-update");
  });
  it("Astra take-the-wheel is related", () => {
    const r = rankClaim("Astra take the wheel Financial Services ship");
    assert.equal(r.rank, "related");
  });
  it("IPO delay is also, not lead", () => {
    const r = rankClaim("Altman IPO delay ill-advised moment");
    assert.equal(r.rank, "also");
  });
  it("6TB router dump is also, different attacker", () => {
    const r = rankClaim("6TB Fable dump from LLM router is the new lead");
    assert.equal(r.rank, "also");
    assert.match(r.reason, /Different attacker/i);
  });
  it("no primary is unconfirmed", () => {
    const r = rankClaim("a blog says the swarm was a civilization");
    assert.equal(r.rank, "unconfirmed");
  });
});

describe("placementNote", () => {
  it("lead note is editorial, not a seal", () => {
    const lead = DIGEST_ITEMS.find((i) => i.kind === "lead")!;
    assert.match(placementNote(lead), /Lead/);
    assert.doesNotMatch(placementNote(lead), /unlock/i);
  });
});
