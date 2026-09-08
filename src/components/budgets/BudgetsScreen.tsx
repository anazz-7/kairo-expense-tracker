import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { AccountType } from '../../types';

export const BudgetsScreen: React.FC = () => {
  const {
    accounts,
    categories,
    budgets,
    transactions,
    addAccount,
    deleteAccount,
    addManualTransaction,
    saveBudget,
    user,
  } = useExpense();

  const [showAddAccountModal, setShowAddAccountModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);

  // New Account State
  const [accName, setAccName] = useState<string>('');
  const [accType, setAccType] = useState<AccountType>('Bank');
  const [accBalance, setAccBalance] = useState<string>('0');

  // Transfer State
  const [fromAccId, setFromAccId] = useState<string>(accounts[0]?.id || '');
  const [toAccId, setToAccId] = useState<string>(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferDesc, setTransferDesc] = useState<string>('Account Transfer');

  // Budget Edit State
  const [selectedBudgetCatId, setSelectedBudgetCatId] = useState<string>('overall');
  const [budgetAmountInput, setBudgetAmountInput] = useState<string>('5000');

  const formatCurrency = (val: number) => `${user.currency}${val.toLocaleString('en-IN')}`;

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const categorySpendMap = new Map<string, number>();
  let overallSpend = 0;

  transactions.forEach(t => {
    if (t.date.slice(0, 7) === currentMonthKey && t.type === 'expense') {
      overallSpend += t.amount;
      categorySpendMap.set(t.category_id, (categorySpendMap.get(t.category_id) || 0) + t.amount);
    }
  });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;
    addAccount({
      name: accName.trim(),
      type: accType,
      opening_balance: parseFloat(accBalance) || 0,
      current_balance: parseFloat(accBalance) || 0,
    });
    setAccName('');
    setAccBalance('0');
    setShowAddAccountModal(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || fromAccId === toAccId) return;

    addManualTransaction({
      account_id: fromAccId,
      destination_account_id: toAccId,
      category_id: categories.find(c => c.name === 'Other')?.id || categories[0].id,
      type: 'transfer',
      amount: amt,
      description: transferDesc || 'Transfer',
      date: new Date().toISOString().split('T')[0],
      time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
    });

    setTransferAmount('');
    setShowTransferModal(false);
  };

  const handleSaveBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(budgetAmountInput);
    if (isNaN(amt) || amt <= 0) return;

    const catId = selectedBudgetCatId === 'overall' ? undefined : selectedBudgetCatId;
    saveBudget(catId, amt);
    setShowBudgetModal(false);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto pb-20 md:pb-8 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">Accounts & Budgets</h2>
          <p className="text-xs text-text-muted">Manage balances, transfers, and monthly spending budgets</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-tint text-primary border border-primary/30 font-semibold text-xs flex items-center gap-1 hover:bg-emerald-light/50 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>Transfer</span>
          </button>
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-semibold text-xs flex items-center gap-1 shadow-xs hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: ACCOUNTS */}
      <div className="space-y-2.5">
        <h3 className="font-bold text-base text-text-primary">Accounts & Wallets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-tint text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[18px]">
                      {acc.type === 'Cash' ? 'payments' : acc.type === 'UPI' ? 'qr_code' : acc.type === 'Credit Card' ? 'credit_card' : 'account_balance'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-text-primary">{acc.name}</h4>
                    <span className="text-[9px] text-text-muted uppercase tracking-wider">{acc.type}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteAccount(acc.id)}
                  className="text-text-muted hover:text-danger-coral transition-colors p-1"
                  title="Delete Account"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-text-muted">Current Balance</span>
                <h4 className="text-xl font-bold font-mono text-text-primary tracking-tight">{formatCurrency(acc.current_balance)}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: BUDGETS — P0 FIX: 4-tier threshold states and remaining amount display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-text-primary">Monthly Budgets</h3>
            <p className="text-xs text-text-muted">Status: Normal (0-69%), Watch (70-89%), Near Limit (90-99%), Over Budget (≥100%)</p>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="px-3 py-1.5 rounded-xl bg-surface-white text-text-primary border border-border-subtle font-semibold text-xs hover:bg-surface-muted transition-all"
          >
            Set Budget
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {budgets.map(bgt => {
            const isOverall = !bgt.category_id;
            const category = categories.find(c => c.id === bgt.category_id);
            const title = isOverall ? 'Overall Monthly Budget' : category?.name || 'Category Budget';
            const spent = isOverall ? overallSpend : (categorySpendMap.get(bgt.category_id!) || 0);
            const remaining = bgt.amount - spent;
            const ratio = spent / (bgt.amount || 1);
            const pct = Math.min(100, Math.round(ratio * 100));

            // P0 FIX: 4-tier budget status threshold states
            let statusColor = 'bg-emerald-tint text-primary border border-primary/20';
            let statusText = '🟢 Normal';
            let barColor = 'bg-primary';

            if (ratio >= 1.0) {
              statusColor = 'bg-error text-on-error';
              statusText = '🔴 Over Budget';
              barColor = 'bg-error';
            } else if (ratio >= 0.90) {
              statusColor = 'bg-danger-tint text-danger-coral border border-danger-coral/30';
              statusText = '🟠 Near Limit';
              barColor = 'bg-danger-coral';
            } else if (ratio >= 0.70) {
              statusColor = 'bg-amber-100 text-amber-800 border border-amber-300';
              statusText = '🟡 Watch';
              barColor = 'bg-amber-500';
            }

            return (
              <div key={bgt.id} className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {category?.icon || 'tune'}
                    </span>
                    <h4 className="font-bold text-sm text-text-primary">{title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                    {statusText}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-0.5">
                  <div>
                    <span className="font-mono text-base font-bold text-text-primary">{formatCurrency(spent)} spent</span>
                    <span className="text-[10px] text-text-muted block">Budget: {formatCurrency(bgt.amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono text-xs font-bold ${remaining < 0 ? 'text-error' : 'text-primary'}`}>
                      {remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over`}
                    </span>
                    <span className="text-[10px] text-text-muted block">{pct}% used</span>
                  </div>
                </div>

                <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/60 backdrop-blur-md">
          <div className="bg-surface-white w-full max-w-md rounded-3xl border border-border-subtle p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-bold text-base text-text-primary">Add New Account</h3>
              <button onClick={() => setShowAddAccountModal(false)} className="text-text-muted">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Salary Account"
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Type</label>
                <select
                  value={accType}
                  onChange={e => setAccType(e.target.value as AccountType)}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Account</option>
                  <option value="UPI">UPI App</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Wallet">Digital Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Opening Balance</label>
                <input
                  type="number"
                  step="any"
                  value={accBalance}
                  onChange={e => setAccBalance(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs font-mono font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Account Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/60 backdrop-blur-md">
          <div className="bg-surface-white w-full max-w-md rounded-3xl border border-border-subtle p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-bold text-base text-text-primary">Transfer Funds Between Accounts</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-text-muted">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">From Account</label>
                <select
                  value={fromAccId}
                  onChange={e => setFromAccId(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (₹{a.current_balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">To Account</label>
                <select
                  value={toAccId}
                  onChange={e => setToAccId(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (₹{a.current_balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Amount</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl font-mono text-base font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs"
              >
                Execute Transfer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Set Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/60 backdrop-blur-md">
          <div className="bg-surface-white w-full max-w-md rounded-3xl border border-border-subtle p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-bold text-base text-text-primary">Set Category Budget</h3>
              <button onClick={() => setShowBudgetModal(false)} className="text-text-muted">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveBudgetSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Category / Scope</label>
                <select
                  value={selectedBudgetCatId}
                  onChange={e => setSelectedBudgetCatId(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs"
                >
                  <option value="overall">Overall Monthly Budget</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Monthly Budget Limit</label>
                <input
                  type="number"
                  step="any"
                  value={budgetAmountInput}
                  onChange={e => setBudgetAmountInput(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl font-mono text-base font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs"
              >
                Save Budget
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
