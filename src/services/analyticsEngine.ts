import { Category, SpendingInsight, Transaction } from '../types';

export interface AnalyticsMetrics {
  dailyBurnRate: number;
  momDeltaPercent: number;
  highestCategoryName: string;
  highestCategoryAmount: number;
  topMerchants: { name: string; amount: number; count: number }[];
  categoryBreakdown: { name: string; amount: number; color: string; percentage: number }[];
  monthlyTrend: { date: string; income: number; expense: number }[];
  insights: SpendingInsight[];
}

export function computeAnalyticsMetrics(
  transactions: Transaction[],
  categories: Category[]
): AnalyticsMetrics {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = Math.min(now.getDate(), daysInMonth);

  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  let currentMonthExpenses = 0;
  let prevMonthExpenses = 0;

  const categoryTotals = new Map<string, number>();
  const merchantTotals = new Map<string, { amount: number; count: number }>();
  const dailySpendMap = new Map<string, { income: number; expense: number }>();

  transactions.forEach(t => {
    const monthKey = t.date.slice(0, 7);

    if (t.type === 'expense') {
      if (monthKey === currentMonthKey) {
        currentMonthExpenses += t.amount;

        // Category spend
        const cat = categories.find(c => c.id === t.category_id);
        const catName = cat ? cat.name : 'Other';
        categoryTotals.set(catName, (categoryTotals.get(catName) || 0) + t.amount);

        // Merchant spend
        if (t.merchant) {
          const existing = merchantTotals.get(t.merchant) || { amount: 0, count: 0 };
          merchantTotals.set(t.merchant, {
            amount: existing.amount + t.amount,
            count: existing.count + 1,
          });
        }
      } else if (monthKey === prevMonthKey) {
        prevMonthExpenses += t.amount;
      }
    }

    // Trend grouping
    if (monthKey === currentMonthKey) {
      const existing = dailySpendMap.get(t.date) || { income: 0, expense: 0 };
      if (t.type === 'expense') {
        existing.expense += t.amount;
      } else if (t.type === 'income') {
        existing.income += t.amount;
      }
      dailySpendMap.set(t.date, existing);
    }
  });

  // Daily burn rate
  const dailyBurnRate = Math.round(currentMonthExpenses / (currentDay || 1));

  // MoM Delta shift
  let momDeltaPercent = 0;
  if (prevMonthExpenses > 0) {
    momDeltaPercent = parseFloat((((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100).toFixed(1));
  }

  // Highest category
  let highestCategoryName = 'None';
  let highestCategoryAmount = 0;
  categoryTotals.forEach((amt, name) => {
    if (amt > highestCategoryAmount) {
      highestCategoryAmount = amt;
      highestCategoryName = name;
    }
  });

  // Category breakdown list
  const categoryColors: Record<string, string> = {
    'Food': '#006948',
    'Transport': '#3B82F6',
    'Shopping': '#EC4899',
    'Bills': '#F59E0B',
    'Fuel': '#8B5CF6',
    'Health': '#10B981',
    'Entertainment': '#6366F1',
    'Rent': '#EF4444',
    'Education': '#14B8A6',
    'Travel': '#06B6D4',
    'Business': '#64748B',
    'Other': '#94A3B8',
  };

  const categoryBreakdown = Array.from(categoryTotals.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      color: categoryColors[name] || '#006948',
      percentage: currentMonthExpenses > 0 ? Math.round((amount / currentMonthExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top Merchants
  const topMerchants = Array.from(merchantTotals.entries())
    .map(([name, data]) => ({ name, amount: data.amount, count: data.count }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Monthly trend array (day 1 to end of month)
  const monthlyTrend: { date: string; income: number; expense: number }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const data = dailySpendMap.get(dayStr) || { income: 0, expense: 0 };
    monthlyTrend.push({
      date: `${i}`,
      income: data.income,
      expense: data.expense,
    });
  }

  // Predictive Intelligence Insights
  const insights: SpendingInsight[] = [];
  
  if (categoryBreakdown.length > 0 && highestCategoryAmount > 0) {
    const foodCat = categoryBreakdown.find(c => c.name === 'Food');
    if (foodCat && foodCat.percentage >= 25) {
      insights.push({
        id: 'ins-food',
        title: 'Dining Velocity Alert',
        message: `You spent ${foodCat.percentage}% of your expenses on Food & Dining this month. Pace stabilizes if weekend dine-outs stay under ₹2,100.`,
        type: 'warning',
        category: 'Food',
        actionText: 'Set Weekend Cap',
        impactAmount: 2100,
      });
    }

    insights.push({
      id: 'ins-top-cat',
      title: `${highestCategoryName} is Top Spending Category`,
      message: `${highestCategoryName} accounts for ₹${highestCategoryAmount.toLocaleString()} (${Math.round((highestCategoryAmount / (currentMonthExpenses || 1)) * 100)}%) of your current monthly spending.`,
      type: 'info',
      category: highestCategoryName,
    });
  }

  if (momDeltaPercent > 0) {
    insights.push({
      id: 'ins-mom-increase',
      title: 'Spending Acceleration',
      message: `Your monthly spending is running ${momDeltaPercent}% higher than last month. Consider reviewing non-essential purchases.`,
      type: 'warning',
    });
  } else if (momDeltaPercent < 0) {
    insights.push({
      id: 'ins-mom-decrease',
      title: 'Healthy Savings Velocity',
      message: `Great job! Your spending is ${Math.abs(momDeltaPercent)}% lower than last month.`,
      type: 'success',
    });
  }

  return {
    dailyBurnRate,
    momDeltaPercent,
    highestCategoryName,
    highestCategoryAmount,
    topMerchants,
    categoryBreakdown,
    monthlyTrend,
    insights,
  };
}
