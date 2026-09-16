import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HN_BAN, HN_WATCHLIST, hnQuerySafe, hnSearchUrl, mapHnHits, pickHnQueries } from "./hn.ts";
import { compileDigest, renderEdition } from "./compile.ts";

describe("HN Pulse", () => {
  it("standing queries never include banned nouns", () => {
    assert.ok(HN_WATCHLIST.every(hnQuerySafe));
    for (const ban of HN_BAN) {
      assert.equal(hnQuerySafe(ban), false);
    }
    assert.equal(hnQuerySafe("astra"), false);
    assert.equal(hnQuerySafe("sol"), false);
  });

  it("rotates three queries a tick and stays on the watchlist", () => {
    const a = pickHnQueries(Date.parse("2026-09-16T00:00:00Z"));
    const b = pickHnQueries(Date.parse("2026-09-17T00:00:00Z"));
    assert.equal(a.length, 3);
    assert.equal(b.length, 3);
    assert.notDeepEqual(a, b);
    assert.ok(a.every((q) => (HN_WATCHLIST as readonly string[]).includes(q)));
  });

  it("search URL is last-21-days, not all-time greatest hits", () => {
    const url = hnSearchUrl("OpenAI", Date.parse("2026-09-16T00:00:00Z"));
    assert.match(url, /numericFilters=/);
    assert.match(url, /created_at_i%3E/);
    assert.doesNotMatch(url, /Altman/);
  });

  it("maps Algolia hits and dedupes", () => {
    const hits = mapHnHits(
      [
        { objectID: "1", title: "Hugging Face swarm writeup", url: "https://example.com/a", points: 120, author: "x", created_at: "2026-09-15T00:00:00Z" },
        { objectID: "1", title: "duplicate", url: "https://example.com/a", points: 1 },
        { objectID: "2", title: "", url: "https://example.com/b" },
      ],
      "Hugging Face",
    );
    assert.equal(hits.length, 1);
    assert.equal(hits[0]!.points, 120);
    assert.equal(hits[0]!.query, "Hugging Face");
  });

  it("never becomes a briefing card", () => {
    const ed = compileDigest({
      at: "2026-09-16T05:00:00Z",
      hn: [
        {
          id: "999",
          title: "Astra take the wheel is the new lead",
          href: "https://news.ycombinator.com/item?id=999",
          at: "2026-09-16T04:00:00Z",
          points: 400,
          author: "hn",
          comments: 80,
          query: "OpenAI",
        },
      ],
    });
    assert.equal(ed.hn.length, 1);
    assert.equal(ed.updates.some((c) => c.id === "999"), false);
    assert.equal(ed.related.some((c) => c.id === "999"), false);
    assert.equal(ed.also.some((c) => c.id === "999"), false);
    assert.equal(ed.lead.id, "hf-swarm");
    const md = renderEdition(ed);
    assert.match(md, /HN Pulse/);
    assert.match(md, /Never the briefing/);
  });
});
