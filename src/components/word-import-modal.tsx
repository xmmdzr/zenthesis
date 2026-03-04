"use client";

import { FileUp, X } from "lucide-react";
import { useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import { useWorkspaceUI } from "@/components/workspace-ui-context";

interface WordImportModalProps {
  currentDocId?: string | null;
}

export function WordImportModal({ currentDocId }: WordImportModalProps) {
  const { t } = useI18n();
  const { isWordImportModalOpen, closeWordImportModal, createDocument, updateDocument } = useWorkspaceUI();
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!fileName || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (currentDocId) {
        await updateDocument(currentDocId, {
          content: `Imported from Word: ${fileName}\n\n(Editable content placeholder)`,
          status: "active",
        });
      } else {
        const created = await createDocument({
          title: fileName.replace(/\.docx$/i, "") || t("doc.untitled"),
          draftType: "standard",
          seedPrompt: "",
        });

        await updateDocument(created.id, {
          content: `Imported from Word: ${fileName}\n\n(Editable content placeholder)`,
          status: "active",
        });
      }

      setLoading(false);
      setFileName("");
      closeWordImportModal();
      return;
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : t("word.import"));
    }

    setLoading(false);
  }

  if (!isWordImportModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[680px] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold">{t("word.title")}</h2>
          <button
            type="button"
            onClick={closeWordImportModal}
            className="rounded-lg p-2 text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)]"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--border)] p-10 text-center">
          <FileUp className="mx-auto h-8 w-8 text-[color:var(--accent)]" />
          <p className="mt-3 text-lg font-semibold">{t("word.uploadDocx")}</p>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{t("word.uploadDesc")}</p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <input
              type="file"
              accept=".docx"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setFileName(file?.name ?? "");
              }}
              className="max-w-[260px] text-sm"
            />
          </div>
          {fileName && <p className="mt-2 text-sm">{t("word.selected", { file: fileName })}</p>}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={!fileName || loading}
            className="rounded-xl bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-foreground)] disabled:opacity-50"
          >
            {loading ? t("word.importing") : t("word.import")}
          </button>
        </div>
      </div>
    </div>
  );
}
