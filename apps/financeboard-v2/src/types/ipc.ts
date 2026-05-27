import type { AppState } from './models';

// ── STATE ────────────────────────────────────────────────────

export interface LoadStateResult {
  state: AppState | null;
  version: string;
}

export interface SaveStateArgs {
  data: AppState;
}

// ── STORAGE ──────────────────────────────────────────────────

export interface GetPathResult {
  path: string;
  isDefault: boolean;
}

export interface ChoosePathResult {
  path: string | null;
  migrated: boolean;
}

// ── ARCHIVE ──────────────────────────────────────────────────

export interface ArchiveFilter {
  category?: string;
  search?: string;
}

export interface ArchiveDoc {
  id: string;
  name: string;
  category: string;
  size: number;
  createdAt: string;
  note: string;
  linkedPostenId: string | null;
}

export interface ArchiveAddArgs {
  name: string;
  category: string;
  note: string;
  linkedPostenId: string | null;
  data: number[];
}

// ── EXPORT ───────────────────────────────────────────────────

export interface ExportArgs {
  state: AppState;
  includeArchive: boolean;
}

export interface ImportResult {
  success: boolean;
  state: AppState | null;
  error: string | null;
}

// ── PRINT ────────────────────────────────────────────────────

export interface PrintHtmlArgs {
  html: string;
  title?: string;
}

// ── SAFEPOINTS ───────────────────────────────────────────────

export interface SafepointEntry {
  id: string;
  label: string;
  type: 'manual' | 'auto';
  createdAt: string;
  sizeBytes: number;
}

export interface SaveSafepointArgs {
  label: string;
  type: 'manual' | 'auto';
  state: AppState;
}
