import { requestDeepSeekChat } from "@/lib/ai/deepseek-provider";
import {
  buildSmartOutlineContent,
  contentJsonToPlainText,
  inferSmartInputIntent,
  normalizeDocCreationSettings,
  parseSmartOutlineResult,
} from "@/lib/doc-bootstrap";
import type {
  AutoCompleteRequestPayload,
  ConversationMessage,
  DocCreationSettings,
  LibraryItem,
} from "@/lib/types";

interface PromptRequest {
  prompt: string;
  useWeb?: boolean;
  useLibrary?: boolean;
  useCurrentDoc?: boolean;
  contextDocId?: string;
  conversationHistory?: ConversationMessage[];
  currentDocument?: {
    id: string;
    title: string;
    content: string;
  } | null;
  attachments?: LibraryItem[];
}

interface AiChatMeta {
  usedFallback: boolean;
  providerReason: string;
  status?: number;
  upstreamMessage?: string;
  attempts?: number;
  keySlotUsed?: string;
  lastReason?: string;
  lastStatus?: number;
  model: string;
  baseUrl: string;
}

interface AiChatResponse {
  response: string;
  suggestions: string[];
  toolContext: {
    useWeb: boolean;
    useLibrary: boolean;
  };
  _meta: AiChatMeta;
}

interface AiAutocompleteResponse {
  suggestion: string | null;
  _meta: AiChatMeta;
  error?: string;
}

interface AiHealthResponse {
  configured: boolean;
  reachable: boolean;
  model: string;
  baseUrl: string;
  reason: string;
  attempts: number;
  activeKeySlot: string | null;
}

interface SmartOutlineRequest {
  input: string;
  settings?: Partial<DocCreationSettings> | null;
}

interface SmartOutlineResponse {
  title: string;
  contentJson: Record<string, unknown>;
  content: string;
  _meta: AiChatMeta;
  error?: string;
}

function formatConversationHistory(messages: ConversationMessage[] | undefined) {
  if (!messages || messages.length === 0) {
    return "";
  }

  return messages
    .slice(-20)
    .map((message, index) => {
      const role = message.role === "assistant" ? "Assistant" : "User";
      return `#${index + 1} ${role}: ${message.content}`;
    })
    .join("\n");
}

function formatAttachments(items: LibraryItem[] | undefined) {
  if (!items || items.length === 0) {
    return "";
  }

  return items
    .map((item, index) => `#${index + 1} [${item.sourceType.toUpperCase()}] ${item.title}`)
    .join("\n");
}

