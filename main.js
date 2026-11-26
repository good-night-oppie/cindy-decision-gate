// Decision Gate answers Cindy's control points and the `evaluate` tool from rules or typed questions:
// - when a new task starts (will-start-task): noul / choice / score → pick a model route;
// - before an automation or routine runs (will-schedule-run / will-routine-run): noul / choice / score → skip this run;
// - evaluate tool: evaluate 1–1,000 typed questions (noul, choice, score) over text, images, video, audio, and PDFs.
// Rules for a moment are checked top to bottom; the first with a conclusion applies. Below threshold counts as unsure.
// Gemini Decision (gemini-decision-1), OpenAI Decisions (gpt-6-luna), or TypeSafe Jev answers all questions in one request.
// On error no verdict is sent: Cindy follows the task's failure setting (a new task keeps the original model).
const POINTS = ['will-start-task', 'will-schedule-run', 'will-routine-run'];
const DEFAULT_MODELS = { gemini: 'gemini-decision-1', jev: 'jev-latest', openai: 'gpt-6-luna' };
const PROVIDER_IDS = ['gemini', 'openai', 'jev'];
const SECRET_KEYS = { gemini: 'gemini_api_key', jev: 'typesafe_api_key', openai: 'openai_api_key' };
const PROVIDER_NAMES = { gemini: 'Gemini Decision', jev: 'TypeSafe Jev', openai: 'OpenAI Decisions' };
const AGENT_KIND = { 'claude-code': 'cc', cc: 'cc', codex: 'codex', pi: 'pi', acp: 'acp', antigravity: 'acp', agy: 'acp' };
const DEFAULT_ACP_PROVIDER_ID = 'acp-plugin:_ns__local__cindy-antigravity-multi-accounts:agy';
const ACP_FALLBACK_MODELS = [
  { id: 'gemini-4-hydrogen', name: 'Gemini 4 Hydrogen', efforts: ['low', 'medium', 'high', 'xhigh'], defaultEffort: 'high', visible: true },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', efforts: ['low', 'medium', 'high'], defaultEffort: 'high', visible: true },
  { id: 'gemini-4-carbon', name: 'Gemini 4 Carbon', efforts: ['low', 'medium', 'high'], defaultEffort: 'medium', visible: true },
  { id: 'gemini-4-neon', name: 'Gemini 4 Neon', efforts: ['low', 'medium', 'high', 'xhigh'], defaultEffort: 'high', visible: true },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', efforts: ['low', 'medium', 'high'], defaultEffort: 'medium', visible: true },
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', efforts: ['low', 'medium', 'high'], defaultEffort: 'high', visible: true },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', efforts: ['low', 'medium', 'high'], defaultEffort: 'high', visible: true },
  { id: 'gpt-oss-120b-medium', name: 'GPT-OSS 120B (Medium)', efforts: [], defaultEffort: null, visible: true },
  { id: 'gemini-pro-orchestrator-neon', name: 'Orchestrator (Neon)', efforts: [], defaultEffort: null, visible: true },
  { id: 'gemini-pro-orchestrator', name: 'Orchestrator (Carbon)', efforts: [], defaultEffort: null, visible: true },
  { id: 'gemini-pro-orchestrator-argon', name: 'Orchestrator (Argon)', efforts: [], defaultEffort: null, visible: true },
  { id: 'default', name: 'Antigravity Default', efforts: [], defaultEffort: null, visible: false },
];
const SANDBOX_BODY_MAX_BYTES = 262144;

const MIME_ALIASES = {
  'image/jpg': 'image/jpeg',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/x-m4a': 'audio/m4a',
  'audio/mp4': 'audio/m4a',
  'video/quicktime': 'video/mov',
  'video/x-msvideo': 'video/avi',
};
const SUPPORTED_MIMES = {
  image: new Set(['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif', 'image/gif', 'image/bmp', 'image/tiff']),
  audio: new Set(['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/m4a', 'audio/opus', 'audio/webm', 'audio/l16', 'audio/alaw', 'audio/mulaw']),
  video: new Set(['video/mp4', 'video/mpeg', 'video/mov', 'video/avi', 'video/webm', 'video/wmv', 'video/x-flv', 'video/3gpp']),
  document: new Set(['application/pdf']),
};
const EXT_TO_MIME = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif', gif: 'image/gif', bmp: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff',
  wav: 'audio/wav', mp3: 'audio/mp3', mpeg: 'audio/mpeg', aif: 'audio/aiff', aiff: 'audio/aiff', aac: 'audio/aac', ogg: 'audio/ogg', oga: 'audio/ogg', flac: 'audio/flac', m4a: 'audio/m4a', opus: 'audio/opus', weba: 'audio/webm', l16: 'audio/l16', alaw: 'audio/alaw', mulaw: 'audio/mulaw',
  mp4: 'video/mp4', mpg: 'video/mpeg', mov: 'video/mov', avi: 'video/avi', webm: 'video/webm', wmv: 'video/wmv', flv: 'video/x-flv', '3gp': 'video/3gpp', '3gpp': 'video/3gpp',
  pdf: 'application/pdf',
};
const IMAGE_RESOLUTIONS = new Set(['low', 'medium', 'high', 'ultra_high']);
const VIDEO_RESOLUTIONS = new Set(['low', 'medium', 'high']);

