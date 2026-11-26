// Decision Gate settings: the judge (Gemini Decision / OpenAI Decisions / TypeSafe Jev),
// typed rules (noul / choice / score), and multimodal evaluation playground.
// Copy follows the host language only (GET /app-context); anything else falls back to English.
const MESSAGES = {
  "en": {
    save: "Save",
    pointRunHint: "If a condition holds, this run is skipped.",
    ifWord: "If",
    useWord: "use",
    otherwise: "Anything else, or if judging fails",
    chooseModel: "Select a model",
    addCondition: "Add condition",
    phCondition: "e.g. writing code or fixing a bug",
    phRunCondition: "e.g. the prompt says not to run this time",
    conditionLabel: "Condition {n}",
    modelFor: "Model for condition {n}",
    fallbackLabel: "Fallback model",
    moveUp: "Move condition {n} up",
    deleteRule: "Delete condition {n}",
    fallbackNeeded: "Choose a fallback model, then “Pick by rules” appears in the new task model picker.",
    pickerFailed: "Could not open the model picker: {error}",
    pickerUnsupported: "this version of Cindy needs an update",
    modelGone: "Not available",
    belowA: "Below",
    belowB: "counts as unsure. You can only choose connected models.",
    storeLoadFailed: "Could not load rules: {error}.",
    storeSaveFailed: "Could not save: {error}. Your change was not applied.",
    storeRetry: "Try again",
    pointStart: "When a new task starts",
    pointStartHint: "Checks the first message once and keeps that model afterward. Not used in teammate chats.",
    pointSchedule: "Before an automation runs",
    pointRoutine: "Before a routine runs",
    effort_minimal: "Minimal",
    effort_low: "Low",
    effort_medium: "Medium",
    effort_high: "High",
    effort_xhigh: "Extra high",
    effort_max: "Max",
    effort_ultra: "Ultra",
    noModel: "No model selected",
    noReply: "The plugin did not respond",
    keySaved: "Key saved",
    keyMissing: "Key not set",
    done: "Done",
    change: "Change",
    use: "Use",
    judgeModelLabel: "Model used for judging",
    keyReplace: "Enter a new key to replace it",
    keyPaste: "Paste {label}",
    keyStored: "Saved. Cindy encrypts it and the plugin cannot read it back.",
    notSet: "Not set",
    modelVersion: "Model version",
    modelVersionGemini: "Gemini Decisions API supports gemini-decision-1 for text, image, video, audio, and PDF.",
    modelVersionJev: "Models available to your TypeSafe account",
    modelVersionOpenai: "The Decisions API currently supports only gpt-6-luna. Change this when a new version is available.",
    geminiVersionLabel: "Gemini model version",
    jevVersionLabel: "Jev model version",
    openaiVersionLabel: "OpenAI model version",
    judgeTitle: "Judged by",
    judgeDesc: "It only answers typed questions with calibrated probabilities. It never touches your files.",
    skipRun: "Skip this run",
    justNow: "just now",
    minsAgo: "{n} min ago",
    hoursAgo: "{n} hr ago",
    daysAgo: "{n} days ago",
    lastRun: "Last: {summary} · {when}",
    removeItem: "Remove {text}",
    pressEnter: "Type and press Enter",
    tryIt: "Try it",
    thresholdLabel: "Confidence threshold",
    keywordHint: "Skip without asking the model when the name or prompt contains:",
    addKeyword: "Add keyword",
    tryLabel: "Text to try",
    phTryStart: "Try a message, e.g. Fix the bug on the login page",
    phTryRun: "Try a task name, e.g. Weekly report (paused)",
    judging: "Judging…",
    seconds: " · {n} s",
    noConclusion: "No conclusion",
    noChange: "{why}, no change{sec}",
    enableRule: "Enable this rule",
    tipA: "The AI can write rules for you. In any task, say",
    tipQuote: "Use Claude Opus for coding and a cheaper model for chat",
    tipB: "and it adds the rule here for you to edit.",
    ruleTypeLabel: "Question type",
    typeNoul: "Yes/No",
    typeChoice: "Choice",
    typeScore: "Score",
    addOption: "Add option",
    addLevel: "Add level",
    phOptionKey: "Option ID",
    phOptionDesc: "When this option applies",
    phLevelDesc: "Level {n} description",
    targetOptionLabel: "Trigger when choice is",
    anyOption: "Any winning option",
    minScoreLabel: "Trigger when score ≥",
    addMedia: "Attach media/PDF",
    addUri: "Add media URL",
    phMediaUri: "https://... or Gemini Files API URI",
    inlineTooLarge: "“{name}” ({kb} KB) may exceed the 256 KB sandbox fetch limit; use an HTTPS or Files API URI for large audio/video/PDF.",
    evalTitle: "Multimodal Typed Question Playground",
    evalDesc: "Test Yes/No (noul), Single-Select (choice), and Rubric (score) questions over text, image, video, audio, and PDF.",
    evalToggleOpen: "Open playground",
    evalToggleClose: "Hide playground",
    evalInputLabel: "Shared input (text + attachments)",
    evalInputPh: "Enter text or JSON input, and optionally attach images, video, audio, or PDF below...",
    evalQuestionLabel: "Question instructions",
    evalQuestionPh: "e.g. Did the item arrive damaged, or what severity level is this?",
    evalRun: "Evaluate",
    acpGroup: "Antigravity (acp)",
    otherEngineModels: "Other engines (Claude / Codex / Pi)…",
  },
  "zh-CN": {
    save: "保存",
    pointRunHint: "条件符合就跳过这次运行。",
    ifWord: "如果",
    useWord: "用",
    otherwise: "其他情况，或判断失败",
    chooseModel: "选择模型",
    addCondition: "添加条件",
    phCondition: "例如：在写代码或改 bug",
    phRunCondition: "例如：指令写明这次不用运行",
    conditionLabel: "条件 {n}",
    modelFor: "条件 {n} 用的模型",
    fallbackLabel: "保底模型",
    moveUp: "上移条件 {n}",
    deleteRule: "删除条件 {n}",
    fallbackNeeded: "选好保底模型后，新任务的模型选择器里才会出现「按规则选模型」。",
    pickerFailed: "打不开模型选择器：{error}",
    pickerUnsupported: "当前 Cindy 版本需要更新",
    modelGone: "已不可用",
    belowA: "把握低于",
    belowB: "算拿不准。只能选你已连接的模型。",
    storeLoadFailed: "读取规则失败：{error}。",
    storeSaveFailed: "保存失败：{error}。这次改动没有生效。",
    storeRetry: "重试",
    pointStart: "开新任务时",
    pointStartHint: "只在新任务的第一条消息判断一次，之后不再换模型；伙伴对话不使用",
    pointSchedule: "自动化运行前",
    pointRoutine: "例行任务运行前",
    effort_minimal: "最低",
    effort_low: "低",
    effort_medium: "中",
    effort_high: "高",
    effort_xhigh: "超高",
    effort_max: "最高",
    effort_ultra: "极致",
    noModel: "未选模型",
    noReply: "插件没有回应",
    keySaved: "Key 已保存",
    keyMissing: "Key 未填写",
    done: "完成",
    change: "更改",
    use: "使用",
    judgeModelLabel: "判断用的模型",
    keyReplace: "输入新 Key 以更换",
    keyPaste: "粘贴 {label}",
    keyStored: "已保存，Cindy 加密保管，插件读不回",
    notSet: "未填写",
    modelVersion: "模型版本",
    modelVersionGemini: "Gemini Decisions API 支持 gemini-decision-1，可针对文本、图像、视频、音频和 PDF 评估是/否、单选和评分问题。",
    modelVersionJev: "来自 TypeSafe 账号可用的模型",
    modelVersionOpenai: "Decisions API 目前只支持 gpt-6-luna，有新版本时可直接改",
    geminiVersionLabel: "Gemini 模型版本",
    jevVersionLabel: "Jev 模型版本",
    openaiVersionLabel: "OpenAI 模型版本",
    judgeTitle: "判断用",
    judgeDesc: "它只回答带类型的问题并返回校准概率，不会动你的文件。",
    skipRun: "跳过本次",
    justNow: "刚刚",
    minsAgo: "{n} 分钟前",
    hoursAgo: "{n} 小时前",
    daysAgo: "{n} 天前",
    lastRun: "上次：{summary} · {when}",
    removeItem: "删除 {text}",
    pressEnter: "输入后回车",
    tryIt: "试一下",
    thresholdLabel: "把握阈值",
    keywordHint: "名称或指令里含这些词，不问模型直接跳过：",
    addKeyword: "添加关键词",
    tryLabel: "试一下的内容",
    phTryStart: "写一条消息试试，例如：帮我修一下登录页的 bug",
    phTryRun: "写一个任务名试试，例如：周报汇总（暂停中）",
    judging: "正在判断…",
    seconds: " · {n} 秒",
    noConclusion: "没有结论",
    noChange: "{why}，不改{sec}",
    enableRule: "启用这条规则",
    tipA: "也可以让 AI 帮你写规则。在任何任务里说一句",
    tipQuote: "写代码用 Claude Opus，闲聊用便宜点的模型",
    tipB: "，AI 会把规则加到这里，你可以再改。",
    ruleTypeLabel: "问题类型",
    typeNoul: "是/否",
    typeChoice: "单选",
    typeScore: "评分",
    addOption: "添加选项",
    addLevel: "添加等级",
    phOptionKey: "选项 ID",
    phOptionDesc: "适用条件说明",
    phLevelDesc: "等级 {n} 说明",
    targetOptionLabel: "命中选项时触发",
    anyOption: "任意最优选项",
    minScoreLabel: "触发最低分 ≥",
    addMedia: "附带媒体/PDF",
    addUri: "添加媒体 URL",
    phMediaUri: "https://... 或 Gemini Files API URI",
    inlineTooLarge: "「{name}」（{kb} KB）可能超出沙箱 256 KB 请求限制；大音视频或 PDF 请改用 HTTPS 或 Files API URI。",
    evalTitle: "多模态带类型问题测试台",
    evalDesc: "直接针对文本、图像、视频、音频和 PDF 评估是/否（noul）、单选（choice）和评分标准（score）问题。",
    evalToggleOpen: "展开测试台",
    evalToggleClose: "收起测试台",
    evalInputLabel: "共享输入（文本 + 附件）",
    evalInputPh: "输入文本或 JSON，并可在下方附带图片、视频、音频或 PDF...",
    evalQuestionLabel: "问题说明",
    evalQuestionPh: "例如：物品是否损坏，或该问题的严重程度如何？",
    evalRun: "立即评估",
    acpGroup: "Antigravity (acp)",
    otherEngineModels: "其他引擎模型（Claude / Codex / Pi）…",
  },
  "ja": {
    save: "保存",
    pointRunHint: "条件に一致すると、この実行をスキップします。",
    ifWord: "もし",
    useWord: "使う",
    otherwise: "その他、または判断に失敗したとき",
    chooseModel: "モデルを選択",
    addCondition: "条件を追加",
    phCondition: "例：コードを書いている、バグを直している",
    phRunCondition: "例：今回は実行不要と指示に書かれている",
    conditionLabel: "条件 {n}",
    modelFor: "条件 {n} のモデル",
    fallbackLabel: "保険のモデル",
    moveUp: "条件 {n} を上へ",
    deleteRule: "条件 {n} を削除",
    fallbackNeeded: "保険のモデルを選ぶと、新しいタスクのモデル選択に「ルールで選ぶ」が表示されます。",
    pickerFailed: "モデル選択を開けませんでした: {error}",
    pickerUnsupported: "この Cindy は更新が必要です",
    modelGone: "利用不可",
    belowA: "確信度が",
    belowB: "未満なら判断できない扱いです。接続済みのモデルだけ選べます。",
    storeLoadFailed: "ルールを読み込めませんでした: {error}。",
    storeSaveFailed: "保存できませんでした: {error}。変更は適用されていません。",
    storeRetry: "再試行",
    pointStart: "新しいタスクの開始時",
    pointStartHint: "新しいタスクの最初のメッセージで一度だけ判断し、その後はモデルを変えません。チームメイトとの会話では使いません。",
    pointSchedule: "自動化の実行前",
    pointRoutine: "ルーティンの実行前",
    effort_minimal: "最小",
    effort_low: "低",
    effort_medium: "中",
    effort_high: "高",
    effort_xhigh: "超高",
    effort_max: "最大",
    effort_ultra: "ウルトラ",
    noModel: "モデル未選択",
    noReply: "プラグインから応答がありません",
    keySaved: "キー保存済み",
    keyMissing: "キー未設定",
    done: "完了",
    change: "変更",
    use: "使用",
    judgeModelLabel: "判断に使うモデル",
    keyReplace: "新しいキーを入力して置き換え",
    keyPaste: "{label} を貼り付け",
    keyStored: "保存済み。Cindy が暗号化して保管し、プラグインは読み戻せません。",
    notSet: "未設定",
    modelVersion: "モデルのバージョン",
    modelVersionGemini: "Gemini Decisions API は gemini-decision-1 でテキスト・画像・動画・音声・PDF に対応します。",
    modelVersionJev: "TypeSafe アカウントで使えるモデル",
    modelVersionOpenai: "Decisions API は現在 gpt-6-luna のみ対応です。新しいバージョンが出たら変更できます。",
    geminiVersionLabel: "Gemini モデルのバージョン",
    jevVersionLabel: "Jev モデルのバージョン",
    openaiVersionLabel: "OpenAI モデルのバージョン",
    judgeTitle: "判断に使うモデル",
    judgeDesc: "型付き質問に校正済み確率で答えるだけです。ファイルには触れません。",
    skipRun: "今回はスキップ",
    justNow: "たった今",
    minsAgo: "{n} 分前",
    hoursAgo: "{n} 時間前",
    daysAgo: "{n} 日前",
    lastRun: "前回: {summary} · {when}",
    removeItem: "{text} を削除",
    pressEnter: "入力して Enter",
    tryIt: "試す",
    thresholdLabel: "確信度のしきい値",
    keywordHint: "名前または指示に次の語があれば、モデルに聞かずスキップ:",
    addKeyword: "キーワードを追加",
    tryLabel: "試す内容",
    phTryStart: "メッセージを試す。例: ログインページのバグを直して",
    phTryRun: "タスク名を試す。例: 週報まとめ(一時停止中)",
    judging: "判断中…",
    seconds: " · {n} 秒",
    noConclusion: "結論なし",
    noChange: "{why}、変更なし{sec}",
    enableRule: "このルールを有効にする",
    tipA: "AI にルールを書いてもらえます。任意のタスクで次のように伝えてください:",
    tipQuote: "コードは Claude Opus、雑談は安いモデルで",
    tipB: "AI がここにルールを追加し、あとから編集できます。",
    ruleTypeLabel: "質問タイプ",
    typeNoul: "はい/いいえ",
    typeChoice: "単一選択",
    typeScore: "スコア",
    addOption: "選択肢を追加",
    addLevel: "レベルを追加",
    phOptionKey: "選択肢 ID",
    phOptionDesc: "適用条件の説明",
    phLevelDesc: "レベル {n} の説明",
    targetOptionLabel: "一致する選択肢",
    anyOption: "任意の最有力選択肢",
    minScoreLabel: "発動スコア ≥",
    addMedia: "メディア/PDF 添付",
    addUri: "メディア URL 追加",
    phMediaUri: "https://... または Gemini Files API URI",
    inlineTooLarge: "「{name}」（{kb} KB）は 256 KB 制限を超える可能性があります。大きい音声/動画/PDF は HTTPS または Files API URI を使用してください。",
    evalTitle: "マルチモーダル型付き質問テスト",
    evalDesc: "テキスト・画像・動画・音声・PDF に対して noul / choice / score をテストします。",
    evalToggleOpen: "テストを開く",
    evalToggleClose: "テストを閉じる",
    evalInputLabel: "共有入力（テキスト + 添付）",
    evalInputPh: "テキストや JSON を入力し、下で画像・動画・音声・PDF を添付できます...",
    evalQuestionLabel: "質問の指示",
    evalQuestionPh: "例：破損はありますか？ / 深刻度はどの段階ですか？",
    evalRun: "評価する",
    acpGroup: "Antigravity (acp)",
    otherEngineModels: "他のエンジン（Claude / Codex / Pi）…",
  },
  "ko": {
    save: "저장",
    pointRunHint: "조건에 맞으면 이번 실행을 건너뜁니다.",
    ifWord: "만약",
    useWord: "사용",
    otherwise: "그 외, 또는 판단 실패 시",
    chooseModel: "모델 선택",
    addCondition: "조건 추가",
    phCondition: "예: 코드를 쓰거나 버그를 고칠 때",
    phRunCondition: "예: 이번에는 실행하지 말라고 적혀 있을 때",
    conditionLabel: "조건 {n}",
    modelFor: "조건 {n}의 모델",
    fallbackLabel: "기본 모델",
    moveUp: "조건 {n} 위로",
    deleteRule: "조건 {n} 삭제",
    fallbackNeeded: "기본 모델을 고르면 새 작업의 모델 선택기에 “규칙으로 선택”이 나타납니다.",
    pickerFailed: "모델 선택기를 열지 못했습니다: {error}",
    pickerUnsupported: "이 Cindy 버전은 업데이트가 필요합니다",
    modelGone: "사용 불가",
    belowA: "확신도가",
    belowB: "미만이면 확실하지 않은 것으로 봅니다. 연결된 모델만 고를 수 있습니다.",
    storeLoadFailed: "규칙을 불러오지 못했습니다: {error}.",
    storeSaveFailed: "저장하지 못했습니다: {error}. 변경 사항이 적용되지 않았습니다.",
    storeRetry: "다시 시도",
    pointStart: "새 작업을 시작할 때",
    pointStartHint: "새 작업의 첫 메시지에서 한 번만 판단하고 이후에는 모델을 바꾸지 않습니다. 팀원 대화에서는 쓰지 않습니다.",
    pointSchedule: "자동화 실행 전",
    pointRoutine: "루틴 실행 전",
    effort_minimal: "최소",
    effort_low: "낮음",
    effort_medium: "중간",
    effort_high: "높음",
    effort_xhigh: "매우 높음",
    effort_max: "최대",
    effort_ultra: "울트라",
    noModel: "모델 미선택",
    noReply: "플러그인이 응답하지 않습니다",
    keySaved: "키 저장됨",
    keyMissing: "키 미설정",
    done: "완료",
    change: "변경",
    use: "사용",
    judgeModelLabel: "판단에 쓰는 모델",
    keyReplace: "새 키를 입력해 교체",
    keyPaste: "{label} 붙여넣기",
    keyStored: "저장됨. Cindy가 암호화해 보관하며 플러그인은 다시 읽을 수 없습니다.",
    notSet: "미설정",
    modelVersion: "모델 버전",
    modelVersionGemini: "Gemini Decisions API는 gemini-decision-1로 텍스트·이미지·동영상·오디오·PDF를 지원합니다.",
    modelVersionJev: "TypeSafe 계정에서 쓸 수 있는 모델",
    modelVersionOpenai: "Decisions API는 현재 gpt-6-luna만 지원합니다. 새 버전이 나오면 바꿀 수 있습니다.",
    geminiVersionLabel: "Gemini 모델 버전",
    jevVersionLabel: "Jev 모델 버전",
    openaiVersionLabel: "OpenAI 모델 버전",
    judgeTitle: "판단 모델",
    judgeDesc: "유형별 질문에 보정된 확률로만 답합니다. 파일은 건드리지 않습니다.",
    skipRun: "이번 실행 건너뛰기",
    justNow: "방금",
    minsAgo: "{n}분 전",
    hoursAgo: "{n}시간 전",
    daysAgo: "{n}일 전",
    lastRun: "지난번: {summary} · {when}",
    removeItem: "{text} 삭제",
    pressEnter: "입력 후 Enter",
    tryIt: "시험해 보기",
    thresholdLabel: "확신도 기준",
    keywordHint: "이름이나 지시에 다음 단어가 있으면 모델에 묻지 않고 건너뜁니다:",
    addKeyword: "키워드 추가",
    tryLabel: "시험할 내용",
    phTryStart: "메시지를 시험해 보세요. 예: 로그인 페이지 버그 고쳐 줘",
    phTryRun: "작업 이름을 시험해 보세요. 예: 주간 보고(일시 중지)",
    judging: "판단 중…",
    seconds: " · {n}초",
    noConclusion: "결론 없음",
    noChange: "{why}, 변경 없음{sec}",
    enableRule: "이 규칙 사용",
    tipA: "AI에게 규칙 작성을 맡길 수 있습니다. 아무 작업에서나 이렇게 말해 보세요:",
    tipQuote: "코딩은 Claude Opus, 잡담은 저렴한 모델로",
    tipB: "AI가 여기에 규칙을 추가하며 나중에 고칠 수 있습니다.",
    ruleTypeLabel: "질문 유형",
    typeNoul: "예/아니오",
    typeChoice: "단일 선택",
    typeScore: "점수",
    addOption: "선택지 추가",
    addLevel: "등급 추가",
    phOptionKey: "선택지 ID",
    phOptionDesc: "적용 기준 설명",
    phLevelDesc: "등급 {n} 설명",
    targetOptionLabel: "트리거 선택지",
    anyOption: "모든 최상위 선택지",
    minScoreLabel: "최소 점수 ≥",
    addMedia: "미디어/PDF 첨부",
    addUri: "미디어 URL 추가",
    phMediaUri: "https://... 또는 Gemini Files API URI",
    inlineTooLarge: "“{name}”({kb} KB)는 256 KB 샌드박스 제한을 초과할 수 있습니다. 큰 오디오/비디오/PDF는 HTTPS 또는 Files API URI를 사용하세요.",
    evalTitle: "멀티모달 유형별 질문 테스트",
    evalDesc: "텍스트·이미지·동영상·오디오·PDF에 대해 noul / choice / score 질문을 직접 테스트합니다.",
    evalToggleOpen: "테스트 열기",
    evalToggleClose: "테스트 닫기",
    evalInputLabel: "공유 입력 (텍스트 + 첨부)",
    evalInputPh: "텍스트나 JSON을 입력하고 아래에서 이미지·동영상·오디오·PDF를 첨부하세요...",
    evalQuestionLabel: "질문 지침",
    evalQuestionPh: "예: 제품이 파손되었나요? / 심각도 점수는 몇 점인가요?",
    evalRun: "평가 실행",
    acpGroup: "Antigravity (acp)",
    otherEngineModels: "다른 엔진 모델 (Claude / Codex / Pi)…",
  },
};

