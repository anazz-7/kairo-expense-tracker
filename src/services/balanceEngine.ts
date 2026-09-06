import { Account, Transaction } from '../types';

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number; // percentage e.g. 38.3%
}

export function computeAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Account[] {
  // Start each account from its opening balance
  const accountMap = new Map<string, number>();
  accounts.forEach(acc => {
    accountMap.set(acc.id, acc.opening_balance);
  });

  // Process all transactions chronologically
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sorted.forEach(t => {
    const current = accountMap.get(t.account_id) ?? 0;
    if (t.type === 'expense') {
      accountMap.set(t.account_id, current - t.amount);
    } else if (t.type === 'income') {
      accountMap.set(t.account_id, current + t.amount);
    } else if (t.type === 'transfer') {
      // Deduct from source
      accountMap.set(t.account_id, current - t.amount);
      // Credit to destination
      if (t.destination_account_id) {
        const destCurrent = accountMap.get(t.destination_account_id) ?? 0;
        accountMap.set(t.destination_account_id, destCurrent + t.amount);
      }
    }
  });

  return accounts.map(acc => ({
    ...acc,
    current_balance: accountMap.get(acc.id) ?? acc.opening_balance,
  }));
}

export function computeFinancialSummary(
  accounts: Account[],
  transactions: Transaction[],
  targetMonthISO?: string // YYYY-MM
): FinancialSummary {
  const currentAccounts = computeAccountBalances(accounts, transactions);
  const totalBalance = currentAccounts.reduce((sum, acc) => sum + acc.current_balance, 0);

  const now = new Date();
  const currentMonthKey = targetMonthISO || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  transactions.forEach(t => {
    const txMonth = t.date.slice(0, 7);
    if (txMonth === currentMonthKey) {
      if (t.type === 'income') {
        monthlyIncome += t.amount;
      } else if (t.type === 'expense') {
        monthlyExpenses += t.amount;
      }
      // Note: Transfers do NOT count towards income or expenses
    }
  });

  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate: Math.max(0, parseFloat(savingsRate.toFixed(1))),
  };
}

export function applyTransactionToAccounts(
  accounts: Account[],
  transaction: Transaction,
  action: 'add' | 'delete'
): Account[] {
  const multiplier = action === 'add' ? 1 : -1;

  return accounts.map(acc => {
    let newBalance = acc.current_balance;

    if (acc.id === transaction.account_id) {
      if (transaction.type === 'expense') {
        newBalance -= transaction.amount * multiplier;
      } else if (transaction.type === 'income') {
        newBalance += transaction.amount * multiplier;
      } else if (transaction.type === 'transfer') {
        newBalance -= transaction.amount * multiplier;
      }
    }

    if (transaction.type === 'transfer' && acc.id === transaction.destination_account_id) {
      newBalance += transaction.amount * multiplier;
    }

    return { ...acc, current_balance: newBalance };
  });
}
