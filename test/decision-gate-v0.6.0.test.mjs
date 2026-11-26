import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const pluginDir = fileURLToPath(new URL('..', import.meta.url));
const mainSource = fs.readFileSync(path.join(pluginDir, 'main.js'), 'utf8');
const settingsSource = fs.readFileSync(path.join(pluginDir, 'settings.js'), 'utf8');

// 1. Syntax check both scripts
new vm.Script(mainSource, { filename: 'main.js' });
new vm.Script(settingsSource, { filename: 'settings.js' });

// 2. Sandbox harness for main.js
function createHarness({ initialConfig = { rules: [] }, initialSecrets = [], modelsCatalog = [], supportsRemoteRoutes = false } = {}) {
  let kvStore = JSON.parse(JSON.stringify(initialConfig));
  let secretsList = JSON.parse(JSON.stringify(initialSecrets));
  let publishedModels = null;
  let hostHandler = null;
  const sentMessages = [];
  const fetchCalls = [];
  const fsCalls = [];
  const bcMessages = [];
  let bcInstance = null;
  let mockFetchHandler = async () => ({ ok: true, status: 200, body: '{}' });
  let mockFsHandler = async () => ({ ok: false, message: 'mock fs not configured' });

  class MockBroadcastChannel {
    constructor(name) { this.name = name; this.onmessage = null; bcInstance = this; }
    postMessage(data) { bcMessages.push(data); }
    addEventListener() {}
    removeEventListener() {}
  }

  const sandbox = {
    console,
    Date,
    Math,
    JSON,
    Object,
    Array,
    Set,
    Map,
    Promise,
    Error,
    Number,
    String,
    Boolean,
    Uint8Array,
    TextEncoder,
    TextDecoder,
    AbortController,
    atob: (b64) => Buffer.from(b64, 'base64').toString('binary'),
    crypto: {
      getRandomValues: (() => {
        let seed = 1;
        return (arr) => {
          for (let i = 0; i < arr.length; i += 1) arr[i] = ((seed++) * 37 + i * 13) & 0xff;
          return arr;
        };
      })(),
    },
    BroadcastChannel: MockBroadcastChannel,
    fetch: async (url, init = {}) => {
      if (url === '/kv') {
        if (init.method === 'PUT') {
          kvStore = JSON.parse(init.body);
          return { ok: true, status: 200, json: async () => kvStore };
        }
        return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(kvStore)) };
      }
      if (url === '/secrets') {
        return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(secretsList)) };
      }
      if (url === '/agent-models') {
        return { ok: true, status: 200, json: async () => ({ ok: true, models: modelsCatalog, supportsRemoteRoutes, locations: [] }) };
      }
      if (url === '/models' && init.method === 'PUT') {
        publishedModels = JSON.parse(init.body).models;
        return { ok: true, status: 200, json: async () => ({ ok: true }) };
      }
      throw new Error(`Unexpected sandbox fetch: ${url}`);
    },
    cindy: {
      onHostMessage: (fn) => { hostHandler = fn; },
      send: (msg) => { sentMessages.push(msg); },
      request: async (req) => {
        if (req.kind === 'app-context') return { context: { locale: 'en' } };
        return {};
      },
      fetch: async (opts) => {
        fetchCalls.push(opts);
        return mockFetchHandler(opts);
      },
      fs: async (opts) => {
        fsCalls.push(opts);
        return mockFsHandler(opts);
      },
    },
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(mainSource, sandbox, { filename: 'main.js' });

  const callTool = async (tool, args, callId = `call_${sentMessages.length + 1}`) => {
    const before = sentMessages.length;
    await hostHandler({ type: 'tool-call', tool, args, callId });
    const reply = sentMessages.slice(before).find((m) => m.type === 'tool-result' && m.callId === callId);
    assert(reply, `Expected tool-result for ${tool}`);
    return reply;
  };

  const triggerHook = async (name, data, hookId = `hook_${sentMessages.length + 1}`) => {
    const before = sentMessages.length;
    await hostHandler({ type: 'event', name, data, hookId, deadline: Date.now() + 8000 });
    return sentMessages.slice(before).find((m) => m.type === 'event-verdict' && m.hookId === hookId);
  };

  return {
    getKv: () => kvStore,
    setSecrets: (s) => { secretsList = s; },
    getPublishedModels: () => publishedModels,
    setFetchHandler: (fn) => { mockFetchHandler = fn; },
    setFsHandler: (fn) => { mockFsHandler = fn; },
    fetchCalls,
    fsCalls,
    bcMessages,
    sendChannelMessage: async (msg) => {
      assert(bcInstance && typeof bcInstance.onmessage === 'function', 'BroadcastChannel.onmessage not registered');
      const before = bcMessages.length;
      await bcInstance.onmessage({ data: msg });
      const reply = bcMessages.slice(before).find((m) => m.reqId === msg.reqId);
      assert(reply, `Expected BroadcastChannel reply for ${msg.reqId}`);
      return reply;
    },
    callTool,
    triggerHook,
  };
}