let locale = 'en';
const t = (key, vars = {}) => (MESSAGES[locale]?.[key] ?? MESSAGES.en[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
async function loadLocale() {
  const body = await fetch('/app-context').then((r) => r.json()).catch(() => null);
  const next = body?.context?.locale;
  locale = MESSAGES[next] ? next : 'en';
  document.documentElement.lang = locale;
}

const POINTS = [
  { id: 'will-start-task', label: () => t('pointStart'), hint: () => t('pointStartHint') },
  { id: 'will-schedule-run', label: () => t('pointSchedule'), hint: () => t('pointRunHint') },
  { id: 'will-routine-run', label: () => t('pointRoutine'), hint: () => t('pointRunHint') },
];
const PROVIDERS = {
  gemini: { name: 'Gemini Decision', key: 'gemini_api_key', keyLabel: 'Gemini API Key', model: 'gemini-decision-1' },
  openai: { name: 'OpenAI Decisions', key: 'openai_api_key', keyLabel: 'OpenAI API Key', model: 'gpt-6-luna' },
  jev: { name: 'TypeSafe Jev', key: 'typesafe_api_key', keyLabel: 'TypeSafe API Key', model: 'jev-latest' },
};
const THRESHOLDS = [0.5, 0.6, 0.7, 0.8, 0.9];
const effortName = (effort) => (MESSAGES.en[`effort_${effort}`] ? t(`effort_${effort}`) : effort);
const AGENT_KIND = { 'claude-code': 'cc', cc: 'cc', codex: 'codex', pi: 'pi', acp: 'acp', antigravity: 'acp', agy: 'acp' };
const AGENT_LABEL = { 'claude-code': 'Claude Code', cc: 'Claude Code', codex: 'Codex', pi: 'Pi', acp: 'Antigravity' };
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
];

const root = document.getElementById('root');
const channel = new BroadcastChannel('decision-gate');
let cfg = { rules: [] };
let secrets = {};
let models = [];
let supportsRemoteRoutes = false;
let jevModels = null;
let editingJudge = false;
let loaded = false;
let stored = '{}';
let storeError = '';
const tryRuns = {};
const unsavedKeys = {};
let pickerError = '';
const tryTexts = {};
const tryMedias = {}; // by point: [{ name, type, mime_type, data?, uri?, kb?, tooLarge? }]
const tryStates = {};

let evalOpen = false;
let evalInputText = '';
let evalMedias = [];
let evalQType = 'noul';
let evalQInstr = '';
let evalChoiceOpts = [{ key: 'billing', desc: 'Payment or refund' }, { key: 'technical', desc: 'Bug or error' }];
let evalScoreLvls = ['Low severity', 'Moderate impact', 'Critical blocker'];
let evalState = null;

const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
};
const svg = (d, size = 14) => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('aria-hidden', 'true'); s.classList.add('ic');
  for (const part of d.split('|')) { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', part); s.append(p); }
  return s;
};
const ICON = {
  chevron: 'm6 9 6 6 6-6', up: 'm5 12 7-7 7 7|M12 19V5', plus: 'M5 12h14|M12 5v14', x: 'M18 6 6 18|m6 6 12 12', arrow: 'M5 12h14|m12 5 7 7-7 7',
  check: 'M20 6 9 17l-5-5', play: 'M6 3v18l15-9z', trash: 'M3 6h18|M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6|M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  wand: 'm21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72|m14 7 3 3|M5 6v4|M19 14v4|M10 2v2|M7 8H3|M21 16h-4|M11 3H9',
};
const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, '0')).join('');
const newId = () => randomId();
const pct = (n) => `${Math.round(n * 100)}%`;
const providerId = () => (cfg.provider === 'gemini' ? 'gemini' : cfg.provider === 'jev' ? 'jev' : 'openai');
const provider = () => PROVIDERS[providerId()];
const modelOf = (id) => (id === 'gemini' ? cfg.geminiModel : id === 'jev' ? cfg.jevModel : cfg.openaiModel) || PROVIDERS[id].model;
const withRules = (raw) => ({ ...raw, rules: Array.isArray(raw.rules) ? raw.rules : [] });

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
      const pId = config.provider === 'gemini' ? 'gemini' : config.provider === 'jev' ? 'jev' : 'openai';
      const keyName = PROVIDERS[pId].key;
      const keySaved = list.some((s) => s.key === keyName && s.saved);
      const ready = keySaved && !!config.fallback;
      await fetch('/models', { method: 'PUT', body: JSON.stringify({ models: ready ? [PICKER_MODEL] : [] }) });
    } catch { /* the picker keeps the last published list */ }
  };
  return globalThis.navigator?.locks ? navigator.locks.request('decision-gate-models', run) : run();
}

