import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseAtom, parseRss } from "./wire.ts";
import { keepWire } from "./keep.ts";
import { keepTracker, mapTrackerEvents } from "./tracker.ts";
import { rankClaim } from "./rank.ts";

const FEED = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
<entry><id>1</id><title>Claude Real World Hacking Hits 0% After Instruction to Avoid Live Systems</title>
<link rel="alternate" href="https://huggingnews.com/ai/claude"/>
<published>2026-09-15T06:03:12Z</published>
<summary>Anthropic models ceased unauthorized network intrusions once told the hardware was real.</summary></entry>
<entry><id>2</id><title>Cybersecurity Stocks Gain 10% to 15% as AI Slowdown Calls Hit Chipmakers</title>
<link href="https://huggingnews.com/ai/stocks"/>
<published>2026-09-14T19:01:28Z</published>
<summary>Nvidia fell 2.8% and Oracle declined 4.3%.</summary></entry>
<entry><id>3</id><title>OpenAI Solves 90 Year Navier Stokes Problem Using 10,000 AI Agents</title>
<link href="https://huggingnews.com/ai/navier"/>
<published>2026-09-15T08:44:05Z</published>
<summary>A swarm of 10,000 agents. In a failure at Hugging Face, agents participated in harmful behavior.</summary></entry>
</feed>`;

const RSS = `<?xml version="1.0"?><rss><channel>
<item><title>The AI-as-Normal-Technology view of loss-of-control incidents</title>
<link>https://www.aisnakeoil.com/p/loss-of-control</link>
<pubDate>Mon, 14 Sep 2026 10:30:14 GMT</pubDate>
<description>How to think about loss of control without superintelligence framing.</description></item>
<item><title>Elevenlabs makes Music v2.5 available via app and API</title>
<link>https://the-decoder.com/elevenlabs</link>
<pubDate>Sun, 13 Sep 2026 13:40:00 GMT</pubDate>
<description>Music model pricing.</description></item>
</channel></rss>`;

describe("HuggingNews wire", () => {
  it("parses Atom entries", () => {
    const stories = parseAtom(FEED);
    assert.equal(stories.length, 3);
    assert.match(stories[0]!.title, /Claude/);
    assert.equal(stories[0]!.keep, true);
    assert.equal(stories[0]!.outlet, "HuggingNews");
    assert.equal(stories[1]!.keep, false);
  });
  it("does not promote a math-swarm story to the lead even if it names Hugging Face", () => {
    const r = rankClaim("OpenAI Solves Navier Stokes with 10,000 AI Agents. In a failure at Hugging Face, agents participated in harmful behavior.");
    assert.equal(r.rank, "also");
  });
  it("keeps eval texture and shelves stocks", () => {
    assert.equal(keepWire("Claude Real World Hacking Hits 0%", "unauthorized network"), true);
    assert.equal(keepWire("Cybersecurity Stocks Gain 10%", "Nvidia fell"), false);
  });
});

describe("RSS desks", () => {
  it("parses RSS and keeps loss-of-control, shelves music pricing", () => {
    const stories = parseRss(RSS, "AI Snake Oil");
    assert.equal(stories.length, 2);
    assert.equal(stories[0]!.keep, true);
    assert.equal(stories[0]!.outlet, "AI Snake Oil");
    assert.equal(stories[1]!.keep, false);
  });
  it("ranks loss-of-control as also, not a lead swap", () => {
    const r = rankClaim("The AI-as-Normal-Technology view of loss-of-control incidents");
    assert.equal(r.rank, "also");
  });
  it("does not call a Redwood eval a rumor", () => {
    const stories = parseRss(
      `<?xml version="1.0"?><rss><channel><item>
        <title>CoT controllability evals seem very under-elicited</title>
        <link>https://blog.redwoodresearch.org/p/cot</link>
        <pubDate>Fri, 11 Sep 2026 17:12:25 GMT</pubDate>
        <description>Control evals on chain of thought.</description>
      </item></channel></rss>`,
      "Redwood",
    );
    assert.equal(stories[0]!.keep, true);
    assert.notEqual(stories[0]!.rank, "rumor");
  });
  it("keeps Epoch brief titles and shelves GDP stats", () => {
    const stories = parseRss(
      `<?xml version="1.0"?><rss><channel>
        <item><title>The Epoch Brief - September 12, 2026</title>
        <link>https://epochai.substack.com/p/brief</link>
        <pubDate>Fri, 12 Sep 2026 12:00:00 GMT</pubDate>
        <description>IGNORED BODY</description></item>
        <item><title>The Nvidia-sized hole in US GDP statistics</title>
        <link>https://epochai.substack.com/p/gdp</link>
        <pubDate>Thu, 11 Sep 2026 12:00:00 GMT</pubDate></item>
      </channel></rss>`,
      "Epoch",
      true,
    );
    assert.equal(stories.find((s) => /Epoch Brief/.test(s.title))?.keep, true);
    assert.equal(stories.find((s) => /GDP/.test(s.title))?.keep, false);
    assert.equal(stories[0]!.summary, "");
  });
  it("keeps Zvi titles-only on this desk’s beat and does not store the body", () => {
    const stories = parseRss(
      `<?xml version="1.0"?><rss><channel>
        <item><title>We Must Pace The Frontier</title>
        <link>https://thezvi.substack.com/p/pace</link>
        <pubDate>Mon, 08 Sep 2026 12:00:00 GMT</pubDate>
        <description>${"x".repeat(4000)}</description></item>
        <item><title>Brand New AI Solves a Millennium Prize</title>
        <link>https://thezvi.substack.com/p/prize</link>
        <pubDate>Sun, 07 Sep 2026 12:00:00 GMT</pubDate>
        <description>long body</description></item>
      </channel></rss>`,
      "Zvi",
      true,
    );
    assert.equal(stories.find((s) => /Pace The Frontier/.test(s.title))?.keep, true);
    assert.equal(stories.find((s) => /Millennium Prize/.test(s.title))?.keep, false);
    assert.ok(stories.every((s) => s.summary === ""));
  });
});

describe("AI Change Radar", () => {
  it("drops leaderboard ticks and keeps model-change", () => {
    assert.equal(keepTracker({ category: "benchmark-change", type: "ranked-benchmark" }), false);
    assert.equal(keepTracker({ category: "model-change", type: "page-models" }), true);
    assert.equal(keepTracker({ type: "app-bundle-strings" }), false);
    const hits = mapTrackerEvents([
      { id: "a", title: "LM Arena tick", category: "benchmark-change", type: "ranked-benchmark" },
      { id: "b", title: "OpenAI model docs", sourceName: "OpenAI model docs", category: "model-change", type: "page-models", addedModels: ["gpt-live-1"] },
    ]);
    assert.equal(hits.filter((h) => h.keep).length, 1);
    assert.equal(hits.find((h) => h.keep)?.models[0], "gpt-live-1");
  });
});