const sampleModels = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', agent: 'claude-code', providerId: 'anthropic', efforts: ['low', 'medium', 'high'], defaultEffort: 'medium', visible: true },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', agent: 'codex', providerId: 'openai', efforts: ['low', 'high'], defaultEffort: 'low', visible: true },
];

// Test 1: Model publishing with Gemini API key + fallback
{
  const h = createHarness({
    initialConfig: { provider: 'gemini', fallback: { agentKind: 'codex', model: 'gpt-5-mini', providerId: 'openai', modelName: 'GPT-5 Mini' }, rules: [] },
    initialSecrets: [{ key: 'gemini_api_key', saved: true }],
    modelsCatalog: sampleModels,
  });
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(h.getPublishedModels().length, 1);
  assert.equal(h.getPublishedModels()[0].id, 'by-rules');
}

// Test 2: Gemini Decision 1 REST API multimodal (text + image + video + audio + PDF) & typed questions (noul + choice + score)
{
  const h = createHarness({
    initialConfig: { provider: 'gemini', rules: [] },
    initialSecrets: [{ key: 'gemini_api_key', saved: true }],
    modelsCatalog: sampleModels,
  });

  // 1x1 PNG magic header base64
  const pngB64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]).toString('base64');
  // PDF header base64
  const pdfB64 = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n').toString('base64');
  // MP4 ftyp header base64
  const mp4B64 = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00]).toString('base64');
  // WAV header base64
  const wavB64 = Buffer.from('RIFF\x24\x00\x00\x00WAVEfmt ').toString('base64');

  h.setFsHandler(async (opts) => {
    assert.equal(opts.op, 'read');
    assert.equal(opts.root, 'workdir');
    assert.equal(opts.path, 'invoice.pdf');
    return { ok: true, content: pdfB64 };
  });

  h.setFetchHandler(async (opts) => {
    if (opts.url.includes('/upload/v1beta/files')) {
      return { ok: true, status: 200, body: JSON.stringify({ file: { uri: 'https://generativelanguage.googleapis.com/v1beta/files/handoff123', mimeType: 'application/pdf' } }) };
    }
    assert.equal(opts.url, 'https://generativelanguage.googleapis.com/v1beta/decisions');
    const body = JSON.parse(opts.body);
    assert.equal(body.model, 'gemini-decision-1');
    assert.equal(body.input.length, 6);
    assert.deepEqual(body.input[0], { type: 'text', text: 'Inspect all attachments' });
    assert.equal(body.input[1].type, 'image');
    assert.equal(body.input[1].mime_type, 'image/png');
    assert.equal(body.input[1].resolution, 'ultra_high');
    assert.equal(body.input[2].type, 'video');
    assert.equal(body.input[2].mime_type, 'video/mp4');
    assert.equal(body.input[2].resolution, 'high'); // ultra_high clamped to high on video
    assert.equal(body.input[3].type, 'audio');
    assert.equal(body.input[3].mime_type, 'audio/wav');
    assert.equal(body.input[3].resolution, undefined); // stripped on audio
    assert.equal(body.input[4].type, 'document');
    assert.equal(body.input[4].mime_type, 'application/pdf');
    assert.equal(body.input[4].resolution, undefined); // stripped on document
    assert.equal(body.input[5].type, 'document');
    assert.equal(body.input[5].uri, 'https://generativelanguage.googleapis.com/v1beta/files/handoff123');

    assert.equal(body.questions.has_defect.type, 'noul');
    assert.equal(body.questions.route_team.type, 'choice');
    assert.equal(body.questions.severity.type, 'score');

    return {
      ok: true,
      status: 200,
      body: JSON.stringify({
        answers: {
          has_defect: { type: 'noul', noul: 0.94, confidence: 0.94 },
          route_team: { type: 'choice', choice: 'hardware', probabilities: { hardware: 0.88, billing: 0.12 }, confidence: 0.88 },
          severity: { type: 'score', score: 1.85, legend: { 0: 'Low', 1: 'Med', 2: 'High' }, probabilities: { 0: 0.05, 1: 0.1, 2: 0.85 }, confidence: 0.85 },
        },
        usage: { total_input_tokens: 420, total_output_tokens: 0, total_tokens: 420 },
      }),
    };
  });

  const res = await h.callTool('evaluate', {
    input: [
      { type: 'text', text: 'Inspect all attachments' },
      { type: 'image', data: `data:image/png;base64,${pngB64}`, resolution: 'ultra_high' },
      { type: 'video', data: mp4B64, resolution: 'ultra_high' },
      { type: 'audio', data: wavB64, mime_type: 'audio/x-wav', resolution: 'high' },
      { type: 'pdf', path: 'invoice.pdf', resolution: 'high' },
    ],
    cindy_handoff_files: [{ ref: 'handoff:11111111-1111-1111-1111-111111111111', name: 'extra.pdf', mimeType: 'application/pdf' }],
    questions: {
      has_defect: { type: 'noul', instructions: 'Is there a defect?', criteria: { true_description: 'Broken hardware', false_description: 'Other' } },
      route_team: { type: 'choice', instructions: 'Which team?', criteria: { hardware: 'Physical damage', billing: 'Payment issue' } },
      severity: { type: 'score', instructions: 'Rate severity', criteria: ['Low', 'Med', 'High'] },
    },
  });
  assert.equal(res.ok, true, res.message);
  assert.equal(res.result.provider, 'gemini');
  assert.equal(res.result.model, 'gemini-decision-1');
  assert.equal(res.result.answers.has_defect.noul, 0.94);
  assert.equal(res.result.answers.route_team.choice, 'hardware');
  assert.equal(res.result.answers.severity.score, 1.85);
  assert.equal(res.result.usage.total_output_tokens, 0);
}

