import { describe, expect, it } from "vitest";

import { formatCitation } from "@/lib/citations";

describe("citation formatting", () => {
  const item = {
    id: "lib-1",
    userId: "u-1",
    sourceType: "web" as const,
    title: "Paper Title",
    authors: ["J. Doe", "K. Smith"],
    year: 2024,
    venue: "Journal",
    createdAt: new Date().toISOString(),
  };

  it("formats APA style", () => {
    expect(formatCitation("APA", item)).toContain("(2024)");
  });

  it("formats MLA style", () => {
    expect(formatCitation("MLA", item)).toContain('"Paper Title."');
  });
});
