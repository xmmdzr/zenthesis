import { beforeEach, describe, expect, it } from "vitest";

import {
  __resetPreferenceStoreForTests,
  getUserPreferences,
  updateUserPreferences,
} from "@/lib/preferences-store";

describe("preferences store", () => {
  beforeEach(() => {
    __resetPreferenceStoreForTests();
  });

  it("defaults to system", async () => {
    const value = await getUserPreferences("u-1");
    expect(value.theme).toBe("system");
    expect(value.locale).toBe("zh");
  });

  it("updates theme", async () => {
    await updateUserPreferences("u-1", { theme: "dark", locale: "en" });
    const value = await getUserPreferences("u-1");
    expect(value.theme).toBe("dark");
    expect(value.locale).toBe("en");
  });
});
