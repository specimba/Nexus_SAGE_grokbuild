import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { briefingBeats, compileDigest } from "./compile.ts";

describe("read aloud", () => {
  it("is this edition, not a podcast", () => {
    const beats = briefingBeats(compileDigest({ at: "2026-09-16T01:00:00Z" }));
    const body = beats.map((b) => `${b.kicker} ${b.text}`).join("\n");
    assert.ok(beats.length >= 6);
    assert.match(body, /Hugging Face/);
    assert.match(body, /METR/);
    assert.doesNotMatch(body, /\bEve\b|\bOrion\b|this tape|podcast|VU|chapter/i);
  });
});
