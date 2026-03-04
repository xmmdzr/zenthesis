"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  DocCreationSettings,
  ConversationAttachment,
  ConversationMessage,
  ConversationSummary,
  DocumentItem,
  LibraryItem,
  TempUserProfile,
} from "@/lib/types";

export type SourceTab = "pdf" | "zotero" | "mendeley" | "bib_ris" | "id";
export type DraftType = "standard" | "smart" | "blank";
export type LeftPanelMode = "docs" | "library" | null;
export type DeleteDocMode = "hard_deleted" | "removed_from_list";

interface UsageLine {
  labelKey: string;
  used: number;
  limit: number;
}

interface CreateDocumentPayload {
  title: string;
  draftType: DraftType;
  seedPrompt?: string;
  creationSettings?: DocCreationSettings;
  bootstrap?: boolean;
}

interface WorkspaceUIContextValue {
  user: TempUserProfile;
  docs: DocumentItem[];
  libraryItems: LibraryItem[];
  docsLoaded: boolean;
  activeDocId: string | null;
  leftPanelMode: LeftPanelMode;
  isChatOpen: boolean;
  isUserMenuOpen: boolean;
  isNewDocModalOpen: boolean;
  isSourceModalOpen: boolean;
  isWordImportModalOpen: boolean;
  sourceTab: SourceTab;
  usageLines: UsageLine[];
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  isDeletingConversationId: string | null;
  isDeletingDocId: string | null;
  conversationMessages: ConversationMessage[];
  conversationAttachments: ConversationAttachment[];
  selectedAttachmentIds: string[];
  isHistoryDropdownOpen: boolean;
  useCurrentDoc: boolean;
  selectDoc: (docId: string) => void;
  openDocsPanel: () => void;
  toggleLibraryPanel: () => void;
  closeLeftPanel: () => void;
  openChatPanel: () => void;
  toggleChatPanel: () => void;
  closeChatPanel: () => void;
  setHistoryDropdownOpen: (open: boolean) => void;
  toggleHistoryDropdown: () => void;
  createNewConversation: (title?: string) => Promise<ConversationSummary | null>;
  openConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<boolean>;
  appendConversationMessage: (
    payload: Pick<ConversationMessage, "role" | "content"> & Partial<ConversationMessage>,
  ) => void;
  refreshConversations: () => Promise<ConversationSummary[]>;
  clearConversationMessages: () => void;
  setUseCurrentDoc: (next: boolean) => void;
  uploadConversationFiles: (files: File[]) => Promise<LibraryItem[]>;
  removeAttachment: (libraryItemId: string) => void;
  setSelectedAttachmentIds: (next: string[]) => void;
  toggleUserMenu: () => void;
  closeUserMenu: () => void;
  openNewDocModal: () => void;
  closeNewDocModal: () => void;
  openSourceModal: (tab?: SourceTab) => void;
  closeSourceModal: () => void;
  openWordImportModal: () => void;
  closeWordImportModal: () => void;
  createDocument: (payload: CreateDocumentPayload) => Promise<DocumentItem>;
  updateDocument: (
    docId: string,
    payload: Partial<Pick<DocumentItem, "title" | "content" | "contentJson" | "status">>,
  ) => Promise<DocumentItem | null>;
  deleteDocument: (docId: string) => Promise<{ ok: boolean; mode?: DeleteDocMode; error?: string }>;
  refreshDocs: () => Promise<DocumentItem[]>;
  logout: () => Promise<void>;
}

const fallbackUser: TempUserProfile = {
  id: "demo-user",
  name: "林知序",
  avatarText: "林",
};

const WorkspaceUIContext = createContext<WorkspaceUIContextValue | null>(null);

function mapUsageLines(consumed: number): UsageLine[] {
  const config = [
    { labelKey: "usage.upload", limit: 10, weight: 0.05 },
    { labelKey: "usage.autoComplete", limit: 10, weight: 0.08 },
    { labelKey: "usage.edit", limit: 5, weight: 0.12 },
    { labelKey: "usage.chat", limit: 5, weight: 0.12 },
    { labelKey: "usage.review", limit: 3, weight: 0.08 },
  ];

  return config.map((item) => ({
    labelKey: item.labelKey,
    limit: item.limit,
    used: Math.min(item.limit, Math.floor(consumed * item.weight)),
  }));
}

interface ConversationDetailResponse {
  conversation: ConversationSummary;
  messages: ConversationMessage[];
  attachments: ConversationAttachment[];
}

