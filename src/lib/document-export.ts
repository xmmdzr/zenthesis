import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { DocumentItem } from "@/lib/types";

interface TextBlock {
  type: "title" | "heading1" | "heading2" | "paragraph" | "bullet";
  text: string;
}

function flattenText(node: unknown): string {
  if (!node || typeof node !== "object") {
    return "";
  }

  const value = node as { text?: unknown; content?: unknown[] };
  const parts: string[] = [];

  if (typeof value.text === "string") {
    parts.push(value.text);
  }

  if (Array.isArray(value.content)) {
    for (const child of value.content) {
      parts.push(flattenText(child));
    }
  }

  return parts.join("");
}

function toTextBlocks(doc: DocumentItem): TextBlock[] {
  const blocks: TextBlock[] = [];
  blocks.push({ type: "title", text: doc.title || "Untitled" });

  if (doc.contentJson && Array.isArray((doc.contentJson as { content?: unknown[] }).content)) {
    const nodes = (doc.contentJson as { content: Array<{ type?: string; content?: unknown[] }> }).content;
    for (const node of nodes) {
      const text = flattenText(node).trim();
      if (!text) {
        continue;
      }

      switch (node.type) {
        case "heading":
          blocks.push({ type: "heading1", text });
          break;
        case "bulletList":
          if (Array.isArray(node.content)) {
            for (const item of node.content) {
              const line = flattenText(item).trim();
              if (line) {
                blocks.push({ type: "bullet", text: line });
              }
            }
          }
          break;
        case "orderedList":
          if (Array.isArray(node.content)) {
            let order = 1;
            for (const item of node.content) {
              const line = flattenText(item).trim();
              if (line) {
                blocks.push({ type: "paragraph", text: `${order}. ${line}` });
                order += 1;
              }
            }
          }
          break;
        default:
          blocks.push({ type: "paragraph", text });
      }
    }
  } else if (doc.content.trim()) {
    blocks.push({ type: "paragraph", text: doc.content.trim() });
  }

  return blocks;
}

function safeFileBaseName(title: string) {
  return (title || "untitled")
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-")
    .toLowerCase() || "untitled";
}

export async function exportDocx(doc: DocumentItem) {
  const blocks = toTextBlocks(doc);
  const children = blocks.map((block) => {
    if (block.type === "title") {
      return new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun(block.text)],
      });
    }

    if (block.type === "heading1") {
      return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun(block.text)],
      });
    }

    if (block.type === "heading2") {
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun(block.text)],
      });
    }

    if (block.type === "bullet") {
      return new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun(block.text)],
      });
    }

    return new Paragraph({
      children: [new TextRun(block.text)],
    });
  });

  const document = new DocxDocument({
    sections: [{ children }],
  });

  const blob = await Packer.toBuffer(document);
  return {
    bytes: new Uint8Array(blob),
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileName: `${safeFileBaseName(doc.title)}.docx`,
  };
}

export async function exportPdf(doc: DocumentItem) {
  const blocks = toTextBlocks(doc);
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  for (const block of blocks) {
    const isHeading = block.type === "title" || block.type === "heading1" || block.type === "heading2";
    const size = block.type === "title" ? 20 : isHeading ? 16 : 11;
    const activeFont = isHeading ? boldFont : font;
    const maxWidth = 520;
    const words = block.text.split(/\s+/);
    let line = "";

    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      const width = activeFont.widthOfTextAtSize(next, size);
      if (width > maxWidth && line) {
        page.drawText(line, { x: 38, y, size, font: activeFont, color: rgb(0.08, 0.1, 0.16) });
        y -= size + 5;
        line = word;
      } else {
        line = next;
      }
    }

    if (line) {
      page.drawText(line, { x: 38, y, size, font: activeFont, color: rgb(0.08, 0.1, 0.16) });
      y -= size + 10;
    }

    if (y < 80) {
      y = 800;
      page = pdf.addPage([595.28, 841.89]);
    }
  }

  const bytes = await pdf.save();
  return {
    bytes: new Uint8Array(bytes),
    contentType: "application/pdf",
    fileName: `${safeFileBaseName(doc.title)}.pdf`,
  };
}
