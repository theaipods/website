import test from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import { officeText } from "../lib/server/extract";
import { agents, domains, processFor } from "../lib/workforce";

test("Word extraction preserves paragraph text and entities, ignores relationships", () => {
  const data = zipSync({ "word/document.xml": strToU8('<w:document><w:p><w:r><w:t>Brand &amp; safety</w:t></w:r></w:p><w:p><w:r><w:t>Do not claim &#x32;00% growth.</w:t></w:r></w:p></w:document>'), "word/_rels/document.xml.rels": strToU8('https://untrusted.example/never-follow') });
  assert.match(officeText(data, "docx"), /Brand & safety\nDo not claim 200% growth/);
  assert.doesNotMatch(officeText(data, "docx"), /untrusted/);
});
test("PowerPoint extracts slide text in numeric order", () => {
  const data = zipSync({ "ppt/slides/slide10.xml": strToU8('<a:p><a:r><a:t>Last</a:t></a:r></a:p>'), "ppt/slides/slide2.xml": strToU8('<a:p><a:r><a:t>First</a:t></a:r></a:p>') });
  assert.ok(officeText(data, "pptx").indexOf("First") < officeText(data, "pptx").indexOf("Last"));
});
test("oversized and invalid archives fail extraction", () => {
  assert.throws(() => officeText(strToU8("not a zip"), "docx"));
  const data = zipSync({ "word/document.xml": new Uint8Array(10_000_001) });
  assert.throws(() => officeText(data, "docx"), /exceeds extraction limit/);
});
test("every department has real specialist defaults and an editable process", () => {
  for (const domain of domains) {
    if (domain.roles.length) assert.ok(agents.some(a => domain.roles.includes(a.name)), `${domain.name} needs a matching specialist`);
    assert.ok(domain.questions.length >= 6);
    assert.ok(processFor(domain.id, {}).length > 0);
  }
  assert.equal(new Set(agents.map(a => a.id)).size, agents.length);
});
