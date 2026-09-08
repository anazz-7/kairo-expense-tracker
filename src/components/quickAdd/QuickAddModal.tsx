import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useExpense } from '../../context/ExpenseContext';
import { parseVoiceExpense } from '../../services/voiceParser';
import { speechService } from '../../services/speechRecognition';
import { ParsedExpense, TransactionType } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    categories,
    accounts,
    settings,
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddInitialMode,
    addTransactionFromParsed,
    addManualTransaction,
    triggerShakeTest,
  } = useExpense();

  const [mode, setMode] = useState<'manual' | 'voice' | 'shake'>(quickAddInitialMode);

  // Manual Form State
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [merchant, setMerchant] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
  );
  const [attachment, setAttachment] = useState<string | null>(null);

  // Voice & Shake Parsing State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [parsedExpense, setParsedExpense] = useState<ParsedExpense | null>(null);
  const [confidenceStatus, setConfidenceStatus] = useState<'idle' | 'high' | 'medium' | 'low'>('idle');
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [categories, accounts]);

  useEffect(() => {
    setMode(quickAddInitialMode);
    if (isQuickAddOpen && (quickAddInitialMode === 'voice' || quickAddInitialMode === 'shake')) {
      startVoiceListening();
    }
  }, [quickAddInitialMode, isQuickAddOpen]);

  if (!isQuickAddOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignore
    }
  };

  const handleClose = () => {
    speechService.stop();
    setIsListening(false);
    setIsQuickAddOpen(false);
    setParsedExpense(null);
    setConfidenceStatus('idle');
    setSavedSuccessMessage(null);
    setTranscript('');
    setAmount('');
  };

  const startVoiceListening = () => {
    setTranscript('');
    setParsedExpense(null);
    setConfidenceStatus('idle');
    setSavedSuccessMessage(null);

    speechService.start({
      onStart: () => {
        setIsListening(true);
      },
      onResult: (text, isFinal) => {
        setTranscript(text);
        const parsed = parseVoiceExpense(text, categories, accounts);
        setParsedExpense(parsed);

        if (isFinal) {
          setIsListening(false);
          handleVoiceResultFinal(parsed);
        }
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleVoiceResultFinal = (parsed: ParsedExpense) => {
    if (!parsed.amount || parsed.amount <= 0) {
      setConfidenceStatus('low');
      return;
    }

    if (parsed.confidence === 'high' && settings.autoSave) {
      addTransactionFromParsed(parsed);
      setConfidenceStatus('high');
      setSavedSuccessMessage(`✓ Expense Added: ₹${parsed.amount} · ${parsed.description || 'Expense'} · ${parsed.categoryName}`);
      triggerConfetti();

      setTimeout(() => {
        handleClose();
      }, 1600);
    } else {
      setConfidenceStatus(parsed.confidence === 'high' ? 'high' : 'medium');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const cat = categories.find(c => c.id === categoryId);
    addManualTransaction({
      account_id: accountId || (accounts[0]?.id ?? ''),
      category_id: categoryId || (categories[0]?.id ?? ''),
      type,
      amount: numAmount,
      merchant: merchant || undefined,
      description: description || cat?.name || 'Expense',
      date,
      time,
      attachment: attachment || undefined,
    });

    triggerConfetti();
    setSavedSuccessMessage(`✓ Expense Saved: ₹${numAmount}`);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const handleConfirmParsed = () => {
    if (!parsedExpense) return;
    addTransactionFromParsed(parsedExpense);
    triggerConfetti();
    setSavedSuccessMessage(`✓ Expense Saved: ₹${parsedExpense.amount}`);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-text-primary/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-border-subtle flex items-center justify-between bg-surface-muted/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
            <h3 className="font-bold text-base sm:text-lg text-text-primary">Quick Add Expense</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Entry Mode Tabs */}
        <div className="flex p-1.5 bg-surface-muted border-b border-border-subtle gap-1">
          <button
            onClick={() => setMode('voice')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all touch-manipulation ${
              mode === 'voice' ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary hover:bg-surface-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
            <span>Voice</span>
          </button>

          <button
            onClick={() => setMode('shake')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all touch-manipulation ${
              mode === 'shake' ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary hover:bg-surface-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">vibration</span>
            <span>Shake</span>
          </button>

          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all touch-manipulation ${
              mode === 'manual' ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary hover:bg-surface-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Manual</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {savedSuccessMessage ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-tint text-primary flex items-center justify-center mb-3 border border-primary/30">
                <span className="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <h4 className="text-lg font-bold text-text-primary px-2">{savedSuccessMessage}</h4>
              <p className="text-xs text-text-muted mt-1">Closing...</p>
            </div>
          ) : mode === 'voice' || mode === 'shake' ? (
            <div className="flex flex-col items-center justify-center py-4 text-center space-y-5">
              {/* Mic Visualizer Container */}
              <div className="relative flex items-center justify-center my-2">
                {isListening && (
                  <>
                    <div className="absolute w-28 h-28 rounded-full bg-primary/20 animate-ping" />
                    <div className="absolute w-20 h-20 rounded-full bg-primary/40 animate-pulse" />
                  </>
                )}
                <button
                  onClick={startVoiceListening}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all touch-manipulation ${
                    isListening ? 'bg-danger-coral scale-105' : 'bg-primary hover:bg-primary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[32px] sm:text-[36px]">
                    {isListening ? 'graphic_eq' : 'mic'}
                  </span>
                </button>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-text-primary">
                  {isListening ? 'Listening...' : 'Tap Mic or Say Expense'}
                </h4>
                <p className="text-xs text-text-muted mt-1 px-2">
                  Example: <span className="font-semibold text-text-secondary">"Spent ₹450 on dinner using UPI"</span>
                </p>
              </div>

              {/* Real-time speech transcript box */}
              {transcript && (
                <div className="w-full bg-surface-muted/60 p-3 rounded-2xl border border-border-subtle text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Live Speech Recognition</span>
                  <p className="text-sm sm:text-base font-medium text-text-primary mt-0.5">"{transcript}"</p>
                </div>
              )}

              {/* Confidence Card Result */}
              {parsedExpense && parsedExpense.amount && (
                <div className="w-full bg-emerald-tint/80 border border-primary/30 p-4 rounded-2xl text-left space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      {parsedExpense.confidence === 'high' ? '✓ High Confidence Extract' : '⚠️ Please Confirm Details'}
                    </span>
                    <span className="text-xs font-bold font-mono text-text-primary">
                      {Math.round(parsedExpense.confidenceScore * 100)}% Match
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase">Amount</span>
                      <p className="text-lg font-bold font-mono text-text-primary">₹{parsedExpense.amount}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase">Category</span>
                      <p className="text-xs font-semibold text-text-primary truncate">{parsedExpense.categoryName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase">Description</span>
                      <p className="text-xs font-semibold text-text-primary truncate">{parsedExpense.description || 'Expense'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase">Account</span>
                      <p className="text-xs font-semibold text-text-primary truncate">{parsedExpense.accountName}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleConfirmParsed}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-sm hover:bg-primary-container active:scale-95 transition-all touch-manipulation"
                    >
                      Save Expense
                    </button>
                    <button
                      onClick={() => {
                        setAmount(String(parsedExpense.amount));
                        setDescription(parsedExpense.description || '');
                        setMode('manual');
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-surface-white text-text-secondary font-semibold text-xs border border-border-subtle hover:bg-surface-muted transition-all touch-manipulation"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {/* Shake Test Simulator Callout inside Shake Mode */}
              {mode === 'shake' && (
                <div className="pt-3 border-t border-border-subtle w-full text-center">
                  <p className="text-[11px] text-text-muted mb-2">Testing on a desktop without motion sensors?</p>
                  <button
                    onClick={triggerShakeTest}
                    className="px-3.5 py-1.5 rounded-full bg-surface-white text-primary border border-primary/30 font-semibold text-xs hover:bg-emerald-tint transition-all touch-manipulation"
                  >
                    Simulate Shake Motion
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Manual Form */
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              {/* Type Switcher */}
              <div className="flex bg-surface-muted p-1 rounded-xl gap-1">
                {(['expense', 'income', 'transfer'] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all touch-manipulation ${
                      type === t ? 'bg-surface-white text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Large Amount Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xl sm:text-2xl font-bold text-text-muted">₹</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-surface border border-border-strong rounded-2xl font-mono text-2xl sm:text-3xl font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                  autoFocus
                />
              </div>

              {/* Category Pills */}
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1.5">Category</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-0.5">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border transition-all touch-manipulation ${
                        categoryId === cat.id
                          ? 'bg-primary text-on-primary border-primary shadow-sm'
                          : 'bg-surface-white text-text-secondary border-border-subtle hover:border-text-muted'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Account</label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type}) — ₹{acc.current_balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description & Merchant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Dinner with team"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1">Merchant</label>
                  <input
                    type="text"
                    placeholder="e.g. KFC"
                    value={merchant}
                    onChange={e => setMerchant(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2 bg-surface border border-border-subtle rounded-xl text-xs text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full p-2 bg-surface border border-border-subtle rounded-xl text-xs text-text-primary"
                  />
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1">Attach Receipt</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="w-full text-xs text-text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-tint file:text-primary"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container active:scale-95 transition-all touch-manipulation mt-2"
              >
                Save Expense
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
