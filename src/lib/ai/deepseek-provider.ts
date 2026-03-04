interface DeepSeekChatParams {
  prompt: string;
  useWeb: boolean;
  useLibrary: boolean;
  contextDocId?: string;
  timeoutMs?: number;
  systemPrompt?: string;
}

export type DeepSeekProviderReason =
  | "ok"
  | "missing_key"
  | "upstream_non_2xx"
  | "timeout"
  | "network_error"
  | "empty_content";

export interface DeepSeekProviderResult {
  text: string | null;
  reason: DeepSeekProviderReason;
  status?: number;
  upstreamMessage?: string;
  attempts: number;
  keySlotUsed?: string;
  lastReason?: DeepSeekProviderReason;
  lastStatus?: number;
}

interface DeepSeekChoice {
  message?: {
    content?:
      | string
      | Array<{
          type?: string;
          text?: string;
        }>;
  };
}

interface DeepSeekChatResponse {
  choices?: DeepSeekChoice[];
  error?: {
    message?: string;
  };
}

interface ApiKeyCandidate {
  key: string;
  slot: string;
}

function readDeepSeekText(result: DeepSeekChatResponse): string | null {
  const content = result.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim() || null;
  }

  if (Array.isArray(content)) {
    const text = content
      .map((item) => (typeof item?.text === "string" ? item.text : ""))
      .join("\n")
      .trim();
    return text || null;
  }

  return null;
}

function stripOuterQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizeApiKey(raw: string | undefined) {
  if (!raw) {
    return "";
  }

  const value = stripOuterQuotes(raw);
  if (!value || value === '""' || value === "''") {
    return "";
  }

  return value;
}

function resolveApiKeyCandidates(): ApiKeyCandidate[] {
  const keyCandidates: ApiKeyCandidate[] = [];
  const dedupe = new Set<string>();
  const primary = normalizeApiKey(process.env.DEEPSEEK_API_KEY);
  const backup = normalizeApiKey(process.env.DEEPSEEK_API_KEY_BACKUP);
  const list = (process.env.DEEPSEEK_API_KEYS || "")
    .split(",")
    .map((item) => normalizeApiKey(item))
    .filter(Boolean);

  const append = (key: string, slot: string) => {
    if (!key || dedupe.has(key)) {
      return;
    }
    dedupe.add(key);
    keyCandidates.push({ key, slot });
  };

  append(primary, "primary");
  append(backup, "backup");
  list.forEach((key, index) => append(key, `index:${index + 1}`));
  return keyCandidates;
}

function resolveTimeoutMs(overrideTimeout?: number) {
  if (typeof overrideTimeout === "number" && Number.isFinite(overrideTimeout)) {
    return overrideTimeout;
  }

  const raw = process.env.AI_TIMEOUT_MS || process.env.AI_TIMES_OUT || "30000";
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 30000;
  }
  return parsed;
}

export async function requestDeepSeekChat(params: DeepSeekChatParams): Promise<DeepSeekProviderResult> {
  const keyCandidates = resolveApiKeyCandidates();
  if (keyCandidates.length === 0) {
    return {
      text: null,
      reason: "missing_key",
      attempts: 0,
      keySlotUsed: undefined,
      lastReason: "missing_key",
      lastStatus: undefined,
    };
  }

  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const timeoutMs = resolveTimeoutMs(params.timeoutMs);

  const toolFlags = [
    `UseWeb=${params.useWeb}`,
    `UseLibrary=${params.useLibrary}`,
    `ContextDocId=${params.contextDocId || "none"}`,
  ].join(" | ");

  let attempts = 0;
  let lastFailureReason: DeepSeekProviderReason = "network_error";
  let lastFailureStatus: number | undefined;
  let lastFailureMessage: string | undefined;
  let lastSlot = keyCandidates[0]?.slot;

  for (const candidate of keyCandidates) {
    attempts += 1;
    lastSlot = candidate.slot;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      try {
        response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${candidate.key}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            messages: [
              {
                role: "system",
                content:
                  params.systemPrompt ||
                  "You are Zenthesis writing copilot. Give concise, practical academic writing help in markdown-friendly plain text.",
              },
              {
                role: "user",
                content: `User prompt: ${params.prompt}\n\nTool flags: ${toolFlags}`,
              },
            ],
          }),
          signal: controller.signal,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          lastFailureReason = "timeout";
          lastFailureStatus = undefined;
          lastFailureMessage = "request timed out";
        } else {
          lastFailureReason = "network_error";
          lastFailureStatus = undefined;
          lastFailureMessage = error instanceof Error ? error.message : String(error);
        }

        if (attempts < keyCandidates.length) {
          continue;
        }

        return {
          text: null,
          reason: lastFailureReason,
          status: lastFailureStatus,
          upstreamMessage: lastFailureMessage,
          attempts,
          keySlotUsed: candidate.slot,
          lastReason: lastFailureReason,
          lastStatus: lastFailureStatus,
        };
      }

      if (!response.ok) {
        const raw = await response.text().catch(() => "");
        let upstreamMessage = raw;

        try {
          const parsed = JSON.parse(raw) as DeepSeekChatResponse;
          upstreamMessage = parsed.error?.message || raw;
        } catch {
          // keep raw response body
        }

        lastFailureReason = "upstream_non_2xx";
        lastFailureStatus = response.status;
        lastFailureMessage = upstreamMessage.slice(0, 300);

        const authFailure = response.status === 401 || response.status === 403;
        const transientFailure = response.status >= 500 || response.status === 429;
        if (attempts < keyCandidates.length && (authFailure || transientFailure)) {
          continue;
        }

        return {
          text: null,
          reason: "upstream_non_2xx",
          status: response.status,
          upstreamMessage: upstreamMessage.slice(0, 300),
          attempts,
          keySlotUsed: candidate.slot,
          lastReason: lastFailureReason,
          lastStatus: lastFailureStatus,
        };
      }

      let result: DeepSeekChatResponse;
      try {
        result = (await response.json()) as DeepSeekChatResponse;
      } catch (error) {
        lastFailureReason = "network_error";
        lastFailureStatus = response.status;
        lastFailureMessage = error instanceof Error ? error.message : String(error);

        if (attempts < keyCandidates.length) {
          continue;
        }

        return {
          text: null,
          reason: "network_error",
          status: response.status,
          upstreamMessage: lastFailureMessage,
          attempts,
          keySlotUsed: candidate.slot,
          lastReason: lastFailureReason,
          lastStatus: lastFailureStatus,
        };
      }

      const text = readDeepSeekText(result);
      if (!text) {
        lastFailureReason = "empty_content";
        lastFailureStatus = response.status;
        if (attempts < keyCandidates.length) {
          continue;
        }
        return {
          text: null,
          reason: "empty_content",
          status: response.status,
          attempts,
          keySlotUsed: candidate.slot,
          lastReason: lastFailureReason,
          lastStatus: lastFailureStatus,
        };
      }

      return {
        text,
        reason: "ok",
        status: response.status,
        attempts,
        keySlotUsed: candidate.slot,
        lastReason: "ok",
        lastStatus: response.status,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    text: null,
    reason: lastFailureReason,
    status: lastFailureStatus,
    upstreamMessage: lastFailureMessage,
    attempts,
    keySlotUsed: lastSlot,
    lastReason: lastFailureReason,
    lastStatus: lastFailureStatus,
  };
}
