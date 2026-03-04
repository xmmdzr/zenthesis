"use client";

import "katex/dist/katex.min.css";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Mathematics from "@tiptap/extension-mathematics";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Code2, ImagePlus, List, ListOrdered, LoaderCircle, Quote, Sigma, Table2, Type, Heading1, Heading2, Heading3 } from "lucide-react";
import { createLowlight, all } from "lowlight";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AutoCompleteSettings } from "@/lib/types";

interface RichDocumentEditorProps {
  docId: string;
  title: string;
  initialJson?: Record<string, unknown> | null;
  initialText?: string;
  editable?: boolean;
  collabUserId?: string;
  collabUserName?: string;
  onChange: (payload: { content: string; contentJson: Record<string, unknown> }) => void;
  autoCompleteEnabled: boolean;
  autoCompleteSettings: AutoCompleteSettings;
  onRequestAutoComplete: (payload: {
    content: string;
    sectionTitle?: string;
    cursorContext?: string;
    retryFrom?: string;
    signal: AbortSignal;
  }) => Promise<string | null>;
}

const lowlight = createLowlight(all);

interface RealtimeContentPayload {
  docId: string;
  userId: string;
  userName: string;
  contentJson: Record<string, unknown>;
  text: string;
  sentAt: number;
}

function toInitialContent(initialJson?: Record<string, unknown> | null, initialText?: string) {
  if (initialJson && typeof initialJson === "object") {
    return initialJson;
  }

  if (initialText?.trim()) {
    return {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: initialText }] }],
    };
  }

  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

function extractCursorContext(editor: ReturnType<typeof useEditor>) {
  if (!editor) {
    return "";
  }
  const position = editor.state.selection.from;
  const start = Math.max(1, position - 220);
  const text = editor.state.doc.textBetween(start, position, "\n", " ");
  return text.trim();
}

function extractCurrentSectionTitle(editor: ReturnType<typeof useEditor>) {
  if (!editor) {
    return "";
  }

  const position = editor.state.selection.from;
  let latestHeading = "";
  editor.state.doc.nodesBetween(0, position, (node) => {
    if (node.type.name === "heading" && node.textContent.trim()) {
      latestHeading = node.textContent.trim();
    }
  });
  return latestHeading;
}

