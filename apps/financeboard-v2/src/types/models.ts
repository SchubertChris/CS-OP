import type { Settings } from './settings';

// ── KONTEN ──────────────────────────────────────────────────

export type AccountType =
  | 'girokonto'
  | 'kreditkarte'
  | 'tagesgeld'
  | 'sparkonto'
  | 'depot'
  | 'festgeld'
  | 'vl'
  | 'sonstiges';

export type BillingType = 'stichtag' | 'direkt' | 'prepaid';

export interface Account {
  id: string;
  label: string;
  sub: string;
  accountType: AccountType;
  iban: string;
  color: string;
  balance: number;
  include: boolean;
  isMain: boolean;
  monthlyIncome: number;
  bankGroup: string;
  isGroupRef: boolean;
  billingType?: BillingType;
  billingDay?: number;
  ccExp?: string;
  ccCvv?: string;
  vlMonthlyRate?: number;
  note: string;
  sortOrder: number;
  createdAt: string;
}

// ── FESTPOSTEN ───────────────────────────────────────────────

export type Interval =
  | 'monatl.'
  | 'viertelj.'
  | 'halbjährl.'
  | 'jährl.'
  | 'einmalig';

export type PostenType = 'ausgabe' | 'einnahme';

export interface Posten {
  id: string;
  name: string;
  type: PostenType;
  amount: number;
  interval: Interval;
  due: number;
  accountId: string;
  note: string;
  contractStart: string;
  contractEnd: string;
  overrides: Record<string, number>;
  categoryId: string | null;
  goalId: string | null;
  creditorId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── UMBUCHUNGEN ──────────────────────────────────────────────

export interface Transfer {
  id: string;
  date: string;
  fromId: string;
  toId: string;
  amount: number;
  note: string;
  interval: Interval | null;
  execDay: number;
  createdAt: string;
}

// ── SPARZIELE ────────────────────────────────────────────────

export interface Goal {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  monthlyRate: number;
  startDate: string;
  deadline: string;
  note: string;
  accountId: string;
  createdAt: string;
}

// ── KATEGORIEN ───────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  isDefault: boolean;
}

// ── KREDITOREN ───────────────────────────────────────────────

export interface Creditor {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountId: string | null;
  address: string;
  website: string;
  note: string;
  color: string;
  icon: string;
  logoDomain: string;
  createdAt: string;
}

// ── BUCHUNGEN ────────────────────────────────────────────────

export type BookingStatus =
  | 'gebucht'
  | 'vorgemerkt'
  | 'ausgesetzt'
  | 'geändert'
  | 'beglichen';

export interface Booking {
  id: string;
  postenId: string | null;
  transferId: string | null;
  date: string;
  monthKey: string;
  name: string;
  type: PostenType | 'umbuchung';
  amount: number;
  baseAmount: number;
  accountId: string;
  status: BookingStatus;
  note: string;
  interval: Interval | null;
  categoryId: string | null;
  creditorId: string | null;
}

// ── SAFEPOINTS ───────────────────────────────────────────────

export interface Safepoint {
  id: string;
  label: string;
  createdAt: string;
  type: 'manual' | 'auto';
}

// ── VOLLSTÄNDIGER APP-STATE ──────────────────────────────────

export interface AppState {
  accounts: Account[];
  posten: Posten[];
  transfers: Transfer[];
  goals: Goal[];
  categories: Category[];
  creditors: Creditor[];
  bookings: Booking[];
  settings: Settings;
  yearNotes: Record<string, string>;
  closedMonths: string[];
  version: string;
}

// Settings re-export für AppState (definiert in settings.ts)
export type { Settings } from './settings';