const withConfigLock = (fn) => (navigator.locks ? navigator.locks.request('decision-gate-config', fn) : fn());
async function readStore() {
  const res = await fetch('/kv');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function mergeChanges(base, mine, latest) {
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const merged = { ...latest };
  for (const key of new Set([...Object.keys(base), ...Object.keys(mine)])) {
    if (key !== 'rules' && key !== 'lastByRule' && !same(base[key], mine[key])) merged[key] = mine[key];
  }
  const rulesById = (rules) => new Map((rules || []).map((r) => [r.id, r]));
  const baseRules = rulesById(base.rules);
  const mineRules = rulesById(mine.rules);
  const rules = (latest.rules || []).filter((r) => !baseRules.has(r.id) || mineRules.has(r.id));
  for (const rule of mine.rules || []) {
    const before = baseRules.get(rule.id);
    if (same(before, rule)) continue;
    const index = rules.findIndex((r) => r.id === rule.id);
    if (index < 0) { rules.push(rule); continue; }
    const next = { ...rules[index] };
    for (const key of new Set([...Object.keys(before || {}), ...Object.keys(rule)])) {
      if (same(before?.[key], rule[key])) continue;
      if (rule[key] === undefined) delete next[key]; else next[key] = rule[key];
    }
    rules[index] = before ? next : rule;
  }
  const baseIds = (base.rules || []).map((r) => r.id);
  const mineIds = (mine.rules || []).map((r) => r.id);
  const kept = baseIds.filter((id) => mineIds.includes(id));
  const added = mineIds.filter((id) => !baseIds.includes(id));
  const moved = !same(mineIds, [...kept, ...added]);
  const order = new Map((mine.rules || []).map((r, i) => [r.id, i]));
  merged.rules = moved ? rules.sort((x, y) => (order.get(x.id) ?? Infinity) - (order.get(y.id) ?? Infinity)) : rules;
  return merged;
}

let saves = 0;
async function save() {
  const landed = await withConfigLock(async () => {
    const mine = JSON.parse(JSON.stringify(cfg));
    try {
      const next = mergeChanges(JSON.parse(stored), mine, withRules(await readStore()));
      const res = await fetch('/kv', { method: 'PUT', body: JSON.stringify(next) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      cfg = mergeChanges(mine, cfg, next);
      stored = JSON.stringify(next);
      saves += 1;
      storeError = '';
      return true;
    } catch (error) {
      cfg = mergeChanges(mine, cfg, JSON.parse(stored));
      storeError = t('storeSaveFailed', { error: error && error.message });
      return false;
    }
  });
  if (!landed) return false;
  channel.postMessage({ from: 'settings', type: 'config-changed' });
  await publishModels();
  return true;
}

function ask(kind, payload, timeoutMs = 30000) {
  const reqId = randomId();
  fetch('/wake').catch(() => {});
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { clearInterval(resend); channel.removeEventListener('message', on); reject(new Error(t('noReply'))); }, timeoutMs);
    const send = () => channel.postMessage({ from: 'settings', reqId, kind, ...payload });
    const resend = setInterval(send, 600);
    const on = ({ data }) => {
      if (data?.from !== 'brain' || data.reqId !== reqId) return;
      clearTimeout(timer); clearInterval(resend); channel.removeEventListener('message', on);
      data.ok ? resolve(data) : reject(new Error(data.message));
    };
    channel.addEventListener('message', on);
    send();
  });
}

