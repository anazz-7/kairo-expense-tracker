import React from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { NavBar } from './components/navigation/NavBar';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { TransactionsScreen } from './components/transactions/TransactionsScreen';
import { AnalyticsScreen } from './components/analytics/AnalyticsScreen';
import { BudgetsScreen } from './components/budgets/BudgetsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { QuickAddModal } from './components/quickAdd/QuickAddModal';

const AppContent: React.FC = () => {
  const { activeTab } = useExpense();

  return (
    <div className="min-h-screen bg-surface font-sans text-text-primary flex flex-col antialiased">
      <NavBar />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && <DashboardScreen />}
        {activeTab === 'transactions' && <TransactionsScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
        {activeTab === 'budgets' && <BudgetsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
};

export default App;