export function RichDocumentEditor({
  docId,
  title,
  initialJson,
  initialText,
  editable = true,
  collabUserId,
  collabUserName,
  onChange,
  autoCompleteEnabled,
  autoCompleteSettings,
  onRequestAutoComplete,
}: RichDocumentEditorProps) {
  const { t } = useI18n();
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [formula, setFormula] = useState("E = mc^2");
  const [currentText, setCurrentText] = useState(initialText ?? "");
  const [suggestion, setSuggestion] = useState("");
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const suggestionSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const skipNextRef = useRef(false);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyingRemoteRef = useRef(false);
  const settingsSignature = useMemo(
    () => JSON.stringify(autoCompleteSettings),
    [autoCompleteSettings],
  );

  const content = useMemo(() => toInitialContent(initialJson, initialText), [initialJson, initialText]);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("doc.placeholder"),
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Mathematics,
    ],
    content,
    onUpdate({ editor: current }) {
      if (applyingRemoteRef.current) {
        return;
      }
      setCurrentText(current.getText());
      onChange({
        content: current.getText(),
        contentJson: current.getJSON() as Record<string, unknown>,
      });

      if (!collabUserId || !realtimeChannelRef.current) {
        return;
      }

      if (realtimeTimerRef.current) {
        clearTimeout(realtimeTimerRef.current);
      }

      const payload: RealtimeContentPayload = {
        docId,
        userId: collabUserId,
        userName: collabUserName || "Collaborator",
        contentJson: current.getJSON(),
        text: current.getText(),
        sentAt: Date.now(),
      };

      realtimeTimerRef.current = setTimeout(() => {
        void realtimeChannelRef.current?.send({
          type: "broadcast",
          event: "content-update",
          payload,
        });
      }, 240);
    },
  });

  const requestSuggestion = useCallback(async (options?: { retryFrom?: string }) => {
    if (!editor || !autoCompleteEnabled) {
      return;
    }

    const text = editor.getText().trim();
    if (!text) {
      setSuggestion("");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const seq = suggestionSeqRef.current + 1;
    suggestionSeqRef.current = seq;
    setAutoError(null);
    setAutoLoading(true);

    try {
      const generated = await onRequestAutoComplete({
        content: editor.getText(),
        sectionTitle: extractCurrentSectionTitle(editor),
        cursorContext: extractCursorContext(editor),
        retryFrom: options?.retryFrom,
        signal: controller.signal,
      });

      if (seq !== suggestionSeqRef.current) {
        return;
      }
      const nextSuggestion = (generated || "").trim();
      setSuggestion(nextSuggestion);
      if (!nextSuggestion) {
        setAutoError(t("doc.suggestion.failed"));
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      if (seq !== suggestionSeqRef.current) {
        return;
      }
      setSuggestion("");
      setAutoError(error instanceof Error ? error.message : t("doc.suggestion.failed"));
    } finally {
      if (seq === suggestionSeqRef.current) {
        setAutoLoading(false);
      }
    }
  }, [autoCompleteEnabled, editor, onRequestAutoComplete, t]);

  useEffect(() => {
    if (!autoCompleteEnabled) {
      abortRef.current?.abort();
      setAutoLoading(false);
      setSuggestion("");
      setAutoError(null);
      return;
    }

    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }

    const text = currentText.trim();
    if (!text) {
      setSuggestion("");
      setAutoError(null);
      return;
    }

    const timer = setTimeout(() => {
      void requestSuggestion();
    }, 1200);

    return () => clearTimeout(timer);
  }, [autoCompleteEnabled, currentText, requestSuggestion, settingsSignature]);

  useEffect(() => {
    setSuggestion("");
    setCurrentText(initialText ?? "");
    abortRef.current?.abort();
    setAutoLoading(false);
    setAutoError(null);
  }, [docId, title, initialText]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(editable);
  }, [editable, editor]);

  useEffect(() => {
    if (!editor || !collabUserId) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const channel = supabase.channel(`doc:${docId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: collabUserId },
      },
    });

    channel.on("broadcast", { event: "content-update" }, ({ payload }: { payload: RealtimeContentPayload }) => {
      if (!payload || payload.userId === collabUserId || !payload.contentJson) {
        return;
      }

      applyingRemoteRef.current = true;
      editor.commands.setContent(payload.contentJson, { emitUpdate: false });
      const nextText = typeof payload.text === "string" ? payload.text : editor.getText();
      setCurrentText(nextText);
      onChange({
        content: nextText,
        contentJson: payload.contentJson as Record<string, unknown>,
      });
      requestAnimationFrame(() => {
        applyingRemoteRef.current = false;
      });
    });

    channel.subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        void channel.track({
          userId: collabUserId,
          userName: collabUserName || "Collaborator",
          activeAt: Date.now(),
        });
      }
    });
    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeTimerRef.current) {
        clearTimeout(realtimeTimerRef.current);
      }
      realtimeChannelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [collabUserId, collabUserName, docId, editor, onChange]);

  if (!editor) {
    return (
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-8 text-sm text-[color:var(--muted-foreground)]">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)]">
      {(autoCompleteEnabled && (autoLoading || suggestion || autoError)) && (
        <div className="mx-6 mt-6 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3">
          {autoLoading ? (
            <div className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>{t("doc.suggestion.loading")}</span>
            </div>
          ) : autoError ? (
            <p className="text-sm text-[color:var(--muted-foreground)]">{autoError}</p>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#9ca3af]">{suggestion}</p>
          )}

          {!autoLoading && (suggestion || autoError) && (
            <div className="mt-3 flex items-center gap-2">
              {suggestion && (
                <button
                  type="button"
                  onClick={() => {
                    if (!suggestion) {
                      return;
                    }
                    skipNextRef.current = true;
                    editor.chain().focus().insertContent(`${suggestion}\n`).run();
                    setSuggestion("");
                    setAutoError(null);
                  }}
                  className="rounded-md bg-[color:var(--accent)] px-3 py-1.5 text-xs font-semibold text-[color:var(--accent-foreground)]"
                >
                  {t("doc.suggestion.accept")}
                </button>
              )}
              <button
                type="button"
                onClick={() => void requestSuggestion({ retryFrom: suggestion })}
                className="rounded-md border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold"
              >
                {t("doc.suggestion.retry")}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] px-3 py-2">
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className="rounded-md p-2 hover:bg-[color:var(--surface)]" title="Paragraph">
          <Type className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="rounded-md p-2 hover:bg-[color:var(--surface)]" title="H1">
          <Heading1 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="rounded-md p-2 hover:bg-[color:var(--surface)]" title="H2">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="rounded-md p-2 hover:bg-[color:var(--surface)]" title="H3">
          <Heading3 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="rounded-md p-2 hover:bg-[color:var(--surface)]" title="Bullet List">
          <List className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="rounded-md p-2 hover:bg-[color:var(--surface)]" title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="rounded-md p-2 hover:bg-[color:var(--surface)]" title="Quote">
          <Quote className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="rounded-md p-2 hover:bg-[color:var(--surface)]" title="Code Block">
          <Code2 className="h-4 w-4" />
        </button>
      </div>

      <EditorContent editor={editor} className="zenthesis-editor min-h-[440px] px-6 py-5" />

      <div className="relative flex items-center gap-2 border-t border-[color:var(--border)] px-3 py-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                editor.chain().focus().setImage({ src: reader.result, alt: file.name }).run();
              }
            };
            reader.readAsDataURL(file);
            event.currentTarget.value = "";
          }}
        />
        <button type="button" onClick={() => imageInputRef.current?.click()} className="inline-flex items-center gap-1 rounded-md border border-[color:var(--border)] px-2 py-1.5 text-xs font-medium hover:bg-[color:var(--surface)]">
          <ImagePlus className="h-4 w-4" /> {t("insert.image")}
        </button>
        <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="inline-flex items-center gap-1 rounded-md border border-[color:var(--border)] px-2 py-1.5 text-xs font-medium hover:bg-[color:var(--surface)]">
          <Table2 className="h-4 w-4" /> {t("insert.table")}
        </button>
        <button type="button" onClick={() => setFormulaOpen((prev) => !prev)} className="inline-flex items-center gap-1 rounded-md border border-[color:var(--border)] px-2 py-1.5 text-xs font-medium hover:bg-[color:var(--surface)]">
          <Sigma className="h-4 w-4" /> {t("insert.formula")}
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="inline-flex items-center gap-1 rounded-md border border-[color:var(--border)] px-2 py-1.5 text-xs font-medium hover:bg-[color:var(--surface)]">
          <Code2 className="h-4 w-4" /> {t("insert.code")}
        </button>

        {formulaOpen && (
          <div className="absolute bottom-[calc(100%+8px)] left-3 z-10 w-[320px] rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-3 shadow-xl">
            <p className="text-xs font-semibold text-[color:var(--muted-foreground)]">LaTeX</p>
            <input
              value={formula}
              onChange={(event) => setFormula(event.target.value)}
              className="mt-2 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-1.5 text-sm outline-none"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setFormulaOpen(false)} className="rounded-md border border-[color:var(--border)] px-2 py-1 text-xs">
                {t("common.close")}
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().insertInlineMath({ latex: formula }).run();
                  setFormulaOpen(false);
                }}
                className="rounded-md bg-[color:var(--accent)] px-2 py-1 text-xs font-semibold text-[color:var(--accent-foreground)]"
              >
                {t("common.create")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
