"use client";

import Link from "next/link";

import { PublicHeader } from "@/components/public-header";
import { useI18n } from "@/components/i18n-provider";

export default function HomePage() {
  const { t, locale } = useI18n();
  const featureCardKeys = locale === "zh"
    ? [
        { title: "智能起稿", detail: "从一个问题出发，自动生成论文结构与段落草稿，减少空白页焦虑。" },
        { title: "文献管理", detail: "支持 PDF、网页、Zotero、Mendeley 与 .bib/.ris 导入，统一整理引用。" },
        { title: "段落改写", detail: "针对学术语气、逻辑连贯与术语准确性进行句段级润色。" },
        { title: "摘要生成", detail: "快速输出摘要、结论和研究贡献总结，支持多轮压缩与扩展。" },
        { title: "引用格式化", detail: "按 APA / MLA / Chicago 生成可粘贴引用，降低格式错误率。" },
        { title: "导出提交", detail: "一键导出 DOCX / PDF，打通从构思到提交的完整流程。" },
      ]
    : [
        { title: "AI Drafting", detail: "Generate thesis structure and first-pass sections from a prompt." },
        { title: "Reference Library", detail: "Import PDF, web, Zotero, Mendeley, and .bib/.ris in one place." },
        { title: "Paragraph Rewrite", detail: "Refine academic tone, coherence, and terminology precision." },
        { title: "Summary Builder", detail: "Produce abstract, conclusion, and contribution summaries faster." },
        { title: "Citation Formatting", detail: "Generate APA / MLA / Chicago references ready to paste." },
        { title: "Export", detail: "Export DOCX / PDF to complete the writing-to-submission flow." },
      ];

  return (
    <div className="min-h-screen pb-16">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl px-6">
        <section className="pt-10 text-center md:pt-16">
          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight md:text-6xl">{t("home.badge")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[color:var(--muted-foreground)] md:text-lg">{t("home.subtitle")}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/auth/register"
              className="rounded-xl bg-[color:var(--accent)] px-7 py-3 text-sm font-semibold text-[color:var(--accent-foreground)]"
            >
              {t("home.cta")}
            </Link>
          </div>
          <p className="mt-5 text-sm text-[color:var(--muted-foreground)]">{t("home.socialProof")}</p>
        </section>

        <section className="mt-10 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-3 md:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_2.1fr_1fr]">
            <div className="rounded-xl bg-[color:var(--surface)] p-3 text-left">
              <p className="text-xs text-[color:var(--muted-foreground)]">Library</p>
              <p className="mt-2 rounded-lg bg-[color:var(--card)] px-2 py-2 text-xs">Hardware Prototyping for Digital Systems...</p>
              <p className="mt-2 rounded-lg bg-[color:var(--card)] px-2 py-2 text-xs">Predicting Earthquakes and Seismic Risk...</p>
              <p className="mt-2 rounded-lg bg-[color:var(--card)] px-2 py-2 text-xs">Cognitive Load in Remote Team Work...</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-left">
              <h2 className="text-2xl font-bold">Hardware Prototyping for Digital Systems: A Review</h2>
              <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
                {locale === "zh"
                  ? "传统逻辑仿真已经证明其在验证方面的价值。本文综合多篇高引文献，提出一个更适用于课程项目与原型实验的硬件设计路径。"
                  : "Classical logic simulation has shown strong verification value. This workspace combines sources, drafting, and iterative review."}
              </p>
              <div className="mt-4 rounded-lg bg-[color:var(--surface)] px-3 py-2 text-xs text-[color:var(--muted-foreground)]">
                {locale === "zh"
                  ? "引用、文本、公式、导出等能力均可在同一工作区协同完成。"
                  : "Citations, text, equations, and export are handled in one workspace."}
              </div>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-3 text-left">
              <p className="text-xs text-[color:var(--muted-foreground)]">AI Chat</p>
              <p className="mt-2 rounded-lg bg-[color:var(--surface)] px-2 py-2 text-xs">What are the key metrics for hardware prototyping?</p>
              <p className="mt-2 rounded-lg border border-[color:var(--border)] px-2 py-2 text-xs">
                Focus on design latency, iteration cost, and validation coverage.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-[color:var(--accent)]">POWERFUL FEATURES</p>
          <h3 className="mt-2 text-3xl font-bold">{t("home.featuresTitle")}</h3>
          <p className="mx-auto mt-3 max-w-2xl text-[color:var(--muted-foreground)]">{t("home.featuresSubtitle")}</p>
        </section>

        <section className="masonry-grid mt-8">
          {featureCardKeys.map((card, index) => (
            <article
              key={card.title}
              className="masonry-item mb-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6"
            >
              <p className="text-xs font-mono text-[color:var(--muted-foreground)]">{String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 text-2xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{card.detail}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
