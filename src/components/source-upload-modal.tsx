"use client";

import { FileArchive, FileText, Hash, Search, UploadCloud, X } from "lucide-react";
import { useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import { useWorkspaceUI, type SourceTab } from "@/components/workspace-ui-context";

export function SourceUploadModal() {
  const { t } = useI18n();
  const tabs: Array<{ key: SourceTab; label: string }> = [
    { key: "pdf", label: t("source.tab.pdf") },
    { key: "zotero", label: t("source.tab.zotero") },
    { key: "mendeley", label: t("source.tab.mendeley") },
    { key: "bib_ris", label: t("source.tab.bibris") },
    { key: "id", label: t("source.tab.id") },
  ];

  const { isSourceModalOpen, sourceTab, openSourceModal, closeSourceModal } = useWorkspaceUI();
  const [bibInput, setBibInput] = useState("");

  const activeTab = tabs.find((tab) => tab.key === sourceTab) ?? tabs[0];

  if (!isSourceModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[920px] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold">{t("source.title")}</h2>
          <button
            type="button"
            onClick={closeSourceModal}
            className="rounded-lg p-2 text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)]"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => openSourceModal(tab.key)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                tab.key === activeTab.key ? "bg-[color:var(--surface)]" : "text-[color:var(--muted-foreground)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab.key === "pdf" && (
          <section className="mt-4 rounded-xl border border-dashed border-[color:var(--border)] p-10 text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-[color:var(--accent)]" />
            <h3 className="mt-4 text-2xl font-semibold">{t("source.maxPdf")}</h3>
            <p className="mt-2 text-[color:var(--muted-foreground)]">{t("source.dragOrSelect")}</p>
            <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">{t("source.pdfLimit")}</p>
          </section>
        )}

        {activeTab.key === "zotero" && (
          <section className="mt-6 py-10 text-center">
            <div className="mx-auto w-fit rounded-2xl bg-[color:var(--surface)] p-4">
              <FileText className="h-10 w-10 text-[#e35757]" />
            </div>
            <h3 className="mt-5 text-4xl font-semibold">{t("source.connectZotero")}</h3>
            <p className="mt-3 text-[color:var(--muted-foreground)]">{t("source.connectZoteroDesc")}</p>
            <button type="button" className="mt-6 rounded-xl bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-foreground)]">
              {t("common.connect")}
            </button>
          </section>
        )}

        {activeTab.key === "mendeley" && (
          <section className="mt-6 py-10 text-center">
            <div className="mx-auto w-fit rounded-2xl bg-[color:var(--surface)] p-4">
              <FileArchive className="h-10 w-10 text-[#b91c1c]" />
            </div>
            <h3 className="mt-5 text-4xl font-semibold">{t("source.connectMendeley")}</h3>
            <p className="mt-3 text-[color:var(--muted-foreground)]">{t("source.connectMendeleyDesc")}</p>
            <button type="button" className="mt-6 rounded-xl bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-foreground)]">
              {t("common.connect")}
            </button>
          </section>
        )}

        {activeTab.key === "bib_ris" && (
          <section className="mt-4">
            <textarea
              value={bibInput}
              onChange={(event) => setBibInput(event.target.value)}
              rows={12}
              placeholder={t("source.bibPlaceholder")}
              className="w-full resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]"
            />
            <div className="mt-3 flex items-center justify-between text-sm">
              <p className="text-[color:var(--muted-foreground)]">{t("library.importBibRis")}</p>
              <button type="button" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 font-semibold text-[color:var(--accent-foreground)]">
                {t("source.importToLibrary")}
              </button>
            </div>
          </section>
        )}

        {activeTab.key === "id" && (
          <section className="mt-4 space-y-4">
            <p className="text-lg font-semibold">{t("source.metaHint")}</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]"
              />
              <button type="button" className="rounded-xl bg-[color:var(--accent)] p-3 text-[color:var(--accent-foreground)]">
                <Search className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm font-semibold">{t("source.tryExample")}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { key: "DOI", value: "10.1038/s41522-018-0073-2", hint: "DOI" },
                { key: "PMID", value: "34234088", hint: "PMID" },
                { key: "arXiv", value: "https://arxiv.org/abs/2306.01643", hint: "arXiv" },
                { key: "ISBN", value: "0374533555", hint: "ISBN" },
              ].map((item) => (
                <article key={item.key} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3">
                  <h4 className="text-lg font-semibold">{item.key}</h4>
                  <p className="text-sm text-[color:var(--muted-foreground)]">{item.hint}</p>
                  <div className="mt-2 rounded bg-[color:var(--surface)] px-2 py-1 text-center text-sm">{item.value}</div>
                </article>
              ))}
            </div>
            <div className="flex justify-end">
              <button type="button" className="inline-flex items-center gap-1 rounded-xl bg-[color:var(--accent)] px-4 py-2 font-semibold text-[color:var(--accent-foreground)]">
                <Hash className="h-4 w-4" /> {t("source.importToLibrary")}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
