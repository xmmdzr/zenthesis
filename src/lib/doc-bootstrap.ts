import type { DocCreationSettings } from "@/lib/types";
import { looksLikeStandaloneTitle } from "@/lib/title-quality";

interface SmartOutlineSection {
  heading: string;
  subheadings: string[];
}

export interface SmartOutlineResult {
  title: string;
  sections: SmartOutlineSection[];
  introParagraph?: string;
}

export function defaultDocCreationSettings(): DocCreationSettings {
  return {
    useWeb: true,
    useLibrary: true,
    yearPreset: "all",
    impactPreset: "all",
    citationStyle: "APA7",
    showCitationPage: false,
  };
}

export function normalizeDocCreationSettings(
  value?: Partial<DocCreationSettings> | null,
): DocCreationSettings {
  const defaults = defaultDocCreationSettings();
  if (!value) {
    return defaults;
  }

  const yearPreset = value.yearPreset === "5y" || value.yearPreset === "custom" ? value.yearPreset : "all";
  const impactPreset =
    value.impactPreset === "gt025" || value.impactPreset === "gt3" || value.impactPreset === "gt10"
      ? value.impactPreset
      : "all";
  const citationStyle =
    value.citationStyle === "MLA9" ||
    value.citationStyle === "Chicago17" ||
    value.citationStyle === "GBT7714" ||
    value.citationStyle === "APA7"
      ? value.citationStyle
      : "APA7";

  let yearMin = typeof value.yearMin === "number" && Number.isFinite(value.yearMin) ? value.yearMin : undefined;
  let yearMax = typeof value.yearMax === "number" && Number.isFinite(value.yearMax) ? value.yearMax : undefined;
  if (yearPreset !== "custom") {
    yearMin = undefined;
    yearMax = undefined;
  } else if (yearMin !== undefined && yearMax !== undefined && yearMin > yearMax) {
    [yearMin, yearMax] = [yearMax, yearMin];
  }

  return {
    useWeb: typeof value.useWeb === "boolean" ? value.useWeb : defaults.useWeb,
    useLibrary: typeof value.useLibrary === "boolean" ? value.useLibrary : defaults.useLibrary,
    yearPreset,
    yearMin,
    yearMax,
    impactPreset,
    citationStyle,
    showCitationPage: typeof value.showCitationPage === "boolean" ? value.showCitationPage : false,
  };
}

function paragraphNode(text: string) {
  return {
    type: "paragraph",
    content: text ? [{ type: "text", text }] : [],
  };
}

function headingNode(level: 1 | 2 | 3, text: string) {
  return {
    type: "heading",
    attrs: {
      level,
      textAlign: "left",
    },
    content: [{ type: "text", text }],
  };
}

function safeTitle(value: string) {
  const trimmed = value.trim();
  return trimmed || "未命名";
}

export function buildStandardOutlineContent(title: string) {
  const docTitle = safeTitle(title);
  return {
    type: "doc",
    content: [
      headingNode(1, docTitle),
      headingNode(2, "引言"),
      paragraphNode("请在此补充研究背景、问题提出与研究意义。"),
      headingNode(2, "文献综述"),
      paragraphNode("请梳理国内外相关研究进展与研究缺口。"),
      headingNode(2, "方法论"),
      paragraphNode("请说明研究设计、数据来源与分析方法。"),
      headingNode(2, "结果"),
      paragraphNode("请陈述关键发现，并对应研究问题。"),
      headingNode(2, "讨论"),
      paragraphNode("请解释结果含义、局限性与理论/实践启示。"),
      headingNode(2, "结论"),
      paragraphNode("请总结结论并给出未来研究展望。"),
    ],
  } as Record<string, unknown>;
}

function flattenTextFromNode(node: Record<string, unknown>) {
  const content = Array.isArray(node.content) ? (node.content as Record<string, unknown>[]) : [];
  return content
    .map((item) => {
      if (typeof item.text === "string") {
        return item.text;
      }
      return "";
    })
    .join("")
    .trim();
}

export function contentJsonToPlainText(contentJson: Record<string, unknown>) {
  const content = Array.isArray(contentJson.content)
    ? (contentJson.content as Record<string, unknown>[])
    : [];
  const lines: string[] = [];

  for (const node of content) {
    if (typeof node.type !== "string") {
      continue;
    }

    if (node.type === "heading") {
      const text = flattenTextFromNode(node);
      if (text) {
        lines.push(text);
      }
      continue;
    }

    if (node.type === "paragraph") {
      const text = flattenTextFromNode(node);
      if (text) {
        lines.push(text);
      }
    }
  }

  return lines.join("\n");
}

export function parseSmartOutlineResult(raw: string): SmartOutlineResult | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  let payload: unknown = null;
  try {
    payload = JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i);
    if (!fenced?.[1]) {
      return null;
    }
    try {
      payload = JSON.parse(fenced[1]);
    } catch {
      return null;
    }
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const title = typeof (payload as { title?: unknown }).title === "string"
    ? (payload as { title: string }).title.trim()
    : "";
  const introParagraph = typeof (payload as { introParagraph?: unknown }).introParagraph === "string"
    ? (payload as { introParagraph: string }).introParagraph.trim()
    : "";
  const sectionsRaw = Array.isArray((payload as { sections?: unknown }).sections)
    ? ((payload as { sections: unknown[] }).sections as unknown[])
    : [];

  const sections: SmartOutlineSection[] = sectionsRaw
    .map((section) => {
      if (!section || typeof section !== "object") {
        return null;
      }

      const heading = typeof (section as { heading?: unknown }).heading === "string"
        ? (section as { heading: string }).heading.trim()
        : "";
      const subheadingsRaw = Array.isArray((section as { subheadings?: unknown }).subheadings)
        ? ((section as { subheadings: unknown[] }).subheadings as unknown[])
        : [];
      const subheadings = subheadingsRaw
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 4);

      if (!heading) {
        return null;
      }

      return {
        heading,
        subheadings,
      };
    })
    .filter((section): section is SmartOutlineSection => Boolean(section))
    .slice(0, 8);

  if (!title || sections.length === 0) {
    return null;
  }

  return {
    title,
    sections,
    introParagraph: introParagraph || undefined,
  };
}

export function buildSmartOutlineContent(result: SmartOutlineResult) {
  const nodes: Record<string, unknown>[] = [headingNode(1, safeTitle(result.title))];

  if (result.introParagraph) {
    nodes.push(paragraphNode(result.introParagraph));
  }

  for (const section of result.sections) {
    nodes.push(headingNode(2, section.heading));
    nodes.push(paragraphNode(""));
    for (const subheading of section.subheadings) {
      nodes.push(headingNode(3, subheading));
      nodes.push(paragraphNode(""));
    }
  }

  return {
    type: "doc",
    content: nodes,
  } as Record<string, unknown>;
}

export function inferSmartInputIntent(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      providedTitle: "",
      context: "",
      shouldGenerateTitle: true,
    };
  }

  if (looksLikeStandaloneTitle(trimmed)) {
    return {
      providedTitle: trimmed,
      context: trimmed,
      shouldGenerateTitle: false,
    };
  }

  const firstLine = trimmed.split("\n").map((line) => line.trim()).find(Boolean) || "";
  const titleCandidate = looksLikeStandaloneTitle(firstLine) ? firstLine : "";
  return {
    providedTitle: titleCandidate,
    context: trimmed,
    shouldGenerateTitle: titleCandidate.length === 0,
  };
}
