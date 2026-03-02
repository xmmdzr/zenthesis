import { requestDeepSeekChat } from "@/lib/ai/deepseek-provider";
import type {
  AutoCompleteRequestPayload,
  ConversationMessage,
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
  suggestion: string;
  _meta: AiChatMeta;
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
      model,
      baseUrl,
    },
  };
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

export async function aiAutocomplete(payload: AutoCompleteRequestPayload): Promise<AiAutocompleteResponse> {
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  const settingsBlock = formatAutoCompleteSettings(payload.settings);
  const prompt = [
    "Task: write exactly one next sentence for an academic document.",
    "Requirements: keep coherent with current section, no markdown bullets, output plain sentence only.",
    `Document title: ${payload.title || "Untitled"}`,
    `Document ID: ${payload.docId}`,
    payload.cursorContext ? `Recent cursor context:\n${payload.cursorContext}` : "",
    `Current draft full text:\n${payload.content}`,
    `Auto-complete constraints:\n${settingsBlock}`,
    payload.retryFrom
      ? `Retry instruction: previous suggestion was "${payload.retryFrom}". Generate a different expression.`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const providerResult = await requestDeepSeekChat({
    prompt,
    useWeb: payload.settings.useWeb,
    useLibrary: payload.settings.useLibrary,
  });

  const usingFallback = !providerResult.text;
  return {
    suggestion:
      providerResult.text ||
      "该主题还可以从方法、证据与结论衔接三个层面进一步展开，以提升论证的完整性。",
    _meta: {
      usedFallback: usingFallback,
      providerReason: providerResult.reason,
      status: providerResult.status,
      upstreamMessage: providerResult.upstreamMessage,
      model,
      baseUrl,
    },
  };
}
