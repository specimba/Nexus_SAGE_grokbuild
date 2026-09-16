import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseArxivAtom } from "./arxiv.ts";

const ATOM = `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/1706.03762v7</id>
    <summary>The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.</summary>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2609.02749</id>
    <summary>Agent sandbox measurement notes.</summary>
  </entry>
</feed>`;

describe("arXiv Atom", () => {
  it("parses ids and abstracts from Atom entries", () => {
    const rows = parseArxivAtom(ATOM);
    assert.equal(rows.length, 2);
    assert.equal(rows[0]!.id, "1706.03762");
    assert.match(rows[0]!.abstract, /sequence transduction/);
    assert.equal(rows[1]!.id, "2609.02749");
  });
});
