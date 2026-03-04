import type { CitationStyle, LibraryItem } from "@/lib/types";

export function formatCitation(style: CitationStyle, item: LibraryItem): string {
  const authorText = item.authors.length > 0 ? item.authors.join(", ") : "Unknown Author";
  const yearText = item.year ? `${item.year}` : "n.d.";

  if (style === "MLA" || style === "MLA9") {
    return `${authorText}. \"${item.title}.\" ${item.venue ?? "Unknown Venue"}, ${yearText}.`;
  }

  if (style === "Chicago" || style === "Chicago17") {
    return `${authorText}. ${yearText}. ${item.title}. ${item.venue ?? "Unknown Venue"}.`;
  }

  if (style === "GBT7714") {
    return `${authorText}. ${yearText}. ${item.title}. ${item.venue ?? "Unknown Venue"}.`;
  }

  return `${authorText} (${yearText}). ${item.title}. ${item.venue ?? "Unknown Venue"}.`;
}
