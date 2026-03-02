import { describe, expect, it } from "vitest";

import { isValidUsername } from "@/lib/startup-backfill";

describe("username validation", () => {
  it("accepts 6-10 chars with at least one letter", () => {
    expect(isValidUsername("abc123")).toBe(true);
    expect(isValidUsername("ab_cd12")).toBe(true);
    expect(isValidUsername("abcdef")).toBe(true);
  });

  it("rejects invalid patterns", () => {
    expect(isValidUsername("123456")).toBe(false);
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("abcdefghijkl")).toBe(false);
    expect(isValidUsername("ab-c12")).toBe(false);
  });
});