export function WorkspaceUIProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<TempUserProfile>(fallbackUser);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [docsLoaded, setDocsLoaded] = useState(false);

  const [leftPanelMode, setLeftPanelMode] = useState<LeftPanelMode>("docs");
  const [isChatOpen, setChatOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isNewDocModalOpen, setNewDocModalOpen] = useState(false);
  const [isSourceModalOpen, setSourceModalOpen] = useState(false);
  const [isWordImportModalOpen, setWordImportModalOpen] = useState(false);
  const [sourceTab, setSourceTab] = useState<SourceTab>("pdf");
  const [usageLines, setUsageLines] = useState<UsageLine[]>(mapUsageLines(0));

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isDeletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [isDeletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [conversationAttachments, setConversationAttachments] = useState<ConversationAttachment[]>([]);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [isHistoryDropdownOpen, setHistoryDropdownOpen] = useState(false);
  const [useCurrentDoc, setUseCurrentDoc] = useState(false);

  const refreshDocs = useCallback(async () => {
    const response = await fetch("/api/docs", {
      cache: "no-store",
      headers: {
        "x-user-id": user.id,
      },
    });

    if (!response.ok) {
      return [];
    }

    const result = (await response.json()) as { docs: DocumentItem[] };
    setDocs(result.docs);
    setDocsLoaded(true);
    return result.docs;
  }, [user.id]);

  const refreshLibrary = useCallback(async () => {
    const response = await fetch("/api/library/items", {
      cache: "no-store",
      headers: {
        "x-user-id": user.id,
      },
    });

    if (!response.ok) {
      return;
    }

    const result = (await response.json()) as { items: LibraryItem[] };
    setLibraryItems(result.items);
  }, [user.id]);

  const refreshUsage = useCallback(async () => {
    const response = await fetch("/api/usage/quota", {
      cache: "no-store",
      headers: {
        "x-user-id": user.id,
      },
    });

    if (!response.ok) {
      return;
    }

    const result = (await response.json()) as { quota: { consumed: number } };
    setUsageLines(mapUsageLines(result.quota.consumed));
  }, [user.id]);

  const refreshConversations = useCallback(async () => {
    const response = await fetch("/api/ai/conversations", {
      cache: "no-store",
      headers: {
        "x-user-id": user.id,
      },
    });

    if (!response.ok) {
      return [];
    }

    const result = (await response.json()) as { conversations: ConversationSummary[] };
    setConversations(result.conversations);

    if (
      activeConversationId &&
      !result.conversations.some((item) => item.id === activeConversationId)
    ) {
      setActiveConversationId(null);
      setConversationMessages([]);
      setConversationAttachments([]);
      setSelectedAttachmentIds([]);
    }
    return result.conversations;
  }, [activeConversationId, user.id]);

  const openConversation = useCallback(async (conversationId: string) => {
    const response = await fetch(`/api/ai/conversations/${conversationId}`, {
      cache: "no-store",
      headers: {
        "x-user-id": user.id,
      },
    });

    if (!response.ok) {
      return;
    }

    const result = (await response.json()) as ConversationDetailResponse;
    setActiveConversationId(result.conversation.id);
    setConversationMessages(result.messages);
    setConversationAttachments(result.attachments);
    setSelectedAttachmentIds(result.attachments.map((item) => item.libraryItemId));
    setHistoryDropdownOpen(false);
  }, [user.id]);

  const createNewConversation = useCallback(async (title?: string) => {
    const response = await fetch("/api/ai/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      },
      body: JSON.stringify({ title: title?.trim() || undefined }),
    });

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as { conversation: ConversationSummary };
    setConversations((prev) => [result.conversation, ...prev.filter((item) => item.id !== result.conversation.id)]);
    setActiveConversationId(result.conversation.id);
    setConversationMessages([]);
    setConversationAttachments([]);
    setSelectedAttachmentIds([]);
    setHistoryDropdownOpen(false);
    return result.conversation;
  }, [user.id]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!conversationId || isDeletingConversationId) {
      return false;
    }

    setDeletingConversationId(conversationId);
    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (!response.ok) {
        return false;
      }

      const latest = await refreshConversations();
      if (activeConversationId === conversationId) {
        if (latest[0]) {
          await openConversation(latest[0].id);
        } else {
          setActiveConversationId(null);
          setConversationMessages([]);
          setConversationAttachments([]);
          setSelectedAttachmentIds([]);
        }
      }
      return true;
    } finally {
      setDeletingConversationId(null);
    }
  }, [
    activeConversationId,
    isDeletingConversationId,
    openConversation,
    refreshConversations,
    user.id,
  ]);

  const uploadConversationFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter((file) => file.size > 0);
    if (validFiles.length === 0) {
      return [];
    }

    let conversationId = activeConversationId;
    if (!conversationId) {
      const created = await createNewConversation();
      conversationId = created?.id ?? null;
    }

    const formData = new FormData();
    for (const file of validFiles) {
      formData.append("files", file);
    }
    if (conversationId) {
      formData.append("conversationId", conversationId);
    }

    const response = await fetch("/api/library/import/upload", {
      method: "POST",
      headers: {
        "x-user-id": user.id,
      },
      body: formData,
    });

    if (!response.ok) {
      return [];
    }

    const result = (await response.json()) as { items: LibraryItem[]; conversationId?: string | null };
    if (result.items.length > 0) {
      setLibraryItems((prev) => {
        const merged = new Map<string, LibraryItem>();
        for (const item of result.items) {
          merged.set(item.id, item);
        }
        for (const item of prev) {
          if (!merged.has(item.id)) {
            merged.set(item.id, item);
          }
        }
        return Array.from(merged.values());
      });
    }

    if (result.conversationId) {
      await openConversation(result.conversationId);
    } else if (conversationId) {
      await openConversation(conversationId);
    }

    return result.items;
  }, [activeConversationId, createNewConversation, openConversation, user.id]);

  useEffect(() => {
    void fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as {
          user?: { id: string; username?: string | null; name?: string | null; email?: string };
        };

        if (result.user?.id) {
          const name = result.user.username || result.user.name || fallbackUser.name;
          setUser({
            id: result.user.id,
            name,
            avatarText: name.slice(0, 1).toUpperCase(),
          });
        }
      })
      .catch(() => {
        // use fallback temp user
      });
  }, []);

  useEffect(() => {
    void refreshDocs();
    void refreshLibrary();
    void refreshUsage();
    void refreshConversations();
  }, [refreshConversations, refreshDocs, refreshLibrary, refreshUsage]);

  useEffect(() => {
    if (pathname.startsWith("/app/library")) {
      setLeftPanelMode("library");
      return;
    }

    if (pathname.startsWith("/app/docs") || pathname.startsWith("/app/chat")) {
      setLeftPanelMode((prev) => prev ?? "docs");
    }
  }, [pathname]);

  const activeDocId = useMemo(() => {
    const match = pathname.match(/^\/app\/docs\/([^/]+)$/);
    if (match && match[1] !== "new") {
      return match[1];
    }
    return null;
  }, [pathname]);

  const selectDoc = useCallback((docId: string) => {
    router.push(`/app/docs/${docId}`);
  }, [router]);

  const createDocument = useCallback(async (payload: CreateDocumentPayload) => {
    const response = await fetch("/api/docs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const failed = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
      throw new Error(failed?.error || failed?.message || "create document failed");
    }

    const result = (await response.json()) as { doc: DocumentItem };
    setDocs((prev) => [result.doc, ...prev.filter((item) => item.id !== result.doc.id)]);
    setNewDocModalOpen(false);
    router.push(`/app/docs/${result.doc.id}`);
    return result.doc;
  }, [router, user.id]);

  const updateDocument = useCallback(async (
    docId: string,
    payload: Partial<Pick<DocumentItem, "title" | "content" | "contentJson" | "status">>,
  ) => {
    const response = await fetch(`/api/docs/${docId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as { doc: DocumentItem };
    setDocs((prev) => prev.map((item) => (item.id === result.doc.id ? result.doc : item)));
    return result.doc;
  }, [user.id]);

  const deleteDocument = useCallback(async (docId: string) => {
    if (!docId || isDeletingDocId) {
      return { ok: false, error: "invalid document id" };
    }

    setDeletingDocId(docId);
    try {
      const response = await fetch(`/api/docs/${docId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (!response.ok) {
        const failed = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
        return { ok: false, error: failed?.error || failed?.message || "delete document failed" };
      }

      const result = (await response.json().catch(() => null)) as { mode?: DeleteDocMode } | null;
      const mode = result?.mode;
      if (mode !== "hard_deleted" && mode !== "removed_from_list") {
        return { ok: false, error: "invalid delete mode" };
      }

      const nextDocs = docs.filter((item) => item.id !== docId);
      setDocs(nextDocs);
      const refreshedDocs = await refreshDocs();
      const routeDocs = refreshedDocs.length > 0 ? refreshedDocs : nextDocs;

      if (activeDocId === docId) {
        if (routeDocs[0]) {
          router.push(`/app/docs/${routeDocs[0].id}`);
        } else {
          router.push("/app/docs/new");
        }
      }

      return { ok: true, mode };
    } finally {
      setDeletingDocId(null);
    }
  }, [activeDocId, docs, isDeletingDocId, refreshDocs, router, user.id]);

  const logout = useCallback(async () => {
    localStorage.removeItem("zenthesis-temp-user");
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/auth/login");
  }, [router]);

  const value = useMemo<WorkspaceUIContextValue>(() => ({
    user,
    docs,
    libraryItems,
    docsLoaded,
    activeDocId,
    leftPanelMode,
    isChatOpen,
    isUserMenuOpen,
    isNewDocModalOpen,
    isSourceModalOpen,
    isWordImportModalOpen,
    sourceTab,
    usageLines,
    conversations,
    activeConversationId,
    isDeletingConversationId,
    isDeletingDocId,
    conversationMessages,
    conversationAttachments,
    selectedAttachmentIds,
    isHistoryDropdownOpen,
    useCurrentDoc,
    selectDoc,
    openDocsPanel: () => setLeftPanelMode("docs"),
    toggleLibraryPanel: () => setLeftPanelMode((prev) => (prev === "library" ? null : "library")),
    closeLeftPanel: () => setLeftPanelMode(null),
    openChatPanel: () => setChatOpen(true),
    toggleChatPanel: () => setChatOpen((prev) => !prev),
    closeChatPanel: () => setChatOpen(false),
    setHistoryDropdownOpen: (open) => setHistoryDropdownOpen(open),
    toggleHistoryDropdown: () => setHistoryDropdownOpen((prev) => !prev),
    createNewConversation,
    openConversation,
    deleteConversation,
    appendConversationMessage: (payload) => {
      const now = new Date().toISOString();
      const message: ConversationMessage = {
        id: payload.id || `temp-${Date.now()}`,
        conversationId: payload.conversationId || activeConversationId || "temp-conversation",
        role: payload.role,
        content: payload.content,
        useWeb: Boolean(payload.useWeb),
        useLibrary: Boolean(payload.useLibrary),
        useCurrentDoc: Boolean(payload.useCurrentDoc),
        contextDocId: payload.contextDocId,
        createdAt: payload.createdAt || now,
      };
      setConversationMessages((prev) => [...prev, message]);
    },
    refreshConversations,
    clearConversationMessages: () => setConversationMessages([]),
    setUseCurrentDoc,
    uploadConversationFiles,
    removeAttachment: (libraryItemId) => {
      setSelectedAttachmentIds((prev) => prev.filter((item) => item !== libraryItemId));
    },
    setSelectedAttachmentIds,
    toggleUserMenu: () => setUserMenuOpen((prev) => !prev),
    closeUserMenu: () => setUserMenuOpen(false),
    openNewDocModal: () => setNewDocModalOpen(true),
    closeNewDocModal: () => setNewDocModalOpen(false),
    openSourceModal: (tab = "pdf") => {
      setSourceTab(tab);
      setSourceModalOpen(true);
    },
    closeSourceModal: () => setSourceModalOpen(false),
    openWordImportModal: () => setWordImportModalOpen(true),
    closeWordImportModal: () => setWordImportModalOpen(false),
    createDocument,
    updateDocument,
    deleteDocument,
    refreshDocs,
    logout,
  }), [
    user,
    docs,
    libraryItems,
    docsLoaded,
    activeDocId,
    leftPanelMode,
    isChatOpen,
    isUserMenuOpen,
    isNewDocModalOpen,
    isSourceModalOpen,
    isWordImportModalOpen,
    sourceTab,
    usageLines,
    conversations,
    activeConversationId,
    isDeletingConversationId,
    isDeletingDocId,
    conversationMessages,
    conversationAttachments,
    selectedAttachmentIds,
    isHistoryDropdownOpen,
    useCurrentDoc,
    selectDoc,
    createNewConversation,
    openConversation,
    deleteConversation,
    refreshConversations,
    uploadConversationFiles,
    createDocument,
    updateDocument,
    deleteDocument,
    refreshDocs,
    logout,
  ]);

  return <WorkspaceUIContext.Provider value={value}>{children}</WorkspaceUIContext.Provider>;
}

export function useWorkspaceUI() {
  const context = useContext(WorkspaceUIContext);
  if (!context) {
    throw new Error("useWorkspaceUI must be used inside WorkspaceUIProvider");
  }

  return context;
}
