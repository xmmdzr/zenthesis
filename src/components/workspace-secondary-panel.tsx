"use client";

import { CirclePlus, LoaderCircle, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import { useWorkspaceUI } from "@/components/workspace-ui-context";

interface WorkspaceSecondaryPanelProps {
  mode: "docs" | "library";
}

function formatOpenedMeta(ts: string, t: (key: string, params?: Record<string, string | number>) => string) {
  const target = new Date(ts);
  const diffMs = Date.now() - target.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return t("workspace.openedMinutesAgo", { minutes: diffMinutes });
  }

  const diffHours = Math.max(1, Math.floor(diffMinutes / 60));
  if (diffHours < 24) {
    return t("workspace.openedHoursAgo", { hours: diffHours });
  }

  const dateText = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(target);
  return t("workspace.openedOnDate", { date: dateText });
}

export function WorkspaceSecondaryPanel({ mode }: WorkspaceSecondaryPanelProps) {
  const { t } = useI18n();
  const {
    docs,
    activeDocId,
    selectDoc,
    openNewDocModal,
    openSourceModal,
    libraryItems,
    deleteDocument,
    isDeletingDocId,
  } = useWorkspaceUI();

  const [pendingDocId, setPendingDocId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const pendingDoc = useMemo(
    () => docs.find((item) => item.id === pendingDocId) ?? null,
    [docs, pendingDocId],
  );

  if (mode === "library") {
    return (
      <aside className="hidden h-full min-h-0 w-[318px] flex-col border-r border-[color:var(--border)] bg-[color:var(--background)] px-3 py-3 lg:flex">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-semibold">{t("workspace.libraryTitle")}</h3>
          <button
            type="button"
            onClick={() => openSourceModal("pdf")}
            className="rounded-xl bg-[color:var(--accent)] p-2 text-[color:var(--accent-foreground)]"
            aria-label={t("workspace.uploadSources")}
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto pb-2">
          <section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-3">
            <h4 className="text-sm font-semibold text-[color:var(--muted-foreground)]">{t("workspace.uploadedItems")}</h4>
            <div className="mt-2 space-y-2">
              {libraryItems.length === 0 && (
                <p className="rounded-lg bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--muted-foreground)]">{t("workspace.noItems")}</p>
              )}
              {libraryItems.map((item) => (
                <article key={item.id} className="rounded-lg bg-[color:var(--surface)] px-3 py-2">
                  <h5 className="text-sm font-semibold">{item.title}</h5>
                  <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{item.sourceType.toUpperCase()}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <button
              type="button"
              onClick={() => openSourceModal("pdf")}
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-left text-sm font-medium"
            >
              {t("library.uploadPdf")}
            </button>
            <button
              type="button"
              onClick={() => openSourceModal("zotero")}
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-left text-sm font-medium"
            >
              {t("library.importZotero")}
            </button>
            <button
              type="button"
              onClick={() => openSourceModal("mendeley")}
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-left text-sm font-medium"
            >
              {t("library.importMendeley")}
            </button>
            <button
              type="button"
              onClick={() => openSourceModal("bib_ris")}
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-left text-sm font-medium"
            >
              {t("library.importBibRis")}
            </button>
            <button
              type="button"
              onClick={() => openSourceModal("id")}
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-left text-sm font-medium"
            >
              {t("library.importById")}
            </button>
          </section>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className="hidden h-full min-h-0 w-[318px] flex-col border-r border-[color:var(--border)] bg-[color:var(--background)] px-3 py-3 lg:flex">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-semibold">{t("workspace.docsTitle")}</h3>
          <button
            type="button"
            onClick={openNewDocModal}
            className="rounded-xl bg-[color:var(--accent)] p-2 text-[color:var(--accent-foreground)]"
            aria-label={t("doc.new")}
          >
            <CirclePlus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-sm text-[color:var(--muted-foreground)]">
          <span className="inline-flex items-center gap-2">
            <Search className="h-4 w-4" /> {t("workspace.searchDocs")}
          </span>
        </div>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pb-2">
          {docs.map((item) => (
            <article
              key={item.id}
              className={`rounded-xl px-3 py-3 transition ${
                activeDocId === item.id
                  ? "bg-[color:var(--surface)]"
                  : "bg-[color:var(--card)] hover:bg-[color:var(--surface)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button type="button" onClick={() => selectDoc(item.id)} className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="line-clamp-1 font-semibold">{item.title}</h4>
                    {item.isSample && (
                      <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--muted-foreground)]">
                        {t("doc.sample")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {formatOpenedMeta(item.updatedAt, t)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingDocId(item.id);
                    setDeleteError(null);
                  }}
                  className="rounded-md p-1 text-[color:var(--muted-foreground)] hover:bg-[color:var(--background)]"
                  aria-label={t("doc.delete")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </aside>

      {pendingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[360px] rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-xl">
            <h4 className="text-base font-semibold">{t("doc.delete")}</h4>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              {pendingDoc.isOwner === false ? t("doc.removeFromListConfirm") : t("doc.deleteConfirm")}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-[color:var(--muted-foreground)]">{pendingDoc.title}</p>
            {deleteError && <p className="mt-2 text-xs text-red-500">{deleteError}</p>}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingDocId(null);
                  setDeleteError(null);
                }}
                className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm"
              >
                {t("common.close")}
              </button>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    const result = await deleteDocument(pendingDoc.id);
                    if (!result.ok) {
                      setDeleteError(result.error || t("doc.deleteFailed"));
                      return;
                    }
                    setPendingDocId(null);
                    setDeleteError(null);
                  })();
                }}
                disabled={isDeletingDocId === pendingDoc.id}
                className="inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-70"
              >
                {isDeletingDocId === pendingDoc.id ? (
                  <>
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    {pendingDoc.isOwner === false ? t("doc.removingFromList") : t("doc.deleting")}
                  </>
                ) : (
                  pendingDoc.isOwner === false ? t("doc.removeFromList") : t("doc.delete")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
