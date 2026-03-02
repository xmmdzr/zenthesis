import { describe, expect, it } from "vitest";

import { aiChat } from "@/lib/ai";

describe("ai chat tool context", () => {
  it("defaults tool switches to false", async () => {
    const result = await aiChat({ prompt: "hello" });
    expect(result.toolContext.useWeb).toBe(false);
    expect(result.toolContext.useLibrary).toBe(false);
  });

  it("returns provided tool switches", async () => {
    const result = await aiChat({ prompt: "hello", useWeb: true, useLibrary: true });
    expect(result.toolContext.useWeb).toBe(true);
    expect(result.toolContext.useLibrary).toBe(true);
  });
});
