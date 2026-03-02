"use client";

import { LogOut, Settings, ChevronDown, ChevronsUpDown } from "lucide-react";
import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";
import { useWorkspaceUI } from "@/components/workspace-ui-context";

export function UserProfileMenu() {
  const { t } = useI18n();
  const { user, isUserMenuOpen, toggleUserMenu, closeUserMenu, usageLines, logout } = useWorkspaceUI();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleUserMenu}
        className="inline-flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-sm font-semibold hover:bg-[color:var(--surface)]"
        aria-expanded={isUserMenuOpen}
        aria-haspopup="menu"
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-[color:var(--accent-foreground)]">
            {user.avatarText}
          </span>
          {user.name}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-[color:var(--muted-foreground)]" />
      </button>

      {isUserMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default"
            onClick={closeUserMenu}
            aria-label="close menu overlay"
          />
          <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-[220px] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-xl">
            <div className="border-b border-[color:var(--border)] p-2">
              <Link
                href="/app/settings"
                onClick={closeUserMenu}
                className="inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-[color:var(--surface)]"
              >
                <Settings className="h-4 w-4" /> {t("common.settings")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  void logout();
                }}
                className="inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-[color:var(--surface)]"
              >
                <LogOut className="h-4 w-4" /> {t("common.logout")}
              </button>
            </div>

            <div className="space-y-2 p-3">
              {usageLines.map((line) => {
                const percent = Math.min(100, Math.round((line.used / line.limit) * 100));

                return (
                  <div key={line.labelKey}>
                    <div className="mb-1 flex items-center justify-between text-sm font-medium">
                      <span>{t(line.labelKey)}</span>
                      <span className="text-[color:var(--muted-foreground)]">{line.used}/{line.limit}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[color:var(--surface)]">
                      <div className="h-1.5 rounded-full bg-[color:var(--border)]" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 pt-0">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent-foreground)]"
              >
                ⚡ {t("common.pricing")}
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
