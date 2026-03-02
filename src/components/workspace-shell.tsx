"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { NewDocumentModal } from "@/components/new-document-modal";
import { SourceUploadModal } from "@/components/source-upload-modal";
import { WorkspaceChatPanel } from "@/components/workspace-chat-panel";
import { WorkspaceSecondaryPanel } from "@/components/workspace-secondary-panel";
import { WorkspaceUIProvider, useWorkspaceUI } from "@/components/workspace-ui-context";
import { WordImportModal } from "@/components/word-import-modal";

interface WorkspaceShellProps {
  children: React.ReactNode;
}

function WorkspaceShellInner({ children }: WorkspaceShellProps) {
  const pathname = usePathname();
  const { isChatOpen, activeDocId, openChatPanel, leftPanelMode } = useWorkspaceUI();
  const prevPathRef = useRef("");

  useEffect(() => {
    const wasChat = prevPathRef.current.startsWith("/app/chat");
    const isChat = pathname.startsWith("/app/chat");
    if (isChat && !wasChat) {
      openChatPanel();
    }
    prevPathRef.current = pathname;
  }, [pathname, openChatPanel]);

  const showRightChatPanel = isChatOpen;
  const showLeftPanel = leftPanelMode !== null;

  return (
    <>
      <div className="h-screen overflow-hidden md:flex">
        <AppSidebar />
        {showLeftPanel && leftPanelMode === "docs" && <WorkspaceSecondaryPanel mode="docs" />}
        {showLeftPanel && leftPanelMode === "library" && <WorkspaceSecondaryPanel mode="library" />}
        <main className="flex-1 min-h-0 overflow-hidden p-3 lg:p-0">
          <div className="mx-auto h-full w-full">{children}</div>
        </main>
        {showRightChatPanel && <WorkspaceChatPanel />}
      </div>

      <NewDocumentModal />
      <SourceUploadModal />
      <WordImportModal currentDocId={activeDocId} />
    </>
  );
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <WorkspaceUIProvider>
      <WorkspaceShellInner>{children}</WorkspaceShellInner>
    </WorkspaceUIProvider>
  );
}
