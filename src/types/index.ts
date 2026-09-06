export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'Cash' | 'Bank' | 'UPI' | 'Credit Card' | 'Wallet';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  opening_balance: number;
  current_balance: number;
  icon?: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  destination_account_id?: string; // For transfers
  category_id: string;
  type: TransactionType;
  amount: number;
  merchant?: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  attachment?: string; // Base64 or object URL
  created_at: string;
  updated_at: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  start_date: string;
  end_date?: string;
  description: string;
  active: boolean;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string; // null means overall budget
  amount: number;
  period: 'monthly';
  start_date: string;
  end_date?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  created_at: string;
}

export interface VoiceSettings {
  autoSave: boolean;
  confidenceThreshold: number; // 0 to 1
  shakeSensitivity: number; // 1 to 3 (1=low, 2=med, 3=high threshold)
  shakeEnabled: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ParsedExpense {
  amount: number | null;
  categoryName: string | null;
  categoryId: string | null;
  merchant: string | null;
  description: string | null;
  accountName: string | null;
  accountId: string | null;
  date: string;
  time: string;
  type: TransactionType;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0 to 1
  rawInput: string;
  missingFields: string[];
}

export interface SpendingInsight {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success';
  category?: string;
  actionText?: string;
  impactAmount?: number;
}