// ── File Attachment Helper ────────────────────────────────────────────────
function readFileBase64(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const str = String(fr.result || '');
      const idx = str.indexOf(',');
      resolve(idx >= 0 ? str.slice(idx + 1) : str);
    };
    fr.onerror = () => reject(fr.error || new Error('File read error'));
    fr.readAsDataURL(file);
  });
}

async function compressImageIfNeeded(file) {
  if (file.size <= 160 * 1024) return { mime_type: file.type || 'image/jpeg', data: await readFileBase64(file) };
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    return { mime_type: 'image/jpeg', data: b64 };
  } catch {
    return { mime_type: file.type || 'image/jpeg', data: await readFileBase64(file) };
  }
}

async function fileToMediaItem(file) {
  const mime = (file.type || '').toLowerCase();
  const isPdf = mime === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImg = mime.startsWith('image/');
  const isAud = mime.startsWith('audio/');
  const isVid = mime.startsWith('video/');
  const type = isPdf ? 'document' : isImg ? 'image' : isAud ? 'audio' : isVid ? 'video' : 'document';
  if (isImg) {
    const img = await compressImageIfNeeded(file);
    return { name: file.name, type: 'image', mime_type: img.mime_type, data: img.data, resolution: 'low', kb: Math.round((img.data.length * 3) / 4 / 1024) };
  }
  const b64 = await readFileBase64(file);
  const resolvedMime = mime || (isPdf ? 'application/pdf' : isAud ? 'audio/mp3' : isVid ? 'video/mp4' : 'application/pdf');
  const kb = Math.round(file.size / 1024);
  return { name: file.name, type, mime_type: resolvedMime, data: b64, ...(type === 'video' ? { resolution: 'low' } : {}), kb, tooLarge: kb > 180 };
}

function mediaAttachmentBar(list, onUpdate) {
  const fileInput = h('input', {
    type: 'file',
    accept: 'image/*,video/*,audio/*,application/pdf',
    multiple: true,
    hidden: true,
    onchange: async (e) => {
      const files = Array.from(e.target.files || []);
      e.target.value = '';
      for (const f of files) {
        const item = await fileToMediaItem(f);
        list.push(item);
      }
      onUpdate();
    },
  });
  const uriInput = h('input', { class: 'pill small', placeholder: t('phMediaUri'), style: 'max-width:220px' });
  const addUriBtn = h('button', {
    class: 'chip add',
    type: 'button',
    onclick: () => {
      const v = uriInput.value.trim();
      if (!v) return;
      uriInput.value = '';
      list.push({ name: v.split('/').pop()?.slice(0, 24) || 'uri', uri: v });
      onUpdate();
    },
  }, svg(ICON.plus, 12), t('addUri'));

  const warnings = list.filter((x) => x.tooLarge).map((x) => h('p', { class: 'hint', style: 'margin-top:4px' }, t('inlineTooLarge', { name: x.name, kb: x.kb })));
  return h('div', { style: 'margin-top:8px' },
    h('div', { class: 'chips' },
      fileInput,
      ...list.map((m, i) => h('span', { class: 'chip' }, `${m.type || 'media'}: ${m.name}`, h('button', { class: 'x', type: 'button', 'aria-label': t('removeItem', { text: m.name }), onclick: () => { list.splice(i, 1); onUpdate(); } }, svg(ICON.x, 12)))),
      h('button', { class: 'chip add', type: 'button', onclick: () => fileInput.click() }, svg(ICON.plus, 12), t('addMedia')),
      uriInput,
      addUriBtn),
    ...warnings);
}

