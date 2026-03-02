"use client";

import { CirclePlus, Search, Upload } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { useWorkspaceUI } from "@/components/workspace-ui-context";

interface WorkspaceSecondaryPanelProps {
  mode: "docs" | "library";
}

function formatMeta(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  return Math.max(1, Math.floor(diff / 60000));
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
  } = useWorkspaceUI();

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
          <button
            key={item.id}
            type="button"
            onClick={() => selectDoc(item.id)}
            className={`w-full rounded-xl px-3 py-3 text-left transition ${
              activeDocId === item.id
                ? "bg-[color:var(--surface)]"
                : "bg-[color:var(--card)] hover:bg-[color:var(--surface)]"
            }`}
          >
            <h4 className="font-semibold">{item.title}</h4>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{new Date(item.updatedAt).toLocaleDateString()} · {t("workspace.openedAgo", { minutes: formatMeta(item.updatedAt) })}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
