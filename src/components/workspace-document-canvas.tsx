import { BookText, FileUp, MessageSquareMore, PenSquare, ShieldCheck, Share2 } from "lucide-react";

interface WorkspaceDocumentCanvasProps {
  title?: string;
}

const starterCards = [
  {
    title: "从提示开始",
    description: "使用 AI 起草文档结构并调整自动完成设置",
    icon: PenSquare,
  },
  {
    title: "从 Word (.docx) 导入",
    description: "导入您的工作并使用 AI 改进它",
    icon: FileUp,
  },
  {
    title: "与 AI 聊天",
    description: "发现论文、集思广益或撰写草稿",
    icon: MessageSquareMore,
  },
  {
    title: "上传来源",
    description: "上传 PDF 以进行聊天、引用或为 AI 提供上下文",
    icon: BookText,
  },
];

export function WorkspaceDocumentCanvas({ title = "未命名" }: WorkspaceDocumentCanvasProps) {
  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
      <header className="flex items-center justify-between border-b border-[color:var(--border)] px-6 py-4 text-sm">
        <p className="font-semibold">{title}</p>
        <div className="flex items-center gap-4 text-[color:var(--muted-foreground)]">
          <button type="button" className="inline-flex items-center gap-1 transition hover:text-[color:var(--foreground)]">
            <Share2 className="h-4 w-4" /> 分享
          </button>
          <button type="button" className="inline-flex items-center gap-1 transition hover:text-[color:var(--foreground)]">
            <ShieldCheck className="h-4 w-4" /> 审查
          </button>
          <button
            type="button"
            className="rounded-lg bg-[color:var(--accent)] px-3 py-2 font-semibold text-[color:var(--accent-foreground)]"
          >
            查看定价
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 px-8 py-10">
        <h1 className="text-6xl font-bold text-[#bcc2cc]">{title}</h1>
        <p className="mt-8 text-3xl font-semibold">开始写作</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {starterCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-4"
              >
                <Icon className="h-5 w-5" />
                <h2 className="mt-3 text-lg font-semibold">{card.title}</h2>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{card.description}</p>
              </article>
            );
          })}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-[color:var(--border)] px-5 py-3 text-sm text-[color:var(--muted-foreground)]">
        <div className="flex items-center gap-4">
          <span>自动完成</span>
          <span>引用</span>
          <span>文本</span>
        </div>
        <span>0 词</span>
      </footer>
    </section>
  );
}