const MESSAGES = {
  "en": {
    whyNoMatchRun: "No condition matched",
    whyNoMatch: "No condition matched, using the fallback model",
    whyJudgeFailed: "Could not judge, using the fallback model",
    fallbackSummary: "{reason} → {model}",
    noteNoFallback: "Saved. Set a fallback model with set_fallback_model: without one, this plugin’s model does not appear in the new task picker.",
    modelAmbiguous: "“{model}” matches several models: {candidates}. Pass model with agent, providerId and agentDeviceId from availableModels.",
    serviceAuth: "The API key was rejected. Check or replace it under Judged by.",
    serviceLimit: "The judge service limit or quota was reached. Try again later or check your plan.",
    serviceDown: "The judge service is temporarily unavailable. Please try again later.",
    whyNoRules: "no rules are enabled",
    keywordReason: "Matched keyword “{word}”",
    keywordSummary: "Keyword “{word}” → skip",
    judgedBy: "{name} judged {pct}",
    yesSkip: "Yes {pct} → skip",
    choiceSummary: "{question} [{choice}] {pct}",
    scoreSummary: "{question} [{score}] {pct}",
    requestFailed: "Request failed",
    badPoint: "point must be will-start-task, will-schedule-run or will-routine-run",
    badProvider: "provider must be gemini, openai or jev",
    noQuestion: "question is missing: write one question for the decision model",
    modelNotFound: "Model “{model}” was not found. Check availableModels with list_rules and use an id or name from it.",
    noteStart: "Saved. It checks only the first message of a new task, once. The user must choose “Pick by rules” in the new task model picker for it to apply.",
    noteRun: "Saved. The user must choose Plugin → Decision Gate in that automation or routine’s pre-run check for it to apply.",
    ruleNotFound: "This rule does not exist. Get its id with list_rules first.",
    unknownTool: "Unknown tool {tool}",
    storeFailed: "Could not read or write rules: {error}. Please try again later.",
    bodyTooLarge: "Inline payload ({bytes} bytes) exceeds Cindy sandbox fetch limit (262,144 bytes). Use an HTTPS URL or Gemini Files API uri, or reduce media size/resolution.",
    unsupportedMediaProvider: "{provider} does not support {modality} inputs. Switch Judged by to Gemini Decision (gemini-decision-1).",
    effort_minimal: "Minimal",
    effort_low: "Low",
    effort_medium: "Medium",
    effort_high: "High",
    effort_xhigh: "Extra high",
    effort_max: "Max",
    effort_ultra: "Ultra",
  },
  "zh-CN": {
    whyNoMatchRun: "没有符合的条件",
    whyNoMatch: "没有符合的条件，用保底模型",
    whyJudgeFailed: "判断失败，用保底模型",
    fallbackSummary: "{reason} → {model}",
    noteNoFallback: "已保存。还要用 set_fallback_model 设置保底模型，否则新任务的模型选择器里不会出现这个模型。",
    modelAmbiguous: "「{model}」对应多个模型：{candidates}。请按 availableModels 同时传 model、agent、providerId 和 agentDeviceId。",
    serviceAuth: "API Key 被拒绝。请在「判断用」里检查或更换。",
    serviceLimit: "判断服务达到限额或额度不足。请稍后再试，或检查套餐。",
    serviceDown: "判断服务暂时不可用，请稍后再试。",
    whyNoRules: "没有启用的规则",
    keywordReason: "命中关键词「{word}」",
    keywordSummary: "关键词「{word}」→ 跳过",
    judgedBy: "{name} 判断 {pct}",
    yesSkip: "是 {pct} → 跳过",
    choiceSummary: "{question} [{choice}] {pct}",
    scoreSummary: "{question} [{score}] {pct}",
    requestFailed: "请求失败",
    badPoint: "point 必须是 will-start-task / will-schedule-run / will-routine-run 之一",
    badProvider: "provider 必须是 gemini / openai / jev 之一",
    noQuestion: "缺少 question：写一句交给决策模型判断的问题",
    modelNotFound: "找不到模型「{model}」。先用 list_rules 看 availableModels，再按其中的 id 或名称填写。",
    noteStart: "已保存。只在新任务的第一条消息判断一次；用户需要在新任务的模型选择器里选「按规则选模型」才会生效。",
    noteRun: "已保存。用户需要在对应自动化或例行任务的「前置检查」里选「插件 → 决策闸门」才会生效。",
    ruleNotFound: "没有这条规则，先用 list_rules 查 id",
    unknownTool: "未知工具 {tool}",
    storeFailed: "读写规则失败：{error}。请稍后重试。",
    bodyTooLarge: "内联请求体（{bytes} 字节）超出 Cindy 沙箱网络 256 KB（262,144 字节）限制。请改用公开/签名 HTTPS 地址或 Gemini Files API uri，或压缩/降低素材分辨率。",
    unsupportedMediaProvider: "{provider} 不支持 {modality} 输入，请将判断模型切换为 Gemini Decision (gemini-decision-1)。",
    effort_minimal: "最低",
    effort_low: "低",
    effort_medium: "中",
    effort_high: "高",
    effort_xhigh: "超高",
    effort_max: "最高",
    effort_ultra: "极致",
  },
  "ja": {
    whyNoMatchRun: "一致する条件がありません",
    whyNoMatch: "一致する条件がないため、保険のモデルを使います",
    whyJudgeFailed: "判断できなかったため、保険のモデルを使います",
    fallbackSummary: "{reason} → {model}",
    noteNoFallback: "保存しました。set_fallback_model で保険のモデルを設定してください。未設定だと新しいタスクのモデル選択に表示されません。",
    modelAmbiguous: "「{model}」は複数のモデルに一致します: {candidates}。availableModels の model、agent、providerId、agentDeviceId を指定してください。",
    serviceAuth: "API キーが拒否されました。判断モデルの設定で確認または変更してください。",
    serviceLimit: "判断サービスの上限またはクォータに達しました。後でもう一度試すか、プランを確認してください。",
    serviceDown: "判断サービスは一時的に利用できません。後でもう一度お試しください。",
    whyNoRules: "有効なルールがありません",
    keywordReason: "キーワード「{word}」に一致",
    keywordSummary: "キーワード「{word}」→ スキップ",
    judgedBy: "{name} の判断 {pct}",
    yesSkip: "はい {pct} → スキップ",
    choiceSummary: "{question} [{choice}] {pct}",
    scoreSummary: "{question} [{score}] {pct}",
    requestFailed: "リクエストに失敗しました",
    badPoint: "point は will-start-task / will-schedule-run / will-routine-run のいずれかにしてください",
    badProvider: "provider は gemini / openai / jev のいずれかにしてください",
    noQuestion: "question がありません。判断モデルへの質問を 1 つ書いてください",
    modelNotFound: "モデル「{model}」が見つかりません。list_rules の availableModels を確認し、その id か名前を指定してください。",
    noteStart: "保存しました。新しいタスクの最初のメッセージで一度だけ判断します。適用するには、新しいタスクのモデル選択で「ルールで選ぶ」を選ぶ必要があります。",
    noteRun: "保存しました。適用するには、その自動化またはルーティンの実行前チェックで「プラグイン → Decision Gate」を選ぶ必要があります。",
    ruleNotFound: "このルールはありません。先に list_rules で id を確認してください",
    unknownTool: "不明なツール {tool}",
    storeFailed: "ルールの読み書きに失敗しました: {error}。後でもう一度お試しください。",
    bodyTooLarge: "インラインペイロード（{bytes} バイト）が Cindy サンドボックスの上限（262,144 バイト）を超えています。HTTPS URL または Gemini Files API uri を使用するか、ファイルサイズを小さくしてください。",
    unsupportedMediaProvider: "{provider} は {modality} 入力に対応していません。判断モデルを Gemini Decision (gemini-decision-1) に切り替えてください。",
    effort_minimal: "最小",
    effort_low: "低",
    effort_medium: "中",
    effort_high: "高",
    effort_xhigh: "超高",
    effort_max: "最大",
    effort_ultra: "ウルトラ",
  },
  "ko": {
    whyNoMatchRun: "맞는 조건이 없습니다",
    whyNoMatch: "일치하는 조건이 없어 기본 모델을 사용합니다",
    whyJudgeFailed: "판단하지 못해 기본 모델을 사용합니다",
    fallbackSummary: "{reason} → {model}",
    noteNoFallback: "저장했습니다. set_fallback_model로 기본 모델을 설정하세요. 없으면 새 작업의 모델 선택기에 나타나지 않습니다.",
    modelAmbiguous: "“{model}”에 해당하는 모델이 여러 개입니다: {candidates}. availableModels의 model, agent, providerId, agentDeviceId를 함께 전달하세요.",
    serviceAuth: "API 키가 거부되었습니다. 판단 모델 설정에서 확인하거나 교체하세요.",
    serviceLimit: "판단 서비스 한도 또는 할당량에 도달했습니다. 나중에 다시 시도하거나 요금제를 확인하세요.",
    serviceDown: "판단 서비스를 일시적으로 사용할 수 없습니다. 나중에 다시 시도하세요.",
    whyNoRules: "사용 중인 규칙이 없습니다",
    keywordReason: "키워드 “{word}” 일치",
    keywordSummary: "키워드 “{word}” → 건너뛰기",
    judgedBy: "{name} 판단 {pct}",
    yesSkip: "예 {pct} → 건너뛰기",
    choiceSummary: "{question} [{choice}] {pct}",
    scoreSummary: "{question} [{score}] {pct}",
    requestFailed: "요청 실패",
    badPoint: "point는 will-start-task / will-schedule-run / will-routine-run 중 하나여야 합니다",
    badProvider: "provider는 gemini / openai / jev 중 하나여야 합니다",
    noQuestion: "question이 없습니다. 판단 모델에 물을 질문을 하나 쓰세요",
    modelNotFound: "모델 “{model}”을 찾을 수 없습니다. list_rules의 availableModels에서 id나 이름을 확인해 쓰세요.",
    noteStart: "저장했습니다. 새 작업의 첫 메시지에서 한 번만 판단합니다. 적용하려면 새 작업의 모델 선택기에서 “규칙으로 선택”를 골라야 합니다.",
    noteRun: "저장했습니다. 적용하려면 해당 자동화나 루틴의 실행 전 확인에서 “플러그인 → Decision Gate”를 골라야 합니다.",
    ruleNotFound: "이 규칙이 없습니다. 먼저 list_rules로 id를 확인하세요",
    unknownTool: "알 수 없는 도구 {tool}",
    storeFailed: "규칙을 읽거나 쓰지 못했습니다: {error}. 나중에 다시 시도하세요.",
    bodyTooLarge: "인라인 요청 본문({bytes}바이트)이 Cindy 샌드박스 한도(262,144바이트)를 초과했습니다. HTTPS URL 또는 Gemini Files API uri를 사용하거나 파일 크기를 줄이세요.",
    unsupportedMediaProvider: "{provider}는 {modality} 입력을 지원하지 않습니다. 판단 모델을 Gemini Decision(gemini-decision-1)으로 전환하세요.",
    effort_minimal: "최소",
    effort_low: "낮음",
    effort_medium: "중간",
    effort_high: "높음",
    effort_xhigh: "매우 높음",
    effort_max: "최대",
    effort_ultra: "울트라",
  },
};

