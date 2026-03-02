import type { CitationStyle, LibraryItem } from "@/lib/types";

export function formatCitation(style: CitationStyle, item: LibraryItem): string {
  const authorText = item.authors.length > 0 ? item.authors.join(", ") : "Unknown Author";
  const yearText = item.year ? `${item.year}` : "n.d.";

  if (style === "MLA") {
    return `${authorText}. \"${item.title}.\" ${item.venue ?? "Unknown Venue"}, ${yearText}.`;
  }

  if (style === "Chicago") {
    return `${authorText}. ${yearText}. ${item.title}. ${item.venue ?? "Unknown Venue"}.`;
  }

  return `${authorText} (${yearText}). ${item.title}. ${item.venue ?? "Unknown Venue"}.`;
}
