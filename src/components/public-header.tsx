"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";

export function PublicHeader() {
  const { t } = useI18n();

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-2xl font-bold tracking-tight text-[#1c2a56]">
        Zenthesis
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-[color:var(--muted-foreground)] md:flex">
        <Link href="/case-studies" className="transition hover:text-[color:var(--foreground)]">
          {t("public.pricing")}
        </Link>
        <Link href="/contact" className="transition hover:text-[color:var(--foreground)]">
          {t("public.team")}
        </Link>
        <Link href="/contact" className="transition hover:text-[color:var(--foreground)]">
          {t("public.about")}
        </Link>
        <Link href="/case-studies" className="transition hover:text-[color:var(--foreground)]">
          {t("public.blog")}
        </Link>
      </nav>
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/auth/login"
          className="rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2 text-[color:var(--muted-foreground)] transition hover:text-[color:var(--foreground)]"
        >
          {t("public.login")}
        </Link>
        <Link
          href="/auth/register"
          className="rounded-lg bg-[color:var(--surface)] px-4 py-2 font-semibold text-[color:var(--muted-foreground)] transition hover:text-[color:var(--foreground)]"
        >
          {t("public.start")}
        </Link>
      </nav>
    </header>
  );
}