let locale = 'en';
const t = (key, vars = {}) => (MESSAGES[locale]?.[key] ?? MESSAGES.en[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
async function loadLocale() {
  const context = await cindy.request({ kind: 'app-context' }).catch(() => null);
  const next = context?.context?.locale;
  locale = MESSAGES[next] ? next : 'en';
}
const effortName = (effort) => (MESSAGES.en[`effort_${effort}`] ? t(`effort_${effort}`) : effort);

const providerOf = (cfg) => (PROVIDER_IDS.includes(cfg?.provider) ? cfg.provider : 'openai');
const providerNameOf = (p) => PROVIDER_NAMES[p] || PROVIDER_NAMES.openai;
const secretKeyOf = (p) => SECRET_KEYS[p] || SECRET_KEYS.openai;
const judgeModelOf = (cfg, p) => {
  if (p === 'gemini') return cfg?.geminiModel || DEFAULT_MODELS.gemini;
  if (p === 'jev') return cfg?.jevModel || DEFAULT_MODELS.jev;
  return cfg?.openaiModel || DEFAULT_MODELS.openai;
};

// The brain and the settings page rewrite the whole config: one lock keeps either from writing back a stale copy.
const withConfigLock = (fn) => (globalThis.navigator?.locks ? navigator.locks.request('decision-gate-config', fn) : fn());

// A failed read must not look like "no rules": callers would overwrite the stored rules or allow the run.
async function readConfig() {
  const res = await fetch('/kv');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return withRules(await res.json());
}

async function writeConfig(cfg) {
  const res = await fetch('/kv', { method: 'PUT', body: JSON.stringify(cfg) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  channel.postMessage({ from: 'brain', type: 'config-changed' });
}

// The model this plugin adds to the new task picker. Published once it has a key and a fallback model to land on.
const PICKER_MODEL = {
  id: 'by-rules',
  name: 'Pick by rules',
  description: 'Picks a model for a new task from your rules',
  locales: {
    'zh-CN': { name: '按规则选模型', description: '开新任务时，按你写的规则选模型' },
    ja: { name: 'ルールで選ぶ', description: '新しいタスクのモデルをルールで選びます' },
    ko: { name: '규칙으로 선택', description: '새 작업의 모델을 규칙에 따라 고릅니다' },
  },
  target: { type: 'route' },
};

function publishModels() {
  const run = async () => {
    try {
      const [configRes, secretsRes] = await Promise.all([fetch('/kv'), fetch('/secrets')]);
      if (!configRes.ok || !secretsRes.ok) return;
      const [config, list] = await Promise.all([configRes.json(), secretsRes.json()]);
      const keyName = secretKeyOf(providerOf(config));
      const keySaved = list.some((s) => s.key === keyName && s.saved);
      const ready = keySaved && !!config.fallback;
      await fetch('/models', { method: 'PUT', body: JSON.stringify({ models: ready ? [PICKER_MODEL] : [] }) });
    } catch { /* the picker keeps the last published list */ }
  };
  return globalThis.navigator?.locks ? navigator.locks.request('decision-gate-models', run) : run();
}

const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, '0')).join('');
const withRules = (raw) => ({ ...raw, rules: Array.isArray(raw.rules) ? raw.rules : [] });
const isPlainObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const utf8Len = (str) => new TextEncoder().encode(str).length;

function describe(point, data) {
  if (point === 'will-start-task') {
    return [`First message: ${data.text}`, data.attachmentCount ? `Attachments: ${data.attachmentCount}` : ''].filter(Boolean).join('\n');
  }
  const lines = [`Type: ${point === 'will-routine-run' ? 'teammate routine' : 'automation'}`, `Name: ${data.name}`, `Prompt: ${data.prompt || '(none)'}`];
  if (data.trigger) lines.push(`Trigger: ${data.trigger}`);
  if (Array.isArray(data.events) && data.events.length > 0) lines.push(`Events: ${JSON.stringify(data.events).slice(0, 4000)}`);
  lines.push(`Current time: ${new Date().toISOString()}`);
  return lines.join('\n');
}

const budget = (deadline) => Math.max(1000, Math.min(deadline - Date.now() - 1500, 30000));

async function post(url, body, deadline, extraFetchOpts = {}) {
  const encoded = typeof body === 'string' ? body : JSON.stringify(body);
  const bytes = utf8Len(encoded);
  if (bytes > SANDBOX_BODY_MAX_BYTES) {
    throw new Error(t('bodyTooLarge', { bytes }));
  }
  const r = await cindy.fetch({
    url,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    timeoutMs: budget(deadline),
    body: encoded,
    ...extraFetchOpts,
  });
  if (!r.ok) throw new Error(r.message || t('requestFailed'));
  if (r.status !== 200) {
    let parsedErr = null;
    try { parsedErr = JSON.parse(r.body); } catch { /* ignore */ }
    const errObj = parsedErr?.error;
    if (r.status === 400 && errObj && typeof errObj === 'object' && errObj.code) {
      throw new Error(`HTTP 400 [${errObj.code}]: ${errObj.message || String(r.body).slice(0, 200)}`);
    }
    const hint = r.status === 401 || r.status === 403 ? 'serviceAuth' : r.status === 402 || r.status === 429 ? 'serviceLimit' : r.status >= 500 ? 'serviceDown' : null;
    const detail = `HTTP ${r.status}: ${errObj?.message || String(r.body).slice(0, 200)}`;
    throw new Error(hint ? `${t(hint)} (${detail})` : detail);
  }
  return JSON.parse(r.body);
}

// ── MIME Type & Multimodal Input Normalization ─────────────────────────────
function normalizeMime(raw) {
  if (typeof raw !== 'string') return '';
  const base = raw.split(';')[0].trim().toLowerCase();
  return MIME_ALIASES[base] || base;
}

function mimeFromExt(nameOrUrl) {
  if (typeof nameOrUrl !== 'string') return '';
  const clean = nameOrUrl.split('#')[0].split('?')[0];
  const dot = clean.lastIndexOf('.');
  if (dot < 0) return '';
  return EXT_TO_MIME[clean.slice(dot + 1).toLowerCase()] || '';
}

function sniffBase64Mime(b64) {
  if (typeof b64 !== 'string' || b64.length < 8) return '';
  try {
    const clean = b64.replace(/\s+/g, '');
    const slice = clean.slice(0, 24);
    const pad = slice.length % 4 === 0 ? slice : slice.slice(0, Math.floor(slice.length / 4) * 4);
    if (!pad) return '';
    const bin = atob(pad);
    const b = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) b[i] = bin.charCodeAt(i);
    if (b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'application/pdf';
    if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
    if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
    if (b.length >= 4 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif';
    if (b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d) return 'image/bmp';
    if (b.length >= 4 && ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) || (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a))) return 'image/tiff';
    if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) {
      const fourcc = String.fromCharCode(b[8], b[9], b[10], b[11]);
      if (fourcc === 'WEBP') return 'image/webp';
      if (fourcc === 'WAVE') return 'audio/wav';
      if (fourcc === 'AVI ') return 'video/avi';
    }
    if (b.length >= 4 && b[0] === 0x66 && b[1] === 0x4c && b[2] === 0x61 && b[3] === 0x43) return 'audio/flac';
    if (b.length >= 4 && b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53) return 'audio/ogg';
    if (b.length >= 3 && b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) return 'audio/mp3';
    if (b.length >= 2 && b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return 'audio/mp3';
    if (b.length >= 3 && b[0] === 0x46 && b[1] === 0x4c && b[2] === 0x56) return 'video/x-flv';
    if (b.length >= 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
      const brand = String.fromCharCode(b[8], b[9], b[10], b[11]).toLowerCase();
      if (brand === 'qt  ') return 'video/mov';
      if (brand === 'm4a ') return 'audio/m4a';
      if (brand === 'heic' || brand === 'heix' || brand === 'mif1') return 'image/heic';
      if (brand === 'heif') return 'image/heif';
      if (brand.startsWith('3gp')) return 'video/3gpp';
      return 'video/mp4';
    }
  } catch { /* ignore invalid base64 prefix */ }
  return '';
}

function parseDataUrl(str) {
  const m = /^data:([^;,]+)(?:;[^,]*)?;base64,([A-Za-z0-9+/=\r\n]+)$/.exec(String(str || '').trim());
  if (!m) return null;
  return { mimeType: normalizeMime(m[1]), data: m[2].replace(/\s+/g, '') };
}

function modalityForMime(mime) {
  for (const [mod, set] of Object.entries(SUPPORTED_MIMES)) {
    if (set.has(mime)) return mod;
  }
  return '';
}

function validateUriForDecisions(uri) {
  const lower = uri.toLowerCase();
  if (lower.startsWith('gs://')) {
    throw new Error('The Decisions API does not support direct Cloud Storage (gs://) URIs. Pass an HTTPS URL, a Gemini Files API URI, or inline base64 data.');
  }
  if (/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\//i.test(uri)) {
    throw new Error('The Decisions API does not support YouTube URLs. Pass a video file via HTTPS URL, Gemini Files API URI, or inline base64 data.');
  }
}

async function uploadToGeminiFiles(uploadSpec, displayName, callId, deadline) {
  const r = await cindy.fetch({
    url: 'https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=multipart',
    method: 'POST',
    timeoutMs: Math.max(15000, budget(deadline)),
    upload: {
      ...uploadSpec,
      fields: { metadata: JSON.stringify({ file: { display_name: displayName || 'media' } }) },
    },
    ...(callId ? { callId } : {}),
  });
  if (!r.ok) throw new Error(r.message || 'Gemini Files upload failed');
  if (r.status < 200 || r.status >= 300) {
    throw new Error(`Gemini Files upload failed (HTTP ${r.status}): ${String(r.body).slice(0, 200)}`);
  }
  const parsed = JSON.parse(r.body);
  const fileObj = parsed?.file || parsed;
  if (!fileObj?.uri) throw new Error('Gemini Files upload response missing file.uri');
  return {
    uri: fileObj.uri,
    mimeType: normalizeMime(fileObj.mimeType || fileObj.mime_type || ''),
  };
}

function inspectInputModalities(rawInput, handoffFiles, attachments) {
  const modalities = new Set();
  const scan = (item) => {
    if (!item || typeof item !== 'object') return;
    const rawType = String(item.type || '').toLowerCase();
    if (rawType === 'audio' || rawType === 'video' || rawType === 'document' || rawType === 'pdf') {
      modalities.add(rawType === 'pdf' ? 'document' : rawType);
    } else if (rawType === 'image' || rawType === 'image_url') {
      modalities.add('image');
    }
    const mime = normalizeMime(item.mime_type || item.mimeType || item.inlineData?.mimeType || item.inline_data?.mime_type || item.fileData?.mimeType || item.file_data?.mime_type || mimeFromExt(item.path || item.uri || item.url || ''));
    const mod = modalityForMime(mime);
    if (mod) modalities.add(mod);
  };
  if (Array.isArray(rawInput)) rawInput.forEach(scan);
  else if (isPlainObject(rawInput)) scan(rawInput);
  if (Array.isArray(handoffFiles)) {
    for (const f of handoffFiles) {
      const mod = modalityForMime(normalizeMime(f?.mimeType || mimeFromExt(f?.name || '')));
      if (mod) modalities.add(mod);
      else modalities.add('document');
    }
  }
  if (Array.isArray(attachments) && attachments.length > 0) modalities.add('image');
  return modalities;
}

async function normalizeBlock(raw, { callId }) {
  if (typeof raw === 'string') return { type: 'text', text: raw };
  if (!isPlainObject(raw)) throw new Error('Input block must be a string or object');

  // Support standard Gemini Interactions blocks as well as inlineData / fileData / image_url aliases.
  let rawType = typeof raw.type === 'string' ? raw.type.trim().toLowerCase() : '';
  if (rawType === 'pdf') rawType = 'document';

  if (rawType === 'text' || (!rawType && typeof raw.text === 'string' && !raw.data && !raw.uri && !raw.url && !raw.path && !raw.inlineData && !raw.inline_data && !raw.fileData && !raw.file_data)) {
    return { type: 'text', text: String(raw.text ?? '') };
  }

  let data = typeof raw.data === 'string' ? raw.data : '';
  let uri = typeof (raw.uri ?? raw.url ?? raw.file_uri ?? raw.fileUri) === 'string' ? String(raw.uri ?? raw.url ?? raw.file_uri ?? raw.fileUri).trim() : '';
  let mime = normalizeMime(raw.mime_type || raw.mimeType || '');

  if (rawType === 'image_url' && raw.image_url?.url) {
    uri = String(raw.image_url.url).trim();
    rawType = 'image';
  }
  const inlineObj = raw.inlineData || raw.inline_data;
  if (isPlainObject(inlineObj)) {
    if (!data && typeof inlineObj.data === 'string') data = inlineObj.data;
    if (!mime) mime = normalizeMime(inlineObj.mimeType || inlineObj.mime_type || '');
  }
  const fileObj = raw.fileData || raw.file_data;
  if (isPlainObject(fileObj)) {
    if (!uri && typeof (fileObj.fileUri ?? fileObj.file_uri ?? fileObj.uri) === 'string') {
      uri = String(fileObj.fileUri ?? fileObj.file_uri ?? fileObj.uri).trim();
    }
    if (!mime) mime = normalizeMime(fileObj.mimeType || fileObj.mime_type || '');
  }

  if (typeof raw.path === 'string' && raw.path.trim()) {
    if (!callId) throw new Error('Reading a file from workdir via path requires an active Agent tool-call');
    const fsRes = await cindy.fs({ op: 'read', root: 'workdir', path: raw.path.trim(), encoding: 'base64', callId });
    if (!fsRes.ok) throw new Error(fsRes.message || `Failed to read workdir file: ${raw.path}`);
    data = fsRes.content;
    if (!mime) mime = mimeFromExt(raw.path);
  }

  if (data && data.startsWith('data:')) {
    const parsed = parseDataUrl(data);
    if (!parsed) throw new Error('Invalid base64 data URL in input block.data');
    data = parsed.data;
    if (!mime) mime = parsed.mimeType;
  }
  if (!data && uri && uri.startsWith('data:')) {
    const parsed = parseDataUrl(uri);
    if (!parsed) throw new Error('Invalid base64 data URL in input block.uri');
    data = parsed.data;
    uri = '';
    if (!mime) mime = parsed.mimeType;
  }

  if (!mime && data) mime = sniffBase64Mime(data);
  if (!mime && uri) mime = mimeFromExt(uri);
  if (mime === 'application/octet-stream') {
    const sniffed = data ? sniffBase64Mime(data) : uri ? mimeFromExt(uri) : '';
    if (!sniffed) throw new Error('Generic application/octet-stream MIME type is not supported. Specify the real mime_type.');
    mime = sniffed;
  }

  const inferredType = modalityForMime(mime);
  const blockType = inferredType || (['image', 'audio', 'video', 'document'].includes(rawType) ? rawType : '');
  if (!blockType) {
    throw new Error(`Unsupported or missing mime_type (${mime || 'none'}). Supported: image/*, audio/*, video/*, application/pdf.`);
  }
  if (!mime) {
    throw new Error(`mime_type is required for ${blockType} block`);
  }
  if (uri) validateUriForDecisions(uri);
  if (!data && !uri) {
    throw new Error(`Input ${blockType} block must provide data, uri, or path`);
  }

  const block = { type: blockType, mime_type: mime };
  if (data) block.data = data.replace(/\s+/g, '');
  else block.uri = uri;

  if (typeof raw.resolution === 'string') {
    const res = raw.resolution.trim().toLowerCase();
    if (blockType === 'image' && IMAGE_RESOLUTIONS.has(res)) block.resolution = res;
    else if (blockType === 'video') {
      if (res === 'ultra_high') block.resolution = 'high';
      else if (VIDEO_RESOLUTIONS.has(res)) block.resolution = res;
    }
    // Audio and document (PDF) blocks do not support resolution.
  }
  return block;
}

async function normalizeInput(rawInput, { callId, attachments, handoffFiles, targetProvider, deadline }) {
  const hasHandoff = Array.isArray(handoffFiles) && handoffFiles.length > 0;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
  if (typeof rawInput === 'string' && !hasHandoff && !hasAttachments) {
    if (!rawInput.trim()) throw new Error('Input cannot be empty');
    return { input: rawInput, modalities: new Set(['text']) };
  }

  const rawItems = Array.isArray(rawInput) ? rawInput : rawInput !== undefined && rawInput !== null ? [rawInput] : [];
  const blocks = [];
  const modalities = new Set();

  for (const item of rawItems) {
    const block = await normalizeBlock(item, { callId });
    blocks.push(block);
    modalities.add(block.type);
  }

  if (hasHandoff) {
    for (const file of handoffFiles) {
      if (!file?.ref) continue;
      if (targetProvider !== 'gemini') {
        throw new Error(t('unsupportedMediaProvider', { provider: providerNameOf(targetProvider), modality: file.mimeType || 'file' }));
      }
      const uploaded = await uploadToGeminiFiles({ handoff: [file.ref] }, file.name, callId, deadline);
      const mime = normalizeMime(uploaded.mimeType || file.mimeType || mimeFromExt(file.name));
      const blockType = modalityForMime(mime);
      if (!blockType) throw new Error(`Unsupported handoff file MIME type: ${mime || file.name}`);
      blocks.push({ type: blockType, uri: uploaded.uri, mime_type: mime });
      modalities.add(blockType);
    }
  }

  if (hasAttachments) {
    for (const att of attachments) {
      const m = /^cindy-media:\/\/blobs\/([a-f0-9]{64})(\.[a-z0-9]+)?$/i.exec(String(att || '').trim());
      if (!m) continue;
      const hash = m[1];
      const extMime = mimeFromExt(att);
      if (targetProvider !== 'gemini') {
        throw new Error(t('unsupportedMediaProvider', { provider: providerNameOf(targetProvider), modality: extMime || 'media' }));
      }
      const uploaded = await uploadToGeminiFiles({ hashes: [hash] }, `attachment${m[2] || ''}`, callId, deadline);
      const mime = normalizeMime(uploaded.mimeType || extMime);
      const blockType = modalityForMime(mime) || 'image';
      blocks.push({ type: blockType, uri: uploaded.uri, mime_type: mime || 'image/jpeg' });
      modalities.add(blockType);
    }
  }

  if (blocks.length === 0) throw new Error('Input cannot be empty');
  return { input: blocks, modalities };
}

// ── Typed Questions Validation & Normalization ─────────────────────────────
const QUESTION_KEY_RE = /^[A-Za-z0-9_-]{1,64}$/;
const NON_ASCII_SPACE_OR_CTRL_RE = /[\x00-\x1f\x7f\u00A0\u1680\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF]/;

function normalizeQuestionType(rawType) {
  const s = String(rawType || 'noul').trim().toLowerCase();
  if (s === 'noul' || s === 'predicate' || s === 'yes_no' || s === 'yes/no' || s === 'boolean') return 'noul';
  if (s === 'choice' || s === 'single_select' || s === 'select') return 'choice';
  if (s === 'score' || s === 'rubric') return 'score';
  throw new Error(`Unsupported question type "${rawType}". Expected noul, choice, or score.`);
}

function validateChoiceOptionKey(key) {
  if (typeof key !== 'string' || key.length === 0 || key.length > 128) {
    throw new Error(`Choice option key ${JSON.stringify(key)} must be 1–128 characters`);
  }
  if (utf8Len(key) > 512) {
    throw new Error(`Choice option key ${JSON.stringify(key)} exceeds 512 UTF-8 bytes`);
  }
  if (key !== key.trim() || NON_ASCII_SPACE_OR_CTRL_RE.test(key)) {
    throw new Error(`Choice option key ${JSON.stringify(key)} cannot contain leading/trailing spaces, control chars, or non-ASCII spaces`);
  }
}

function normalizeQuestionEntry(qKey, rawQ) {
  if (!QUESTION_KEY_RE.test(qKey)) {
    throw new Error(`Question key "${qKey}" must be 1–64 ASCII characters matching [A-Za-z0-9_-]+`);
  }
  if (!isPlainObject(rawQ)) throw new Error(`Question "${qKey}" must be an object`);
  const qType = normalizeQuestionType(rawQ.type);

  let instructions = rawQ.instructions;
  if (Array.isArray(instructions)) {
    if (instructions.length === 0) throw new Error(`Question "${qKey}" instructions cannot be empty`);
    instructions = instructions.map((part) => {
      if (typeof part === 'string') return { type: 'text', text: part };
      if (isPlainObject(part) && part.type === 'text' && typeof part.text === 'string') return { type: 'text', text: part.text };
      throw new Error(`Question "${qKey}" instructions accept text only`);
    });
  } else if (typeof instructions === 'string') {
    if (!instructions.trim()) throw new Error(`Question "${qKey}" instructions cannot be empty`);
  } else {
    throw new Error(`Question "${qKey}" must provide text instructions`);
  }

  const out = { type: qType, instructions };
  if (qType === 'noul') {
    if (rawQ.criteria !== undefined && rawQ.criteria !== null) {
      if (!isPlainObject(rawQ.criteria)) throw new Error(`Question "${qKey}" noul criteria must be an object`);
      const trueDesc = rawQ.criteria.true_description ?? rawQ.criteria.true;
      const falseDesc = rawQ.criteria.false_description ?? rawQ.criteria.false;
      const crit = {};
      if (typeof trueDesc === 'string' && trueDesc.trim()) crit.true_description = trueDesc;
      if (typeof falseDesc === 'string' && falseDesc.trim()) crit.false_description = falseDesc;
      if (Object.keys(crit).length > 0) out.criteria = crit;
    }
  } else if (qType === 'choice') {
    if (!isPlainObject(rawQ.criteria)) throw new Error(`Question "${qKey}" choice requires a criteria object mapping 2–255 option IDs to descriptions`);
    const entries = Object.entries(rawQ.criteria);
    if (entries.length < 2 || entries.length > 255) {
      throw new Error(`Question "${qKey}" choice criteria must contain 2–255 options (got ${entries.length})`);
    }
    const crit = {};
    for (const [optKey, desc] of entries) {
      validateChoiceOptionKey(optKey);
      if (typeof desc !== 'string') throw new Error(`Option "${optKey}" description in question "${qKey}" must be a string`);
      crit[optKey] = desc;
    }
    out.criteria = crit;
  } else if (qType === 'score') {
    let levels = rawQ.criteria;
    if (isPlainObject(levels)) {
      levels = Object.entries(levels)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v);
    }
    if (!Array.isArray(levels) || levels.length < 2 || levels.length > 255) {
      throw new Error(`Question "${qKey}" score criteria must be an array of 2–255 non-empty level descriptions`);
    }
    out.criteria = levels.map((lvl, idx) => {
      if (typeof lvl !== 'string' || !lvl.trim()) {
        throw new Error(`Score level ${idx} in question "${qKey}" must be a non-empty string`);
      }
      return lvl;
    });
  }
  return out;
}