// ── Widgets ───────────────────────────────────────────────────────────────
function seg(options, value, onChange, label) {
  return h('div', { class: 'seg', role: 'group', ...(label ? { 'aria-label': label } : {}) },
    ...options.map(([key, text]) => h('button', { type: 'button', 'aria-pressed': String(key === value), onclick: () => onChange(key) }, text)));
}
function select(options, value, onChange, label, cls = '') {
  return h('span', { class: `sel ${cls}` },
    h('select', { 'aria-label': label, onchange: (e) => onChange(e.target.value) },
      ...options.map(([v, text]) => h('option', { value: v, selected: v === value }, text))),
    svg(ICON.chevron, 14));
}
const toggle = (on, label, onChange) => h('button', { class: 'sw', type: 'button', role: 'switch', 'aria-checked': String(on), 'aria-label': label, onclick: onChange });

// ── Judge ─────────────────────────────────────────────────────────────────
function judgeSection() {
  const p = provider();
  const saved = secrets[p.key];
  const group = h('div', { class: 'group' },
    h('div', { class: 'row' },
      h('div', { class: 'grow' }, h('p', { class: 't14' }, p.name), h('p', { class: 'meta', style: 'margin-top:2px' }, `${modelOf(providerId())} · ${saved ? t('keySaved') : t('keyMissing')}`)),
      h('button', { class: 'btn', type: 'button', 'aria-expanded': String(editingJudge), onclick: () => { editingJudge = !editingJudge; render(); } }, editingJudge ? t('done') : t('change'))));
  if (editingJudge) {
    const id = providerId();
    group.append(h('div', { class: 'row' }, h('div', { class: 'grow' }, h('p', {}, t('use'))),
      seg(Object.entries(PROVIDERS).map(([key, v]) => [key, v.name]), id, async (key) => { cfg.provider = key; await save(); render(); if (key === 'jev') loadJevModels(); }, t('judgeModelLabel'))));
    const keyInput = h('input', { class: 'pill', type: 'password', autocomplete: 'off', value: unsavedKeys[p.key] || '', placeholder: saved ? t('keyReplace') : t('keyPaste', { label: p.keyLabel }), 'aria-label': p.keyLabel });
    group.append(h('form', {
      class: 'row', onsubmit: async (e) => {
        e.preventDefault();
        const value = keyInput.value.trim();
        if (!value) return;
        try {
          const res = await fetch(`/secrets/${p.key}`, { method: 'PUT', body: JSON.stringify({ value }) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          delete unsavedKeys[p.key];
          storeError = '';
        } catch (error) {
          unsavedKeys[p.key] = value;
          storeError = t('storeSaveFailed', { error: error && error.message });
        }
        await loadSecrets();
        await publishModels();
        render();
      },
    }, h('div', { class: 'grow' }, h('p', {}, p.keyLabel), h('p', { class: 'meta', style: 'margin-top:2px' }, saved ? t('keyStored') : t('notSet')),
      h('div', { class: 'line', style: 'margin-top:8px' }, keyInput, h('button', { class: 'btn', type: 'submit' }, t('save'))))));
    const versionHint = id === 'gemini' ? t('modelVersionGemini') : id === 'jev' ? t('modelVersionJev') : t('modelVersionOpenai');
    const modelRow = h('div', { class: 'row' }, h('div', { class: 'grow' }, h('p', {}, t('modelVersion')),
      h('p', { class: 'meta', style: 'margin-top:2px' }, versionHint)));
    if (id === 'jev') {
      const options = jevModels?.length ? jevModels : [modelOf('jev')];
      modelRow.append(select(options.map((m) => [m, m]), modelOf('jev'), async (v) => { cfg.jevModel = v; await save(); }, t('jevVersionLabel')));
    } else if (id === 'gemini') {
      modelRow.append(h('input', { class: 'pill narrow', value: modelOf('gemini'), 'aria-label': t('geminiVersionLabel'), onchange: async (e) => { cfg.geminiModel = e.target.value.trim() || PROVIDERS.gemini.model; await save(); } }));
    } else {
      modelRow.append(h('input', { class: 'pill narrow', value: modelOf('openai'), 'aria-label': t('openaiVersionLabel'), onchange: async (e) => { cfg.openaiModel = e.target.value.trim() || PROVIDERS.openai.model; await save(); } }));
    }
    group.append(modelRow);
  }
  return h('section', { class: 'sec' }, h('p', { class: 'st' }, t('judgeTitle')),
    h('p', { class: 'sd' }, t('judgeDesc')), group);
}

// ── Rules ─────────────────────────────────────────────────────────────────
function lastLine(rule) {
  const last = cfg.lastByRule[rule.id];
  const mins = Math.max(0, Math.round((Date.now() - last.at) / 60000));
  const when = mins < 1 ? t('justNow') : mins < 60 ? t('minsAgo', { n: mins }) : mins < 1440 ? t('hoursAgo', { n: Math.round(mins / 60) }) : t('daysAgo', { n: Math.round(mins / 1440) });
  return t('lastRun', { summary: last.summary, when });
}

function findModelEntry(route) {
  return route && models.find((m) => m.id === route.model && (m.agentDeviceId || null) === (route.agentDeviceId || null) && m.providerId === route.providerId && (AGENT_KIND[m.agent] || m.agent) === route.agentKind);
}

let activeModelMenu = null;
function closeModelMenu() {
  if (!activeModelMenu) return;
  activeModelMenu.cleanup();
  activeModelMenu = null;
}

async function pickRoute(current) {
  pickerError = '';
  const hostCompatible = current && ['cc', 'codex', 'pi'].includes(current.agentKind);
  const initial = hostCompatible && (!current.agentDeviceId || supportsRemoteRoutes)
    ? { agentKind: current.agentKind, providerId: current.providerId, model: current.model, effort: current.effort || '', fastMode: false, ...(current.agentDeviceId ? { agentDeviceId: current.agentDeviceId } : {}) }
    : undefined;
  let selected;
  try {
    const res = await fetch('/model-picker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...(initial ? { initial } : {}), ...(supportsRemoteRoutes ? { allowRemote: true } : {}) }) });
    if (res.status === 404) throw new Error(t('pickerUnsupported'));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    selected = await res.json();
  } catch (error) {
    pickerError = t('pickerFailed', { error: error.message });
    render();
    return null;
  }
  if (!selected.ok) {
    if (selected.errorCode !== 'CANCELLED') { pickerError = t('pickerFailed', { error: selected.message || selected.errorCode }); render(); }
    return null;
  }
  await loadModels();
  const { agentKind, providerId: pId, model, effort, agentDeviceId } = selected.route;
  const name = findModelEntry(selected.route)?.name;
  return { agentKind, providerId: pId, model, ...(agentDeviceId ? { agentDeviceId, locationName: findModelEntry(selected.route)?.locationName || current?.locationName } : {}), ...(effort ? { effort } : {}), ...(name ? { modelName: name } : {}) };
}

function openModelMenu(anchorEl, route, onPick) {
  if (activeModelMenu?.anchor === anchorEl) {
    closeModelMenu();
    return;
  }
  closeModelMenu();
  const acpModels = models.filter((m) => (AGENT_KIND[m.agent] || m.agent) === 'acp' && m.visible !== false);
  const list = acpModels.length ? acpModels : ACP_FALLBACK_MODELS.map((m) => ({ ...m, agent: 'acp', providerId: DEFAULT_ACP_PROVIDER_ID, providerName: 'Antigravity' }));
  const pop = h('div', { class: 'mpop', role: 'menu' },
    h('div', { class: 'mpop-hdr' }, t('acpGroup')),
    ...list.map((m) => {
      const isCur = route?.agentKind === 'acp' && route?.model === m.id && route?.providerId === m.providerId;
      const curEffort = isCur ? (route.effort || m.defaultEffort || '') : (m.defaultEffort || '');
      const choose = async (effort) => {
        closeModelMenu();
        pickerError = '';
        await onPick({
          agentKind: 'acp',
          providerId: m.providerId || DEFAULT_ACP_PROVIDER_ID,
          model: m.id,
          modelName: m.name,
          ...(effort ? { effort } : {}),
        });
      };
      return h('div', { class: `mpop-item ${isCur ? 'cur' : ''}` },
        h('button', { class: 'mpop-main', type: 'button', onclick: () => choose(curEffort) }, m.name),
        m.efforts?.length
          ? h('div', { class: 'mpop-efforts' },
              ...m.efforts.map((eff) => h('button', {
                class: `mpop-eff ${isCur && curEffort === eff ? 'on' : ''}`,
                type: 'button',
                onclick: (e) => { e.stopPropagation(); void choose(eff); },
              }, effortName(eff))))
          : null);
    }),
    h('button', {
      class: 'mpop-host',
      type: 'button',
      onclick: async () => {
        closeModelMenu();
        const next = await pickRoute(route);
        if (next) await onPick(next);
      },
    }, t('otherEngineModels')));
  const host = document.body || root;
  host.append(pop);
  if (typeof anchorEl.getBoundingClientRect === 'function' && typeof pop.getBoundingClientRect === 'function') {
    const rect = anchorEl.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    const vw = globalThis.window?.innerWidth || 680;
    const vh = globalThis.window?.innerHeight || 600;
    const left = Math.max(8, Math.min(rect.left, vw - Math.max(pr.width, 280) - 8));
    const spaceBelow = vh - rect.bottom - 8;
    const top = spaceBelow >= Math.min(pr.height, 260) || rect.top < 200
      ? rect.bottom + 4
      : Math.max(8, rect.top - pr.height - 4);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }
  const onDocClick = (e) => {
    if (!pop.contains(e.target) && !anchorEl.contains(e.target)) closeModelMenu();
  };
  const onKey = (e) => { if (e.key === 'Escape') closeModelMenu(); };
  setTimeout(() => {
    document.addEventListener?.('click', onDocClick, true);
    document.addEventListener?.('keydown', onKey, true);
  }, 0);
  activeModelMenu = {
    anchor: anchorEl,
    cleanup: () => {
      document.removeEventListener?.('click', onDocClick, true);
      document.removeEventListener?.('keydown', onKey, true);
      pop.remove?.();
    },
  };
}

function modelButton(route, label, onPick) {
  const entry = findModelEntry(route);
  const fallbackKind = route && (route.agentKind === 'acp' || String(route.providerId || '').startsWith('acp-plugin:')) ? AGENT_LABEL.acp : t('modelGone');
  const detail = route && [entry ? AGENT_LABEL[entry.agent] || AGENT_LABEL[AGENT_KIND[entry.agent]] || entry.agent : fallbackKind, entry?.locationName || route.locationName || '', route.effort ? effortName(route.effort) : ''].filter(Boolean).join(' · ');
  const btn = h('button', {
    class: `mbtn ${route ? '' : 'unset'}`, type: 'button', 'aria-label': label,
    onclick: () => openModelMenu(btn, route, onPick),
  }, route
    ? h('span', { class: 'mname' }, entry?.name || route.modelName || route.model, h('span', { class: 'mdetail' }, ` ${detail}`))
    : h('span', { class: 'mname' }, t('chooseModel')), svg(ICON.chevron, 12));
  return btn;
}

function chipsOf(list, onRemove, addLabel, onAdd) {
  const wrap = h('div', { class: 'chips' },
    ...list.map((text, i) => h('span', { class: 'chip' }, text, h('button', { class: 'x', type: 'button', 'aria-label': t('removeItem', { text }), onclick: () => { onRemove(i); render(); } }, svg(ICON.x, 12)))),
    h('button', { class: 'chip add', type: 'button', onclick: (e) => {
      const input = h('input', { 'aria-label': addLabel, placeholder: t('pressEnter') });
      let done = false;
      const commit = () => { if (done) return; done = true; const v = input.value.trim(); if (v) onAdd(v); render(); };
      input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); commit(); } if (ev.key === 'Escape') { done = true; render(); } });
      input.addEventListener('blur', commit);
      e.currentTarget.replaceWith(h('span', { class: 'chip' }, input));
      input.focus();
    } }, svg(ICON.plus, 12), addLabel));
  return wrap;
}

