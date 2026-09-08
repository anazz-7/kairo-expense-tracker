import React, { useMemo, useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { Transaction } from '../../types';

export const TransactionsScreen: React.FC = () => {
  const { transactions, categories, accounts, deleteTransaction, updateTransaction, user } = useExpense();

  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Edit Drawer State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const formatCurrency = (val: number) => `${user.currency}${val.toLocaleString('en-IN')}`;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const descMatch = tx.description?.toLowerCase().includes(query);
        const merchMatch = tx.merchant?.toLowerCase().includes(query);
        const amtMatch = String(tx.amount).includes(query);
        if (!descMatch && !merchMatch && !amtMatch) return false;
      }

      if (selectedCategory !== 'all' && tx.category_id !== selectedCategory) return false;
      if (selectedAccount !== 'all' && tx.account_id !== selectedAccount) return false;
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, search, selectedCategory, selectedAccount, selectedType, sortBy]);

  const groupedTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const groups: { [key: string]: Transaction[] } = {};

    filteredTransactions.forEach(tx => {
      let groupKey = tx.date;
      if (tx.date === todayStr) groupKey = 'TODAY';
      else if (tx.date === yesterdayStr) groupKey = 'YESTERDAY';

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || 'Expense';
  const getCategoryIcon = (catId: string) => categories.find(c => c.id === catId)?.icon || 'payments';
  
  // P1 FIX: Always retrieve precise account name (e.g., UPI, HDFC Bank, Cash)
  const getAccountName = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : 'UPI';
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTx) {
      updateTransaction(editingTx);
      setEditingTx(null);
    }
  };

  return (
    <div className="flex flex-col space-y-4 max-w-4xl mx-auto pb-20 md:pb-8 pt-2">
      {/* Header & Collapsible Filter Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl text-text-primary tracking-tight">Transactions</h2>
          <p className="text-xs text-text-muted">{filteredTransactions.length} records</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            showFilters || selectedCategory !== 'all' || selectedAccount !== 'all' || selectedType !== 'all'
              ? 'bg-primary text-on-primary border-primary shadow-xs'
              : 'bg-surface-white text-text-secondary border-border-subtle hover:bg-surface-muted'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Filters</span>
        </button>
      </div>

      {/* Compact Search & Collapsible Filters */}
      <div className="bg-surface-white p-3 rounded-2xl border border-border-subtle shadow-xs space-y-2.5">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Collapsible Filter Dropdowns */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border-subtle animate-fadeIn">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="p-1.5 bg-surface border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none truncate"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="p-1.5 bg-surface border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none truncate"
            >
              <option value="all">All Accounts</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="p-1.5 bg-surface border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none truncate"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfer Only</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="p-1.5 bg-surface border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none truncate"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        )}
      </div>

      {/* Transaction List Grouped by Date */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="bg-surface-white p-8 rounded-2xl border border-border-subtle text-center">
          <span className="material-symbols-outlined text-text-muted text-[36px]">search_off</span>
          <h3 className="font-bold text-sm text-text-primary mt-2">No matching transactions found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([dateGroup, items]) => (
            <div key={dateGroup} className="space-y-1.5">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{dateGroup}</span>
                <span className="text-[10px] font-mono text-text-muted">{items.length} records</span>
              </div>

              <div className="bg-surface-white rounded-2xl border border-border-subtle divide-y divide-border-subtle overflow-hidden shadow-xs">
                {items.map(tx => (
                  <div
                    key={tx.id}
                    className="p-3 flex items-center justify-between hover:bg-surface-muted/40 transition-colors cursor-pointer"
                    onClick={() => setEditingTx(tx)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                        tx.type === 'income' ? 'bg-emerald-600' : tx.type === 'transfer' ? 'bg-blue-600' : 'bg-primary'
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">{getCategoryIcon(tx.category_id)}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-text-primary truncate">
                          {tx.description || tx.merchant || getCategoryName(tx.category_id)}
                        </h4>
                        {/* P1 FIX: Always shows precise account name e.g. "Food • UPI" */}
                        <p className="text-[10px] text-text-muted truncate">
                          {getCategoryName(tx.category_id)} • {getAccountName(tx.account_id)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className={`font-mono font-bold text-xs ${
                          tx.type === 'income' ? 'text-emerald-700' : tx.type === 'transfer' ? 'text-blue-600' : 'text-text-primary'
                        }`}>
                          {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        <p className="text-[9px] text-text-muted">{tx.time}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTransaction(tx.id);
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-danger-coral hover:bg-danger-tint transition-all"
                        title="Delete Transaction"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/60 backdrop-blur-md">
          <div className="bg-surface-white w-full max-w-md rounded-3xl border border-border-subtle p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-bold text-base text-text-primary">Edit Transaction</h3>
              <button onClick={() => setEditingTx(null)} className="text-text-muted hover:text-text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Amount</label>
                <input
                  type="number"
                  step="any"
                  value={editingTx.amount}
                  onChange={e => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl font-mono text-base font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Description</label>
                <input
                  type="text"
                  value={editingTx.description}
                  onChange={e => setEditingTx({ ...editingTx, description: e.target.value })}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Merchant</label>
                <input
                  type="text"
                  value={editingTx.merchant || ''}
                  onChange={e => setEditingTx({ ...editingTx, merchant: e.target.value })}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-muted text-text-secondary font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