function normalizeQuestions(rawQuestions) {
  let entries;
  if (Array.isArray(rawQuestions)) {
    entries = rawQuestions.map((q, idx) => [String(q?.id || q?.name || `q_${idx}`), q]);
  } else if (isPlainObject(rawQuestions)) {
    entries = Object.entries(rawQuestions);
  } else {
    throw new Error('questions must be an object mapping question IDs to { type, instructions, criteria? }');
  }
  if (entries.length < 1 || entries.length > 1000) {
    throw new Error(`questions must contain 1–1,000 entries (got ${entries.length})`);
  }
  const normalized = {};
  for (const [qKey, rawQ] of entries) {
    normalized[qKey] = normalizeQuestionEntry(qKey, rawQ);
  }
  return normalized;
}

// ── Provider Execution: Gemini Decision / TypeSafe Jev / OpenAI Decisions ──
function serializeTextInput(input) {
  if (typeof input === 'string') return input;
  return input.map((b) => {
    if (b.type === 'text') return b.text;
    throw new Error(b.type);
  }).join('');
}

function utf8SortCompare(a, b) {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  const len = Math.min(ab.length, bb.length);
  for (let i = 0; i < len; i += 1) {
    if (ab[i] !== bb[i]) return ab[i] - bb[i];
  }
  return ab.length - bb.length;
}