async function changeRule(id, change) {
  const rule = cfg.rules.find((r) => r.id === id);
  if (!rule) { render(); return; }
  change(rule);
  await save();
  render();
}

const sectionLabel = (point, text) => `${point.label()}: ${text}`;
const conditionLabel = (point, n) => sectionLabel(point, t('conditionLabel', { n }));

function ruleCriteriaEditor(rule, start) {
  const rType = rule.type || 'noul';
  if (rType === 'choice') {
    const entries = Object.entries(rule.criteria && typeof rule.criteria === 'object' && !Array.isArray(rule.criteria) ? rule.criteria : {});
    return h('div', { class: 'crit' },
      ...entries.map(([optKey, desc], idx) => h('div', { class: 'crit-row' },
        h('input', {
          class: 'pill small key', value: optKey, placeholder: t('phOptionKey'),
          onchange: (e) => {
            const nextKey = e.target.value.trim();
            if (!nextKey || nextKey === optKey) return;
            changeRule(rule.id, (r) => {
              const nextCrit = {};
              for (const [k, v] of Object.entries(r.criteria || {})) {
                nextCrit[k === optKey ? nextKey : k] = v;
              }
              r.criteria = nextCrit;
              if (r.optionRoutes?.[optKey]) { r.optionRoutes[nextKey] = r.optionRoutes[optKey]; delete r.optionRoutes[optKey]; }
              if (r.targetOption === optKey) r.targetOption = nextKey;
            });
          },
        }),
        h('input', {
          class: 'pill small desc', value: desc, placeholder: t('phOptionDesc'),
          onchange: (e) => changeRule(rule.id, (r) => { r.criteria ||= {}; r.criteria[optKey] = e.target.value; }),
        }),
        start ? modelButton(rule.optionRoutes?.[optKey], `${optKey} route`, (route) => changeRule(rule.id, (r) => { r.optionRoutes ||= {}; r.optionRoutes[optKey] = route; })) : null,
        h('button', {
          class: 'ib', type: 'button', disabled: entries.length <= 2, 'aria-label': t('removeItem', { text: optKey }),
          onclick: () => changeRule(rule.id, (r) => { if (r.criteria) delete r.criteria[optKey]; if (r.optionRoutes) delete r.optionRoutes[optKey]; }),
        }, svg(ICON.x, 12)))),
      h('div', { class: 'crit-row' },
        h('button', {
          class: 'chip add', type: 'button',
          onclick: () => changeRule(rule.id, (r) => {
            r.criteria ||= {};
            let k = `option_${Object.keys(r.criteria).length + 1}`;
            while (r.criteria[k] !== undefined) k += '_x';
            r.criteria[k] = '';
          }),
        }, svg(ICON.plus, 12), t('addOption')),
        !start ? h('span', { class: 'hint' }, t('targetOptionLabel')) : null,
        !start ? select([['', t('anyOption')], ...entries.map(([k]) => [k, k])], rule.targetOption || '', (v) => changeRule(rule.id, (r) => { if (v) r.targetOption = v; else delete r.targetOption; }), t('targetOptionLabel'), 'small') : null));
  }
  if (rType === 'score') {
    const levels = Array.isArray(rule.criteria) ? rule.criteria : [];
    return h('div', { class: 'crit' },
      ...levels.map((lvl, idx) => h('div', { class: 'crit-row' },
        h('span', { class: 'hint', style: 'min-width:18px' }, `${idx}:`),
        h('input', {
          class: 'pill small desc', value: lvl, placeholder: t('phLevelDesc', { n: idx }),
          onchange: (e) => changeRule(rule.id, (r) => { if (!Array.isArray(r.criteria)) r.criteria = []; r.criteria[idx] = e.target.value; }),
        }),
        h('button', {
          class: 'ib', type: 'button', disabled: levels.length <= 2, 'aria-label': t('removeItem', { text: lvl || String(idx) }),
          onclick: () => changeRule(rule.id, (r) => { if (Array.isArray(r.criteria)) r.criteria.splice(idx, 1); }),
        }, svg(ICON.x, 12)))),
      h('div', { class: 'crit-row' },
        h('button', {
          class: 'chip add', type: 'button',
          onclick: () => changeRule(rule.id, (r) => { if (!Array.isArray(r.criteria)) r.criteria = []; r.criteria.push(`Level ${r.criteria.length}`); }),
        }, svg(ICON.plus, 12), t('addLevel')),
        h('span', { class: 'hint' }, t('minScoreLabel')),
        h('input', {
          class: 'pill small xs', type: 'number', step: '0.1', min: '0', max: String(Math.max(1, levels.length - 1)),
          value: typeof rule.minScore === 'number' ? String(rule.minScore) : '',
          placeholder: 'auto',
          onchange: (e) => changeRule(rule.id, (r) => {
            const v = e.target.value.trim();
            if (!v) delete r.minScore;
            else if (!Number.isNaN(Number(v))) r.minScore = Number(v);
          }),
        })));
  }
  return null;
}

