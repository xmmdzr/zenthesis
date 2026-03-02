"use client";

import {
  BookText,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileDown,
  FileUp,
  Link2,
  LoaderCircle,
  MessageSquareMore,
  PenSquare,
  Save,
  Settings2,
  ShieldCheck,
  Share2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import { RichDocumentEditor } from "@/components/rich-document-editor";
import { useWorkspaceUI } from "@/components/workspace-ui-context";
import type { AutoCompleteSettings, DocumentItem } from "@/lib/types";

interface DocumentEditorPaneProps {
  docId?: string;
  forceEmpty?: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const defaultAutoCompleteSettings: AutoCompleteSettings = {
  useWeb: true,
  useLibrary: true,
  yearPreset: "all",
  impactPreset: "all",
};

const yearPresetOptions: Array<{ value: AutoCompleteSettings["yearPreset"]; labelKey: string }> = [
  { value: "all", labelKey: "doc.autoCompleteSettings.yearAll" },
  { value: "2y", labelKey: "doc.autoCompleteSettings.year2y" },
  { value: "5y", labelKey: "doc.autoCompleteSettings.year5y" },
  { value: "10y", labelKey: "doc.autoCompleteSettings.year10y" },
];

const impactPresetOptions: Array<{ value: AutoCompleteSettings["impactPreset"]; labelKey: string }> = [
  { value: "all", labelKey: "doc.autoCompleteSettings.impactAll" },
  { value: "emerging", labelKey: "doc.autoCompleteSettings.impactEmerging" },
  { value: "mid", labelKey: "doc.autoCompleteSettings.impactMid" },
  { value: "high", labelKey: "doc.autoCompleteSettings.impactHigh" },
];

function toOptionalPositiveNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return undefined;
    }
    return parsed;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  return value;
}

function normalizeAutoCompleteSettings(raw?: Partial<AutoCompleteSettings>): AutoCompleteSettings {
  const yearPresetValues: AutoCompleteSettings["yearPreset"][] = ["all", "2y", "5y", "10y"];
  const impactPresetValues: AutoCompleteSettings["impactPreset"][] = ["all", "emerging", "mid", "high"];

  const yearPreset = yearPresetValues.includes(raw?.yearPreset as AutoCompleteSettings["yearPreset"])
    ? (raw?.yearPreset as AutoCompleteSettings["yearPreset"])
    : defaultAutoCompleteSettings.yearPreset;
  const impactPreset = impactPresetValues.includes(raw?.impactPreset as AutoCompleteSettings["impactPreset"])
    ? (raw?.impactPreset as AutoCompleteSettings["impactPreset"])
    : defaultAutoCompleteSettings.impactPreset;
  const useWeb = typeof raw?.useWeb === "boolean" ? raw.useWeb : defaultAutoCompleteSettings.useWeb;
  const useLibrary =
    typeof raw?.useLibrary === "boolean" ? raw.useLibrary : defaultAutoCompleteSettings.useLibrary;

  let yearMin = toOptionalPositiveNumber(raw?.yearMin);
  let yearMax = toOptionalPositiveNumber(raw?.yearMax);
  if (yearPreset === "all") {
    yearMin = undefined;
    yearMax = undefined;
  } else if (yearMin !== undefined && yearMax !== undefined && yearMin > yearMax) {
    [yearMin, yearMax] = [yearMax, yearMin];
  }

  let impactMin = toOptionalPositiveNumber(raw?.impactMin);
  let impactMax = toOptionalPositiveNumber(raw?.impactMax);
  if (impactPreset === "all") {
    impactMin = undefined;
    impactMax = undefined;
  } else if (impactMin !== undefined && impactMax !== undefined && impactMin > impactMax) {
    [impactMin, impactMax] = [impactMax, impactMin];
  }

  return {
    useWeb,
    useLibrary,
    yearPreset,
    yearMin,
    yearMax,
    impactPreset,
    impactMin,
    impactMax,
  };
}