async function evaluateQuestions(cfg, questions, normalizedInput, deadline, options = {}) {
  const provider = options.provider || providerOf(cfg);
  const model = options.model || judgeModelOf(cfg, provider);

  if (provider === 'gemini') {
    const res = await post('https://generativelanguage.googleapis.com/v1beta/decisions', {
      model,
      input: normalizedInput,
      questions,
    }, deadline);
    const answers = {};
    for (const [qKey, q] of Object.entries(questions)) {
      const a = res.answers?.[qKey];
      if (!a) continue;
      if (q.type === 'noul') {
        const p = Number(a.noul);
        answers[qKey] = {
          type: 'noul',
          noul: p,
          confidence: typeof a.confidence === 'number' ? a.confidence : Math.max(p, 1 - p),
        };
      } else if (q.type === 'choice') {
        const probs = isPlainObject(a.probabilities) ? a.probabilities : {};
        answers[qKey] = {
          type: 'choice',
          choice: a.choice,
          probabilities: probs,
          confidence: typeof a.confidence === 'number' ? a.confidence : (typeof probs[a.choice] === 'number' ? probs[a.choice] : 0),
        };
      } else if (q.type === 'score') {
        const probs = isPlainObject(a.probabilities) ? a.probabilities : {};
        const legend = isPlainObject(a.legend) ? a.legend : Object.fromEntries(q.criteria.map((c, i) => [String(i), c]));
        answers[qKey] = {
          type: 'score',
          score: Number(a.score),
          legend,
          probabilities: probs,
          confidence: typeof a.confidence === 'number' ? a.confidence : Math.max(0, ...Object.values(probs).map(Number)),
        };
      }
    }
    return { provider, model, answers, usage: res.usage || null };
  }

  if (provider === 'jev') {
    let state;
    if (typeof normalizedInput === 'string') {
      state = normalizedInput;
    } else {
      state = normalizedInput.map((b) => {
        if (b.type === 'text') return { type: 'text', text: b.text };
        if (b.type === 'image') return { type: 'image_url', image_url: { url: b.uri || `data:${b.mime_type};base64,${b.data}` } };
        throw new Error(t('unsupportedMediaProvider', { provider: providerNameOf('jev'), modality: b.type }));
      });
    }
    const jevQuestions = Object.fromEntries(Object.entries(questions).map(([qKey, q]) => {
      const instr = Array.isArray(q.instructions) ? q.instructions.map((x) => x.text).join('') : q.instructions;
      if (q.type === 'noul' && q.criteria) {
        const crit = {};
        if (q.criteria.true_description) crit.true = q.criteria.true_description;
        if (q.criteria.false_description) crit.false = q.criteria.false_description;
        return [qKey, { type: 'noul', instructions: instr, ...(Object.keys(crit).length ? { criteria: crit } : {}) }];
      }
      return [qKey, { type: q.type, instructions: instr, ...(q.criteria ? { criteria: q.criteria } : {}) }];
    }));
    const res = await post('https://api.typesafe.ai/v1/systemone', { model, state, questions: jevQuestions }, deadline);
    const answers = {};
    for (const [qKey, q] of Object.entries(questions)) {
      const a = res.answers?.[qKey];
      if (!a) continue;
      if (q.type === 'noul' && typeof a.noul === 'number') {
        answers[qKey] = { type: 'noul', noul: a.noul, confidence: typeof a.confidence === 'number' ? a.confidence : Math.max(a.noul, 1 - a.noul) };
      } else if (q.type === 'choice') {
        const probs = isPlainObject(a.probabilities) ? a.probabilities : {};
        answers[qKey] = { type: 'choice', choice: a.choice, probabilities: probs, confidence: typeof a.confidence === 'number' ? a.confidence : (probs[a.choice] ?? 0) };
      } else if (q.type === 'score') {
        const probs = isPlainObject(a.probabilities) ? a.probabilities : {};
        const legend = isPlainObject(a.legend) ? a.legend : Object.fromEntries(q.criteria.map((c, i) => [String(i), c]));
        answers[qKey] = { type: 'score', score: Number(a.score), legend, probabilities: probs, confidence: typeof a.confidence === 'number' ? a.confidence : Math.max(0, ...Object.values(probs).map(Number)) };
      }
    }
    return { provider, model, answers, usage: res.usage || null };
  }

  // OpenAI Decisions (supports text + predicate questions; synthesize choice & score via parallel predicates)
  let textInput;
  try {
    textInput = serializeTextInput(normalizedInput);
  } catch (err) {
    throw new Error(t('unsupportedMediaProvider', { provider: providerNameOf('openai'), modality: err.message }));
  }

  const predicates = [];
  const mappings = {};
  for (const [qKey, q] of Object.entries(questions)) {
    const instr = Array.isArray(q.instructions) ? q.instructions.map((x) => x.text).join('') : q.instructions;
    if (q.type === 'noul') {
      const critHint = q.criteria
        ? [q.criteria.true_description && `True if: ${q.criteria.true_description}`, q.criteria.false_description && `False if: ${q.criteria.false_description}`].filter(Boolean).join('; ')
        : '';
      predicates.push({ type: 'predicate', name: qKey, instructions: critHint ? `${instr} (${critHint})` : instr });
      mappings[qKey] = { type: 'noul' };
    } else if (q.type === 'choice') {
      const keys = Object.keys(q.criteria).sort(utf8SortCompare);
      const subNames = keys.map((optKey, idx) => {
        const pName = `${qKey}__opt__${idx}`;
        const desc = q.criteria[optKey];
        predicates.push({ type: 'predicate', name: pName, instructions: `${instr} Option "${optKey}"${desc ? `: ${desc}` : ''}` });
        return [optKey, pName];
      });
      mappings[qKey] = { type: 'choice', subNames };
    } else if (q.type === 'score') {
      const subNames = q.criteria.map((lvlDesc, idx) => {
        const pName = `${qKey}__lvl__${idx}`;
        predicates.push({ type: 'predicate', name: pName, instructions: `${instr} Level ${idx}: ${lvlDesc}` });
        return [String(idx), pName];
      });
      mappings[qKey] = { type: 'score', subNames, criteria: q.criteria };
    }
  }

  const res = await post('https://api.openai.com/v1/decisions', { model, input: textInput, questions: predicates }, deadline);
  const byName = Object.fromEntries((res.answers || []).filter((a) => a.type === 'predicate').map((a) => [a.name, Number(a.probability)]));
  const answers = {};
  for (const [qKey, map] of Object.entries(mappings)) {
    if (map.type === 'noul') {
      if (typeof byName[qKey] === 'number' && !Number.isNaN(byName[qKey])) {
        const p = byName[qKey];
        answers[qKey] = { type: 'noul', noul: p, confidence: Math.max(p, 1 - p) };
      }
    } else if (map.type === 'choice') {
      const rawScores = map.subNames.map(([optKey, pName]) => [optKey, Math.max(0, byName[pName] || 0)]);
      const sum = rawScores.reduce((acc, [, v]) => acc + v, 0);
      const probs = {};
      let bestKey = rawScores[0][0];
      let bestProb = -1;
      for (const [optKey, v] of rawScores) {
        const p = sum > 0 ? v / sum : 1 / rawScores.length;
        probs[optKey] = Number(p.toFixed(4));
        if (p > bestProb) { bestProb = p; bestKey = optKey; }
      }
      answers[qKey] = { type: 'choice', choice: bestKey, probabilities: probs, confidence: probs[bestKey] ?? 0 };
    } else if (map.type === 'score') {
      const rawScores = map.subNames.map(([idxKey, pName]) => [idxKey, Math.max(0, byName[pName] || 0)]);
      const sum = rawScores.reduce((acc, [, v]) => acc + v, 0);
      const probs = {};
      let expected = 0;
      let maxP = 0;
      for (const [idxKey, v] of rawScores) {
        const p = sum > 0 ? v / sum : 1 / rawScores.length;
        probs[idxKey] = Number(p.toFixed(4));
        expected += Number(idxKey) * p;
        if (p > maxP) maxP = p;
      }
      const legend = Object.fromEntries(map.criteria.map((c, i) => [String(i), c]));
      answers[qKey] = { type: 'score', score: Number(expected.toFixed(4)), legend, probabilities: probs, confidence: maxP };
    }
  }
  return { provider, model, answers, usage: res.usage || null };
}

