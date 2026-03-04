export type ThemePreference = "light" | "dark" | "system";
export type Locale = "zh" | "en" | "ru" | "fr";

export type CitationStyle =
  | "APA"
  | "MLA"
  | "Chicago"
  | "APA7"
  | "MLA9"
  | "Chicago17"
  | "GBT7714";

export interface TitleQualityResult {
  score: number;
  level: "weak" | "medium" | "strong";
  tips: string[];
}

export interface DocCreationSettings {
  useWeb: boolean;
  useLibrary: boolean;
  yearPreset: "all" | "5y" | "custom";
  yearMin?: number;
  yearMax?: number;
  impactPreset: "all" | "gt025" | "gt3" | "gt10";
  citationStyle: CitationStyle;
  showCitationPage: boolean;
}

export type SourceType =
  | "pdf"
  | "image"
  | "bib_ris"
  | "zotero"
  | "mendeley"
  | "web";

export interface UserPreferences {
  userId: string;
  theme: ThemePreference;
  locale: Locale;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  contentJson?: Record<string, unknown> | null;
  creationSettings?: DocCreationSettings | null;
  status: "empty" | "active";
  draftType?: "standard" | "smart" | "blank";
  isSample?: boolean;
  isOwner?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryItem {
  id: string;
  userId: string;
  sourceType: SourceType;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  doi?: string;
  url?: string;
  createdAt: string;
}

export interface UsageQuota {
  userId: string;
  period: string;
  monthlyLimit: number;
  consumed: number;
}

export interface ChatToolOptions {
  useWeb: boolean;
  useLibrary: boolean;
}

export type AutoCompleteYearPreset = "all" | "2y" | "5y" | "10y";
export type AutoCompleteImpactPreset = "all" | "emerging" | "mid" | "high";

export interface AutoCompleteSettings {
  useWeb: boolean;
  useLibrary: boolean;
  yearPreset: AutoCompleteYearPreset;
  yearMin?: number;
  yearMax?: number;
  impactPreset: AutoCompleteImpactPreset;
  impactMin?: number;
  impactMax?: number;
}

export interface AutoCompleteRequestPayload {
  docId: string;
  title: string;
  content: string;
  sectionTitle?: string;
  docSettings?: DocCreationSettings;
  cursorContext?: string;
  settings: AutoCompleteSettings;
  retryFrom?: string;
}

export interface AutoCompleteResponse {
  suggestion: string;
  generatedAt: string;
}

export interface ChatRequestPayload extends Partial<ChatToolOptions> {
  prompt: string;
  contextDocId?: string;
  conversationId?: string;
  useCurrentDoc?: boolean;
  attachmentItemIds?: string[];
}

export interface ConversationSummary {
  id: string;
  userId: string;
  title: string;
  preview: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  useWeb: boolean;
  useLibrary: boolean;
  useCurrentDoc: boolean;
  contextDocId?: string;
  createdAt: string;
}

export interface ConversationAttachment {
  id: string;
  conversationId: string;
  libraryItemId: string;
  title: string;
  sourceType: SourceType;
  createdAt: string;
}

export interface TempUserProfile {
  id: string;
  name: string;
  avatarText: string;
}