// Test 3: Auto-select Gemini when multimodal audio/video/pdf passed to evaluate while cfg.provider is openai
{
  const h = createHarness({
    initialConfig: { provider: 'openai', rules: [] },
    initialSecrets: [{ key: 'openai_api_key', saved: true }, { key: 'gemini_api_key', saved: true }],
  });
  h.setFetchHandler(async (opts) => {
    assert.equal(opts.url, 'https://generativelanguage.googleapis.com/v1beta/decisions');
    return { ok: true, status: 200, body: JSON.stringify({ answers: { q1: { type: 'noul', noul: 0.91, confidence: 0.91 } } }) };
  });
  const res = await h.callTool('evaluate', {
    input: [{ type: 'audio', uri: 'https://example.com/call.wav', mime_type: 'audio/wav' }],
    questions: { q1: { type: 'noul', instructions: 'Is speaker urgent?' } },
  });
  assert.equal(res.ok, true, res.message);
  assert.equal(res.result.provider, 'gemini');
}

// Test 4: Validation & Error Guards (gs:// URI, octet-stream, safety 400, >256KB body)
{
  const h = createHarness({
    initialConfig: { provider: 'gemini', rules: [] },
    initialSecrets: [{ key: 'gemini_api_key', saved: true }],
  });
  const gsErr = await h.callTool('evaluate', {
    input: [{ type: 'video', uri: 'gs://bucket/video.mp4', mime_type: 'video/mp4' }],
    questions: { q1: { type: 'noul', instructions: 'Has fire?' } },
  });
  assert.equal(gsErr.ok, false);
  assert.match(gsErr.message, /gs:\/\//i);

  const octetErr = await h.callTool('evaluate', {
    input: [{ type: 'document', uri: 'https://example.com/blob', mime_type: 'application/octet-stream' }],
    questions: { q1: { type: 'noul', instructions: 'Has PO?' } },
  });
  assert.equal(octetErr.ok, false);
  assert.match(octetErr.message, /octet-stream/i);

  const bigB64 = 'A'.repeat(270000);
  const sizeErr = await h.callTool('evaluate', {
    input: [{ type: 'document', data: `data:application/pdf;base64,${bigB64}`, mime_type: 'application/pdf' }],
    questions: { q1: { type: 'noul', instructions: 'Big PDF?' } },
  });
  assert.equal(sizeErr.ok, false);
  assert.match(sizeErr.message, /256 KB|262,144/);

  h.setFetchHandler(async () => ({
    ok: true,
    status: 400,
    body: JSON.stringify({ error: { code: 'safety', message: 'Request blocked due to safety violations.' } }),
  }));
  const safetyErr = await h.callTool('evaluate', {
    input: 'unsafe text',
    questions: { q1: { type: 'noul', instructions: 'Test' } },
  });
  assert.equal(safetyErr.ok, false);
  assert.match(safetyErr.message, /safety/);
}

// Test 5: save_rule + control points (choice with optionRoutes, score with minScore, will-schedule-run skip)
{
  const h = createHarness({
    initialConfig: { provider: 'gemini', rules: [], threshold: 0.6 },
    initialSecrets: [{ key: 'gemini_api_key', saved: true }],
    modelsCatalog: sampleModels,
  });

  const fb = await h.callTool('set_fallback_model', { model: 'gpt-5-mini', provider: 'gemini' });
  assert.equal(fb.ok, true);

  const r1 = await h.callTool('save_rule', {
    point: 'will-start-task',
    type: 'choice',
    question: 'Classify task type',
    criteria: { coding: 'Writing or debugging code', chat: 'Casual Q&A' },
    optionRoutes: { coding: { model: 'claude-opus-5-5', agent: 'claude-code', providerId: 'anthropic', effort: 'high' }, chat: { model: 'gpt-5-mini' } },
  });
  assert.equal(r1.ok, true, r1.message);

  const r2 = await h.callTool('save_rule', {
    point: 'will-schedule-run',
    type: 'score',
    question: 'How redundant is this run?',
    criteria: ['Necessary', 'Unclear', 'Skip'],
    minScore: 1.5,
  });
  assert.equal(r2.ok, true, r2.message);

  h.setFetchHandler(async (opts) => {
    const body = JSON.parse(opts.body);
    const qId = Object.keys(body.questions)[0];
    if (body.questions[qId].type === 'choice') {
      return {
        ok: true,
        status: 200,
        body: JSON.stringify({ answers: { [qId]: { type: 'choice', choice: 'coding', probabilities: { coding: 0.93, chat: 0.07 }, confidence: 0.93 } } }),
      };
    }
    return {
      ok: true,
      status: 200,
      body: JSON.stringify({ answers: { [qId]: { type: 'score', score: 1.8, legend: { 0: 'Necessary', 1: 'Unclear', 2: 'Skip' }, probabilities: { 0: 0.05, 1: 0.1, 2: 0.85 }, confidence: 0.85 } } }),
    };
  });

  const startVerdict = await h.triggerHook('will-start-task', { text: 'Fix login race condition', attachmentCount: 0 });
  assert.equal(startVerdict.action, 'route');
  assert.equal(startVerdict.route.model, 'claude-opus-5-5');
  assert.equal(startVerdict.route.effort, 'high');

  const schedVerdict = await h.triggerHook('will-schedule-run', { name: 'Daily digest', prompt: 'Check news', trigger: 'cron' });
  assert.equal(schedVerdict.action, 'skip');
}

// Test 6: OpenAI typed question synthesis (choice + score)
{
  const h = createHarness({
    initialConfig: { provider: 'openai', rules: [] },
    initialSecrets: [{ key: 'openai_api_key', saved: true }],
  });
  h.setFetchHandler(async (opts) => {
    assert.equal(opts.url, 'https://api.openai.com/v1/decisions');
    const body = JSON.parse(opts.body);
    return {
      ok: true,
      status: 200,
      body: JSON.stringify({
        answers: body.questions.map((q) => ({
          type: 'predicate',
          name: q.name,
          probability: q.name.endsWith('opt__0') ? 0.9 : q.name.endsWith('lvl__2') ? 0.85 : 0.1,
        })),
      }),
    };
  });
  const res = await h.callTool('evaluate', {
    input: 'Server crashed in production',
    questions: {
      team: { type: 'choice', instructions: 'Which team?', criteria: { infra: 'Servers', sales: 'Sales' } },
      sev: { type: 'score', instructions: 'Severity?', criteria: ['Low', 'Med', 'High'] },
    },
  });
  assert.equal(res.ok, true, res.message);
  assert.equal(res.result.answers.team.choice, 'infra');
  assert.ok(res.result.answers.sev.score > 1.5);
}

// Test 7: BroadcastChannel (req.kind === 'try' with multimodal media & req.kind === 'evaluate') + settings.js PROVIDERS.gemini verification
{
  const h = createHarness({
    initialConfig: {
      provider: 'gemini',
      geminiModel: 'gemini-decision-1',
      threshold: 0.6,
      fallback: { agentKind: 'codex', model: 'gpt-5-mini', providerId: 'openai', modelName: 'GPT-5 Mini' },
      rules: [
        {
          id: 'r_img',
          point: 'will-start-task',
          type: 'noul',
          question: 'Does the message include a UI screenshot bug?',
          route: { agentKind: 'claude-code', model: 'claude-opus-5-5', providerId: 'anthropic', modelName: 'Claude Opus 5.5', effort: 'high' },
          enabled: true,
        },
      ],
    },
    initialSecrets: [{ key: 'gemini_api_key', saved: true }],
    modelsCatalog: sampleModels,
  });

  const pngB64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]).toString('base64');
  h.setFetchHandler(async (opts) => {
    assert.equal(opts.url, 'https://generativelanguage.googleapis.com/v1beta/decisions');
    const body = JSON.parse(opts.body);
    assert.equal(body.model, 'gemini-decision-1');
    const qKeys = Object.keys(body.questions);
    const firstQ = body.questions[qKeys[0]];
    if (firstQ.type === 'score') {
      assert.ok(Array.isArray(body.input) && body.input.some((b) => b.type === 'image'));
      return {
        ok: true,
        status: 200,
        body: JSON.stringify({
          answers: {
            [qKeys[0]]: { type: 'score', score: 1.9, legend: { 0: 'Low', 1: 'Med', 2: 'High' }, probabilities: { 0: 0.02, 1: 0.06, 2: 0.92 }, confidence: 0.92 },
          },
          usage: { total_input_tokens: 180, total_output_tokens: 0, total_tokens: 180 },
        }),
      };
    }
    assert.ok(Array.isArray(body.input) && body.input.some((b) => b.type === 'image' && b.resolution === 'medium'));
    return {
      ok: true,
      status: 200,
      body: JSON.stringify({
        answers: {
          [qKeys[0]]: { type: 'noul', noul: 0.91, confidence: 0.91 },
        },
        usage: { total_input_tokens: 150, total_output_tokens: 0, total_tokens: 150 },
      }),
    };
  });

  const tryReply = await h.sendChannelMessage({
    from: 'settings',
    reqId: 'req_try_mm',
    kind: 'try',
    point: 'will-start-task',
    text: 'Check this screenshot',
    media: [{ type: 'image', data: `data:image/png;base64,${pngB64}`, mime_type: 'image/png', resolution: 'medium' }],
    config: h.getKv(),
  });
  assert.equal(tryReply.ok, true, tryReply.message);
  assert.equal(tryReply.result.action, 'route');
  assert.equal(tryReply.result.route.model, 'claude-opus-5-5');

  const evalReply = await h.sendChannelMessage({
    from: 'settings',
    reqId: 'req_eval_mm',
    kind: 'evaluate',
    provider: 'gemini',
    input: [
      { type: 'text', text: 'Score severity' },
      { type: 'image', data: `data:image/png;base64,${pngB64}`, mime_type: 'image/png', resolution: 'high' },
    ],
    questions: {
      sev: { type: 'score', instructions: 'Rate severity', criteria: ['Low', 'Med', 'High'] },
    },
    config: h.getKv(),
  });
  assert.equal(evalReply.ok, true, evalReply.message);
  assert.equal(evalReply.result.provider, 'gemini');
  assert.equal(evalReply.result.answers.sev.score, 1.9);
  assert.deepEqual(evalReply.result.modalities.sort(), ['image', 'text']);

  const createMockEl = (tag = 'div') => {
    const el = {
      tagName: tag.toUpperCase(),
      children: [],
      attributes: {},
      style: {},
      dataset: {},
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute(k, v) { this.attributes[k] = String(v); },
      removeAttribute(k) { delete this.attributes[k]; },
      addEventListener() {},
      append(...nodes) { this.children.push(...nodes); },
      replaceChildren(...nodes) { this.children = nodes; },
    };
    return el;
  };
  const rootEl = createMockEl('div');
  const settingsSandbox = {
    console,
    Date,
    Math,
    JSON,
    Object,
    Array,
    Set,
    Map,
    Promise,
    Error,
    Number,
    String,
    Boolean,
    AbortController,
    setTimeout,
    clearTimeout,
    navigator: {},
    crypto: {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i += 1) arr[i] = (i * 17 + 3) & 0xff;
        return arr;
      },
    },
    document: {
      activeElement: null,
      documentElement: { lang: 'en' },
      getElementById: (id) => (id === 'root' ? rootEl : null),
      createElement: (tag) => createMockEl(tag),
      createElementNS: (_ns, tag) => createMockEl(tag),
      createTextNode: (txt) => ({ textContent: String(txt) }),
    },
    BroadcastChannel: class { postMessage() {} addEventListener() {} },
    fetch: async (url) => {
      if (url === '/app-context') return { ok: true, status: 200, json: async () => ({ locale: 'en' }) };
      if (url === '/kv') return { ok: true, status: 200, json: async () => ({ provider: 'gemini', rules: [] }) };
      if (url === '/secrets') return { ok: true, status: 200, json: async () => [{ key: 'gemini_api_key', saved: true }] };
      if (url === '/agent-models') return { ok: true, status: 200, json: async () => ({ ok: true, models: sampleModels, supportsRemoteRoutes: false, locations: [] }) };
      if (url === '/models') return { ok: true, status: 200, json: async () => ({ ok: true }) };
      return { ok: true, status: 200, json: async () => ({}) };
    },
  };
  settingsSandbox.globalThis = settingsSandbox;
  vm.runInNewContext(`${settingsSource}\n;globalThis.__SETTINGS_TEST__ = { PROVIDERS, MESSAGES, AGENT_KIND, AGENT_LABEL };`, settingsSandbox, { filename: 'settings.js' });
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(settingsSandbox.__SETTINGS_TEST__.PROVIDERS.gemini.model, 'gemini-decision-1');
  assert.equal(settingsSandbox.__SETTINGS_TEST__.PROVIDERS.gemini.key, 'gemini_api_key');
  assert.equal(settingsSandbox.__SETTINGS_TEST__.PROVIDERS.gemini.name, 'Gemini Decision');
  assert.equal(settingsSandbox.__SETTINGS_TEST__.AGENT_KIND.acp, 'acp');
  assert.equal(settingsSandbox.__SETTINGS_TEST__.AGENT_LABEL.acp, 'Antigravity');
  assert.ok(rootEl.children.length > 0, 'Expected settings.js boot/render to populate root element');
}

