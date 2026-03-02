"use client";

import { useI18n } from "@/components/i18n-provider";

export default function LibraryImportPage() {
  const { locale } = useI18n();
  const importOptions = locale === "zh"
    ? ["上传本地 PDF", "导入 .bib/.ris", "导入网页链接", "连接 Zotero", "连接 Mendeley"]
    : ["Upload local PDF", "Import .bib/.ris", "Import web link", "Connect Zotero", "Connect Mendeley"];

  return (
    <section>
      <h1 className="text-3xl font-bold">{locale === "zh" ? "图书馆导入中心" : "Library Import Center"}</h1>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        {locale === "zh" ? "选择导入来源并创建导入任务。" : "Select a source and create an import job."}
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {importOptions.map((option) => (
          <article key={option} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
            <h2 className="text-base font-semibold">{option}</h2>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              {locale === "zh"
                ? "导入能力已在 `/api/library/import/*` 提供接口骨架。"
                : "Import handlers are scaffolded under `/api/library/import/*`."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
