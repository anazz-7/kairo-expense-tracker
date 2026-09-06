import React from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useExpense } from '../../context/ExpenseContext';

export const AnalyticsScreen: React.FC = () => {
  const { analytics, summary, user } = useExpense();

  const formatCurrency = (val: number) => `${user.currency}${val.toLocaleString('en-IN')}`;

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-text-primary tracking-tight">Financial Analytics & Insights</h2>
        <p className="text-xs text-text-muted">Real-time spending metrics & AI trend intelligence</p>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Daily Velocity</span>
          <p className="text-xl font-bold font-mono text-text-primary mt-1">{formatCurrency(analytics.dailyBurnRate)}</p>
          <span className="text-[11px] text-text-muted">Average spend/day</span>
        </div>

        <div className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">MoM Delta</span>
          <p className={`text-xl font-bold font-mono mt-1 ${analytics.momDeltaPercent <= 0 ? 'text-primary' : 'text-danger-coral'}`}>
            {analytics.momDeltaPercent > 0 ? `+${analytics.momDeltaPercent}%` : `${analytics.momDeltaPercent}%`}
          </p>
          <span className="text-[11px] text-text-muted">vs Previous Month</span>
        </div>

        <div className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Top Category</span>
          <p className="text-base font-bold text-text-primary mt-1 truncate">{analytics.highestCategoryName}</p>
          <span className="text-[11px] text-text-muted">{formatCurrency(analytics.highestCategoryAmount)} total</span>
        </div>

        <div className="bg-surface-white p-4 rounded-2xl border border-border-subtle shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Savings Rate</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">{summary.savingsRate}%</p>
          <span className="text-[11px] text-text-muted">{formatCurrency(summary.monthlySavings)} saved</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Velocity Chart */}
        <div className="bg-surface-white p-5 rounded-2xl border border-border-subtle shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-text-primary">Daily Spending Trend</h3>
            <span className="text-xs font-semibold text-text-muted">This Month</span>
          </div>

          <div className="h-64 w-full">
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
        <div className="bg-surface-white p-5 rounded-2xl border border-border-subtle shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-text-primary">Category Distribution</h3>
            <span className="text-xs font-semibold text-text-muted">{analytics.categoryBreakdown.length} Categories</span>
          </div>

          {analytics.categoryBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-muted text-xs">
              No category expense data available
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
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
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle max-h-32 overflow-y-auto">
            {analytics.categoryBreakdown.map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-text-primary truncate">{cat.name}</span>
                </div>
                <span className="font-mono text-text-muted">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Merchants Leaderboard */}
      <div className="bg-surface-white p-5 rounded-2xl border border-border-subtle shadow-sm">
        <h3 className="font-bold text-base text-text-primary mb-4">Top Spending Merchants</h3>
        {analytics.topMerchants.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">No merchant data recorded yet.</p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {analytics.topMerchants.map((m, idx) => (
              <div key={m.name} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-text-muted w-4">#{idx + 1}</span>
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary">{m.name}</h4>
                    <p className="text-[11px] text-text-muted">{m.count} transactions</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-text-primary">{formatCurrency(m.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
