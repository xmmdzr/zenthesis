"use client";

import { useI18n } from "@/components/i18n-provider";
import { PublicHeader } from "@/components/public-header";

export default function ContactPage() {
  const { locale } = useI18n();

  return (
    <div className="min-h-screen pb-12">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl px-6 lg:px-10">
        <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-8">
          <h1 className="text-4xl font-bold">{locale === "zh" ? "联系团队" : "Contact the Team"}</h1>
          <p className="mt-3 text-[color:var(--muted-foreground)]">
            {locale === "zh"
              ? "欢迎反馈产品建议、试点需求与机构合作。"
              : "Reach us for product feedback, pilot programs, and institutional partnerships."}
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <p>Email: team@zenthesis.ai</p>
            <p>Support: support@zenthesis.ai</p>
            <p>X: @zenthesisai</p>
          </div>
        </section>
      </main>
    </div>
  );
}
