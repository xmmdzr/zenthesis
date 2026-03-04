"use client";

import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Sparkles,
  TextCursorInput,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import type { DraftType } from "@/components/workspace-ui-context";
import { useWorkspaceUI } from "@/components/workspace-ui-context";
import {
  defaultDocCreationSettings,
  normalizeDocCreationSettings,
} from "@/lib/doc-bootstrap";
import { evaluateTitleQuality } from "@/lib/title-quality";
import type { DocCreationSettings } from "@/lib/types";

type CreationStep = "compose" | "settings";

const options: Array<{
  value: DraftType;
  title: string;
  description: string;
  icon: typeof FileText;
}> = [
  {
    value: "standard",
    title: "标准标题",
    description: "添加标准标题（引言、方法、结果等）",
    icon: FileText,
  },
  {
    value: "smart",
    title: "智能标题",
    description: "AI 将根据您的文档提示生成标题和细化大纲",
    icon: Sparkles,
  },
  {
    value: "blank",
    title: "无标题",
    description: "从空白文档开始",
    icon: TextCursorInput,
  },
];

function qualityBarClass(score: number) {
  if (score >= 70) {
    return "bg-emerald-500";
  }
  if (score >= 40) {
    return "bg-amber-500";
  }
  return "bg-red-500";
}

function normalizeSettings(value: DocCreationSettings) {
  return normalizeDocCreationSettings(value);
}

