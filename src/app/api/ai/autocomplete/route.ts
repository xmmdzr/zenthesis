import { jsonError, jsonOk } from "@/lib/api";
import { aiAutocomplete } from "@/lib/ai";
import { listLibraryItems } from "@/lib/library-store";
import { getRequestUserId } from "@/lib/request-user";
import type {
  AutoCompleteImpactPreset,
  AutoCompleteRequestPayload,
  AutoCompleteSettings,
  SourceType,
  AutoCompleteYearPreset,
} from "@/lib/types";
import { consumeUsage } from "@/lib/usage-store";

const yearPresets: AutoCompleteYearPreset[] = ["all", "2y", "5y", "10y"];
const impactPresets: AutoCompleteImpactPreset[] = ["all", "emerging", "mid", "high"];
const fileSourceTypes = new Set<SourceType>(["pdf", "image", "bib_ris", "zotero", "mendeley"]);

interface NormalizeResult {
  settings: AutoCompleteSettings | null;
  error?: string;
}

function toOptionalPositiveNumber(value: unknown): number | undefined | null {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed > 0 ? parsed : undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value > 0 ? value : undefined;
}

function normalizeSettings(raw: AutoCompleteRequestPayload["settings"]): NormalizeResult {
  if (typeof raw.useWeb !== "boolean") {
    return {
      settings: null,
      error: "settings.useWeb must be a boolean",
    };
  }
  if (typeof raw.useLibrary !== "boolean") {
    return {
      settings: null,
      error: "settings.useLibrary must be a boolean",
    };
  }
  if (!yearPresets.includes(raw.yearPreset)) {
    return {
      settings: null,
      error: "invalid yearPreset value",
    };
  }
  if (!impactPresets.includes(raw.impactPreset)) {
    return {
      settings: null,
      error: "invalid impactPreset value",
    };
  }

  const nextYearMin = toOptionalPositiveNumber(raw.yearMin);
  if (nextYearMin === null) {
    return {
      settings: null,
      error: "yearMin must be a positive number",
    };
  }
  const nextYearMax = toOptionalPositiveNumber(raw.yearMax);
  if (nextYearMax === null) {
    return {
      settings: null,
      error: "yearMax must be a positive number",
    };
  }
  const nextImpactMin = toOptionalPositiveNumber(raw.impactMin);
  if (nextImpactMin === null) {
    return {
      settings: null,
      error: "impactMin must be a positive number",
    };
  }
  const nextImpactMax = toOptionalPositiveNumber(raw.impactMax);
  if (nextImpactMax === null) {
    return {
      settings: null,
      error: "impactMax must be a positive number",
    };
  }

  const settings: AutoCompleteSettings = {
    useWeb: raw.useWeb,
    useLibrary: raw.useLibrary,
    yearPreset: raw.yearPreset,
    impactPreset: raw.impactPreset,
    yearMin: nextYearMin,
    yearMax: nextYearMax,
    impactMin: nextImpactMin,
    impactMax: nextImpactMax,
  };

  if (settings.yearPreset === "all") {
    settings.yearMin = undefined;
    settings.yearMax = undefined;
  } else if (
    settings.yearMin !== undefined &&
    settings.yearMax !== undefined &&
    settings.yearMin > settings.yearMax
  ) {
    [settings.yearMin, settings.yearMax] = [settings.yearMax, settings.yearMin];
  }

  if (settings.impactPreset === "all") {
    settings.impactMin = undefined;
    settings.impactMax = undefined;
  } else if (
    settings.impactMin !== undefined &&
    settings.impactMax !== undefined &&
    settings.impactMin > settings.impactMax
  ) {
    [settings.impactMin, settings.impactMax] = [settings.impactMax, settings.impactMin];
  }

  return { settings };
}

function hasFileLibraryResources(sourceTypes: SourceType[]) {
  return sourceTypes.some((sourceType) => fileSourceTypes.has(sourceType));
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as AutoCompleteRequestPayload | null;
  if (!payload) {
    return jsonError("invalid payload", 400);
  }

  if (!payload.docId || typeof payload.docId !== "string") {
    return jsonError("docId is required", 400);
  }
  if (!payload.title || typeof payload.title !== "string") {
    return jsonError("title is required", 400);
  }
  if (typeof payload.content !== "string") {
    return jsonError("content is required", 400);
  }
  if (!payload.settings || typeof payload.settings !== "object") {
    return jsonError("settings is required", 400);
  }
  if (payload.cursorContext !== undefined && typeof payload.cursorContext !== "string") {
    return jsonError("cursorContext must be a string", 400);
  }
  if (payload.retryFrom !== undefined && typeof payload.retryFrom !== "string") {
    return jsonError("retryFrom must be a string", 400);
  }

  const normalized = normalizeSettings(payload.settings);
  if (!normalized.settings) {
    return jsonError(normalized.error || "invalid settings", 400);
  }

  const userId = await getRequestUserId(request);
  let effectiveSettings: AutoCompleteSettings = {
    ...normalized.settings,
  };
  let appliedSourceFallback = false;
  if (effectiveSettings.useLibrary) {
    const libraryItems = await listLibraryItems(userId);
    const hasFileResources = hasFileLibraryResources(libraryItems.map((item) => item.sourceType));
    if (!hasFileResources) {
      effectiveSettings = {
        ...effectiveSettings,
        useLibrary: false,
        useWeb: true,
      };
      appliedSourceFallback = true;
    }
  }

  await consumeUsage(userId, 2);
  const result = await aiAutocomplete({
    ...payload,
    settings: effectiveSettings,
  });

  if (appliedSourceFallback) {
    console.info("[api/ai/autocomplete] source fallback applied", {
      userId,
      reason: "library_empty_file_resources",
      effectiveUseWeb: effectiveSettings.useWeb,
      effectiveUseLibrary: effectiveSettings.useLibrary,
    });
  }

  if (result._meta.usedFallback) {
    console.warn("[api/ai/autocomplete] fallback response", {
      reason: result._meta.providerReason,
      status: result._meta.status ?? null,
      model: result._meta.model,
      baseUrl: result._meta.baseUrl,
      upstreamMessage: result._meta.upstreamMessage ?? null,
      effectiveUseWeb: effectiveSettings.useWeb,
      effectiveUseLibrary: effectiveSettings.useLibrary,
      userId,
    });
  }

  return jsonOk({
    suggestion: result.suggestion,
    generatedAt: new Date().toISOString(),
  });
}
