import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';

export const DashboardScreen: React.FC = () => {
  const { summary, analytics, transactions, categories, accounts, setActiveTab, setQuickAddInitialMode, setIsQuickAddOpen, user } = useExpense();
  const [showAccountsBreakdown, setShowAccountsBreakdown] = useState<boolean>(false);
  const [velocityTimeframe, setVelocityTimeframe] = useState<'7D' | '30D' | '3M' | '1Y'>('30D');

  const formatCurrency = (val: number) => `${user.currency}${Math.abs(val).toLocaleString('en-IN')}`;

  const recentTransactions = transactions.slice(0, 4);

  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || 'Expense';
  const getAccountName = (accId: string) => accounts.find(a => a.id === accId)?.name || 'UPI';
  const getCategoryIcon = (catId: string) => categories.find(c => c.id === catId)?.icon || 'payments';

  // P0 Fix: Handle Savings Rate when Income is 0
  const isSavingsRateValid = summary.monthlyIncome > 0;
  const isMomValid = analytics.momDeltaPercent !== 0;

  return (
    <div className="flex flex-col space-y-4 max-w-4xl mx-auto pb-20 md:pb-8 pt-2 sm:pt-4">
      {/* Financial Velocity Horizon Pill Header */}
      <div className="flex items-center justify-between bg-surface-white px-3.5 py-1.5 rounded-full border border-border-subtle shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Financial Velocity</span>
        </div>
        <div className="flex items-center gap-1 bg-surface-muted/80 p-0.5 rounded-full">
          {(['7D', '30D', '3M', '1Y'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setVelocityTimeframe(tf)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                velocityTimeframe === tf ? 'bg-primary text-on-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* P1 FIX: HERO TOTAL BALANCE CARD with Tap-to-Expand Accounts Breakdown */}
      <div className="bg-surface-white p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Balance</span>
          <button
            onClick={() => setShowAccountsBreakdown(!showAccountsBreakdown)}
            className="px-2.5 py-1 rounded-full bg-emerald-tint text-primary text-[11px] font-semibold flex items-center gap-1 border border-primary/20 hover:bg-emerald-light/60 transition-all"
          >
            <span>{accounts.length} Accounts</span>
            <span className="material-symbols-outlined text-[14px]">
              {showAccountsBreakdown ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono text-text-primary tracking-tight">
            {user.currency}{summary.totalBalance.toLocaleString('en-IN')}
          </h2>
          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary">trending_up</span>
            <span>Net cash across cash, bank, upi & cards</span>
          </p>
        </div>

        {/* Collapsible Accounts Breakdown */}
        {showAccountsBreakdown && (
          <div className="pt-3 border-t border-border-subtle grid grid-cols-2 sm:grid-cols-3 gap-2.5 animate-fadeIn">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-surface-muted/40 p-2.5 rounded-xl border border-border-subtle">
                <span className="text-[10px] text-text-muted font-semibold block truncate">{acc.name}</span>
                <span className="text-xs font-mono font-bold text-text-primary block mt-0.5">{formatCurrency(acc.current_balance)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* P1 FIX: COMBINED SINGLE MONTHLY CASH FLOW CARD (Income, Expenses, Net Savings) */}
      <div className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Monthly Cash Flow</span>
          <span className="text-xs font-mono font-bold text-primary">
            Net: {summary.monthlySavings >= 0 ? '+' : '-'}{formatCurrency(summary.monthlySavings)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-text-muted uppercase font-bold">Income</span>
            <p className="text-lg font-bold font-mono text-emerald-700">{formatCurrency(summary.monthlyIncome)}</p>
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase font-bold">Expenses</span>
            <p className="text-lg font-bold font-mono text-text-primary">{formatCurrency(summary.monthlyExpenses)}</p>
          </div>
        </div>

        {/* Cash Flow Visual Progress Bars */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Income Flow</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden flex">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: summary.monthlyIncome > 0 ? '100%' : '0%' }} />
          </div>

          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Outflow Burn</span>
            <span>{summary.monthlyIncome > 0 ? Math.min(100, Math.round((summary.monthlyExpenses / summary.monthlyIncome) * 100)) : 100}%</span>
          </div>
          <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden flex">
            <div
              className={`h-full rounded-full ${summary.monthlyExpenses > summary.monthlyIncome ? 'bg-error' : 'bg-primary'}`}
              style={{ width: `${summary.monthlyIncome > 0 ? Math.min(100, Math.round((summary.monthlyExpenses / summary.monthlyIncome) * 100)) : (summary.monthlyExpenses > 0 ? 100 : 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Telemetry Strip: Daily Burn & MoM Delta */}
      <div className="grid grid-cols-2 gap-3">
        {/* Daily Burn Rate */}
        <div className="bg-surface-white p-3.5 rounded-2xl border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Daily Burn</span>
            <p className="text-sm sm:text-base font-bold font-mono text-text-primary mt-0.5">{formatCurrency(analytics.dailyBurnRate)}/day</p>
          </div>
          <span className="material-symbols-outlined text-text-muted text-[20px]">speed</span>
        </div>

        {/* P0 FIX: MoM Delta handles 0% properly */}
        <div className="bg-surface-white p-3.5 rounded-2xl border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">MoM Delta</span>
            <p className="text-sm sm:text-base font-bold font-mono text-text-primary mt-0.5">
              {isMomValid ? `${analytics.momDeltaPercent > 0 ? '+' : ''}${analytics.momDeltaPercent}%` : '—'}
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-[20px]">trending_down</span>
        </div>
      </div>

      {/* P1 FIX: HUMANIZED KAIRO INSIGHT CARD */}
      {analytics.insights.length > 0 && (
        <div className="bg-emerald-tint/90 border border-primary/25 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">✦ Kairo Insight</span>
            </div>
            <span className="text-[10px] font-bold text-text-muted uppercase">{analytics.insights[0].category || 'Spending'}</span>
          </div>

          <h4 className="font-bold text-sm text-text-primary">
            {analytics.insights[0].category ? `${analytics.insights[0].category} is driving your spending` : analytics.insights[0].title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            {analytics.insights[0].message}
          </p>

          <div className="pt-1">
            <button
              onClick={() => setActiveTab('budgets')}
              className="px-3 py-1 bg-primary text-on-primary font-semibold text-xs rounded-lg shadow-xs hover:bg-primary-container transition-all flex items-center gap-1"
            >
              <span>Set Budget</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* RECENT TRANSACTIONS */}
      <div className="bg-surface-white rounded-2xl border border-border-subtle p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <h3 className="font-bold text-sm text-text-primary">Recent Transactions</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-text-muted">No transactions recorded yet this month.</p>
            <button
              onClick={() => {
                setQuickAddInitialMode('voice');
                setIsQuickAddOpen(true);
              }}
              className="mt-2 px-3.5 py-1.5 rounded-full bg-primary text-on-primary font-semibold text-xs shadow-xs"
            >
              + Quick Add
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between hover:bg-surface-muted/30 px-1 rounded-xl transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-600' : tx.type === 'transfer' ? 'bg-blue-600' : 'bg-primary'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">{getCategoryIcon(tx.category_id)}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-text-primary truncate">
                      {tx.description || tx.merchant || getCategoryName(tx.category_id)}
                    </h4>
                    {/* P1 FIX: Shows actual account name e.g. "Food • UPI" instead of "Account" */}
                    <p className="text-[10px] text-text-muted truncate">
                      {getCategoryName(tx.category_id)} • {getAccountName(tx.account_id)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold text-xs ${
                    tx.type === 'income' ? 'text-emerald-700' : tx.type === 'transfer' ? 'text-blue-600' : 'text-text-primary'
                  }`}>
                    {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <p className="text-[9px] text-text-muted">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
