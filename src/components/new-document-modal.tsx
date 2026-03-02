"use client";

import { FileText, Sparkles, TextCursorInput, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import type { DraftType } from "@/components/workspace-ui-context";
import { useWorkspaceUI } from "@/components/workspace-ui-context";

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
    description: "AI 将根据您的文档提示生成标题",
    icon: Sparkles,
  },
  {
    value: "blank",
    title: "无标题",
    description: "从空白文档开始",
    icon: TextCursorInput,
  },
];

export function NewDocumentModal() {
  const { t } = useI18n();
  const { isNewDocModalOpen, closeNewDocModal, createDocument } = useWorkspaceUI();
  const [prompt, setPrompt] = useState("");
  const [draftType, setDraftType] = useState<DraftType>("standard");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (draftType === "blank") {
      return true;
    }

    return prompt.trim().length > 0;
  }, [draftType, prompt]);

  async function handleCreate() {
    if (!canSubmit || submitting) {
      return;
    }

    setSubmitting(true);

    const trimmedPrompt = prompt.trim();
    let title = trimmedPrompt;

    if (draftType === "smart") {
      title = trimmedPrompt ? `智能标题：${trimmedPrompt.slice(0, 16)}` : "智能标题";
    }

    if (draftType === "blank") {
      title = "未命名";
    }

    await createDocument({
      title,
      draftType,
      seedPrompt: trimmedPrompt,
    });

    setSubmitting(false);
    setPrompt("");
    setDraftType("standard");
  }

  if (!isNewDocModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[780px] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="text-4xl font-semibold">{t("newDoc.title")}</h2>
          <button
            type="button"
            onClick={closeNewDocModal}
            className="rounded-lg p-2 text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)]"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={t("newDoc.placeholder")}
          rows={5}
          className="mt-4 w-full resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-lg outline-none focus:border-[color:var(--accent)]"
        />

        <p className="mt-3 border-t border-[color:var(--border)] pt-3 text-lg text-[color:var(--muted-foreground)]">
          {t("newDoc.weakPrompt")}
        </p>

        <h3 className="mt-5 text-4xl font-semibold">{t("newDoc.genOutline")}</h3>

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
                    active ? "border-[color:var(--accent)] bg-[color:var(--accent)]" : "border-[color:var(--border)]"
                  }`}
                />
                <Icon className="h-7 w-7 text-[color:var(--muted-foreground)]" />
                <span>
                  <span className="block text-lg font-semibold">
                    {option.value === "standard" && t("newDoc.standard")}
                    {option.value === "smart" && t("newDoc.smart")}
                    {option.value === "blank" && t("newDoc.blank")}
                  </span>
                  <span className="mt-1 block text-sm text-[color:var(--muted-foreground)]">
                    {option.value === "standard" && t("newDoc.standardDesc")}
                    {option.value === "smart" && t("newDoc.smartDesc")}
                    {option.value === "blank" && t("newDoc.blankDesc")}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={!canSubmit || submitting}
            className="rounded-xl bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-[color:var(--accent-foreground)] disabled:opacity-50"
          >
            {submitting ? t("newDoc.creating") : t("common.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