export async function aiChat({
  prompt,
  useWeb = false,
  useLibrary = false,
  useCurrentDoc = false,
  contextDocId,
  conversationHistory,
  currentDocument,
  attachments,
}: PromptRequest): Promise<AiChatResponse> {
  const suffix = contextDocId ? ` (context document: ${contextDocId})` : "";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  const historyBlock = formatConversationHistory(conversationHistory);
  const attachmentBlock = formatAttachments(attachments);
  const includeCurrentDoc = Boolean(useCurrentDoc && currentDocument);
  const docBlock = includeCurrentDoc
    ? `Current Document\nTitle: ${currentDocument?.title || "Untitled"}\nDoc ID: ${currentDocument?.id}\nFull Content:\n${currentDocument?.content || ""}`
    : "";
  const modelPrompt = [
    "Task: assist with academic writing in concise, actionable Chinese output by default.",
    historyBlock ? `Conversation History\n${historyBlock}` : "",
    docBlock,
    attachmentBlock ? `Linked Attachments\n${attachmentBlock}` : "",
    `User Request\n${prompt}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const providerResult = await requestDeepSeekChat({
    prompt: modelPrompt,
    useWeb,
    useLibrary,
    contextDocId,
  });

  const usingFallback = !providerResult.text;

  return {
    response:
      providerResult.text ||
      `这里是针对你论文问题的建议方向：${prompt.slice(0, 180)}${suffix}（当前为本地降级响应，请配置 DEEPSEEK_API_KEY 启用真实模型）`,
    suggestions: [
      "扩展为 5 节论文大纲",
      "增强核心论点与研究缺口表达",
      "生成证据导向的段落草稿",
    ],
    toolContext: {
      useWeb,
      useLibrary,
    },
    _meta: {
      usedFallback: usingFallback,
      providerReason: providerResult.reason,
      status: providerResult.status,
      upstreamMessage: providerResult.upstreamMessage,
      attempts: providerResult.attempts,
      keySlotUsed: providerResult.keySlotUsed,
      lastReason: providerResult.lastReason,
      lastStatus: providerResult.lastStatus,
      model,
      baseUrl,
    },
  };
}

function providerReasonToMessage(reason: string, upstreamMessage?: string) {
  if (reason === "missing_key") {
    return "未配置 DEEPSEEK_API_KEY";
  }
  if (reason === "timeout") {
    return "DeepSeek 响应超时，请稍后重试";
  }
  if (reason === "upstream_non_2xx") {
    if (upstreamMessage && /auth|unauthorized|forbidden|invalid api key|api key/i.test(upstreamMessage)) {
      return "DeepSeek 鉴权失败，请检查 API Key";
    }
    return "DeepSeek 上游返回异常状态";
  }
  if (reason === "network_error") {
    return "连接 DeepSeek 失败，请检查网络或网关配置";
  }
  if (reason === "empty_content") {
    return "DeepSeek 未返回有效文本";
  }
  return "未知模型错误";
}

export async function aiRewrite({ prompt }: PromptRequest) {
  return {
    rewritten: `Rewritten draft: ${prompt.slice(0, 220)}`,
  };
}

export async function aiContinue({ prompt }: PromptRequest) {
  return {
    continued: `Continuation: ${prompt.slice(0, 220)} ... Additionally, this section can connect empirical findings with policy implications.`,
  };
}

export async function aiSummarize({ prompt }: PromptRequest) {
  return {
    summary: `Summary: ${prompt.slice(0, 160)}`,
  };
}

export async function aiOutline({ prompt }: PromptRequest) {
  return {
    outline: [
      `1. Research Context: ${prompt.slice(0, 60)}`,
      "2. Problem Statement and Gap",
      "3. Methodology and Scope",
      "4. Findings and Discussion",
      "5. Conclusion and Future Work",
    ],
  };
}

function formatAutoCompleteSettings(settings: AutoCompleteRequestPayload["settings"]) {
  const effectiveSourceLine = `Effective source constraints: web=${settings.useWeb}, library=${settings.useLibrary}`;
  return [
    effectiveSourceLine,
    `Use web sources: ${settings.useWeb}`,
    `Use library sources: ${settings.useLibrary}`,
    `Year preset: ${settings.yearPreset}`,
    `Year min: ${settings.yearMin ?? "none"}`,
    `Year max: ${settings.yearMax ?? "none"}`,
    `Impact preset: ${settings.impactPreset}`,
    `Impact min: ${settings.impactMin ?? "none"}`,
    `Impact max: ${settings.impactMax ?? "none"}`,
  ].join("\n");
}

function formatDocSettings(settings?: AutoCompleteRequestPayload["docSettings"]) {
  if (!settings) {
    return "Document-level creation settings: none";
  }

  return [
    `Creation settings useWeb: ${settings.useWeb}`,
    `Creation settings useLibrary: ${settings.useLibrary}`,
    `Creation settings yearPreset: ${settings.yearPreset}`,
    `Creation settings yearMin: ${settings.yearMin ?? "none"}`,
    `Creation settings yearMax: ${settings.yearMax ?? "none"}`,
    `Creation settings impactPreset: ${settings.impactPreset}`,
    `Creation settings citationStyle: ${settings.citationStyle}`,
    `Creation settings showCitationPage: ${settings.showCitationPage}`,
  ].join("\n");
}

function buildDocExcerpt(content: string, max = 1600) {
  const trimmed = content.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max)}\n...`;
}

function tokenList(input: string) {
  return Array.from(
    new Set(
      input
        .split(/[\s，。！？、,.!?;；:：()（）《》“”"'-]+/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 2),
    ),
  );
}

function cjkCoverage(seed: string, text: string) {
  const chars = Array.from(
    new Set((seed.match(/[\u4e00-\u9fff]/g) ?? []).filter(Boolean)),
  );
  if (chars.length === 0) {
    return 1;
  }

  const hit = chars.filter((ch) => text.includes(ch)).length;
  return hit / chars.length;
}

function isSuggestionRelevant(payload: AutoCompleteRequestPayload, suggestion: string) {
  const baseline = `${payload.title} ${payload.sectionTitle || ""}`.trim();
  if (!baseline) {
    return true;
  }

  const normalizedSuggestion = suggestion.toLowerCase();
  const tokens = tokenList(baseline.toLowerCase());
  const tokenHit = tokens.some((token) => normalizedSuggestion.includes(token));
  const coverage = cjkCoverage(baseline, suggestion);
  return tokenHit || coverage >= 0.22;
}

function buildAutocompletePrompt(payload: AutoCompleteRequestPayload, forceKeyword = false) {
  const settingsBlock = formatAutoCompleteSettings(payload.settings);
  const docSettingsBlock = formatDocSettings(payload.docSettings);
  const excerpt = buildDocExcerpt(payload.content);
  const keywordLine = forceKeyword
    ? `Hard keyword constraint: output must semantically stay on topic of "${payload.title}" and section "${payload.sectionTitle || "当前段落"}".`
    : "";

  return [
    "Task: write exactly one next sentence for an academic document.",
    "Output rules:",
    "1) Return only one plain sentence in the same language as the draft.",
    "2) Must continue the immediate context, no topic switching.",
    "3) No markdown, no list, no heading label.",
    keywordLine,
    `Document title: ${payload.title || "Untitled"}`,
    payload.sectionTitle ? `Current section title: ${payload.sectionTitle}` : "",
    `Document ID: ${payload.docId}`,
    payload.cursorContext ? `Cursor context:\n${payload.cursorContext}` : "",
    `Document excerpt:\n${excerpt}`,
    `Auto-complete constraints:\n${settingsBlock}`,
    docSettingsBlock,
    payload.retryFrom
      ? `Retry instruction: previous suggestion was "${payload.retryFrom}". Generate a different expression.`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function aiAutocomplete(payload: AutoCompleteRequestPayload): Promise<AiAutocompleteResponse> {
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  const prompt = buildAutocompletePrompt(payload);

  const providerResult = await requestDeepSeekChat({
    prompt,
    useWeb: payload.settings.useWeb,
    useLibrary: payload.settings.useLibrary,
  });

  if (!providerResult.text) {
    return {
      suggestion: null,
      error: providerReasonToMessage(providerResult.reason, providerResult.upstreamMessage),
      _meta: {
        usedFallback: true,
        providerReason: providerResult.reason,
        status: providerResult.status,
        upstreamMessage: providerResult.upstreamMessage,
        attempts: providerResult.attempts,
        keySlotUsed: providerResult.keySlotUsed,
        lastReason: providerResult.lastReason,
        lastStatus: providerResult.lastStatus,
        model,
        baseUrl,
      },
    };
  }

  let suggestion = providerResult.text.trim();
  let retryMeta = providerResult;
  if (!isSuggestionRelevant(payload, suggestion)) {
    const retryPrompt = buildAutocompletePrompt(payload, true);
    retryMeta = await requestDeepSeekChat({
      prompt: retryPrompt,
      useWeb: payload.settings.useWeb,
      useLibrary: payload.settings.useLibrary,
    });
    if (retryMeta.text?.trim()) {
      suggestion = retryMeta.text.trim();
    }
  }

  return {
    suggestion: suggestion || null,
    error: suggestion ? undefined : "模型未生成有效补全文本",
    _meta: {
      usedFallback: !Boolean(suggestion),
      providerReason: retryMeta.reason,
      status: retryMeta.status,
      upstreamMessage: retryMeta.upstreamMessage,
      attempts: retryMeta.attempts,
      keySlotUsed: retryMeta.keySlotUsed,
      lastReason: retryMeta.lastReason,
      lastStatus: retryMeta.lastStatus,
      model,
      baseUrl,
    },
  };
}

export async function aiHealthCheck(): Promise<AiHealthResponse> {
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";

  const result = await requestDeepSeekChat({
    prompt: "Health check: reply with OK.",
    useWeb: false,
    useLibrary: false,
    timeoutMs: 6000,
    systemPrompt: "Return exactly: OK",
  });

  const configured = result.reason !== "missing_key";

  return {
    configured,
    reachable: Boolean(result.text),
    model,
    baseUrl,
    reason: result.reason,
    attempts: result.attempts,
    activeKeySlot: result.keySlotUsed || null,
  };
}

function formatCreationSettings(settings: DocCreationSettings) {
  return [
    `useWeb=${settings.useWeb}`,
    `useLibrary=${settings.useLibrary}`,
    `yearPreset=${settings.yearPreset}`,
    `yearMin=${settings.yearMin ?? "none"}`,
    `yearMax=${settings.yearMax ?? "none"}`,
    `impactPreset=${settings.impactPreset}`,
    `citationStyle=${settings.citationStyle}`,
    `showCitationPage=${settings.showCitationPage}`,
  ].join("\n");
}

export async function aiGenerateSmartOutline({
  input,
  settings,
}: SmartOutlineRequest): Promise<SmartOutlineResponse> {
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  const normalizedSettings = normalizeDocCreationSettings(settings);
  const intent = inferSmartInputIntent(input);

  const prompt = [
    "You are an academic writing planner.",
    "Return strict JSON only with shape:",
    '{"title":"string","introParagraph":"string","sections":[{"heading":"string","subheadings":["string"]}]}',
    "Requirements:",
    "- At least 5 H2 sections.",
    "- Each H2 must include 2-4 H3 subheadings.",
    "- Keep structure logically progressive and tightly related to topic.",
    "- Use Chinese output if user input is Chinese.",
    "- Avoid generic headings like '内容一/内容二'.",
    intent.providedTitle ? `User provided title: ${intent.providedTitle}` : "",
    `User context:\n${intent.context}`,
    `Creation constraints:\n${formatCreationSettings(normalizedSettings)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const provider = await requestDeepSeekChat({
    prompt,
    useWeb: normalizedSettings.useWeb,
    useLibrary: normalizedSettings.useLibrary,
  });

  if (!provider.text) {
    return {
      title: intent.providedTitle || "未命名",
      contentJson: {
        type: "doc",
        content: [],
      },
      content: "",
      error: providerReasonToMessage(provider.reason, provider.upstreamMessage),
      _meta: {
        usedFallback: true,
        providerReason: provider.reason,
        status: provider.status,
        upstreamMessage: provider.upstreamMessage,
        attempts: provider.attempts,
        keySlotUsed: provider.keySlotUsed,
        lastReason: provider.lastReason,
        lastStatus: provider.lastStatus,
        model,
        baseUrl,
      },
    };
  }

  const parsed = parseSmartOutlineResult(provider.text);
  if (!parsed) {
    return {
      title: intent.providedTitle || "未命名",
      contentJson: {
        type: "doc",
        content: [],
      },
      content: "",
      error: "模型输出无法解析为结构化大纲，请重试。",
      _meta: {
        usedFallback: true,
        providerReason: "empty_content",
        status: provider.status,
        upstreamMessage: provider.upstreamMessage,
        attempts: provider.attempts,
        keySlotUsed: provider.keySlotUsed,
        lastReason: provider.lastReason,
        lastStatus: provider.lastStatus,
        model,
        baseUrl,
      },
    };
  }

  if (intent.providedTitle) {
    parsed.title = intent.providedTitle;
  }

  const contentJson = buildSmartOutlineContent(parsed);
  const content = contentJsonToPlainText(contentJson);

  return {
    title: parsed.title,
    contentJson,
    content,
    _meta: {
      usedFallback: false,
      providerReason: provider.reason,
      status: provider.status,
      upstreamMessage: provider.upstreamMessage,
      attempts: provider.attempts,
      keySlotUsed: provider.keySlotUsed,
      lastReason: provider.lastReason,
      lastStatus: provider.lastStatus,
      model,
      baseUrl,
    },
  };
}
