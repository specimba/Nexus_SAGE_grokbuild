import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { briefingBeats, compileDigest, editionCounts, editionStories, placementNote, renderEdition } from "./compile.ts";
import { rankClaim } from "./rank.ts";
import type { WireStory } from "./wire.ts";

function wire(partial: Partial<WireStory> & Pick<WireStory, "id" | "title" | "rank" | "outlet">): WireStory {
  return {
    summary: partial.summary ?? "",
    href: partial.href ?? "https://example.com/" + partial.id,
    at: partial.at ?? "2026-09-15T12:00:00Z",
    keep: partial.keep ?? true,
    reason: partial.reason ?? "test",
    beat: partial.beat,
    ...partial,
  };
}

describe("compileDigest", () => {
  const ed = compileDigest({
    at: "2026-09-16T01:00:00Z",
    papers: [
      { id: "2609.05824", title: "Diversity-Aware Skill Routing for LLM Agents", up: 1, keep: true, href: "https://arxiv.org/abs/2609.05824" },
      { id: "2609.12641", title: "Latent Interface Training for Robotics Foundation Models", up: 51, keep: false, href: "https://arxiv.org/abs/2609.12641" },
    ],
    wires: [
      wire({
        id: "casar",
        title: "Congress asked OpenAI for Hugging Face incident logs. Casar set a deadline.",
        rank: "lead-bond",
        outlet: "HuggingNews",
        reason: "Oversight on the known escape.",
      }),
      wire({
        id: "astra",
        title: "Astra take the wheel for ChatGPT Financial Services",
        rank: "companion",
        outlet: "HuggingNews",
      }),
      wire({
        id: "trump",
        title: "Trump says AI existential risk is a hoax",
        rank: "rest",
        outlet: "HuggingNews",
      }),
    ],
  });

  it("has exactly one lead and it is the Hugging Face swarm", () => {
    assert.equal(ed.lead.id, "hf-swarm");
    assert.match(ed.lead.title, /Hugging Face/i);
  });

  it("ranks live wires onto the edition, not a handwritten pack", () => {
    assert.ok(ed.updates.some((c) => c.id === "casar"));
    assert.ok(ed.related.some((c) => c.id === "astra"));
    assert.ok(ed.also.some((c) => c.id === "trump"));
    assert.equal(ed.lead.id, "hf-swarm");
  });

  it("does not promote Astra to lead", () => {
    assert.ok(ed.related.every((c) => c.kind !== "lead"));
    assert.ok(ed.updates.every((c) => c.id !== "hf-swarm"));
  });

  it("does not treat an Astra bake-off as related", () => {
    const bake = compileDigest({
      at: "2026-09-16T02:00:00Z",
      wires: [
        wire({
          id: "neon",
          title: "Periodic Labs 1 Trillion Parameter Neon Model Beats GPT-6 Astra in Science",
          rank: "companion",
          outlet: "HuggingNews",
        }),
      ],
    });
    assert.equal(bake.related.some((c) => c.id === "neon"), false);
    assert.equal(bake.lead.id, "hf-swarm");
  });

  it("does not promote an eval-desk op-ed to a lead update from a stuffed summary", () => {
    const ed2 = compileDigest({
      at: "2026-09-16T02:00:00Z",
      wires: [
        wire({
          id: "oped",
          title: "Op-Ed: I Worked at Google DeepMind. You Should Listen to the Warnings About AI",
          summary: "Mentions the Hugging Face sandbox escape in paragraph four.",
          rank: "rest",
          outlet: "Alignment Forum",
        }),
      ],
    });
    assert.equal(ed2.updates.some((c) => c.id === "oped"), false);
    assert.equal(ed2.lead.id, "hf-swarm");
  });

  it("dedupes the METR investigation when an eval desk reprints the title", () => {
    const ed2 = compileDigest({
      at: "2026-09-16T02:00:00Z",
      metr: [
        {
          id: "metr-hf-investigation",
          title: "Brief independent investigation of agents’ behavior in the OpenAI / Hugging Face hacking incident",
          summary: "METR primary",
          href: "https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/",
          at: "2026-08-26T07:00:00Z",
          keep: true,
          rank: "lead-bond",
          reason: "METR primary",
          outlet: "METR",
          beat: "investigation",
        },
      ],
      wires: [
        wire({
          id: "reprint",
          title: "Brief independent investigation of agents’ behavior in the OpenAI / Hugging Face hacking incident",
          rank: "lead-bond",
          outlet: "Redwood",
          href: "https://blog.redwoodresearch.org/p/reprint",
        }),
      ],
    });
    const hits = ed2.updates.filter((c) => /hacking incident/i.test(c.title));
    assert.equal(hits.length, 1);
    assert.equal(hits[0]?.outlet, "METR");
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

  it("edition markdown has no filing codes and skim comes from this pull", () => {
    const md = renderEdition(ed);
    const n = editionCounts(ed);
    assert.match(md, /90 seconds/);
    assert.match(md, /Casar/);
    assert.match(md, /Keep is not upvote/i);
    assert.match(md, /METR security/);
    assert.doesNotMatch(md, /hf-incident/);
    assert.doesNotMatch(md, /Sol ≠/);
    assert.doesNotMatch(md, /unlock-only/);
    assert.ok(n.keep >= 1);
    assert.match(ed.skim[1]!, /Casar/i);
  });

  it("METR security is related, not the lead", () => {
    assert.notEqual(ed.lead.id, "metr-security-update");
    assert.ok(ed.related.some((c) => /security at metr/i.test(c.title)) || ed.metr.some((m) => m.beat === "security"));
    assert.ok(editionCounts(ed).metrSecurity >= 1);
  });

  it("seeds a METR last board so the briefing is not empty", () => {
    assert.ok(ed.metr.some((m) => m.beat === "security"));
    assert.equal(ed.lead.id, "hf-swarm");
  });

  it("does not card HN Pulse onto the briefing", () => {
    const ed2 = compileDigest({
      at: "2026-09-16T03:00:00Z",
      hn: [{ id: "hn-1", title: "New lead: Google RSI", href: "https://news.ycombinator.com/item?id=1", at: "2026-09-16T02:00:00Z", points: 90, author: "x", comments: 12, query: "eval" }],
    });
    assert.equal(ed2.hn[0]?.id, "hn-1");
    assert.equal(ed2.updates.some((c) => c.id === "hn-1"), false);
    assert.equal(ed2.rumours.some((c) => c.id === "hn-1"), false);
  });

  it("bumps a security-lab rumor to also, not unconfirmed", () => {
    const ed2 = compileDigest({
      at: "2026-09-16T03:00:00Z",
      wires: [
        wire({
          id: "tob",
          title: "Auditing agent toolchains for supply-chain risk",
          rank: "rumor",
          outlet: "Trail of Bits",
          beat: "security",
        }),
      ],
    });
    assert.equal(ed2.rumours.some((c) => c.id === "tob"), false);
    assert.ok(ed2.also.some((c) => c.id === "tob") || ed2.related.some((c) => c.id === "tob") || ed2.updates.some((c) => c.id === "tob"));
    assert.equal(ed2.lead.id, "hf-swarm");
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
    const ed = compileDigest({ at: "2026-09-16T01:00:00Z" });
    const lead = editionStories(ed)[0]!;
    assert.match(placementNote(lead), /Lead/);
    assert.doesNotMatch(placementNote(lead), /unlock/i);
  });
});

describe("read aloud", () => {
  it("is this edition, not a podcast", () => {
    const ed = compileDigest({ at: "2026-09-16T01:00:00Z" });
    const beats = briefingBeats(ed);
    const body = beats.map((b) => `${b.kicker} ${b.text}`).join("\n");
    assert.ok(beats.length >= 6);
    assert.match(body, /Hugging Face/);
    assert.match(body, /METR/);
    assert.doesNotMatch(body, /\bEve\b|\bOrion\b|this tape|podcast|VU|chapter/i);
  });
});
