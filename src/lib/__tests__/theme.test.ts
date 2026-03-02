import { describe, expect, it } from "vitest";

import { normalizeTheme, resolveSystemTheme } from "@/lib/theme";

describe("theme utils", () => {
  it("normalizes invalid theme to system", () => {
    expect(normalizeTheme("random")).toBe("system");
  });

  it("returns light or dark system theme", () => {
    expect(resolveSystemTheme(true)).toBe("dark");
    expect(resolveSystemTheme(false)).toBe("light");
  });
});
