"use client";

import {
  ChevronsRight,
  Clock3,
  Link2,
  LoaderCircle,
  PenLine,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import { useWorkspaceUI } from "@/components/workspace-ui-context";

interface ChatResponse {
  response: string;
  suggestions: string[];
  toolContext: {
    useWeb: boolean;
    useLibrary: boolean;
  };
  conversationId?: string;
}

function formatConversationTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString();
}

export function WorkspaceChatPanel() {
  const { t } = useI18n();
  const {
    closeChatPanel,
    conversations,
    activeConversationId,
    isDeletingConversationId,
    conversationMessages,
    conversationAttachments,
    selectedAttachmentIds,
    isHistoryDropdownOpen,
    toggleHistoryDropdown,
    setHistoryDropdownOpen,
    createNewConversation,
    openConversation,
    deleteConversation,
    appendConversationMessage,
    refreshConversations,
    activeDocId,
    useCurrentDoc,
    setUseCurrentDoc,
    uploadConversationFiles,
    removeAttachment,
  } = useWorkspaceUI();
  const [prompt, setPrompt] = useState("");
  const [useWeb, setUseWeb] = useState(false);
  const [useLibrary, setUseLibrary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteConversationId, setPendingDeleteConversationId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyBoxRef = useRef<HTMLDivElement>(null);

  const selectedAttachments = useMemo(
    () =>
      conversationAttachments.filter((item) => selectedAttachmentIds.includes(item.libraryItemId)),
    [conversationAttachments, selectedAttachmentIds],
  );

  useEffect(() => {
    if (!messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [conversationMessages, loading]);

  useEffect(() => {
    if (!loading) {
      setThinkingSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setThinkingSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!historyBoxRef.current) {
        return;
      }

      if (!historyBoxRef.current.contains(event.target as Node)) {
        setHistoryDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [setHistoryDropdownOpen]);

  async function submitPrompt() {
    const trimmed = prompt.trim();
    if (!trimmed || loading) {
      return;
    }

    setPrompt("");
    setLoading(true);

    let conversationId = activeConversationId;
    if (!conversationId) {
      const created = await createNewConversation();
      conversationId = created?.id ?? null;
    }

    if (!conversationId) {
      setLoading(false);
      return;
    }

    appendConversationMessage({
      conversationId,
      role: "user",
      content: trimmed,
      useWeb,
      useLibrary,
      useCurrentDoc: useCurrentDoc && Boolean(activeDocId),
      contextDocId: useCurrentDoc && activeDocId ? activeDocId : undefined,
    });

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmed,
          useWeb,
          useLibrary,
          conversationId,
          useCurrentDoc: useCurrentDoc && Boolean(activeDocId),
          contextDocId: useCurrentDoc && activeDocId ? activeDocId : undefined,
          attachmentItemIds: selectedAttachmentIds,
        }),
      });

      if (!response.ok) {
        throw new Error("request failed");
      }

      const result = (await response.json()) as ChatResponse;
      appendConversationMessage({
        conversationId,
        role: "assistant",
        content: result.response,
        useWeb,
        useLibrary,
        useCurrentDoc: useCurrentDoc && Boolean(activeDocId),
        contextDocId: useCurrentDoc && activeDocId ? activeDocId : undefined,
      });

      await openConversation(result.conversationId || conversationId);
      await refreshConversations();
    } catch {
      appendConversationMessage({
        conversationId,
        role: "assistant",
        content: t("chat.failed"),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(files: File[]) {
    const items = await uploadConversationFiles(files);
    if (items.length === 0) {
      setUploadStatus(t("chat.uploadFail"));
      return;
    }

    setUploadStatus(t("chat.uploadSuccess", { count: items.length }));
  }

  function openDeleteConfirm(conversationId: string) {
    setPendingDeleteConversationId(conversationId);
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  }

  function closeDeleteConfirm() {
    setDeleteConfirmOpen(false);
    setPendingDeleteConversationId(null);
    setDeleteError(null);
  }

  async function handleDeleteConversation() {
    if (!pendingDeleteConversationId) {
      return;
    }

    const success = await deleteConversation(pendingDeleteConversationId);
    if (!success) {
      setDeleteError(t("chat.deleteFailed"));
      return;
    }

    closeDeleteConfirm();
  }

  return (
    <aside className="relative hidden h-full min-h-0 w-[390px] border-l border-[color:var(--border)] bg-[color:var(--background)] xl:flex xl:flex-col">
      <header className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={closeChatPanel}
            className="rounded p-1 text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)]"
            aria-label={t("chat.collapse")}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
          <h3 className="text-2xl font-bold">{t("chat.title")}</h3>
        </div>

        <div ref={historyBoxRef} className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={toggleHistoryDropdown}
            className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border)] px-2 py-2 text-xs text-[color:var(--muted-foreground)]"
          >
            <Clock3 className="h-4 w-4" /> {t("chat.history")}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[color:var(--border)] px-2 py-2 text-xs text-[color:var(--muted-foreground)]"
            onClick={() => void createNewConversation()}
          >
            {t("chat.newConversation")}
          </button>

          {isHistoryDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[280px] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-xl">
              <div className="max-h-[320px] overflow-y-auto p-2">
                {conversations.length === 0 && (
                  <p className="rounded-lg px-3 py-2 text-sm text-[color:var(--muted-foreground)]">
                    {t("chat.historyEmpty")}
                  </p>
                )}
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`mb-1 rounded-lg transition ${
                      activeConversationId === conversation.id
                        ? "bg-[color:var(--surface)]"
                        : "hover:bg-[color:var(--surface)]"
                    }`}
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_36px] items-stretch gap-2 px-2 py-2">
                      <button
                        type="button"
                        onClick={() => void openConversation(conversation.id)}
                        className="min-h-[68px] rounded-lg px-1 py-0.5 text-left"
                      >
                        <p className="truncate text-sm font-semibold">{conversation.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-[color:var(--muted-foreground)]">
                          {conversation.preview || t("chat.historyOpen")}
                        </p>
                        <p className="mt-1 h-4 text-[11px] text-[color:var(--muted-foreground)]">
                          {formatConversationTime(conversation.lastMessageAt)}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(conversation.id)}
                        disabled={isDeletingConversationId === conversation.id}
                        className="my-auto flex h-8 w-8 items-center justify-center rounded-md p-1.5 text-[color:var(--muted-foreground)] hover:bg-[color:var(--background)] disabled:opacity-40"
                        aria-label={t("chat.deleteHistory")}
                      >
                        {isDeletingConversationId === conversation.id ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <div ref={messagesRef} className="flex-1 min-h-0 space-y-6 overflow-y-auto px-4 py-4">
        {conversationMessages.length === 0 && (
          <p className="rounded-xl bg-[color:var(--card)] px-3 py-2 text-sm text-[color:var(--muted-foreground)]">
            {t("chat.hint")}
          </p>
        )}
        {conversationMessages.map((message) => (
          <div key={message.id}>
            {message.role === "user" ? (
              <article className="ml-auto inline-block w-fit max-w-[78%] rounded-2xl rounded-br-md bg-[color:var(--accent)] px-4 py-2.5 text-sm leading-6 text-[color:var(--accent-foreground)]">
                {message.content}
              </article>
            ) : (
              <article className="mr-auto max-w-[94%] whitespace-pre-wrap text-[15px] leading-7 text-[color:var(--foreground)]">
                {message.content}
              </article>
            )}
          </div>
        ))}
        {loading && (
          <div className="mr-auto inline-flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            <span>{t("chat.thinking", { seconds: thinkingSeconds })}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-[color:var(--border)] px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
          <button
            type="button"
            onClick={() => {
              if (!activeDocId) {
                return;
              }
              setUseCurrentDoc(!useCurrentDoc);
            }}
            disabled={!activeDocId}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
              useCurrentDoc && activeDocId
                ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                : "border-[color:var(--border)]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <PenLine className="h-4 w-4" /> {useCurrentDoc ? t("chat.currentDocOn") : t("chat.currentDocOff")}
          </button>
        </div>

        {selectedAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedAttachments.map((item) => (
              <span
                key={item.libraryItemId}
                className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-2 py-1 text-xs"
              >
                {item.title}
                <button
                  type="button"
                  onClick={() => removeAttachment(item.libraryItemId)}
                  className="rounded-full p-0.5 text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)]"
                  aria-label={t("common.close")}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-3">
          <textarea
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void submitPrompt();
              }
            }}
            placeholder={t("chat.placeholder")}
            className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-[color:var(--muted-foreground)]"
          />

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp,image/gif"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  if (files.length > 0) {
                    void handleFileUpload(files);
                  }
                  event.currentTarget.value = "";
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border border-[color:var(--border)] p-1.5"
              >
                <Link2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setUseWeb((prev) => !prev)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  useWeb ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]" : "bg-[color:var(--surface)]"
                }`}
              >
                {t("chat.web")}
              </button>
              <button
                type="button"
                onClick={() => setUseLibrary((prev) => !prev)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  useLibrary ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]" : "bg-[color:var(--surface)]"
                }`}
              >
                {t("chat.library")}
              </button>
            </div>
            <button
              type="button"
              onClick={() => void submitPrompt()}
              disabled={loading}
              className="rounded-full bg-[color:var(--accent)] p-2 text-[color:var(--accent-foreground)] disabled:opacity-70"
              aria-label={t("chat.send")}
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </button>
          </div>
          {uploadStatus && (
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">{uploadStatus}</p>
          )}
        </div>
      </div>

      {isDeleteConfirmOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[320px] rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-xl">
            <h4 className="text-base font-semibold">{t("chat.deleteHistory")}</h4>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
              {t("chat.deleteConfirm")}
            </p>
            {deleteError && (
              <p className="mt-2 text-xs text-red-500">{deleteError}</p>
            )}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-sm"
              >
                {t("common.close")}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConversation()}
                disabled={
                  pendingDeleteConversationId !== null &&
                  isDeletingConversationId === pendingDeleteConversationId
                }
                className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-70"
              >
                {pendingDeleteConversationId !== null &&
                isDeletingConversationId === pendingDeleteConversationId ? (
                  <span className="inline-flex items-center gap-1">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    {t("chat.deleteHistory")}
                  </span>
                ) : (
                  t("chat.deleteHistory")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
