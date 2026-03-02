import type { Locale } from "@/lib/types";

export type Messages = Record<string, string>;

export interface LocaleOption {
  value: Locale;
  label: string;
}
