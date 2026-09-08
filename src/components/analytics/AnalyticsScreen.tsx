import React from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useExpense } from '../../context/ExpenseContext';

export const AnalyticsScreen: React.FC = () => {
  const { analytics, summary, user } = useExpense();

  const formatCurrency = (val: number) => `${user.currency}${val.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col space-y-5 max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h2 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">Financial Analytics & Insights</h2>
        <p className="text-xs text-text-muted">Real-time spending metrics & AI trend intelligence</p>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface-white p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Daily Velocity</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-text-primary mt-0.5 truncate">{formatCurrency(analytics.dailyBurnRate)}</p>
          <span className="text-[10px] text-text-muted">Average spend/day</span>
        </div>

        <div className="bg-surface-white p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">MoM Delta</span>
          <p className={`text-lg sm:text-xl font-bold font-mono mt-0.5 ${analytics.momDeltaPercent <= 0 ? 'text-primary' : 'text-danger-coral'}`}>
            {analytics.momDeltaPercent > 0 ? `+${analytics.momDeltaPercent}%` : `${analytics.momDeltaPercent}%`}
          </p>
          <span className="text-[10px] text-text-muted">vs Previous Month</span>
        </div>

        <div className="bg-surface-white p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Top Category</span>
          <p className="text-sm sm:text-base font-bold text-text-primary mt-0.5 truncate">{analytics.highestCategoryName}</p>
          <span className="text-[10px] text-text-muted truncate block">{formatCurrency(analytics.highestCategoryAmount)} total</span>
        </div>

        <div className="bg-surface-white p-3.5 sm:p-4 rounded-2xl border border-border-subtle shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Savings Rate</span>
          <p className="text-lg sm:text-xl font-bold font-mono text-primary mt-0.5">{summary.savingsRate}%</p>
          <span className="text-[10px] text-text-muted truncate block">{formatCurrency(summary.monthlySavings)} saved</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Monthly Spending Velocity Chart */}
        <div className="bg-surface-white p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-text-primary">Daily Spending Trend</h3>
            <span className="text-xs font-semibold text-text-muted">This Month</span>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyTrend}>
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${user.currency}${Number(value).toLocaleString()}`, 'Expense']}
                  labelFormatter={(label) => `Day ${label}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#E2E8F0' }}
                />
                <Bar dataKey="expense" fill="#006948" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut / Pie */}
        <div className="bg-surface-white p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-text-primary">Category Distribution</h3>
            <span className="text-xs font-semibold text-text-muted">{analytics.categoryBreakdown.length} Categories</span>
          </div>

          {analytics.categoryBreakdown.length === 0 ? (
            <div className="h-56 sm:h-64 flex items-center justify-center text-text-muted text-xs">
              No category expense data available
            </div>
          ) : (
            <div className="h-56 sm:h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${user.currency}${Number(value).toLocaleString()}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#E2E8F0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle max-h-28 overflow-y-auto">
            {analytics.categoryBreakdown.map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs min-w-0 pr-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-text-primary truncate">{cat.name}</span>
                </div>
                <span className="font-mono text-text-muted text-[11px] shrink-0 ml-1">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Merchants Leaderboard */}
      <div className="bg-surface-white p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-sm">
        <h3 className="font-bold text-sm sm:text-base text-text-primary mb-3">Top Spending Merchants</h3>
        {analytics.topMerchants.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">No merchant data recorded yet.</p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {analytics.topMerchants.map((m, idx) => (
              <div key={m.name} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xs font-bold text-text-muted w-4 shrink-0">#{idx + 1}</span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-text-primary truncate">{m.name}</h4>
                    <p className="text-[10px] text-text-muted">{m.count} transactions</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs sm:text-sm text-text-primary shrink-0">{formatCurrency(m.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