// Test 8: Antigravity (acp) routing, anti-xd fallback guard, rule c24ae4455993, and settings.js Antigravity rendering
{
  const acpProvider = 'acp-plugin:_ns__local__cindy-antigravity-multi-accounts:agy';
  const xdCollisionCatalog = [
    { id: 'google/gemini-3.8-flash', name: 'Gemini 3.8 Flash', agent: 'claude-code', providerId: 'xd', efforts: ['low', 'medium', 'high'], defaultEffort: 'medium', visible: true },
    { id: 'gpt-6-luna', name: 'GPT-6 Luna', agent: 'codex', providerId: 'openai-sub-6c24b838', efforts: ['low', 'medium', 'high'], defaultEffort: 'medium', visible: true },
  ];
  const h = createHarness({
    initialConfig: { provider: 'gemini', threshold: 0.6, rules: [] },
    initialSecrets: [{ key: 'gemini_api_key', saved: true }],
    modelsCatalog: xdCollisionCatalog,
  });

  const listed = await h.callTool('list_rules', {});
  assert.equal(listed.ok, true, listed.message);
  assert.ok(listed.result.availableModels.some((m) => m.agent === 'acp' && m.providerId === acpProvider && m.id === 'gemini-4-hydrogen'));
  assert.ok(listed.result.availableModels.some((m) => m.agent === 'acp' && m.providerId === acpProvider && m.id === 'gemini-3.8-flash'));

  // Without providerId, querying "gemini-3.8-flash" must NOT fall into providerId "xd" ("google/gemini-3.8-flash", name "Gemini 3.8 Flash")
  const fbFlash = await h.callTool('set_fallback_model', { model: 'gemini-3.8-flash', effort: 'medium' });
  assert.equal(fbFlash.ok, true, fbFlash.message);
  assert.equal(fbFlash.result.fallback.agentKind, 'acp');
  assert.equal(fbFlash.result.fallback.providerId, acpProvider);
  assert.equal(fbFlash.result.fallback.model, 'gemini-3.8-flash');
  assert.equal(fbFlash.result.fallback.effort, 'medium');

  const fb = await h.callTool('set_fallback_model', { model: 'gemini-4-hydrogen', agent: 'acp', providerId: acpProvider, effort: 'medium' });
  assert.equal(fb.ok, true, fb.message);
  assert.equal(fb.result.fallback.agentKind, 'acp');
  assert.equal(fb.result.fallback.providerId, acpProvider);
  assert.equal(fb.result.fallback.model, 'gemini-4-hydrogen');
  assert.equal(fb.result.fallback.effort, 'medium');

  const savedRule = await h.callTool('save_rule', {
    id: 'c24ae4455993',
    point: 'will-start-task',
    type: 'choice',
    question: 'Classify task for Antigravity routing',
    criteria: {
      decision: 'Architecture or risk decision',
      engineering: 'Implementation or debugging',
      visual: 'Screenshot / UI inspection',
      receipt: 'Simple receipt summary',
      general: 'General fallback Q&A',
    },
    optionRoutes: {
      decision: { agent: 'acp', providerId: acpProvider, model: 'gemini-4-hydrogen', effort: 'high' },
      engineering: { agent: 'acp', providerId: acpProvider, model: 'gemini-4-argon', effort: 'high' },
      visual: { agent: 'acp', providerId: acpProvider, model: 'gemini-4-carbon', effort: 'medium' },
      receipt: { agent: 'acp', providerId: acpProvider, model: 'gemini-4-hydrogen', effort: 'low' },
      general: { agent: 'acp', providerId: acpProvider, model: 'gemini-4-hydrogen', effort: 'medium' },
    },
  });
  assert.equal(savedRule.ok, true, savedRule.message);
  assert.equal(savedRule.result.saved.optionRoutes.decision.agentKind, 'acp');
  assert.equal(savedRule.result.saved.optionRoutes.decision.providerId, acpProvider);
  assert.equal(savedRule.result.saved.optionRoutes.decision.model, 'gemini-4-hydrogen');
  assert.equal(savedRule.result.saved.optionRoutes.decision.effort, 'high');
  assert.equal(savedRule.result.saved.optionRoutes.receipt.model, 'gemini-4-hydrogen');
  assert.equal(savedRule.result.saved.optionRoutes.receipt.effort, 'low');
  assert.equal(savedRule.result.saved.optionRoutes.general.model, 'gemini-4-hydrogen');
  assert.equal(savedRule.result.saved.optionRoutes.general.effort, 'medium');

  // Also ensure unlisted Antigravity model IDs synthesize cleanly when agentKind/providerId specify acp
  const customRule = await h.callTool('save_rule', {
    point: 'will-start-task',
    type: 'noul',
    question: 'Route custom acp model',
    agentKind: 'acp',
    providerId: acpProvider,
    model: 'gemini-future-acp',
    effort: 'high',
    enabled: false,
  });
  assert.equal(customRule.ok, true, customRule.message);
  assert.equal(customRule.result.saved.route.agentKind, 'acp');
  assert.equal(customRule.result.saved.route.providerId, acpProvider);
  assert.equal(customRule.result.saved.route.model, 'gemini-future-acp');

  h.setFetchHandler(async () => ({
    ok: true,
    status: 200,
    body: JSON.stringify({
      answers: {
        c24ae4455993: {
          type: 'choice',
          choice: 'engineering',
          probabilities: { engineering: 0.92, decision: 0.04, visual: 0.02, receipt: 0.01, general: 0.01 },
          confidence: 0.92,
        },
      },
    }),
  }));

  const verdict = await h.triggerHook('will-start-task', { text: 'Debug audio sync drift in MontClip', attachmentCount: 0 });
  assert.equal(verdict.action, 'route');
  assert.deepEqual(JSON.parse(JSON.stringify(verdict.route)), {
    agentKind: 'acp',
    providerId: acpProvider,
    model: 'gemini-4-argon',
    effort: 'high',
  });

  // Render settings.js with Antigravity acp routes and assert "Antigravity" label, inline acp picker, and /model-picker initial guard
  const serializeText = (node) => {
    if (node == null) return '';
    if (typeof node === 'string') return node;
    if (typeof node.textContent === 'string') return node.textContent;
    if (Array.isArray(node.children)) return node.children.map(serializeText).join(' ');
    return '';
  };
  const findNodes = (node, pred, acc = []) => {
    if (!node || typeof node !== 'object') return acc;
    if (pred(node)) acc.push(node);
    if (Array.isArray(node.children)) node.children.forEach((c) => findNodes(c, pred, acc));
    return acc;
  };
  const pickerCalls = [];
  let kvSavedFromUi = null;
  const createMockEl = (tag = 'div') => {
    const el = {
      tagName: tag.toUpperCase(),
      children: [],
      attributes: {},
      style: {},
      dataset: {},
      listeners: {},
      parent: null,
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute(k, v) { this.attributes[k] = String(v); },
      removeAttribute(k) { delete this.attributes[k]; },
      addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); },
      click() { (this.listeners.click || []).forEach((fn) => fn({ target: el, currentTarget: el, stopPropagation() {}, preventDefault() {} })); },
      contains(target) { return target === el || el.children.some((c) => c && typeof c.contains === 'function' && c.contains(target)); },
      remove() { if (el.parent) el.parent.children = el.parent.children.filter((c) => c !== el); },
      getBoundingClientRect: () => ({ left: 10, top: 20, right: 210, bottom: 52, width: 200, height: 32 }),
      append(...nodes) { for (const n of nodes) { if (n && typeof n === 'object') n.parent = el; this.children.push(n); } },
      replaceChildren(...nodes) { this.children = []; this.append(...nodes); },
      get childElementCount() { return this.children.filter((c) => c && typeof c === 'object' && c.tagName).length; },
    };
    return el;
  };
  const rootEl = createMockEl('div');
  const bodyEl = createMockEl('body');
  const settingsSandbox = {
    console, Date, Math, JSON, Object, Array, Set, Map, Promise, Error, Number, String, Boolean, AbortController,
    setTimeout, clearTimeout, navigator: {},
    crypto: { getRandomValues: (arr) => arr.fill(7) },
    document: {
      activeElement: null,
      documentElement: { lang: 'en' },
      body: bodyEl,
      addEventListener() {},
      removeEventListener() {},
      getElementById: (id) => (id === 'root' ? rootEl : null),
      createElement: (tag) => createMockEl(tag),
      createElementNS: (_ns, tag) => createMockEl(tag),
      createTextNode: (txt) => ({ textContent: String(txt) }),
    },
    BroadcastChannel: class { postMessage() {} addEventListener() {} },
    fetch: async (url, init = {}) => {
      if (url === '/app-context') return { ok: true, status: 200, json: async () => ({ locale: 'en' }) };
      if (url === '/kv') {
        if (init.method === 'PUT') {
          kvSavedFromUi = JSON.parse(init.body);
          return { ok: true, status: 200, json: async () => kvSavedFromUi };
        }
        return { ok: true, status: 200, json: async () => h.getKv() };
      }
      if (url === '/secrets') return { ok: true, status: 200, json: async () => [{ key: 'gemini_api_key', saved: true }] };
      if (url === '/agent-models') return { ok: true, status: 200, json: async () => ({ ok: true, models: xdCollisionCatalog, supportsRemoteRoutes: false, locations: [] }) };
      if (url === '/models') return { ok: true, status: 200, json: async () => ({ ok: true }) };
      if (url === '/model-picker') {
        pickerCalls.push(JSON.parse(init.body));
        return { ok: true, status: 200, json: async () => ({ ok: false, errorCode: 'CANCELLED' }) };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    },
  };
  settingsSandbox.globalThis = settingsSandbox;
  vm.runInNewContext(`${settingsSource}\n;globalThis.__SETTINGS_EXPORT__ = { pickRoute };`, settingsSandbox, { filename: 'settings.js' });
  await new Promise((r) => setTimeout(r, 30));
  const renderedText = serializeText(rootEl);
  assert.match(renderedText, /Antigravity/);
  assert.doesNotMatch(renderedText, /Not available/);

  // Open inline Antigravity popover from the fallback modelButton and select Gemini 4 Hydrogen (High)
  const fallbackBtn = findNodes(rootEl, (n) => n.attributes?.['aria-label'] === 'Fallback model')[0];
  assert.ok(fallbackBtn, 'Expected Fallback model button');
  fallbackBtn.click();
  const pop = findNodes(bodyEl, (n) => String(n.attributes?.class || '').includes('mpop'))[0];
  assert.ok(pop, 'Expected inline Antigravity .mpop menu');
  assert.match(serializeText(pop), /Gemini 4 Hydrogen/);
  const h2Row = findNodes(pop, (n) => String(n.attributes?.class || '').includes('mpop-item') && serializeText(n).includes('Gemini 4 Hydrogen'))[0];
  const highEffBtn = findNodes(h2Row, (n) => n.tagName === 'BUTTON' && serializeText(n).trim() === 'High')[0];
  assert.ok(highEffBtn, 'Expected High effort button on Gemini 4 Hydrogen');
  highEffBtn.click();
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(kvSavedFromUi?.fallback?.model, 'gemini-4-hydrogen');
  assert.equal(kvSavedFromUi?.fallback?.effort, 'high');
  assert.equal(kvSavedFromUi?.fallback?.agentKind, 'acp');

  // Opening Host /model-picker when current route is acp must omit `initial` (fixing "Invalid model picker options")
  const fallbackBtnAfter = findNodes(rootEl, (n) => n.attributes?.['aria-label'] === 'Fallback model')[0];
  fallbackBtnAfter.click();
  const pop2 = findNodes(bodyEl, (n) => String(n.attributes?.class || '').includes('mpop'))[0];
  const hostBtn = findNodes(pop2, (n) => String(n.attributes?.class || '').includes('mpop-host'))[0];
  assert.ok(hostBtn, 'Expected Other engines host picker button');
  hostBtn.click();
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(pickerCalls.length, 1);
  assert.equal('initial' in pickerCalls[0], false, 'acp route must omit initial in /model-picker');

  // Verify codex route still passes initial to /model-picker
  await settingsSandbox.__SETTINGS_EXPORT__.pickRoute({ agentKind: 'codex', providerId: 'openai-sub-6c24b838', model: 'gpt-6-luna', effort: 'medium' });
  assert.equal(pickerCalls.length, 2);
  assert.equal(pickerCalls[1].initial?.agentKind, 'codex');
  assert.equal(pickerCalls[1].initial?.model, 'gpt-6-luna');
}

console.log('ALL_MAIN_JS_TESTS_PASSED');