async function agentModels() {
  const r = await fetch('/agent-models');
  const body = await r.json();
  if (!body.ok) return [];
  const localModels = Array.isArray(body.models) ? body.models : [];
  const hasAcp = localModels.some((m) => (AGENT_KIND[m.agent] || m.agent) === 'acp');
  const acpFallback = hasAcp ? [] : ACP_FALLBACK_MODELS.map((m) => ({
    ...m,
    agent: 'acp',
    providerId: DEFAULT_ACP_PROVIDER_ID,
    providerName: 'Antigravity',
  }));
  const remote = await Promise.all((body.supportsRemoteRoutes ? body.locations || [] : []).map(async (location) => {
    const controller = new AbortController();
    let timer;
    try {
      const catalog = await Promise.race([
        fetch(`/agent-models?agent_device_id=${encodeURIComponent(location.agentDeviceId)}`, { signal: controller.signal }).then((res) => res.json()),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(new Error('Remote model catalog timed out'));
          }, 3000);
        }),
      ]);
      return catalog.ok && catalog.agentDeviceId === location.agentDeviceId
        ? catalog.models.map((m) => ({ ...m, agentDeviceId: location.agentDeviceId, locationName: location.name })) : [];
    } catch { return []; } finally { clearTimeout(timer); }
  }));
  return [...localModels, ...acpFallback, ...remote.flat()];
}

const pct = (n) => `${Math.round(n * 100)}%`;
const routeName = (route) => `${route.modelName || route.model}${route.effort ? ` · ${effortName(route.effort)}` : ''}`;

function hasCallableRoute(rule) {
  return !!rule.route || (rule.type === 'choice' && isPlainObject(rule.optionRoutes) && Object.keys(rule.optionRoutes).length > 0);
}

