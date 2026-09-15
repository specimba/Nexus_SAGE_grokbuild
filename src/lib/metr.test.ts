import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isEnglishMetr, metrRank, parseMetrRss, parseAisiRss, sortMetr } from "./metr.ts";
import { compileDigest, splitMetr } from "./compile.ts";

const FEED = `<?xml version="1.0"?><rss><channel>
<item>
  <title>Funding update</title>
  <link>https://metr.org/blog/2026-08-14-funding-update/</link>
  <pubDate>Fri, 14 Aug 2026 00:00:00 -0700</pubDate>
</item>
<item>
  <title>Update on Security at METR</title>
  <link>https://metr.org/blog/2026-08-31-security-update/</link>
  <pubDate>Mon, 31 Aug 2026 00:00:00 -0700</pubDate>
</item>
<item>
  <title>对 OpenAI / Hugging Face 入侵事件中智能体行为的简要独立调查</title>
  <link>https://metr.org/zh-Hans/blog/2026-08-26-openai-hugging-face-incident-investigation/</link>
  <pubDate>Wed, 26 Aug 2026 00:00:00 -0700</pubDate>
</item>
<item>
  <title>Brief independent investigation of agents’ behavior, reasoning and collaboration in the OpenAI / Hugging Face incident</title>
  <link>https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/</link>
  <pubDate>Wed, 26 Aug 2026 00:00:00 -0700</pubDate>
</item>
</channel></rss>`;

describe("METR governance", () => {
  it("keeps English posts and drops translations", () => {
    assert.equal(isEnglishMetr("https://metr.org/blog/2026-08-31-security-update/", "Update on Security at METR"), true);
    assert.equal(
      isEnglishMetr(
        "https://metr.org/zh-Hans/blog/2026-08-26-openai-hugging-face-incident-investigation/",
        "对 OpenAI",
      ),
      false,
    );
    const stories = parseMetrRss(FEED);
    assert.equal(stories.length, 3);
    assert.ok(stories.every((s) => s.outlet === "METR"));
    assert.ok(stories.every((s) => s.keep));
    assert.ok(!stories.some((s) => /zh-Hans/.test(s.href)));
  });
  it("ties the HF investigation to the lead and does not swap it", () => {
    const v = metrRank(
      "Brief independent investigation of agents’ behavior in the OpenAI / Hugging Face incident",
      "https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/",
    );
    assert.equal(v.rank, "lead-bond");
    assert.equal(v.beat, "investigation");
    const ed = compileDigest({
      metr: parseMetrRss(FEED),
      at: "2026-09-15T12:00:00Z",
    });
    assert.equal(ed.lead.id, "hf-swarm");
    assert.equal(ed.metr.length, 3);
    assert.ok(ed.metr.some((m) => m.rank === "lead-bond"));
  });
  it("ranks METR’s own security incidents as related governance, not rest and not a lead swap", () => {
    const sec = metrRank("Update on Security at METR", "https://metr.org/blog/2026-08-31-security-update/");
    assert.equal(sec.rank, "companion");
    assert.equal(sec.beat, "security");
    assert.match(sec.reason, /different target/i);
    const stories = parseMetrRss(FEED);
    assert.equal(stories[0]?.rank, "lead-bond");
    assert.equal(stories[1]?.beat, "security");
    const split = splitMetr(stories);
    assert.equal(split.security.length, 1);
    assert.equal(split.onLead.length, 1);
    assert.equal(sortMetr(stories)[0]?.rank, "lead-bond");
  });
  it("keeps UK AISI incident writing", () => {
    const aisi = parseAisiRss(`<?xml version="1.0"?><rss><channel>
      <item>
        <title>Incident Report: unsanctioned agent behaviour during cyber testing</title>
        <link>https://www.aisi.gov.uk/blog/incident</link>
        <pubDate>Tue, 04 Aug 2026 00:00:00 +0000</pubDate>
      </item>
      <item>
        <title>Office picnic photos</title>
        <link>https://www.aisi.gov.uk/blog/picnic</link>
        <pubDate>Tue, 04 Aug 2026 00:00:00 +0000</pubDate>
      </item>
    </channel></rss>`);
    assert.equal(aisi.length, 1);
    assert.equal(aisi[0]!.outlet, "UK AISI");
    assert.equal(aisi[0]!.keep, true);
  });
});