function ruleRow(rule, index, point) {
  const start = point.id === 'will-start-task';
  const n = index + 1;
  const rType = rule.type || 'noul';
  const condition = h('input', {
    class: 'pill grow', value: rule.question || '', 'aria-label': conditionLabel(point, n),
    placeholder: start ? t('phCondition') : t('phRunCondition'),
    oninput: (e) => { const r = cfg.rules.find((x) => x.id === rule.id); if (r) r.question = e.target.value; },
    onchange: (e) => changeRule(rule.id, (r) => { r.question = e.target.value.trim(); }),
  });
  const typeSel = select([['noul', t('typeNoul')], ['choice', t('typeChoice')], ['score', t('typeScore')]], rType, (nextType) => {
    changeRule(rule.id, (r) => {
      r.type = nextType;
      if (nextType === 'choice' && (!r.criteria || Array.isArray(r.criteria) || Object.keys(r.criteria).length < 2)) {
        r.criteria = { option_a: 'First option', option_b: 'Second option' };
      } else if (nextType === 'score' && (!Array.isArray(r.criteria) || r.criteria.length < 2)) {
        r.criteria = ['Low', 'Medium', 'High'];
      } else if (nextType === 'noul' && (Array.isArray(r.criteria) || (r.criteria && !r.criteria.true_description && !r.criteria.false_description))) {
        delete r.criteria;
      }
    });
  }, sectionLabel(point, `${t('ruleTypeLabel')} ${n}`), 'small');

  const moveUp = () => {
    const rows = cfg.rules.filter((r) => r.point === point.id);
    const at = rows.findIndex((r) => r.id === rule.id);
    if (at > 0) {
      const from = cfg.rules.indexOf(rows[at]);
      const to = cfg.rules.indexOf(rows[at - 1]);
      cfg.rules.splice(from, 1);
      cfg.rules.splice(to, 0, rows[at]);
    }
    save().then(render);
  };
  return h('div', { class: `rule ${rule.enabled === false ? 'off' : ''}` },
    h('div', { class: 'rr' },
      toggle(rule.enabled !== false, sectionLabel(point, `${t('enableRule')} ${n}`), () => changeRule(rule.id, (r) => { r.enabled = r.enabled === false; })),
      h('span', { class: 'w' }, t('ifWord')),
      typeSel,
      condition,
      h('span', { class: 'w' }, start ? t('useWord') : ''),
      start
        ? modelButton(rule.route, sectionLabel(point, t('modelFor', { n })), (route) => changeRule(rule.id, (r) => { r.route = route; }))
        : h('span', { class: 'sd skip' }, t('skipRun')),
      h('button', { class: 'ib', type: 'button', disabled: index === 0, 'aria-label': sectionLabel(point, t('moveUp', { n })), onclick: moveUp }, svg(ICON.up, 14)),
      h('button', { class: 'ib', type: 'button', 'aria-label': sectionLabel(point, t('deleteRule', { n })), onclick: () => { cfg.rules = cfg.rules.filter((r) => r.id !== rule.id); save().then(render); } }, svg(ICON.trash, 14))),
    ruleCriteriaEditor(rule, start),
    start ? null : h('div', { class: 'kw' }, h('span', { class: 'hint' }, t('keywordHint')),
      chipsOf(rule.keywords || [], (i) => { const word = rule.keywords[i]; changeRule(rule.id, (r) => { r.keywords = (r.keywords || []).filter((k) => k !== word); }); }, t('addKeyword'),
        (k) => changeRule(rule.id, (r) => { r.keywords ||= []; if (!r.keywords.includes(k)) r.keywords.push(k); }))),
    cfg.lastByRule?.[rule.id] ? h('p', { class: 'meta last' }, lastLine(rule)) : null);
}

async function runTry(point) {
  const text = (tryTexts[point] || '').trim();
  const mediaList = (tryMedias[point] || []).map((m) => (m.uri ? { uri: m.uri, ...(m.mime_type ? { mime_type: m.mime_type } : {}) } : { type: m.type, mime_type: m.mime_type, data: m.data, ...(m.resolution ? { resolution: m.resolution } : {}) }));
  if (!text && mediaList.length === 0) return;
  const run = (tryRuns[point] || 0) + 1;
  tryRuns[point] = run;
  tryStates[point] = { busy: true }; render();
  try {
    const res = await ask('try', { point, text: text || '(multimodal input)', media: mediaList, config: cfg });
    if (run !== tryRuns[point]) return;
    tryStates[point] = { result: res.result };
  } catch (error) {
    if (run !== tryRuns[point]) return;
    tryStates[point] = { error: error.message };
  }
  render();
}

function tryBox(point) {
  const state = tryStates[point.id];
  tryMedias[point.id] ||= [];
  let line = null;
  if (state?.busy) line = h('p', { class: 'res' }, t('judging'));
  else if (state?.error) line = h('p', { class: 'res err' }, state.error);
  else if (state?.result) {
    const r = state.result;
    const sec = r.ms ? t('seconds', { n: (r.ms / 1000).toFixed(1) }) : '';
    line = h('p', { class: 'res' }, svg(ICON.check, 14), r.action === 'allow' ? t('noChange', { why: r.why || t('noConclusion'), sec }) : `${r.summary || r.reason}${sec}`);
  }
  return h('div', { class: 'try' },
    h('div', { class: 'line' },
      h('input', { class: 'pill grow', value: tryTexts[point.id] || '', 'aria-label': sectionLabel(point, t('tryLabel')),
        placeholder: point.id === 'will-start-task' ? t('phTryStart') : t('phTryRun'), oninput: (e) => { tryTexts[point.id] = e.target.value; } }),
      h('button', { class: 'btn', type: 'button', disabled: !!state?.busy, onclick: () => runTry(point.id) }, svg(ICON.play, 14), t('tryIt'))),
    mediaAttachmentBar(tryMedias[point.id], render),
    line);
}

function rulesSection() {
  const threshold = typeof cfg.threshold === 'number' ? cfg.threshold : 0.6;
  const sec = h('section', { class: 'sec' });
  if (pickerError) sec.append(h('p', { class: 'res err' }, pickerError));
  for (const point of POINTS) {
    const start = point.id === 'will-start-task';
    const list = cfg.rules.filter((r) => r.point === point.id);
    sec.append(h('div', { class: 'glabel' }, h('b', {}, point.label()), h('span', {}, point.hint())));
    const group = h('div', { class: 'group' }, ...list.map((rule, i) => ruleRow(rule, i, point)));
    if (start) {
      group.append(h('div', { class: 'rule base' }, h('div', { class: 'rr other' },
        h('span', { class: 'lab' }, t('otherwise')), h('span', { class: 'w' }, t('useWord')),
        modelButton(cfg.fallback, t('fallbackLabel'), async (route) => { cfg.fallback = route; await save(); render(); }))));
    }
    if (group.childElementCount) sec.append(group);
    sec.append(h('div', { class: 'line addline' }, h('button', { class: 'btn', type: 'button', onclick: async () => {
      cfg.rules.push({ id: newId(), point: point.id, enabled: true, type: 'noul', question: '' });
      render();
      root.querySelector(`[aria-label="${CSS.escape(conditionLabel(point, list.length + 1))}"]`)?.focus();
    } }, svg(ICON.plus, 14), t('addCondition'))));
    if (start && !cfg.fallback) sec.append(h('p', { class: 'hint' }, t('fallbackNeeded')));
    if (start || list.length) sec.append(tryBox(point));
  }
  sec.append(h('p', { class: 'hint line thr' }, t('belowA'), select(THRESHOLDS.map((v) => [String(v), pct(v)]), String(threshold), (v) => { cfg.threshold = Number(v); save().then(render); }, t('thresholdLabel'), 'small'), t('belowB')));
  sec.append(h('div', { class: 'tip' }, svg(ICON.wand, 16),
    h('p', { class: 'sd' }, t('tipA'), ' ', h('q', {}, t('tipQuote')), ' ', t('tipB'))));
  return sec;
}