// Rules read as "if <condition>, use <model>": top to bottom, the first that holds wins, otherwise the fallback.
async function decide(point, data, deadline, cfg) {
  const start = point === 'will-start-task';
  const threshold = typeof cfg.threshold === 'number' ? cfg.threshold : 0.6;
  const rules = (cfg.rules || []).filter((rule) => rule.enabled !== false && rule.point === point);
  const fallback = (reason) => (start && cfg.fallback
    ? { action: 'route', route: cfg.fallback, reason, summary: t('fallbackSummary', { reason, model: routeName(cfg.fallback) }) }
    : { action: 'allow', why: reason });
  if (!start) {
    const text = `${data.name || ''}\n${data.prompt || ''}`.toLowerCase();
    for (const rule of rules) {
      const keyword = (rule.keywords || []).find((k) => k && text.includes(String(k).toLowerCase()));
      if (keyword) return { action: 'skip', reason: t('keywordReason', { word: keyword }), ruleId: rule.id, summary: t('keywordSummary', { word: keyword }) };
    }
  }
  const asked = rules.filter((rule) => rule.question && (!start || hasCallableRoute(rule)));
  if (asked.length === 0) return fallback(t('whyNoRules'));

  const provider = providerOf(cfg);
  const baseText = describe(point, data);
  const rawInput = Array.isArray(data.media) && data.media.length > 0
    ? [{ type: 'text', text: `${baseText}\n` }, ...data.media]
    : data.input !== undefined ? data.input : baseText;

  const rawQuestions = Object.fromEntries(asked.map((rule) => [
    rule.id,
    {
      type: rule.type || 'noul',
      instructions: rule.question,
      ...(rule.criteria !== undefined ? { criteria: rule.criteria } : {}),
    },
  ]));

  const started = Date.now();
  let evalRes;
  try {
    const questions = normalizeQuestions(rawQuestions);
    const { input } = await normalizeInput(rawInput, { targetProvider: provider, deadline });
    evalRes = await evaluateQuestions(cfg, questions, input, deadline, { provider });
  } catch (error) {
    if (!start || !cfg.fallback) throw error;
    console.warn('decision-gate judge failed', error && error.message);
    return fallback(t('whyJudgeFailed'));
  }

  const ms = Date.now() - started;
  const name = providerNameOf(provider);
  const answers = evalRes.answers || {};

  for (const rule of asked) {
    const ans = answers[rule.id];
    if (!ans) continue;
    const ruleType = rule.type || 'noul';

    if (ruleType === 'noul') {
      const probability = ans.noul;
      if (typeof probability !== 'number' || probability < threshold) continue;
      const label = `${rule.question.slice(0, 120)} ${pct(probability)}`;
      if (start && rule.route) return { action: 'route', route: rule.route, reason: label, ruleId: rule.id, ms, summary: `${label} → ${routeName(rule.route)}` };
      if (!start) return { action: 'skip', reason: t('judgedBy', { name, pct: pct(probability) }), ruleId: rule.id, ms, summary: t('yesSkip', { pct: pct(probability) }) };
    } else if (ruleType === 'choice') {
      const chosen = ans.choice;
      const prob = typeof ans.confidence === 'number' ? ans.confidence : (ans.probabilities?.[chosen] ?? 0);
      if (typeof chosen !== 'string' || prob < threshold) continue;
      if (start) {
        const chosenRoute = rule.optionRoutes?.[chosen] || ((!rule.targetOption || rule.targetOption === chosen) ? rule.route : null);
        if (!chosenRoute) continue;
        const label = t('choiceSummary', { question: rule.question.slice(0, 80), choice: chosen, pct: pct(prob) });
        return { action: 'route', route: chosenRoute, reason: label, ruleId: rule.id, ms, summary: `${label} → ${routeName(chosenRoute)}` };
      }
      if (rule.targetOption && rule.targetOption !== chosen) continue;
      const label = t('choiceSummary', { question: rule.question.slice(0, 80), choice: chosen, pct: pct(prob) });
      return { action: 'skip', reason: `${name}: ${chosen} ${pct(prob)}`, ruleId: rule.id, ms, summary: `${label} → skip` };
    } else if (ruleType === 'score') {
      const scoreVal = ans.score;
      const levelCount = Array.isArray(rule.criteria) ? rule.criteria.length : Object.keys(ans.legend || {}).length || 2;
      const minScore = typeof rule.minScore === 'number' ? rule.minScore : threshold * Math.max(1, levelCount - 1);
      const conf = typeof ans.confidence === 'number' ? ans.confidence : 1;
      if (typeof scoreVal !== 'number' || scoreVal < minScore || conf < threshold) continue;
      const scoreText = Number(scoreVal).toFixed(2);
      const label = t('scoreSummary', { question: rule.question.slice(0, 80), score: scoreText, pct: pct(conf) });
      if (start && rule.route) return { action: 'route', route: rule.route, reason: label, ruleId: rule.id, ms, summary: `${label} → ${routeName(rule.route)}` };
      if (!start) return { action: 'skip', reason: `${name}: ${scoreText}`, ruleId: rule.id, ms, summary: `${label} → skip` };
    }
  }
  return { ...fallback(start ? t('whyNoMatch') : t('whyNoMatchRun')), ms };
}

async function recordLast(result) {
  if (!result.ruleId) return;
  try {
    await withConfigLock(async () => {
      const cfg = await readConfig();
      cfg.lastByRule = { ...(cfg.lastByRule || {}), [result.ruleId]: { at: Date.now(), summary: result.summary } };
      await writeConfig(cfg);
    });
  } catch { /* display only */ }
}

const channel = new BroadcastChannel('decision-gate');

cindy.onHostMessage(async (msg) => {
  if (msg.type === 'tool-call') { await loadLocale(); return handleTool(msg); }
  if (msg.type !== 'event' || !POINTS.includes(msg.name) || !msg.hookId) return;
  try {
    await loadLocale();
    const result = await decide(msg.name, msg.data, msg.deadline || Date.now() + 8000, await readConfig());
    const { action, reason, route } = result;
    if (route?.agentDeviceId && !(await fetch('/agent-models').then((r) => r.json())).supportsRemoteRoutes) {
      throw new Error(t('modelNotFound', { model: route.modelName || route.model }));
    }
    const { modelName: _label, locationName: _location, fastMode: _fast, ...wireRoute } = route || {};
    cindy.send({ type: 'event-verdict', hookId: msg.hookId, action, ...(reason ? { reason } : {}), ...(route ? { route: wireRoute } : {}) });
    void recordLast(result);
  } catch (error) {
    console.warn('decision-gate failed', error && error.message);
  }
});

// ── Tools the Agent can call ──────────────────────────────────────────────
function normalizeAgentOption(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (s === 'cc' || s === 'claude-code') return 'claude-code';
  if (s === 'acp' || s === 'antigravity' || s === 'agy') return 'acp';
  return s;
}

function findModels(models, option) {
  const q = String(option.model || '').trim().toLowerCase();
  if (!q) return [];
  const wantedAgent = normalizeAgentOption(option.agent || option.agentKind);
  const wantedKind = wantedAgent ? (AGENT_KIND[wantedAgent] || wantedAgent) : null;
  const allowXdImplicitly = option.providerId === 'xd';
  const scoped = models.filter((m) => {
    const mKind = AGENT_KIND[m.agent] || AGENT_KIND[m.agentKind] || m.agent;
    return (!wantedKind || mKind === wantedKind)
      && (!option.providerId || m.providerId === option.providerId)
      && (option.agentDeviceId === undefined || (m.agentDeviceId || null) === option.agentDeviceId);
  });
  const exact = scoped.filter((m) => m.id.toLowerCase() === q || (m.name.toLowerCase() === q && (allowXdImplicitly || m.providerId !== 'xd')));
  const pool = exact.length
    ? exact
    : scoped.filter((m) => (allowXdImplicitly || m.providerId !== 'xd') && (m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)));
  if (pool.length === 0 && (wantedKind === 'acp' || (typeof option.providerId === 'string' && option.providerId.startsWith('acp-plugin:')))) {
    const rawId = String(option.model).trim();
    return [{
      id: rawId,
      name: String(option.modelName || rawId).trim(),
      agent: 'acp',
      providerId: option.providerId || DEFAULT_ACP_PROVIDER_ID,
      efforts: ['low', 'medium', 'high', 'xhigh'],
      defaultEffort: option.effort || null,
      visible: true,
    }];
  }
  const visible = pool.filter((m) => m.visible !== false);
  return visible.length ? visible : pool;
}

function routeOf(model, effort) {
  const efforts = model.efforts || [];
  const chosen = effort && efforts.includes(effort) ? effort : model.defaultEffort || undefined;
  const agentKind = AGENT_KIND[model.agent] || AGENT_KIND[model.agentKind] || model.agentKind || model.agent;
  return { agentKind, model: model.id, providerId: model.providerId, modelName: model.name, ...(model.agentDeviceId ? { agentDeviceId: model.agentDeviceId, locationName: model.locationName } : {}), ...(chosen ? { effort: chosen } : {}) };
}

async function resolveRoute(a, cachedModels) {
  const models = cachedModels || await agentModels();
  const found = findModels(models, a);
  if (!found.length) return { error: { errorCode: 'MODEL_NOT_FOUND', message: t('modelNotFound', { model: a.model }) } };
  if (found.length > 1) {
    const candidates = found.map((m) => `${m.name} (agent: ${m.agent}, providerId: ${m.providerId}, agentDeviceId: ${m.agentDeviceId || "null"})`).join('; ');
    return { error: { errorCode: 'MODEL_AMBIGUOUS', message: t('modelAmbiguous', { model: a.model, candidates }) } };
  }
  return { route: routeOf(found[0], a.effort) };
}

async function resolveEvalProvider(requestedProvider, cfg, modalities) {
  if (requestedProvider) {
    if (!PROVIDER_IDS.includes(requestedProvider)) throw new Error(t('badProvider'));
    return requestedProvider;
  }
  const current = providerOf(cfg);
  const needsGemini = modalities.has('audio') || modalities.has('video') || modalities.has('document');
  if (needsGemini && current !== 'gemini') {
    try {
      const secretsRes = await fetch('/secrets');
      if (secretsRes.ok) {
        const list = await secretsRes.json();
        if (list.some((s) => s.key === SECRET_KEYS.gemini && s.saved)) return 'gemini';
      }
    } catch { /* fall back to current */ }
  }
  return current;
}

