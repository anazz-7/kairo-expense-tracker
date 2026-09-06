import React, { createContext, useContext, useEffect, useState } from 'react';
import { Account, Budget, Category, ParsedExpense, RecurringTransaction, Transaction, TransactionType, User, VoiceSettings } from '../types';
import { AnalyticsMetrics, computeAnalyticsMetrics } from '../services/analyticsEngine';
import { computeFinancialSummary, FinancialSummary } from '../services/balanceEngine';
import { db } from '../services/db';
import { ShakeDetector } from '../services/shakeDetector';
import { siriIntentsService } from '../services/siriIntents';
import { speechService } from '../services/speechRecognition';

export type ActiveTab = 'dashboard' | 'transactions' | 'quickAdd' | 'analytics' | 'budgets' | 'settings';

interface ExpenseContextType {
  user: User;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  settings: VoiceSettings;
  summary: FinancialSummary;
  analytics: AnalyticsMetrics;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddInitialMode: 'manual' | 'voice' | 'shake';
  setQuickAddInitialMode: (mode: 'manual' | 'voice' | 'shake') => void;

  // Actions
  addTransactionFromParsed: (parsed: ParsedExpense) => Transaction;
  addManualTransaction: (txData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Transaction;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  
  addAccount: (acc: Omit<Account, 'id' | 'user_id' | 'created_at'>) => void;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  
  addCategory: (cat: Omit<Category, 'id' | 'user_id' | 'created_at'>) => void;
  saveBudget: (category_id: string | undefined, amount: number) => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  resetAllData: () => void;

  shakeDetector: ShakeDetector | null;
  triggerShakeTest: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => db.getUser());
  const [accounts, setAccounts] = useState<Account[]>(() => db.getAccounts());
  const [categories, setCategories] = useState<Category[]>(() => db.getCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(() => db.getTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => db.getBudgets());
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => db.getRecurring());
  const [settings, setSettings] = useState<VoiceSettings>(() => db.getSettings());

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [quickAddInitialMode, setQuickAddInitialMode] = useState<'manual' | 'voice' | 'shake'>('manual');
  
  const [shakeDetector, setShakeDetector] = useState<ShakeDetector | null>(null);

  // Recompute summaries reactively
  const summary = computeFinancialSummary(accounts, transactions);
  const analytics = computeAnalyticsMetrics(transactions, categories);

  // Sync state changes to persistence
  useEffect(() => { db.setUser(user); }, [user]);
  useEffect(() => { db.setAccounts(accounts); }, [accounts]);
  useEffect(() => { db.setCategories(categories); }, [categories]);
  useEffect(() => { db.setTransactions(transactions); }, [transactions]);
  useEffect(() => { db.setBudgets(budgets); }, [budgets]);
  useEffect(() => { db.setRecurring(recurring); }, [recurring]);
  useEffect(() => { db.setSettings(settings); }, [settings]);

  // Handle Shake Detector Initialization
  useEffect(() => {
    if (!settings.shakeEnabled) return;

    const detector = new ShakeDetector({
      sensitivity: settings.shakeSensitivity,
      onShake: () => {
        setQuickAddInitialMode('shake');
        setIsQuickAddOpen(true);
        if (settings.soundEffects) {
          speechService.playSound('start');
        }
      },
    });

    detector.start();
    setShakeDetector(detector);

    return () => {
      detector.stop();
    };
  }, [settings.shakeEnabled, settings.shakeSensitivity, settings.soundEffects]);

  // Register Siri App Intents API
  useEffect(() => {
    siriIntentsService.registerHandlers(
      (parsed) => addTransactionFromParsed(parsed),
      () => categories,
      () => accounts
    );
  }, [categories, accounts]);

  const triggerShakeTest = () => {
    setQuickAddInitialMode('shake');
    setIsQuickAddOpen(true);
    if (settings.soundEffects) {
      speechService.playSound('start');
    }
  };

  const addTransactionFromParsed = (parsed: ParsedExpense): Transaction => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      account_id: parsed.accountId || (accounts[0]?.id ?? 'acc-cash'),
      category_id: parsed.categoryId || (categories[0]?.id ?? 'cat-food'),
      type: parsed.type,
      amount: parsed.amount || 0,
      merchant: parsed.merchant || undefined,
      description: parsed.description || parsed.categoryName || 'Voice Expense',
      date: parsed.date,
      time: parsed.time,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Recalculate account balances
    setAccounts(prev => {
      return prev.map(acc => {
        if (acc.id === newTx.account_id) {
          const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
          return { ...acc, current_balance: acc.current_balance + delta };
        }
        return acc;
      });
    });

