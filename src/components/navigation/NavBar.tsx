import React, { useState } from 'react';
import { ActiveTab, useExpense } from '../../context/ExpenseContext';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { PwaInstallModal } from '../common/PwaInstallModal';

export const NavBar: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickAddOpen, setQuickAddInitialMode, triggerShakeTest } = useExpense();
  const { isInstallable, isInstalled, isIos, triggerInstall } = usePwaInstall();
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);

  const handleQuickAddClick = (mode: 'manual' | 'voice' | 'shake' = 'manual') => {
    setQuickAddInitialMode(mode);
    setIsQuickAddOpen(true);
  };

  const handleInstallClick = () => {
    if (isIos) {
      setShowPwaModal(true);
    } else {
      triggerInstall();
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Home', icon: 'grid_view' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
    { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
    { id: 'budgets', label: 'Budgets', icon: 'account_balance_wallet' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* PWA Install Modal */}
      <PwaInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
        onInstall={triggerInstall}
        isIos={isIos}
      />

      {/* Desktop Top Header & Navigation */}
      <header className="hidden md:flex fixed top-0 w-full z-50 h-16 bg-surface-white/90 backdrop-blur-xl border-b border-border-subtle px-8 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-text-primary leading-tight">Kairo AI</h1>
            <p className="text-xs text-text-muted">Voice Expense Tracker</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-surface-muted/60 p-1.5 rounded-full border border-border-subtle">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === item.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-full bg-emerald-tint text-primary hover:bg-emerald-light/60 transition-all font-semibold text-xs flex items-center gap-1.5 border border-primary/30"
              title="Install App on Device"
            >
              <span className="material-symbols-outlined text-[18px]">install_mobile</span>
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={triggerShakeTest}
            className="px-3.5 py-2 rounded-full bg-surface-white text-text-secondary hover:bg-surface-muted transition-all font-semibold text-xs flex items-center gap-1.5 border border-border-subtle"
            title="Simulate device shake"
          >
            <span className="material-symbols-outlined text-[18px]">vibration</span>
            <span>Test Shake</span>
          </button>

          <button
            onClick={() => handleQuickAddClick('voice')}
            className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
            <span>Voice Add</span>
          </button>
        </div>
      </header>

      {/* Mobile Top App Bar Header */}
      <header className="md:hidden fixed top-0 w-full z-40 h-16 pt-safe bg-surface/90 backdrop-blur-xl border-b border-border-subtle px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
          </div>
          <span className="font-bold text-base text-text-primary tracking-tight">Kairo AI</span>
        </div>

        <div className="flex items-center gap-2">
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">install_mobile</span>
              <span>Install</span>
            </button>
          )}

          <button
            onClick={triggerShakeTest}
            className="px-2.5 py-1 rounded-full bg-emerald-tint text-primary text-xs font-semibold flex items-center gap-1 border border-primary/20 active:scale-95"
            title="Simulate Shake"
          >
            <span className="material-symbols-outlined text-[16px]">vibration</span>
            <span>Shake</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-muted text-text-secondary"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Floating Action Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-white/95 backdrop-blur-xl border-t border-border-subtle px-2 py-2 flex items-center justify-around pb-safe">
        {navItems.slice(0, 2).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === item.id ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
            <span className="text-[11px] mt-0.5">{item.label}</span>
          </button>
        ))}

        {/* Prominent Center Quick Add Button */}
        <div className="relative -top-5 flex flex-col items-center px-2">
          <button
            onClick={() => handleQuickAddClick('voice')}
            className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-[0_6px_20px_rgba(0,105,72,0.4)] flex items-center justify-center active:scale-90 transition-transform ring-4 ring-surface"
            aria-label="Quick Add Expense with Voice"
          >
            <span className="material-symbols-outlined text-[28px] animate-pulse">mic</span>
          </button>
          <span className="text-[10px] font-semibold text-primary mt-1">Quick Add</span>
        </div>

        {navItems.slice(2, 4).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === item.id ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
            <span className="text-[11px] mt-0.5">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
