import React from 'react';
import { useExpense } from '../../context/ExpenseContext';

export const DashboardScreen: React.FC = () => {
  const { summary, analytics, transactions, categories, accounts, setActiveTab, setQuickAddInitialMode, setIsQuickAddOpen } = useExpense();
  const { user } = useExpense();

  const formatCurrency = (val: number) => {
    return `${user.currency}${val.toLocaleString('en-IN')}`;
  };

  const recentTransactions = transactions.slice(0, 5);

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Expense';
  };

  const getAccountName = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : 'UPI';
  };

  const getCategoryIcon = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.icon || 'payments';
  };

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Time Horizon Header */}
      <div className="flex items-center justify-between bg-surface-white px-4 py-2 rounded-full border border-border-subtle shadow-sm">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Financial Velocity</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold shadow-sm flex items-center gap-1">
            <span>This Month</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
        </div>
      </div>

      {/* Main Financial Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="bg-surface-white p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Balance</span>
            <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-bold text-text-primary tracking-tight font-mono">
              {formatCurrency(summary.totalBalance)}
            </h2>
            <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
              Across {accounts.length} linked accounts
            </p>
          </div>
        </div>

        {/* Income */}
        <div className="bg-surface-white p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Income</span>
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">arrow_downward</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-text-primary tracking-tight font-mono">
              {formatCurrency(summary.monthlyIncome)}
            </h3>
            <p className="text-xs text-text-muted mt-1">This month's inflow</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-surface-white p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Expenses</span>
            <span className="material-symbols-outlined text-danger-coral text-[20px]">arrow_upward</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-text-primary tracking-tight font-mono">
              {formatCurrency(summary.monthlyExpenses)}
            </h3>
            <p className="text-xs text-text-muted mt-1">This month's outflow</p>
          </div>
        </div>

        {/* Savings & Rate */}
        <div className="bg-surface-white p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Savings</span>
            <span className="material-symbols-outlined text-primary text-[20px]">savings</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-text-primary tracking-tight font-mono">
                {formatCurrency(summary.monthlySavings)}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-tint text-primary text-xs font-bold">
                {summary.savingsRate}%
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">Savings rate target</p>
          </div>
        </div>
      </div>

      {/* Telemetry Triple Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Daily Burn */}
        <div className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Daily Burn Rate</span>
            <p className="text-lg font-bold text-text-primary font-mono mt-0.5">{formatCurrency(analytics.dailyBurnRate)}/day</p>
          </div>
          <span className="material-symbols-outlined text-text-muted text-[22px]">speed</span>
        </div>

        {/* MoM Delta */}
        <div className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">MoM Delta</span>
            <p className={`text-lg font-bold font-mono mt-0.5 ${analytics.momDeltaPercent <= 0 ? 'text-primary' : 'text-danger-coral'}`}>
              {analytics.momDeltaPercent > 0 ? `+${analytics.momDeltaPercent}%` : `${analytics.momDeltaPercent}%`}
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-[22px]">trending_down</span>
        </div>

        {/* Savings Objective Progress */}
        <div className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Savings Goal</span>
            <span className="text-xs font-bold text-primary">{summary.savingsRate}%</span>
          </div>
          <div className="w-full bg-surface-muted h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, summary.savingsRate)}%` }} />
          </div>
        </div>
      </div>

      {/* Kairo Predictive Agent Intelligence Module */}
      {analytics.insights.length > 0 && (
        <div className="relative bg-emerald-tint/90 border border-primary/20 rounded-2xl p-5 shadow-sm overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface-white text-primary shadow-sm flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Kairo Predictive Agent</span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-danger-tint text-danger-coral text-[11px] font-bold">
                  {analytics.insights[0].category ? `${analytics.insights[0].category}` : 'Insight'}
                </span>
              </div>
              <h4 className="font-bold text-base text-text-primary mt-1">{analytics.insights[0].title}</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{analytics.insights[0].message}</p>
              
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('budgets')}
                  className="px-3.5 py-1.5 bg-primary text-on-primary font-semibold text-xs rounded-lg shadow-sm hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>{analytics.insights[0].actionText || 'Adjust Budget'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions & Quick Action */}
      <div className="bg-surface-white rounded-2xl border border-border-subtle p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-text-primary">Recent Transactions</h3>
            <p className="text-xs text-text-muted">Real-time ledger activity</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-text-muted text-[40px]">savings</span>
            <p className="text-sm font-semibold text-text-primary mt-2">Your spending story starts here.</p>
            <button
              onClick={() => {
                setQuickAddInitialMode('voice');
                setIsQuickAddOpen(true);
              }}
              className="mt-3 px-4 py-2 rounded-full bg-primary text-on-primary font-semibold text-xs shadow-sm hover:bg-primary-container transition-all"
            >
              + Add Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-surface-muted/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${tx.type === 'income' ? 'bg-emerald-600' : tx.type === 'transfer' ? 'bg-blue-600' : 'bg-primary'}`}>
                    <span className="material-symbols-outlined text-[20px]">{getCategoryIcon(tx.category_id)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary leading-snug">
                      {tx.description || tx.merchant || getCategoryName(tx.category_id)}
                    </h4>
                    <p className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                      <span>{getCategoryName(tx.category_id)}</span>
                      <span>•</span>
                      <span>{getAccountName(tx.account_id)}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-bold text-sm ${tx.type === 'income' ? 'text-emerald-700' : tx.type === 'transfer' ? 'text-blue-600' : 'text-text-primary'}`}>
                    {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">{tx.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
