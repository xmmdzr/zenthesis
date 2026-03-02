"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useI18n } from "@/components/i18n-provider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const message = response ? ((await response.json().catch(() => null)) as { error?: string } | null)?.error : "Network error";
      setError(message || "Login failed");
      setLoading(false);
      return;
    }

    const nextPath =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
    router.push(nextPath || "/app/docs");
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <div className="h-4 bg-[linear-gradient(90deg,#bfd0ff,#afebd6,#f9f19b,#efbfd8)]" />
      <main className="mx-auto flex min-h-[calc(100vh-16px)] w-full max-w-5xl flex-col items-center px-6">
        <div className="pt-10 text-center">
          <p className="text-3xl font-bold tracking-tight text-[#1c2a56]">{t("auth.brand")}</p>
        </div>

        <section className="mt-24 w-full max-w-[440px] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-7 py-8 shadow-[0_8px_32px_rgba(26,29,52,0.04)]">
          <h1 className="text-center text-4xl font-bold">{t("auth.loginTitle")}</h1>

          <button
            type="button"
            className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm font-semibold"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ffffff] text-[#4285F4]">G</span>
            {t("auth.google")}
          </button>

          <div className="my-6 h-px bg-[color:var(--border)]" />

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <label className="font-medium">{t("auth.password")}</label>
                <Link href="#" className="text-[color:var(--muted-foreground)] underline">
                  {t("auth.forgot")}
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("auth.passwordLoginPlaceholder")}
                className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-[color:var(--accent-foreground)] disabled:opacity-60"
            >
              {loading ? `${t("auth.login")}...` : t("auth.login")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[color:var(--muted-foreground)]">
            {t("auth.orRegister")}
            <Link href="/auth/register" className="ml-1 font-semibold text-[color:var(--foreground)] underline">
              {t("auth.gotoRegister")}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