export function NewDocumentModal() {
  const { t } = useI18n();
  const { isNewDocModalOpen, closeNewDocModal, createDocument } = useWorkspaceUI();
  const [step, setStep] = useState<CreationStep>("compose");
  const [prompt, setPrompt] = useState("");
  const [draftType, setDraftType] = useState<DraftType>("standard");
  const [settings, setSettings] = useState<DocCreationSettings>(defaultDocCreationSettings);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smartFallbackReady, setSmartFallbackReady] = useState(false);

  const quality = useMemo(() => evaluateTitleQuality(prompt), [prompt]);

  const canSubmitCompose = useMemo(() => {
    if (draftType === "blank") {
      return true;
    }

    return prompt.trim().length > 0;
  }, [draftType, prompt]);

  function resetModal() {
    setStep("compose");
    setPrompt("");
    setDraftType("standard");
    setSettings(defaultDocCreationSettings());
    setSubmitting(false);
    setError(null);
    setSmartFallbackReady(false);
  }

  function handleClose() {
    resetModal();
    closeNewDocModal();
  }

  async function handleCreate(forceStandardFallback = false) {
    if (submitting) {
      return;
    }

    const trimmedPrompt = prompt.trim();
    const resolvedDraftType: DraftType =
      forceStandardFallback && draftType === "smart" ? "standard" : draftType;

    if (resolvedDraftType !== "blank" && !trimmedPrompt) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const title =
        resolvedDraftType === "blank" ? "未命名" : trimmedPrompt;

      await createDocument({
        title,
        draftType: resolvedDraftType,
        seedPrompt: trimmedPrompt,
        creationSettings: settings,
        bootstrap: resolvedDraftType !== "blank",
      });

      resetModal();
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "创建文档失败，请稍后重试";
      setError(message);
      if (draftType === "smart") {
        setSmartFallbackReady(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!isNewDocModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[880px] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-0 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
          <div className="inline-flex items-center gap-2 text-xl font-semibold">
            {step === "settings" ? (
              <button
                type="button"
                onClick={() => setStep("compose")}
                className="rounded-md p-1 hover:bg-[color:var(--surface)]"
                aria-label={t("common.back")}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : null}
            <span>{step === "compose" ? "文档提示" : "自动完成设置"}</span>
            {step === "settings" && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)]"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "compose" ? (
          <div className="p-5">
            <h2 className="text-4xl font-semibold">{t("newDoc.title")}</h2>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={t("newDoc.placeholder")}
              rows={5}
              className="mt-4 w-full resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-lg outline-none focus:border-[color:var(--accent)]"
            />

            {draftType !== "blank" && (
              <>
                <div className="mt-3 h-1.5 w-full rounded-full bg-[color:var(--border)]">
                  <div
                    className={`h-1.5 rounded-full transition-all ${qualityBarClass(quality.score)}`}
                    style={{ width: `${quality.score}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--muted-foreground)]">
                  <span>
                    {quality.level === "strong" ? "强提示" : quality.level === "medium" ? "中等提示" : "弱提示"}
                  </span>
                  <span>{quality.score}/100</span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                  {quality.tips[0] || t("newDoc.weakPrompt")}
                </p>
              </>
            )}

            <h3 className="mt-5 text-3xl font-semibold">{t("newDoc.genOutline")}</h3>

            <div className="mt-3 space-y-3">
              {options.map((option) => {
                const active = option.value === draftType;
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDraftType(option.value)}
                    className={`flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition ${
                      active
                        ? "border-[color:var(--accent)] ring-1 ring-[color:var(--accent)]"
                        : "border-[color:var(--border)] hover:border-[color:var(--accent)]"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full border ${
                        active
                          ? "border-[color:var(--accent)] bg-[color:var(--accent)]"
                          : "border-[color:var(--border)]"
                      }`}
                    />
                    <Icon className="h-7 w-7 text-[color:var(--muted-foreground)]" />
                    <span>
                      <span className="block text-lg font-semibold">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-sm text-[color:var(--muted-foreground)]">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (draftType === "blank") {
                    void handleCreate();
                    return;
                  }
                  setStep("settings");
                }}
                disabled={!canSubmitCompose || submitting}
                className="rounded-xl bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-[color:var(--accent-foreground)] disabled:opacity-50"
              >
                {submitting ? t("newDoc.creating") : t("common.next")}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="space-y-5">
              <section>
                <p className="text-sm font-semibold text-[color:var(--muted-foreground)]">来源</p>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-[color:var(--surface)] px-3 py-2">
                    <div>
                      <p className="font-semibold">考虑外部来源</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">将考虑来自网络的来源</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => normalizeSettings({ ...prev, useWeb: !prev.useWeb }))
                      }
                      className={`h-6 w-11 rounded-full transition ${
                        settings.useWeb ? "bg-[color:var(--accent)]" : "bg-[color:var(--border)]"
                      }`}
                    >
                      <span
                        className={`block h-5 w-5 rounded-full bg-white transition ${
                          settings.useWeb ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[color:var(--surface)] px-3 py-2">
                    <div>
                      <p className="font-semibold">考虑文库来源</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">将考虑来自图书馆的来源</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => normalizeSettings({ ...prev, useLibrary: !prev.useLibrary }))
                      }
                      className={`h-6 w-11 rounded-full transition ${
                        settings.useLibrary ? "bg-[color:var(--accent)]" : "bg-[color:var(--border)]"
                      }`}
                    >
                      <span
                        className={`block h-5 w-5 rounded-full bg-white transition ${
                          settings.useLibrary ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>

              <section>
                <p className="text-sm font-semibold text-[color:var(--muted-foreground)]">引用筛选</p>
                <div className="mt-2">
                  <p className="text-sm font-semibold">发表年份</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      { key: "all", label: "全部" },
                      { key: "5y", label: "最近 5 年" },
                      { key: "custom", label: "自定义" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setSettings((prev) =>
                            normalizeSettings({
                              ...prev,
                              yearPreset: item.key as DocCreationSettings["yearPreset"],
                            }),
                          )
                        }
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          settings.yearPreset === item.key
                            ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                            : "bg-[color:var(--surface)]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  {settings.yearPreset === "custom" && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.yearMin ?? ""}
                        onChange={(event) =>
                          setSettings((prev) =>
                            normalizeSettings({
                              ...prev,
                              yearMin: event.target.value ? Number(event.target.value) : undefined,
                            }),
                          )
                        }
                        placeholder="最小值"
                        className="w-28 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1.5"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={settings.yearMax ?? ""}
                        onChange={(event) =>
                          setSettings((prev) =>
                            normalizeSettings({
                              ...prev,
                              yearMax: event.target.value ? Number(event.target.value) : undefined,
                            }),
                          )
                        }
                        placeholder="最大值"
                        className="w-28 rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1.5"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold">影响因子</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      { key: "all", label: "全部" },
                      { key: "gt025", label: ">0.25" },
                      { key: "gt3", label: ">3" },
                      { key: "gt10", label: ">10" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setSettings((prev) =>
                            normalizeSettings({
                              ...prev,
                              impactPreset: item.key as DocCreationSettings["impactPreset"],
                            }),
                          )
                        }
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          settings.impactPreset === item.key
                            ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                            : "bg-[color:var(--surface)]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <p className="text-sm font-semibold text-[color:var(--muted-foreground)]">引用格式</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <select
                    value={settings.citationStyle}
                    onChange={(event) =>
                      setSettings((prev) =>
                        normalizeSettings({
                          ...prev,
                          citationStyle: event.target.value as DocCreationSettings["citationStyle"],
                        }),
                      )
                    }
                    className="w-full max-w-[260px] rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2"
                  >
                    <option value="APA7">APA (7th ed.)</option>
                    <option value="MLA9">MLA (9th ed.)</option>
                    <option value="Chicago17">Chicago (17th)</option>
                    <option value="GBT7714">GB/T 7714</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => normalizeSettings({ ...prev, showCitationPage: !prev.showCitationPage }))
                    }
                    className={`h-6 w-11 rounded-full transition ${
                      settings.showCitationPage ? "bg-[color:var(--accent)]" : "bg-[color:var(--border)]"
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white transition ${
                        settings.showCitationPage ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </section>
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex items-center justify-end gap-2">
              {smartFallbackReady && draftType === "smart" && (
                <button
                  type="button"
                  onClick={() => void handleCreate(true)}
                  disabled={submitting}
                  className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-semibold"
                >
                  降级为标准模板继续
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={submitting}
                className="rounded-xl bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-foreground)] disabled:opacity-60"
              >
                {submitting ? t("newDoc.creating") : "开始写作"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
