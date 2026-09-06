import { Account, Budget, Category, RecurringTransaction, Transaction, User, VoiceSettings } from '../types';

const STORAGE_KEYS = {
  USER: 'kairo_user',
  ACCOUNTS: 'kairo_accounts',
  CATEGORIES: 'kairo_categories',
  TRANSACTIONS: 'kairo_transactions',
  BUDGETS: 'kairo_budgets',
  RECURRING: 'kairo_recurring',
  SETTINGS: 'kairo_voice_settings',
};

// Initial Seed Data
const SEED_USER: User = {
  id: 'usr-1',
  name: 'Alex Morgan',
  email: 'alex@kairo.app',
  currency: '₹',
  created_at: new Date().toISOString(),
};

const SEED_ACCOUNTS: Account[] = [
  { id: 'acc-cash', user_id: 'usr-1', name: 'Cash', type: 'Cash', opening_balance: 15000, current_balance: 14820, created_at: new Date().toISOString() },
  { id: 'acc-bank', user_id: 'usr-1', name: 'HDFC Bank', type: 'Bank', opening_balance: 75000, current_balance: 145000, created_at: new Date().toISOString() },
  { id: 'acc-upi', user_id: 'usr-1', name: 'GPay / UPI', type: 'UPI', opening_balance: 25000, current_balance: 33050, created_at: new Date().toISOString() },
  { id: 'acc-card', user_id: 'usr-1', name: 'Axis Credit Card', type: 'Credit Card', opening_balance: -5000, current_balance: -8049, created_at: new Date().toISOString() },
  { id: 'acc-wallet', user_id: 'usr-1', name: 'Paytm Wallet', type: 'Wallet', opening_balance: 4500, current_balance: 4500, created_at: new Date().toISOString() },
];

const SEED_CATEGORIES: Category[] = [
  { id: 'cat-food', user_id: 'usr-1', name: 'Food', type: 'expense', icon: 'restaurant', color: '#006948', created_at: new Date().toISOString() },
  { id: 'cat-transport', user_id: 'usr-1', name: 'Transport', type: 'expense', icon: 'directions_car', color: '#3B82F6', created_at: new Date().toISOString() },
  { id: 'cat-fuel', user_id: 'usr-1', name: 'Fuel', type: 'expense', icon: 'local_gas_station', color: '#8B5CF6', created_at: new Date().toISOString() },
  { id: 'cat-shopping', user_id: 'usr-1', name: 'Shopping', type: 'expense', icon: 'shopping_bag', color: '#EC4899', created_at: new Date().toISOString() },
  { id: 'cat-bills', user_id: 'usr-1', name: 'Bills', type: 'expense', icon: 'receipt_long', color: '#F59E0B', created_at: new Date().toISOString() },
  { id: 'cat-health', user_id: 'usr-1', name: 'Health', type: 'expense', icon: 'medical_services', color: '#10B981', created_at: new Date().toISOString() },
  { id: 'cat-entertainment', user_id: 'usr-1', name: 'Entertainment', type: 'expense', icon: 'movie', color: '#6366F1', created_at: new Date().toISOString() },
  { id: 'cat-rent', user_id: 'usr-1', name: 'Rent', type: 'expense', icon: 'home', color: '#EF4444', created_at: new Date().toISOString() },
  { id: 'cat-education', user_id: 'usr-1', name: 'Education', type: 'expense', icon: 'school', color: '#14B8A6', created_at: new Date().toISOString() },
  { id: 'cat-travel', user_id: 'usr-1', name: 'Travel', type: 'expense', icon: 'flight', color: '#06B6D4', created_at: new Date().toISOString() },
  { id: 'cat-business', user_id: 'usr-1', name: 'Business', type: 'expense', icon: 'work', color: '#64748B', created_at: new Date().toISOString() },
  { id: 'cat-salary', user_id: 'usr-1', name: 'Salary', type: 'income', icon: 'payments', color: '#10B981', created_at: new Date().toISOString() },
  { id: 'cat-other', user_id: 'usr-1', name: 'Other', type: 'expense', icon: 'category', color: '#94A3B8', created_at: new Date().toISOString() },
];

