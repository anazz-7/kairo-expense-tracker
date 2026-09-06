import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    user,
    transactions,
    categories,
    accounts,
    triggerShakeTest,
    resetAllData,
  } = useExpense();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transactions to export.');
      return;
    }

    const headers = ['Date', 'Time', 'Type', 'Category', 'Account', 'Amount', 'Merchant', 'Description'];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.category_id)?.name || 'Expense';
      const acc = accounts.find(a => a.id === t.account_id)?.name || 'Account';
      return [
        t.date,
        t.time,
        t.type,
        `"${cat}"`,
        `"${acc}"`,
        t.amount,
        `"${t.merchant || ''}"`,
        `"${t.description || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kairo_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ Exported CSV successfully!');
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-2xl shadow-lg text-xs font-bold animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-text-primary tracking-tight">Settings & Voice Calibration</h2>
        <p className="text-xs text-text-muted">Configure shake sensitivity, voice auto-save, and export data</p>
      </div>

      {/* SECTION 1: SHAKE & VOICE CALIBRATION */}
      <div className="bg-surface-white rounded-2xl border border-border-subtle p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-tint text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary">Shake & Voice Engine Calibration</h3>
            <p className="text-xs text-text-muted">Signature SHAKE → SPEAK → AUTO ADD configuration</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* Shake-to-Add Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-text-primary">Enable Shake-to-Add</h4>
              <p className="text-xs text-text-muted">Triggers voice listening when phone is shaken</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.shakeEnabled}
                onChange={e => updateSettings({ shakeEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>

          {/* Shake Sensitivity Slider */}
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-text-primary">Shake Motion Sensitivity</h4>
              <span className="text-xs font-bold font-mono text-primary">
                {settings.shakeSensitivity === 1 ? 'Low (Hard Shake)' : settings.shakeSensitivity === 3 ? 'High (Gentle Shake)' : 'Medium (Default)'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={settings.shakeSensitivity}
              onChange={e => updateSettings({ shakeSensitivity: parseInt(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>Hard Shake</span>
              <span>Medium</span>
              <span>Gentle Shake</span>
            </div>
          </div>

          {/* Auto-Save High Confidence Expenses */}
          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
            <div>
              <h4 className="font-semibold text-sm text-text-primary">Auto-Save High Confidence Expenses</h4>
              <p className="text-xs text-text-muted">Skips manual confirmation when NLP confidence is high</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={e => updateSettings({ autoSave: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>

          {/* Test Motion Trigger Button */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-text-primary">Motion Detector Simulator</h4>
              <p className="text-xs text-text-muted">Test shake logic on desktop browsers</p>
            </div>
            <button
              onClick={triggerShakeTest}
              className="px-4 py-2 rounded-xl bg-emerald-tint text-primary font-semibold text-xs border border-primary/30 hover:bg-emerald-light/60 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">vibration</span>
              <span>Test Shake Motion</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: DATA & EXPORT */}
      <div className="bg-surface-white rounded-2xl border border-border-subtle p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-tint text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">download</span>
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary">Data Export & Backup</h3>
            <p className="text-xs text-text-muted">Export your full ledger in CSV format</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <h4 className="font-semibold text-sm text-text-primary">Download Transaction CSV</h4>
            <p className="text-xs text-text-muted">Includes dates, categories, accounts, amounts & notes</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: SYSTEM RESET */}
      <div className="bg-surface-white rounded-2xl border border-border-subtle p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-error">
          <div className="w-10 h-10 rounded-xl bg-danger-tint text-danger-coral flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">restart_alt</span>
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary">Reset & Restore Seed Data</h3>
            <p className="text-xs text-text-muted">Reset all transactions to default demonstration dataset</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <h4 className="font-semibold text-sm text-text-primary">Reset Database</h4>
            <p className="text-xs text-text-muted">Restores default accounts, categories, and sample transactions</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all transactions and accounts to default seed data?')) {
                resetAllData();
                showToast('✓ Restored seed data!');
              }
            }}
            className="px-4 py-2 rounded-xl bg-surface-white text-danger-coral border border-danger-coral/30 font-semibold text-xs hover:bg-danger-tint transition-all"
          >
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
