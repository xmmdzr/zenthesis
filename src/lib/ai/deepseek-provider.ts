interface DeepSeekChatParams {
  prompt: string;
  useWeb: boolean;
  useLibrary: boolean;
  contextDocId?: string;
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

export async function requestDeepSeekChat(params: DeepSeekChatParams): Promise<DeepSeekProviderResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      text: null,
      reason: "missing_key",
    };
  }

  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const timeoutMs = Number.parseInt(process.env.AI_TIMEOUT_MS || "30000", 10);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number.isNaN(timeoutMs) ? 30000 : timeoutMs);

  const toolFlags = [
    `UseWeb=${params.useWeb}`,
    `UseLibrary=${params.useLibrary}`,
    `ContextDocId=${params.contextDocId || "none"}`,
  ].join(" | ");

  try {
    let response: Response;
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content:
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
        return {
          text: null,
          reason: "timeout",
        };
      }

      return {
        text: null,
        reason: "network_error",
        upstreamMessage: error instanceof Error ? error.message : String(error),
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

      return {
        text: null,
        reason: "upstream_non_2xx",
        status: response.status,
        upstreamMessage: upstreamMessage.slice(0, 300),
      };
    }

    let result: DeepSeekChatResponse;
    try {
      result = (await response.json()) as DeepSeekChatResponse;
    } catch (error) {
      return {
        text: null,
        reason: "network_error",
        status: response.status,
        upstreamMessage: error instanceof Error ? error.message : String(error),
      };
    }

    const text = readDeepSeekText(result);
    if (!text) {
      return {
        text: null,
        reason: "empty_content",
        status: response.status,
      };
    }

    return {
      text,
      reason: "ok",
      status: response.status,
    };
  } finally {
    clearTimeout(timer);
  }
}
