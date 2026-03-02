"use client";

import { BookOpenText, Bot, CirclePlus, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useI18n } from "@/components/i18n-provider";
import { ThemeDock } from "@/components/theme-dock";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { useWorkspaceUI } from "@/components/workspace-ui-context";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    openNewDocModal,
    openDocsPanel,
    toggleLibraryPanel,
    toggleChatPanel,
  } = useWorkspaceUI();
  const { t } = useI18n();
  const isDocsActive = pathname.startsWith("/app/docs");

  return (
    <aside className="flex w-full flex-col border-b border-[color:var(--border)] bg-[color:var(--card)] px-3 py-3 md:h-full md:w-[220px] md:min-h-0 md:border-b-0 md:border-r">
      <div className="mb-3">
        <UserProfileMenu />
      </div>

      <button
        type="button"
        onClick={() => {
          router.push("/app/docs/new");
          openNewDocModal();
        }}
        className={`mb-1 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
          pathname === "/app/docs/new"
            ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
            : "hover:bg-[color:var(--surface)]"
        }`}
      >
        <CirclePlus className="h-4 w-4" /> {t("nav.new")}
      </button>

      <nav className="flex gap-1 md:flex-col">
        <Link
          href="/app/docs"
          onClick={openDocsPanel}
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
            isDocsActive
              ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
              : "hover:bg-[color:var(--surface)]"
          }`}
        >
          <FileText className="h-4 w-4" />
          {t("nav.docs")}
        </Link>
        <button
          type="button"
          onClick={toggleLibraryPanel}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-[color:var(--surface)]"
        >
          <BookOpenText className="h-4 w-4" />
          {t("nav.library")}
        </button>
        <button
          type="button"
          onClick={toggleChatPanel}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-[color:var(--surface)]"
        >
          <Bot className="h-4 w-4" />
          {t("nav.chat")}
        </button>
      </nav>

      <div className="mt-auto pt-4">
        <ThemeDock />
      </div>
    </aside>
  );
}