const nowISO = new Date().toISOString().split('T')[0];
const yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    user_id: 'usr-1',
    account_id: 'acc-bank',
    category_id: 'cat-salary',
    type: 'income',
    amount: 85000,
    merchant: 'Acme Corp',
    description: 'Monthly Salary Credit',
    date: nowISO,
    time: '09:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    user_id: 'usr-1',
    account_id: 'acc-bank',
    category_id: 'cat-rent',
    type: 'expense',
    amount: 15000,
    merchant: 'Landlord',
    description: 'Apartment Rent Nov',
    date: nowISO,
    time: '10:15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    user_id: 'usr-1',
    account_id: 'acc-card',
    category_id: 'cat-shopping',
    type: 'expense',
    amount: 2400,
    merchant: 'Amazon',
    description: 'Wireless Headphones',
    date: nowISO,
    time: '14:30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-4',
    user_id: 'usr-1',
    account_id: 'acc-upi',
    category_id: 'cat-fuel',
    type: 'expense',
    amount: 1500,
    merchant: 'Shell',
    description: 'Petrol Fill Up',
    date: nowISO,
    time: '17:45',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-5',
    user_id: 'usr-1',
    account_id: 'acc-upi',
    category_id: 'cat-food',
    type: 'expense',
    amount: 450,
    merchant: 'KFC',
    description: 'Dinner with friends',
    date: nowISO,
    time: '20:10',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-6',
    user_id: 'usr-1',
    account_id: 'acc-cash',
    category_id: 'cat-food',
    type: 'expense',
    amount: 180,
    merchant: 'Starbucks',
    description: 'Morning Coffee',
    date: yesterdayISO,
    time: '08:30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-7',
    user_id: 'usr-1',
    account_id: 'acc-card',
    category_id: 'cat-entertainment',
    type: 'expense',
    amount: 649,
    merchant: 'Netflix',
    description: 'Premium Plan Subscription',
    date: yesterdayISO,
    time: '12:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-8',
    user_id: 'usr-1',
    account_id: 'acc-bank',
    destination_account_id: 'acc-upi',
    category_id: 'cat-other',
    type: 'transfer',
    amount: 10000,
    description: 'Fund UPI Wallet from HDFC',
    date: yesterdayISO,
    time: '15:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_BUDGETS: Budget[] = [
  { id: 'bgt-overall', user_id: 'usr-1', amount: 60000, period: 'monthly', start_date: nowISO },
  { id: 'bgt-food', user_id: 'usr-1', category_id: 'cat-food', amount: 8000, period: 'monthly', start_date: nowISO },
  { id: 'bgt-shopping', user_id: 'usr-1', category_id: 'cat-shopping', amount: 5000, period: 'monthly', start_date: nowISO },
  { id: 'bgt-travel', user_id: 'usr-1', category_id: 'cat-travel', amount: 6000, period: 'monthly', start_date: nowISO },
];

const SEED_RECURRING: RecurringTransaction[] = [
  {
    id: 'rec-1',
    user_id: 'usr-1',
    account_id: 'acc-bank',
    category_id: 'cat-rent',
    type: 'expense',
    amount: 15000,
    frequency: 'monthly',
    next_date: '2026-10-01',
    start_date: '2026-01-01',
    description: 'Apartment Rent',
    active: true,
  },
  {
    id: 'rec-2',
    user_id: 'usr-1',
    account_id: 'acc-card',
    category_id: 'cat-entertainment',
    type: 'expense',
    amount: 649,
    frequency: 'monthly',
    next_date: '2026-10-05',
    start_date: '2026-01-05',
    description: 'Netflix Premium',
    active: true,
  },
];

const SEED_SETTINGS: VoiceSettings = {
  autoSave: true,
  confidenceThreshold: 0.8,
  shakeSensitivity: 2,
  shakeEnabled: true,
  soundEffects: true,
  hapticFeedback: true,
};

export class LocalDB {
  public getUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      this.setUser(SEED_USER);
      return SEED_USER;
    }
    return JSON.parse(raw);
  }

  public setUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  public getAccounts(): Account[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      this.setAccounts(SEED_ACCOUNTS);
      return SEED_ACCOUNTS;
    }
    return JSON.parse(raw);
  }

  public setAccounts(accounts: Account[]) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  public getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      this.setCategories(SEED_CATEGORIES);
      return SEED_CATEGORIES;
    }
    return JSON.parse(raw);
  }

  public setCategories(categories: Category[]) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  public getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      this.setTransactions(SEED_TRANSACTIONS);
      return SEED_TRANSACTIONS;
    }
    return JSON.parse(raw);
  }

  public setTransactions(transactions: Transaction[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  public getBudgets(): Budget[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) {
      this.setBudgets(SEED_BUDGETS);
      return SEED_BUDGETS;
    }
    return JSON.parse(raw);
  }

  public setBudgets(budgets: Budget[]) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  public getRecurring(): RecurringTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECURRING);
    if (!raw) {
      this.setRecurring(SEED_RECURRING);
      return SEED_RECURRING;
    }
    return JSON.parse(raw);
  }

  public setRecurring(recurring: RecurringTransaction[]) {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
  }

  public getSettings(): VoiceSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      this.setSettings(SEED_SETTINGS);
      return SEED_SETTINGS;
    }
    return JSON.parse(raw);
  }

  public setSettings(settings: VoiceSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  public resetToSeedData() {
    this.setUser(SEED_USER);
    this.setAccounts(SEED_ACCOUNTS);
    this.setCategories(SEED_CATEGORIES);
    this.setTransactions(SEED_TRANSACTIONS);
    this.setBudgets(SEED_BUDGETS);
    this.setRecurring(SEED_RECURRING);
    this.setSettings(SEED_SETTINGS);
  }
}

export const db = new LocalDB();