function pickFileName(header: string | null, fallback: string) {
  if (!header) {
    return fallback;
  }

  const match = header.match(/filename=\"?([^\";]+)\"?/i);
  if (!match?.[1]) {
    return fallback;
  }

  return decodeURIComponent(match[1]);
}

const starterCardMap = [
  {
    key: "prompt",
    titleKey: "starter.prompt.title",
    descKey: "starter.prompt.desc",
    icon: PenSquare,
  },
  {
    key: "word",
    titleKey: "starter.word.title",
    descKey: "starter.word.desc",
    icon: FileUp,
  },
  {
    key: "chat",
    titleKey: "starter.chat.title",
    descKey: "starter.chat.desc",
    icon: MessageSquareMore,
  },
  {
    key: "source",
    titleKey: "starter.source.title",
    descKey: "starter.source.desc",
    icon: BookText,
  },
] as const;

function EditorContent({ currentDoc }: { currentDoc: DocumentItem | null }) {
  const { t } = useI18n();
  const {
    user,
    libraryItems,
    openNewDocModal,
    openSourceModal,
    openWordImportModal,
    openChatPanel,
    updateDocument,
  } = useWorkspaceUI();

  const [titleDraft, setTitleDraft] = useState(currentDoc?.title ?? t("doc.untitled"));
  const [contentDraft, setContentDraft] = useState(currentDoc?.content ?? "");
  const [contentJsonDraft, setContentJsonDraft] = useState<Record<string, unknown> | null>(currentDoc?.contentJson ?? null);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [shareStatus, setShareStatus] = useState<"idle" | "existing" | "none">("idle");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"docx" | "pdf" | null>(null);
  const [isExportMenuOpen, setExportMenuOpen] = useState(false);
  const currentDocId = currentDoc?.id;
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const settingsToggleRef = useRef<HTMLButtonElement | null>(null);
  const [autoCompleteSettings, setAutoCompleteSettings] = useState<AutoCompleteSettings>(() => {
    if (!currentDocId || typeof window === "undefined") {
      return defaultAutoCompleteSettings;
    }
    const key = `zenthesis:autocomplete:${currentDocId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return defaultAutoCompleteSettings;
      }
      const parsed = JSON.parse(raw) as Partial<AutoCompleteSettings>;
      return normalizeAutoCompleteSettings(parsed);
    } catch {
      return defaultAutoCompleteSettings;
    }
  });
  const hasLibraryFileResources = useMemo(
    () =>
      libraryItems.some((item) =>
        ["pdf", "image", "bib_ris", "zotero", "mendeley"].includes(item.sourceType),
      ),
    [libraryItems],
  );
  const sharePanelRef = useRef<HTMLDivElement | null>(null);
  const shareToggleRef = useRef<HTMLButtonElement | null>(null);
  const exportPanelRef = useRef<HTMLDivElement | null>(null);
  const exportToggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!currentDocId) {
      return;
    }
    const key = `zenthesis:autocomplete:${currentDocId}`;
    localStorage.setItem(key, JSON.stringify(autoCompleteSettings));
  }, [autoCompleteSettings, currentDocId]);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (settingsPanelRef.current?.contains(target) || settingsToggleRef.current?.contains(target)) {
        return;
      }
      setSettingsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);

  useEffect(() => {
    if (!isShareOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (sharePanelRef.current?.contains(target) || shareToggleRef.current?.contains(target)) {
        return;
      }
      setShareOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isShareOpen]);

  useEffect(() => {
    if (!isExportMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (exportPanelRef.current?.contains(target) || exportToggleRef.current?.contains(target)) {
        return;
      }
      setExportMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExportMenuOpen]);

  const requestAutoComplete = useCallback(async (payload: {
    content: string;
    cursorContext?: string;
    retryFrom?: string;
    signal: AbortSignal;
  }) => {
    if (!currentDoc) {
      return null;
    }

    let response: Response;
    try {
      response = await fetch("/api/ai/autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          docId: currentDoc.id,
          title: titleDraft,
          content: payload.content,
          cursorContext: payload.cursorContext,
          settings: autoCompleteSettings,
          retryFrom: payload.retryFrom,
        }),
        signal: payload.signal,
      });
    } catch {
      throw new Error(t("doc.suggestion.networkError"));
    }

    if (!response.ok) {
      const failed = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
      throw new Error(failed?.error || failed?.message || t("doc.suggestion.failed"));
    }

    const result = (await response.json()) as { suggestion?: string };
    return (result.suggestion || "").trim() || null;
  }, [autoCompleteSettings, currentDoc, t, titleDraft, user.id]);

  const persist = useCallback(async () => {
    if (!currentDoc || !dirty) {
      return;
    }

    setSaveState("saving");
    const updated = await updateDocument(currentDoc.id, {
      title: titleDraft,
      content: contentDraft,
      contentJson: contentJsonDraft,
      status: contentDraft.trim().length > 0 ? "active" : currentDoc.status,
    });

    if (updated) {
      setSaveState("saved");
      setDirty(false);
      return;
    }

    setSaveState("error");
  }, [currentDoc, dirty, titleDraft, contentDraft, contentJsonDraft, updateDocument]);

  const openSharePanel = useCallback(async () => {
    if (!currentDoc) {
      return;
    }

    setShareOpen((prev) => !prev);
    setShareError(null);
    if (isShareOpen) {
      return;
    }

    setShareLoading(true);
    const response = await fetch(`/api/docs/${currentDoc.id}/share`, {
      cache: "no-store",
    }).catch(() => null);
    setShareLoading(false);

    if (!response || !response.ok) {
      setShareStatus("none");
      return;
    }

    const result = (await response.json()) as { share?: { id: string } | null };
    setShareStatus(result.share ? "existing" : "none");
  }, [currentDoc, isShareOpen]);

  const createShareLink = useCallback(async () => {
    if (!currentDoc) {
      return;
    }

    setShareLoading(true);
    setShareError(null);
    const response = await fetch(`/api/docs/${currentDoc.id}/share`, {
      method: "POST",
    }).catch(() => null);
    setShareLoading(false);

    if (!response || !response.ok) {
      const failed = response ? ((await response.json().catch(() => null)) as { error?: string } | null) : null;
      setShareError(failed?.error || "failed to create share link");
      return;
    }

    const result = (await response.json()) as { share: { shareUrl: string } };
    setShareUrl(result.share.shareUrl);
    setShareStatus("existing");
  }, [currentDoc]);

  const revokeShare = useCallback(async () => {
    if (!currentDoc) {
      return;
    }

    setShareLoading(true);
    setShareError(null);
    const response = await fetch(`/api/docs/${currentDoc.id}/share`, {
      method: "DELETE",
    }).catch(() => null);
    setShareLoading(false);

    if (!response || !response.ok) {
      const failed = response ? ((await response.json().catch(() => null)) as { error?: string } | null) : null;
      setShareError(failed?.error || "failed to revoke share link");
      return;
    }

    setShareStatus("none");
    setShareUrl("");
  }, [currentDoc]);

  const exportDocument = useCallback(async (format: "docx" | "pdf") => {
    if (!currentDoc) {
      return;
    }

    setExporting(format);
    const response = await fetch(`/api/docs/${currentDoc.id}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ format }),
    }).catch(() => null);
    setExporting(null);

    if (!response || !response.ok) {
      return;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const fileName = pickFileName(
      response.headers.get("content-disposition"),
      `${currentDoc.title || "untitled"}.${format}`,
    );
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    setExportMenuOpen(false);
  }, [currentDoc]);

  useEffect(() => {
    if (!dirty || !currentDoc) {
      return;
    }

    const timer = setTimeout(() => {
      void persist();
    }, 850);

    return () => clearTimeout(timer);
  }, [dirty, currentDoc, persist]);

  const isEmptyDoc = !currentDoc || (currentDoc.status === "empty" && contentDraft.trim().length === 0);

  return (
    <section className="relative flex h-full min-h-0 flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
      <header className="flex items-center justify-between border-b border-[color:var(--border)] px-6 py-4 text-sm">
        <input
          value={titleDraft}
          onChange={(event) => {
            setTitleDraft(event.target.value);
            setDirty(true);
          }}
          className="w-full max-w-[420px] rounded-lg bg-transparent px-2 py-1 text-lg font-semibold outline-none focus:bg-[color:var(--surface)]"
        />

        <div className="relative ml-3 flex items-center gap-4 text-[color:var(--muted-foreground)]">
          {currentDoc?.isOwner !== false && (
            <button
              ref={shareToggleRef}
              type="button"
              onClick={() => {
                void openSharePanel();
              }}
              className="inline-flex items-center gap-1 transition hover:text-[color:var(--foreground)]"
            >
              <Share2 className="h-4 w-4" /> {t("common.share")}
            </button>
          )}
          {isShareOpen && currentDoc?.isOwner !== false && (
            <div
              ref={sharePanelRef}
              className="absolute right-[240px] top-[calc(100%+8px)] z-30 w-[340px] rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-3 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[color:var(--foreground)]">{t("doc.shareTitle")}</h4>
                <button
                  type="button"
                  onClick={() => setShareOpen(false)}
                  className="rounded p-1 hover:bg-[color:var(--surface)]"
                  aria-label={t("common.close")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">{t("doc.shareHint")}</p>
              {shareError && <p className="mt-2 text-xs text-red-500">{shareError}</p>}
              {shareUrl ? (
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-2 text-xs">
                    <span className="line-clamp-2 break-all">{shareUrl}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(shareUrl);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-[color:var(--border)] px-2 py-1.5 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5" /> {t("doc.copyLink")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void revokeShare();
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1.5 text-xs text-red-600"
                    >
                      {t("doc.revokeLink")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void createShareLink();
                    }}
                    disabled={shareLoading}
                    className="inline-flex items-center gap-1 rounded-md bg-[color:var(--accent)] px-3 py-1.5 text-xs font-semibold text-[color:var(--accent-foreground)] disabled:opacity-60"
                  >
                    {shareLoading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                    {shareStatus === "existing" ? t("doc.generateNewLink") : t("doc.createLink")}
                  </button>
                </div>
              )}
            </div>
          )}
          <button type="button" className="inline-flex items-center gap-1 transition hover:text-[color:var(--foreground)]">
            <ShieldCheck className="h-4 w-4" /> {t("common.review")}
          </button>
          <div className="relative">
            <button
              ref={exportToggleRef}
              type="button"
              onClick={() => setExportMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1 transition hover:text-[color:var(--foreground)]"
            >
              <Download className="h-4 w-4" /> {t("common.export")}
            </button>
            {isExportMenuOpen && (
              <div
                ref={exportPanelRef}
                className="absolute right-0 top-[calc(100%+8px)] z-30 w-[180px] rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-2 shadow-xl"
              >
                <button
                  type="button"
                  onClick={() => {
                    void exportDocument("docx");
                  }}
                  disabled={exporting !== null}
                  className="inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[color:var(--surface)] disabled:opacity-60"
                >
                  {exporting === "docx" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                  {t("doc.exportDocx")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void exportDocument("pdf");
                  }}
                  disabled={exporting !== null}
                  className="inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[color:var(--surface)] disabled:opacity-60"
                >
                  {exporting === "pdf" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                  {t("doc.exportPdf")}
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void persist()}
            disabled={!dirty || !currentDoc}
            className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border)] px-3 py-2 font-semibold disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> {t("common.save")}
          </button>
          <button type="button" className="rounded-lg bg-[color:var(--accent)] px-3 py-2 font-semibold text-[color:var(--accent-foreground)]">
            {t("common.pricing")}
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-8 py-10">
        <h1 className="text-6xl font-bold text-[#bcc2cc]">{titleDraft || t("doc.untitled")}</h1>

        {isEmptyDoc ? (
          <>
            <p className="mt-8 text-3xl font-semibold">{t("doc.startWriting")}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {starterCardMap.map((card) => {
                const Icon = card.icon;

                return (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => {
                      if (card.key === "prompt") {
                        openNewDocModal();
                      }
                      if (card.key === "word") {
                        openWordImportModal();
                      }
                      if (card.key === "chat") {
                        openChatPanel();
                      }
                      if (card.key === "source") {
                        openSourceModal("pdf");
                      }
                    }}
                    className="rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-4 text-left transition hover:border-[color:var(--accent)]"
                  >
                    <Icon className="h-5 w-5" />
                    <h2 className="mt-3 text-lg font-semibold">{t(card.titleKey)}</h2>
                    <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{t(card.descKey)}</p>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <RichDocumentEditor
            docId={currentDoc.id}
            title={titleDraft}
            initialText={contentDraft}
            initialJson={contentJsonDraft}
            editable
            collabUserId={user.id}
            collabUserName={user.name}
            autoCompleteEnabled={autoCompleteEnabled}
            autoCompleteSettings={autoCompleteSettings}
            onRequestAutoComplete={requestAutoComplete}
            onChange={({ content, contentJson }) => {
              setContentDraft(content);
              setContentJsonDraft(contentJson);
              setDirty(true);
            }}
          />
        )}
      </div>

      {settingsOpen && (
        <div
          ref={settingsPanelRef}
          className="absolute bottom-[56px] left-1/2 z-20 w-[640px] max-w-[calc(100%-32px)] -translate-x-1/2 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-2xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 text-lg font-semibold">
            <Settings2 className="h-4 w-4" />
            <span>{t("doc.autoCompleteSettings.title")}</span>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-[color:var(--surface)] px-3 py-2">
              <div>
                <p className="font-medium">{t("doc.autoCompleteSettings.useWebTitle")}</p>
                <p className="text-[color:var(--muted-foreground)]">{t("doc.autoCompleteSettings.useWebHint")}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAutoCompleteSettings((prev) => ({
                    ...prev,
                    useWeb: !prev.useWeb,
                  }))
                }
                className={`h-6 w-11 rounded-full transition ${autoCompleteSettings.useWeb ? "bg-[color:var(--accent)]" : "bg-[color:var(--border)]"}`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition ${autoCompleteSettings.useWeb ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[color:var(--surface)] px-3 py-2">
              <div>
                <p className="font-medium">{t("doc.autoCompleteSettings.useLibraryTitle")}</p>
                <p className="text-[color:var(--muted-foreground)]">{t("doc.autoCompleteSettings.useLibraryHint")}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAutoCompleteSettings((prev) => ({
                    ...prev,
                    useLibrary: !prev.useLibrary,
                  }))
                }
                className={`h-6 w-11 rounded-full transition ${autoCompleteSettings.useLibrary ? "bg-[color:var(--accent)]" : "bg-[color:var(--border)]"}`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition ${autoCompleteSettings.useLibrary ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
            {autoCompleteSettings.useLibrary && !hasLibraryFileResources && (
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {t("doc.suggestion.sourceFallbackWeb")}
              </p>
            )}

            <div>
              <p className="mb-2 font-medium">{t("doc.autoCompleteSettings.yearTitle")}</p>
              <div className="flex flex-wrap gap-2">
                {yearPresetOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setAutoCompleteSettings((prev) =>
                        normalizeAutoCompleteSettings({
                          ...prev,
                          yearPreset: option.value,
                          yearMin: option.value === "all" ? undefined : prev.yearMin,
                          yearMax: option.value === "all" ? undefined : prev.yearMax,
                        }),
                      )
                    }
                    className={`rounded-lg px-3 py-1.5 text-sm ${autoCompleteSettings.yearPreset === option.value ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]" : "bg-[color:var(--surface)]"}`}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
              {autoCompleteSettings.yearPreset === "all" && (
                <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                  {t("doc.autoCompleteSettings.noYearLimit")}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={autoCompleteSettings.yearMin ?? ""}
                  onChange={(event) =>
                    setAutoCompleteSettings((prev) => {
                      const next = toOptionalPositiveNumber(event.target.value);
                      return normalizeAutoCompleteSettings({
                        ...prev,
                        yearMin: next,
                        yearMax:
                          next !== undefined && prev.yearMax !== undefined && next > prev.yearMax
                            ? next
                            : prev.yearMax,
                      });
                    })
                  }
                  placeholder={t("doc.autoCompleteSettings.min")}
                  className="w-28 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1.5"
                />
                <span>-</span>
                <input
                  type="number"
                  value={autoCompleteSettings.yearMax ?? ""}
                  onChange={(event) =>
                    setAutoCompleteSettings((prev) => {
                      const next = toOptionalPositiveNumber(event.target.value);
                      return normalizeAutoCompleteSettings({
                        ...prev,
                        yearMax: next,
                        yearMin:
                          next !== undefined && prev.yearMin !== undefined && next < prev.yearMin
                            ? next
                            : prev.yearMin,
                      });
                    })
                  }
                  placeholder={t("doc.autoCompleteSettings.max")}
                  className="w-28 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1.5"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 font-medium">{t("doc.autoCompleteSettings.impactTitle")}</p>
              <div className="flex flex-wrap gap-2">
                {impactPresetOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setAutoCompleteSettings((prev) =>
                        normalizeAutoCompleteSettings({
                          ...prev,
                          impactPreset: option.value,
                          impactMin: option.value === "all" ? undefined : prev.impactMin,
                          impactMax: option.value === "all" ? undefined : prev.impactMax,
                        }),
                      )
                    }
                    className={`rounded-lg px-3 py-1.5 text-sm ${autoCompleteSettings.impactPreset === option.value ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]" : "bg-[color:var(--surface)]"}`}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
              {autoCompleteSettings.impactPreset === "all" && (
                <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                  {t("doc.autoCompleteSettings.noImpactLimit")}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={autoCompleteSettings.impactMin ?? ""}
                  onChange={(event) =>
                    setAutoCompleteSettings((prev) => {
                      const next = toOptionalPositiveNumber(event.target.value);
                      return normalizeAutoCompleteSettings({
                        ...prev,
                        impactMin: next,
                        impactMax:
                          next !== undefined && prev.impactMax !== undefined && next > prev.impactMax
                            ? next
                            : prev.impactMax,
                      });
                    })
                  }
                  placeholder={t("doc.autoCompleteSettings.min")}
                  className="w-28 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1.5"
                />
                <span>-</span>
                <input
                  type="number"
                  step="0.1"
                  value={autoCompleteSettings.impactMax ?? ""}
                  onChange={(event) =>
                    setAutoCompleteSettings((prev) => {
                      const next = toOptionalPositiveNumber(event.target.value);
                      return normalizeAutoCompleteSettings({
                        ...prev,
                        impactMax: next,
                        impactMin:
                          next !== undefined && prev.impactMin !== undefined && next < prev.impactMin
                            ? next
                            : prev.impactMin,
                      });
                    })
                  }
                  placeholder={t("doc.autoCompleteSettings.max")}
                  className="w-28 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1.5"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="flex items-center justify-between border-t border-[color:var(--border)] px-5 py-3 text-sm text-[color:var(--muted-foreground)]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setAutoCompleteEnabled((prev) => {
                const next = !prev;
                if (!next) {
                  setSettingsOpen(false);
                }
                return next;
              });
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium transition ${
              autoCompleteEnabled
                ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                : "border-[color:var(--border)] bg-[color:var(--surface)]"
            }`}
          >
            <span
              className={`h-3 w-3 rounded-full ${autoCompleteEnabled ? "bg-[color:var(--accent-foreground)]" : "bg-[color:var(--muted-foreground)]"}`}
            />
            <span>{t("doc.autoComplete")}</span>
          </button>
          <button
            ref={settingsToggleRef}
            type="button"
            onClick={() => {
              if (!autoCompleteEnabled) {
                return;
              }
              setSettingsOpen((prev) => !prev);
            }}
            disabled={!autoCompleteEnabled}
            className="inline-flex items-center rounded-md border border-[color:var(--border)] px-2 py-1 disabled:opacity-50"
            aria-label={t("doc.autoCompleteSettings.toggle")}
          >
            {settingsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
          <span>{t("doc.citation")}</span>
          <span>{t("doc.text")}</span>
        </div>
        <span>
          {saveState === "saving" && t("common.saving")}
          {saveState === "saved" && t("common.saved")}
          {saveState === "error" && t("common.saveError")}
          {saveState === "idle" && t("common.synced")}
        </span>
      </footer>
    </section>
  );
}

export function DocumentEditorPane({ docId, forceEmpty = false }: DocumentEditorPaneProps) {
  const { t } = useI18n();
  const { docs, docsLoaded, activeDocId, openNewDocModal } = useWorkspaceUI();

  const currentDoc = useMemo(() => {
    if (forceEmpty) {
      return null;
    }

    if (docId) {
      return docs.find((item) => item.id === docId) ?? null;
    }

    if (activeDocId) {
      return docs.find((item) => item.id === activeDocId) ?? null;
    }

    return docs[0] ?? null;
  }, [docId, activeDocId, docs, forceEmpty]);

  if (docId && docsLoaded && !currentDoc) {
    return (
      <section className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold">{t("doc.notFound")}</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">{t("doc.notFoundHint")}</p>
          <button
            type="button"
            onClick={openNewDocModal}
            className="mt-4 rounded-xl bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-foreground)]"
          >
            {t("doc.new")}
          </button>
        </div>
      </section>
    );
  }

  return <EditorContent key={currentDoc?.id ?? "empty"} currentDoc={currentDoc} />;
}