    if (settings.soundEffects) {
      speechService.playSound('success');
    }

    return newTx;
  };

  const addManualTransaction = (
    txData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    setAccounts(prev => {
      return prev.map(acc => {
        let delta = 0;
        if (acc.id === newTx.account_id) {
          if (newTx.type === 'income') delta += newTx.amount;
          else if (newTx.type === 'expense' || newTx.type === 'transfer') delta -= newTx.amount;
        }
        if (newTx.type === 'transfer' && acc.id === newTx.destination_account_id) {
          delta += newTx.amount;
        }
        return { ...acc, current_balance: acc.current_balance + delta };
      });
    });

    if (settings.soundEffects) {
      speechService.playSound('success');
    }

    return newTx;
  };

  const updateTransaction = (tx: Transaction) => {
    const oldTx = transactions.find(t => t.id === tx.id);
    if (!oldTx) return;

    setTransactions(prev => prev.map(t => (t.id === tx.id ? tx : t)));

    // Reverse old tx balance effect and apply new tx balance effect
    setAccounts(prev => {
      return prev.map(acc => {
        let balance = acc.current_balance;

        // Reverse old
        if (acc.id === oldTx.account_id) {
          if (oldTx.type === 'income') balance -= oldTx.amount;
          else if (oldTx.type === 'expense' || oldTx.type === 'transfer') balance += oldTx.amount;
        }
        if (oldTx.type === 'transfer' && acc.id === oldTx.destination_account_id) {
          balance -= oldTx.amount;
        }

        // Apply new
        if (acc.id === tx.account_id) {
          if (tx.type === 'income') balance += tx.amount;
          else if (tx.type === 'expense' || tx.type === 'transfer') balance -= tx.amount;
        }
        if (tx.type === 'transfer' && acc.id === tx.destination_account_id) {
          balance += tx.amount;
        }

        return { ...acc, current_balance: balance };
      });
    });
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    // Reverse balance
    setAccounts(prev => {
      return prev.map(acc => {
        let balance = acc.current_balance;
        if (acc.id === tx.account_id) {
          if (tx.type === 'income') balance -= tx.amount;
          else if (tx.type === 'expense' || tx.type === 'transfer') balance += tx.amount;
        }
        if (tx.type === 'transfer' && acc.id === tx.destination_account_id) {
          balance -= tx.amount;
        }
        return { ...acc, current_balance: balance };
      });
    });
  };

  const addAccount = (accData: Omit<Account, 'id' | 'user_id' | 'created_at'>) => {
    const newAcc: Account = {
      ...accData,
      id: `acc-${Date.now()}`,
      user_id: user.id,
      current_balance: accData.opening_balance,
      created_at: new Date().toISOString(),
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const updateAccount = (acc: Account) => {
    setAccounts(prev => prev.map(a => (a.id === acc.id ? acc : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addCategory = (catData: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCat]);
  };

  const saveBudget = (category_id: string | undefined, amount: number) => {
    setBudgets(prev => {
      const existingIdx = prev.findIndex(b => b.category_id === category_id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], amount };
        return updated;
      }
      return [
        ...prev,
        {
          id: `bgt-${Date.now()}`,
          user_id: user.id,
          category_id,
          amount,
          period: 'monthly',
          start_date: new Date().toISOString().split('T')[0],
        },
      ];
    });
  };

  const updateSettings = (newSets: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSets }));
  };

  const resetAllData = () => {
    db.resetToSeedData();
    setUser(db.getUser());
    setAccounts(db.getAccounts());
    setCategories(db.getCategories());
    setTransactions(db.getTransactions());
    setBudgets(db.getBudgets());
    setRecurring(db.getRecurring());
    setSettings(db.getSettings());
  };

  return (
    <ExpenseContext.Provider
      value={{
        user,
        accounts,
        categories,
        transactions,
        budgets,
        recurring,
        settings,
        summary,
        analytics,
        activeTab,
        setActiveTab,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddInitialMode,
        setQuickAddInitialMode,
        addTransactionFromParsed,
        addManualTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        saveBudget,
        updateSettings,
        resetAllData,
        shakeDetector,
        triggerShakeTest,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