async function handleTool(msg) {
  const reply = (ok, payload) => cindy.send({ type: 'tool-result', callId: msg.callId, ok, ...(ok ? { result: payload } : payload) });
  try {
    if (msg.tool === 'list_rules') {
      const cfg = await readConfig();
      const models = await agentModels();
      const p = providerOf(cfg);
      return reply(true, {
        judge: providerNameOf(p),
        provider: p,
        judgeModel: judgeModelOf(cfg, p),
        rules: cfg.rules,
        fallback: cfg.fallback || null,
        threshold: typeof cfg.threshold === 'number' ? cfg.threshold : 0.6,
        availableModels: models.filter((m) => m.visible !== false).map((m) => ({ id: m.id, name: m.name, agent: m.agent, providerId: m.providerId, agentDeviceId: m.agentDeviceId || null, ...(m.locationName ? { locationName: m.locationName } : {}), efforts: m.efforts })),
      });
    }
    if (msg.tool === 'save_rule') {
      const a = msg.args || {};
      if (!POINTS.includes(a.point)) return reply(false, { errorCode: 'INVALID_RULE', message: t('badPoint') });
      if (!a.question && !a.keywords?.length) return reply(false, { errorCode: 'INVALID_RULE', message: t('noQuestion') });
      const ruleType = a.type ? normalizeQuestionType(a.type) : 'noul';
      const rule = { id: a.id || newId(), point: a.point, enabled: a.enabled !== false, type: ruleType, question: a.question || '' };
      if (a.question) {
        const validated = normalizeQuestions({ [rule.id]: { type: ruleType, instructions: a.question, ...(a.criteria !== undefined ? { criteria: a.criteria } : {}) } });
        if (validated[rule.id].criteria !== undefined) rule.criteria = validated[rule.id].criteria;
      } else if (a.criteria !== undefined) {
        rule.criteria = a.criteria;
      }
      if (typeof a.targetOption === 'string' && a.targetOption.trim()) rule.targetOption = a.targetOption.trim();
      if (typeof a.minScore === 'number' && Number.isFinite(a.minScore)) rule.minScore = a.minScore;

      const models = a.point === 'will-start-task' ? await agentModels() : null;
      if (a.point === 'will-start-task') {
        if (isPlainObject(a.optionRoutes)) {
          const resolvedRoutes = {};
          for (const [optKey, routeSpec] of Object.entries(a.optionRoutes)) {
            const spec = typeof routeSpec === 'string' ? { model: routeSpec } : routeSpec;
            const resolved = await resolveRoute(spec || {}, models);
            if (resolved.error) return reply(false, resolved.error);
            resolvedRoutes[optKey] = resolved.route;
          }
          rule.optionRoutes = resolvedRoutes;
        }
        if (a.model || !rule.optionRoutes) {
          const resolved = await resolveRoute(a, models);
          if (resolved.error) return reply(false, resolved.error);
          rule.route = resolved.route;
        }
      } else if (Array.isArray(a.keywords)) {
        rule.keywords = a.keywords;
      }

      const hasFallback = await withConfigLock(async () => {
        const cfg = await readConfig();
        const index = cfg.rules.findIndex((r) => r.id === rule.id);
        if (index >= 0) cfg.rules.splice(index, 1);
        const target = Number.isInteger(a.position) ? a.position : index >= 0 ? index : cfg.rules.length;
        cfg.rules.splice(target, 0, rule);
        await writeConfig(cfg);
        await publishModels();
        return !!cfg.fallback;
      });
      return reply(true, { saved: rule, note: a.point !== 'will-start-task' ? t('noteRun') : hasFallback ? t('noteStart') : t('noteNoFallback') });
    }
    if (msg.tool === 'set_fallback_model') {
      const a = msg.args || {};
      if (a.provider !== undefined && !PROVIDER_IDS.includes(a.provider)) {
        return reply(false, { errorCode: 'INVALID_PARAMS', message: t('badProvider') });
      }
      const resolved = await resolveRoute(a);
      if (resolved.error) return reply(false, resolved.error);
      const updated = await withConfigLock(async () => {
        const cfg = await readConfig();
        cfg.fallback = resolved.route;
        if (typeof a.threshold === 'number') cfg.threshold = a.threshold;
        if (a.provider) cfg.provider = a.provider;
        if (typeof a.judgeModel === 'string' && a.judgeModel.trim()) {
          const p = providerOf(cfg);
          if (p === 'gemini') cfg.geminiModel = a.judgeModel.trim();
          else if (p === 'jev') cfg.jevModel = a.judgeModel.trim();
          else cfg.openaiModel = a.judgeModel.trim();
        }
        await writeConfig(cfg);
        await publishModels();
        return { provider: providerOf(cfg), judgeModel: judgeModelOf(cfg, providerOf(cfg)) };
      });
      return reply(true, { fallback: resolved.route, ...updated, note: t('noteStart') });
    }
    if (msg.tool === 'delete_rule') {
      const deleted = await withConfigLock(async () => {
        const cfg = await readConfig();
        const before = cfg.rules.length;
        cfg.rules = cfg.rules.filter((r) => r.id !== msg.args?.id);
        if (cfg.rules.length === before) return false;
        await writeConfig(cfg);
        await publishModels();
        return true;
      });
      if (!deleted) return reply(false, { errorCode: 'RULE_NOT_FOUND', message: t('ruleNotFound') });
      return reply(true, { deleted: msg.args.id });
    }
    if (msg.tool === 'evaluate') {
      const a = msg.args || {};
      const cfg = await readConfig();
      const deadline = Date.now() + 30000;
      const questions = normalizeQuestions(a.questions);
      const hintedModalities = inspectInputModalities(a.input, a.cindy_handoff_files, a.attachments);
      const targetProvider = await resolveEvalProvider(a.provider, cfg, hintedModalities);
      const { input, modalities } = await normalizeInput(a.input, {
        callId: msg.callId,
        attachments: a.attachments,
        handoffFiles: a.cindy_handoff_files,
        targetProvider,
        deadline,
      });
      const result = await evaluateQuestions(cfg, questions, input, deadline, {
        provider: targetProvider,
        model: typeof a.model === 'string' && a.model.trim() ? a.model.trim() : undefined,
      });
      return reply(true, { ...result, modalities: Array.from(modalities) });
    }
    return reply(false, { errorCode: 'UNKNOWN_TOOL', message: t('unknownTool', { tool: msg.tool }) });
  } catch (error) {
    return reply(false, { errorCode: 'RULE_STORE_FAILED', message: t('storeFailed', { error: error && error.message }) });
  }
}

// ── Settings page ↔ brain: try a rule, list Jev models, direct evaluate ───
const handled = new Set();
channel.onmessage = async ({ data: req }) => {
  if (!req || req.from !== 'settings' || handled.has(req.reqId)) return;
  handled.add(req.reqId);
  const reply = (payload) => channel.postMessage({ from: 'brain', reqId: req.reqId, ...payload });
  try {
    await loadLocale();
    if (req.kind === 'try') {
      const config = withRules(req.config || {});
      const data = req.point === 'will-start-task'
        ? { text: req.text, attachmentCount: Array.isArray(req.media) ? req.media.length : 0, ...(Array.isArray(req.media) && req.media.length ? { media: req.media } : {}) }
        : { name: req.text, prompt: '', ...(Array.isArray(req.media) && req.media.length ? { media: req.media } : {}) };
      const result = await decide(req.point, data, Date.now() + 28000, config);
      reply({ ok: true, result });
    } else if (req.kind === 'evaluate') {
      const config = withRules(req.config || {});
      const deadline = Date.now() + 28000;
      const questions = normalizeQuestions(req.questions);
      const hintedModalities = inspectInputModalities(req.input);
      const targetProvider = await resolveEvalProvider(req.provider, config, hintedModalities);
      const { input, modalities } = await normalizeInput(req.input, { targetProvider, deadline });
      const result = await evaluateQuestions(config, questions, input, deadline, {
        provider: targetProvider,
        model: req.model || undefined,
      });
      reply({ ok: true, result: { ...result, modalities: Array.from(modalities) } });
    } else if (req.kind === 'jev-models') {
      const r = await cindy.fetch({ url: 'https://api.typesafe.ai/v1/models', timeoutMs: 10000 });
      if (!r.ok || r.status !== 200) throw new Error(r.message || `HTTP ${r.status}`);
      reply({ ok: true, models: (JSON.parse(r.body).models || []).map((m) => m.name).filter(Boolean) });
    }
  } catch (error) {
    reply({ ok: false, message: String((error && error.message) || error) });
  }
};

// The picker reads the last published list, so a stale one is only ever one start away from fixed.
publishModels();