async function runEvalPlayground() {
  const inputBlocks = [];
  if (evalInputText.trim()) inputBlocks.push({ type: 'text', text: evalInputText });
  for (const m of evalMedias) {
    inputBlocks.push(m.uri ? { uri: m.uri, ...(m.mime_type ? { mime_type: m.mime_type } : {}) } : { type: m.type, mime_type: m.mime_type, data: m.data, ...(m.resolution ? { resolution: m.resolution } : {}) });
  }
  if (!inputBlocks.length || !evalQInstr.trim()) return;
  const q = { type: evalQType, instructions: evalQInstr.trim() };
  if (evalQType === 'choice') q.criteria = Object.fromEntries(evalChoiceOpts.filter((o) => o.key.trim()).map((o) => [o.key.trim(), o.desc || '']));
  if (evalQType === 'score') q.criteria = evalScoreLvls.filter((s) => s.trim());
  evalState = { busy: true }; render();
  try {
    const res = await ask('evaluate', { input: inputBlocks.length === 1 && inputBlocks[0].type === 'text' ? inputBlocks[0].text : inputBlocks, questions: { q1: q }, config: cfg });
    evalState = { result: res.result };
  } catch (error) {
    evalState = { error: error.message };
  }
  render();
}

function evalSection() {
  const sec = h('section', { class: 'sec' },
    h('div', { class: 'sh' },
      h('div', {}, h('p', { class: 'st' }, t('evalTitle')), h('p', { class: 'sd' }, t('evalDesc'))),
      h('button', { class: 'btn', type: 'button', onclick: () => { evalOpen = !evalOpen; render(); } }, evalOpen ? t('evalToggleClose') : t('evalToggleOpen'))));
  if (!evalOpen) return sec;
  const box = h('div', { class: 'group' },
    h('div', { class: 'rule' },
      h('p', { class: 'hint', style: 'margin-bottom:6px' }, t('evalInputLabel')),
      h('textarea', { class: 'area', placeholder: t('evalInputPh'), value: evalInputText, oninput: (e) => { evalInputText = e.target.value; } }),
      mediaAttachmentBar(evalMedias, render)),
    h('div', { class: 'rule' },
      h('div', { class: 'line' },
        select([['noul', t('typeNoul')], ['choice', t('typeChoice')], ['score', t('typeScore')]], evalQType, (v) => { evalQType = v; render(); }, t('ruleTypeLabel'), 'small'),
        h('input', { class: 'pill grow', value: evalQInstr, placeholder: t('evalQuestionPh'), 'aria-label': t('evalQuestionLabel'), oninput: (e) => { evalQInstr = e.target.value; } }),
        h('button', { class: 'btn cta', type: 'button', disabled: !!evalState?.busy, onclick: runEvalPlayground }, svg(ICON.play, 14), t('evalRun'))),
      evalQType === 'choice' ? h('div', { class: 'crit', style: 'margin-left:0' },
        ...evalChoiceOpts.map((opt, idx) => h('div', { class: 'crit-row' },
          h('input', { class: 'pill small key', value: opt.key, placeholder: t('phOptionKey'), oninput: (e) => { opt.key = e.target.value; } }),
          h('input', { class: 'pill small desc', value: opt.desc, placeholder: t('phOptionDesc'), oninput: (e) => { opt.desc = e.target.value; } }),
          h('button', { class: 'ib', type: 'button', disabled: evalChoiceOpts.length <= 2, onclick: () => { evalChoiceOpts.splice(idx, 1); render(); } }, svg(ICON.x, 12)))),
        h('button', { class: 'chip add', type: 'button', style: 'align-self:flex-start', onclick: () => { evalChoiceOpts.push({ key: `opt_${evalChoiceOpts.length + 1}`, desc: '' }); render(); } }, svg(ICON.plus, 12), t('addOption'))) : null,
      evalQType === 'score' ? h('div', { class: 'crit', style: 'margin-left:0' },
        ...evalScoreLvls.map((lvl, idx) => h('div', { class: 'crit-row' },
          h('span', { class: 'hint', style: 'min-width:18px' }, `${idx}:`),
          h('input', { class: 'pill small desc', value: lvl, placeholder: t('phLevelDesc', { n: idx }), oninput: (e) => { evalScoreLvls[idx] = e.target.value; } }),
          h('button', { class: 'ib', type: 'button', disabled: evalScoreLvls.length <= 2, onclick: () => { evalScoreLvls.splice(idx, 1); render(); } }, svg(ICON.x, 12)))),
        h('button', { class: 'chip add', type: 'button', style: 'align-self:flex-start', onclick: () => { evalScoreLvls.push(`Level ${evalScoreLvls.length}`); render(); } }, svg(ICON.plus, 12), t('addLevel'))) : null,
      evalState?.busy ? h('p', { class: 'res' }, t('judging')) : null,
      evalState?.error ? h('p', { class: 'res err' }, evalState.error) : null,
      evalState?.result ? h('pre', { class: 'eval-out' }, JSON.stringify(evalState.result, null, 2)) : null));
  sec.append(box);
  return sec;
}

function render() {
  closeModelMenu();
  const active = document.activeElement;
  const focused = active?.getAttribute('aria-label');
  const caret = active?.tagName === 'INPUT' && active.type === 'text' ? [active.selectionStart, active.selectionEnd] : null;
  if (!loaded) {
    root.replaceChildren(h('p', { class: 'res err' }, storeError), h('button', { class: 'btn', type: 'button', onclick: boot }, t('storeRetry')));
    return;
  }
  root.replaceChildren(...(storeError ? [h('p', { class: 'res err' }, storeError)] : []), judgeSection(), rulesSection(), evalSection());
  if (focused) {
    const next = root.querySelector(`[aria-label="${CSS.escape(focused)}"]`);
    next?.focus();
    if (caret && next?.tagName === 'INPUT') next.setSelectionRange(...caret);
  }
}

async function loadSecrets() {
  const list = await fetch('/secrets').then((r) => r.json()).catch(() => []);
  secrets = Object.fromEntries(list.map((s) => [s.key, s.saved]));
}
async function loadJevModels() {
  if (jevModels || !secrets[PROVIDERS.jev.key]) return;
  try { jevModels = (await ask('jev-models', {}, 15000)).models; if (editingJudge) render(); } catch { jevModels = null; }
}
async function loadModels() {
  const body = await fetch('/agent-models').then((r) => r.json()).catch(() => ({ ok: false }));
  supportsRemoteRoutes = body.ok && body.supportsRemoteRoutes === true;
  if (!body.ok) { models = []; return; }
  const remote = await Promise.all((body.supportsRemoteRoutes ? body.locations || [] : []).map(async (location) => {
    const controller = new AbortController();
    let timer;
    try {
      const catalog = await Promise.race([
        fetch(`/agent-models?agent_device_id=${encodeURIComponent(location.agentDeviceId)}`, { signal: controller.signal }).then((r) => r.json()),
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
  const localModels = Array.isArray(body.models) ? body.models : [];
  const hasAcp = localModels.some((m) => (AGENT_KIND[m.agent] || m.agent) === 'acp');
  const acpFallback = hasAcp ? [] : ACP_FALLBACK_MODELS.map((m) => ({ ...m, agent: 'acp', providerId: DEFAULT_ACP_PROVIDER_ID, providerName: 'Antigravity' }));
  models = [...localModels, ...acpFallback, ...remote.flat()];
}

channel.addEventListener('message', async ({ data }) => {
  if (data?.from !== 'brain' || data.type !== 'config-changed') return;
  let raw, seen;
  do {
    seen = saves;
    raw = await readStore().catch(() => null);
    if (!raw) return;
  } while (seen !== saves);
  const latest = withRules(raw);
  cfg = mergeChanges(JSON.parse(stored), cfg, latest);
  stored = JSON.stringify(latest);
  if (loaded && document.activeElement?.tagName !== 'INPUT') render();
});

async function boot() {
  await loadLocale();
  let raw;
  try {
    [raw] = await Promise.all([readStore(), loadSecrets(), loadModels()]);
  } catch (error) {
    storeError = t('storeLoadFailed', { error: error && error.message });
    render();
    return;
  }
  cfg = withRules(raw);
  stored = JSON.stringify(cfg);
  loaded = true;
  storeError = '';
  if (!cfg.provider) {
    cfg.provider = secrets.gemini_api_key ? 'gemini' : (secrets.openai_api_key || !secrets.typesafe_api_key ? 'openai' : 'jev');
    await save();
  }
  render();
  publishModels();
  if (providerId() === 'jev') loadJevModels();
}
boot();
