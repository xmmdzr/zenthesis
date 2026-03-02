"use client";

import { MonitorCog, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo } from "react";

import type { ThemePreference } from "@/lib/types";

const cycle: ThemePreference[] = ["system", "light", "dark"];

function nextTheme(theme: string | undefined): ThemePreference {
  const current = cycle.includes(theme as ThemePreference)
    ? (theme as ThemePreference)
    : "system";
  return cycle[(cycle.indexOf(current) + 1) % cycle.length];
}

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const label = useMemo(() => {
    if (theme === "dark") {
      return "Theme: Dark";
    }

    if (theme === "light") {
      return "Theme: Light";
    }

    return "Theme: System";
  }, [theme]);

  const Icon = theme === "dark" ? Moon : theme === "light" ? SunMedium : MonitorCog;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(nextTheme(theme))}
        className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-xs font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
        aria-label="切换主题"
        title="切换主题：跟随系统 -> 亮色 -> 暗色"
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{theme === "dark" ? "暗色" : theme === "light" ? "亮色" : "系统"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme(theme))}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] shadow-sm transition hover:border-[color:var(--accent)]"
      aria-label="Toggle theme"
      title="Cycle theme: System -> Light -> Dark"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
