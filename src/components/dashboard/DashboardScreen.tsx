import React from 'react';
import { useExpense } from '../../context/ExpenseContext';

export const DashboardScreen: React.FC = () => {
  const { summary, analytics, transactions, categories, accounts, setActiveTab, setQuickAddInitialMode, setIsQuickAddOpen } = useExpense();
  const { user } = useExpense();

  const formatCurrency = (val: number) => `${user.currency}${val.toLocaleString('en-IN')}`;

  const recentTransactions = transactions.slice(0, 5);

  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || 'Expense';
  const getAccountName = (accId: string) => accounts.find(a => a.id === accId)?.name || 'UPI';
  const getCategoryIcon = (catId: string) => categories.find(c => c.id === catId)?.icon || 'payments';

  return (
    <div className="flex flex-col space-y-5 max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Time Horizon Header */}
      <div className="flex items-center justify-between bg-surface-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-border-subtle shadow-sm">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Financial Velocity</span>
        <button className="px-3 py-1 rounded-full bg-primary text-on-primary text-[11px] font-semibold shadow-sm flex items-center gap-1">
          <span>This Month</span>
          <span className="material-symbols-outlined text-[14px]">expand_more</span>
        </button>
      </div>

      {/* Main Financial Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Balance */}
        <div className="bg-surface-white p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Balance</span>
            <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight font-mono truncate">
              {formatCurrency(summary.totalBalance)}
            </h2>
            <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1 truncate">
              <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
              Across {accounts.length} linked accounts
            </p>
          </div>
        </div>

        {/* Income */}
        <div className="bg-surface-white p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Income</span>
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">arrow_downward</span>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight font-mono truncate">
              {formatCurrency(summary.monthlyIncome)}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">This month's inflow</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-surface-white p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Expenses</span>
            <span className="material-symbols-outlined text-danger-coral text-[20px]">arrow_upward</span>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight font-mono truncate">
              {formatCurrency(summary.monthlyExpenses)}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">This month's outflow</p>
          </div>
        </div>

        {/* Savings & Rate */}
        <div className="bg-surface-white p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Savings</span>
            <span className="material-symbols-outlined text-primary text-[20px]">savings</span>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight font-mono truncate">
                {formatCurrency(summary.monthlySavings)}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-tint text-primary text-[11px] font-bold shrink-0">
                {summary.savingsRate}%
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">Savings rate target</p>
          </div>
        </div>
      </div>

      {/* Telemetry Triple Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Daily Burn */}
        <div className="bg-surface-white p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Daily Burn Rate</span>
            <p className="text-base sm:text-lg font-bold text-text-primary font-mono mt-0.5">{formatCurrency(analytics.dailyBurnRate)}/day</p>
          </div>
          <span className="material-symbols-outlined text-text-muted text-[20px] sm:text-[22px]">speed</span>
        </div>

        {/* MoM Delta */}
        <div className="bg-surface-white p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">MoM Delta</span>
            <p className={`text-base sm:text-lg font-bold font-mono mt-0.5 ${analytics.momDeltaPercent <= 0 ? 'text-primary' : 'text-danger-coral'}`}>
              {analytics.momDeltaPercent > 0 ? `+${analytics.momDeltaPercent}%` : `${analytics.momDeltaPercent}%`}
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-[20px] sm:text-[22px]">trending_down</span>
        </div>

        {/* Savings Objective Progress */}
        <div className="bg-surface-white p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Savings Goal</span>
            <span className="text-xs font-bold text-primary">{summary.savingsRate}%</span>
          </div>
          <div className="w-full bg-surface-muted h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, summary.savingsRate)}%` }} />
          </div>
        </div>
      </div>

      {/* Kairo Predictive Agent Intelligence Module */}
      {analytics.insights.length > 0 && (
        <div className="relative bg-emerald-tint/90 border border-primary/20 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-surface-white text-primary shadow-sm flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">psychology</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">Kairo Predictive Agent</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-danger-tint text-danger-coral text-[10px] font-bold truncate max-w-[120px]">
                  {analytics.insights[0].category ? `${analytics.insights[0].category}` : 'Insight'}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-text-primary mt-1">{analytics.insights[0].title}</h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{analytics.insights[0].message}</p>
              
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('budgets')}
                  className="px-3 py-1.5 bg-primary text-on-primary font-semibold text-xs rounded-lg shadow-sm hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1.5 touch-manipulation"
                >
                  <span className="material-symbols-outlined text-[15px]">tune</span>
                  <span>{analytics.insights[0].actionText || 'Adjust Budget'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions & Quick Action */}
      <div className="bg-surface-white rounded-2xl border border-border-subtle p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-base text-text-primary">Recent Transactions</h3>
            <p className="text-xs text-text-muted">Real-time ledger activity</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 touch-manipulation"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-text-muted text-[36px] sm:text-[40px]">savings</span>
            <p className="text-sm font-semibold text-text-primary mt-2">Your spending story starts here.</p>
            <button
              onClick={() => {
                setQuickAddInitialMode('voice');
                setIsQuickAddOpen(true);
              }}
              className="mt-3 px-4 py-2 rounded-full bg-primary text-on-primary font-semibold text-xs shadow-sm hover:bg-primary-container transition-all touch-manipulation"
            >
              + Add Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-surface-muted/30 px-1.5 sm:px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-600' : tx.type === 'transfer' ? 'bg-blue-600' : 'bg-primary'
                  }`}>
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{getCategoryIcon(tx.category_id)}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-text-primary truncate">
                      {tx.description || tx.merchant || getCategoryName(tx.category_id)}
                    </h4>
                    <p className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5 truncate">
                      <span className="truncate">{getCategoryName(tx.category_id)}</span>
                      <span>•</span>
                      <span className="truncate">{getAccountName(tx.account_id)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold text-xs sm:text-sm ${
                    tx.type === 'income' ? 'text-emerald-700' : tx.type === 'transfer' ? 'text-blue-600' : 'text-text-primary'
                  }`}>
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
