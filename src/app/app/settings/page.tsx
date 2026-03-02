"use client";

import { ThemeSettingsCard } from "@/components/theme-settings-card";
import { useI18n } from "@/components/i18n-provider";

export default function SettingsPage() {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">{t("common.settings")}</h1>
      <p className="text-sm text-[color:var(--muted-foreground)]">Manage profile defaults, theme, and locale visibility.</p>
      <ThemeSettingsCard />
    </section>
  );
}
