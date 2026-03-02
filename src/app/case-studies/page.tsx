"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { PublicHeader } from "@/components/public-header";

export default function CaseStudiesPage() {
  const { locale } = useI18n();

  const cases = locale === "zh"
    ? [
        { title: "硕士论文冲刺", outcome: "通过聊天到文档联动，首稿时间缩短 42%。" },
        { title: "文献综述重整", outcome: "将分散笔记整理为结构化的六节综述大纲。" },
        { title: "引用流程修复", outcome: "将多来源参考文献合并为 APA 可用清单。" },
      ]
    : [
        { title: "Master's Thesis Sprint", outcome: "Reduced first-draft time by 42% with chat-to-document workflow." },
        { title: "Literature Review Cleanup", outcome: "Converted scattered notes into a structured 6-section review." },
        { title: "Citation Workflow Recovery", outcome: "Merged mixed-source references into one APA-ready bibliography." },
      ];

  return (
    <div className="min-h-screen pb-12">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl px-6 lg:px-10">
        <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 md:p-10">
          <h1 className="text-4xl font-bold">{locale === "zh" ? "案例" : "Case Studies"}</h1>
          <p className="mt-3 text-[color:var(--muted-foreground)]">
            {locale === "zh"
              ? "真实写作场景：从无从下笔到可提交论文结构。"
              : "Real writing scenarios where users moved from uncertainty to submission-ready structure."}
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {cases.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{item.outcome}</p>
            </article>
          ))}
        </section>

        <div className="mt-8">
          <Link
            href="/auth/register"
            className="inline-flex rounded-full bg-[color:var(--accent)] px-6 py-3 font-semibold text-[color:var(--accent-foreground)]"
          >
            {locale === "zh" ? "开始使用 Zenthesis" : "Start Writing with Zenthesis"}
          </Link>
        </div>
      </main>
    </div>
  );
}
