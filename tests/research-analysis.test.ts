import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeResearchProfile, groundedProfile } from '../lib/server/research-profile';
import { directory, researchOutcome, validateResearchContent } from '../lib/server/website-research';
import type { ResearchReport, ResearchSource } from '../lib/research-types';

const source: ResearchSource = { url: 'https://example.org/', kind: 'official', provider: 'fixture', title: 'Example', status: 'Stored', text: 'Example builds project management software for design studios. Our teams operate in India and Singapore.' };
const finding = { field: 'about', value: 'Project management software for design studios.', source: source.url, evidence: 'builds project management software for design studios' };
function report(sources = [source]): ResearchReport { return { website: source.url, at: '', sources, suggestions: [], warnings: [], discovered: 1, limit: 5 }; }

test('widget content and personal LinkedIn pages cannot become company evidence', () => {
  assert.throws(() => validateResearchContent('TradingView Medium Chart Widget', 'Market data '.repeat(40)), /widget/);
  assert.throws(() => validateResearchContent('403 Forbidden', 'Denied '.repeat(30)), /accessible/);
  assert.throws(() => validateResearchContent('Company', 'Empty'), /Too little/);
  assert.doesNotThrow(() => validateResearchContent('Example company', 'We build useful business software. '.repeat(10)));
  assert.equal(directory('https://in.linkedin.com/in/some-person'), false);
  assert.equal(directory('https://in.linkedin.com/company/example'), true);
});

test('directory-only crawl does not count as a successful company profile', () => {
  const blocked = { ...source, status: 'Robots policy unavailable (403); skipped.' };
  assert.equal(researchOutcome([blocked, { ...source, kind: 'directory' }], false), 'failed');
  assert.equal(researchOutcome([source, blocked], false), 'partial');
  assert.equal(researchOutcome([source], true), 'partial');
  assert.equal(researchOutcome([source], false), 'complete');
});

test('AI findings require official URLs and matching evidence and exclude unsupported fields', () => {
  assert.equal(groundedProfile(JSON.stringify({ findings: [finding] }), [source]).length, 1);
  for (const altered of [{ ...finding, source: 'https://unrelated.example/' }, { ...finding, evidence: 'Claims billions in annual revenue.' }]) {
    assert.equal(groundedProfile(JSON.stringify({ findings: [altered] }), [source]).length, 0);
  }
  assert.equal(groundedProfile(JSON.stringify({ findings: [finding] }), [{ ...source, kind: 'directory' }]).length, 0);
  assert.equal(groundedProfile(JSON.stringify({ findings: [{ ...finding, field: 'size' }] }), [source]).length,0);
  assert.throws(() => groundedProfile('not json', [source]));
  assert.equal(groundedProfile(JSON.stringify({findings:[{field:'unknown'},finding]}),[source]).length,1);
  assert.equal(groundedProfile(JSON.stringify({findings:[finding]}),[{...source,text:'An unrelated short search excerpt.'},source]).length,1);
});

test('research calls configured chat only with readable official evidence and retains extraction on failure', async () => {
  const saved = { ...process.env }; const original = globalThis.fetch;
  try {
    process.env.AI_PROVIDER = 'nvidia'; process.env.NVIDIA_API_KEY = 'test-fixture';
    let calls = 0;
    globalThis.fetch = async (_url, init) => {
      calls++;
      const payload = JSON.parse(String(init?.body));
      assert.match(payload.messages[0].content, /untrusted data/);
      assert.match(payload.messages[1].content, /design studios/);
      assert.equal(payload.response_format.type,'json_object');
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ findings: [{field:'about',value:finding.value,evidenceId:'p0'},{field:'industry',value:'Invented',evidenceId:'not-a-passage'}] }) } }] });
    };
    const blocked = report([{ ...source, status: 'Blocked' }]);
    await analyzeResearchProfile(blocked); assert.equal(blocked.analysis?.status, 'skipped'); assert.equal(calls, 0);
    const ok = report(); await analyzeResearchProfile(ok); assert.equal(calls, 1); assert.equal(ok.analysis?.status, 'complete'); assert.equal(ok.suggestions[0].evidence, source.text);assert.equal(ok.suggestions.length,1);
    const extracted = report(); extracted.suggestions = [{ field: 'about', value: 'Metadata description', source: source.url, confidence: 'extracted' }];
    await analyzeResearchProfile(extracted); assert.equal(extracted.suggestions[0].value, finding.value);
    globalThis.fetch = async () => Response.json({}, { status: 429 });
    await analyzeResearchProfile(extracted); assert.equal(extracted.analysis?.status, 'failed'); assert.equal(extracted.suggestions[0].value, finding.value);
    delete process.env.NVIDIA_API_KEY;
    const missing = report(); await analyzeResearchProfile(missing); assert.equal(missing.analysis?.status, 'unavailable');
  } finally {
    globalThis.fetch = original;
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  }
});
