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
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
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
    setMode(quickAddInitialMode);
    if (quickAddInitialMode === 'voice' || quickAddInitialMode === 'shake') {
      startVoiceListening();
    }
  }, [quickAddInitialMode, isQuickAddOpen]);

  if (!isQuickAddOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
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
      onError: (err) => {
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
      // Auto-save high confidence expense
      addTransactionFromParsed(parsed);
      setConfidenceStatus('high');
      setSavedSuccessMessage(`✓ Expense Added: ₹${parsed.amount} · ${parsed.description || 'Expense'} · ${parsed.categoryName}`);
      triggerConfetti();

      setTimeout(() => {
        handleClose();
      }, 1800);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-white w-full max-w-lg rounded-3xl border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-muted/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">add_circle</span>
            <h3 className="font-bold text-lg text-text-primary">Quick Add Expense</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Entry Mode Tabs */}
        <div className="flex p-2 bg-surface-muted border-b border-border-subtle gap-1">
          <button
            onClick={() => setMode('voice')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'voice' ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary hover:bg-surface-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
            <span>Voice</span>
          </button>

          <button
            onClick={() => setMode('shake')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'shake' ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary hover:bg-surface-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">vibration</span>
            <span>Shake-to-Add</span>
          </button>

          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'manual' ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary hover:bg-surface-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Manual</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {savedSuccessMessage ? (
            <div className="py-12 text-center flex flex-col items-center justify-center animate-bounce">
              <div className="w-16 h-16 rounded-full bg-emerald-tint text-primary flex items-center justify-center mb-4 border border-primary/30">
                <span className="material-symbols-outlined text-[36px]">check_circle</span>
              </div>
              <h4 className="text-xl font-bold text-text-primary">{savedSuccessMessage}</h4>
              <p className="text-xs text-text-muted mt-2">Returning to app...</p>
            </div>
          ) : mode === 'voice' || mode === 'shake' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
              {/* Mic Visualizer Container */}
              <div className="relative flex items-center justify-center">
                {isListening && (
                  <>
                    <div className="absolute w-32 h-32 rounded-full bg-primary/20 animate-ping" />
                    <div className="absolute w-24 h-24 rounded-full bg-primary/40 animate-pulse" />
                  </>
                )}
                <button
                  onClick={startVoiceListening}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                    isListening ? 'bg-danger-coral scale-110' : 'bg-primary hover:bg-primary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[36px]">
                    {isListening ? 'graphic_eq' : 'mic'}
                  </span>
                </button>
              </div>

              <div>
                <h4 className="text-lg font-bold text-text-primary">
                  {isListening ? 'Listening...' : 'Tap Mic or Say Expense'}
                </h4>
                <p className="text-xs text-text-muted mt-1">
                  Example: <span className="font-semibold text-text-secondary">"Spent ₹450 on dinner using UPI"</span>
                </p>
              </div>

              {/* Real-time speech transcript box */}
              {transcript && (
                <div className="w-full bg-surface-muted/60 p-4 rounded-2xl border border-border-subtle text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Live Speech Recognition</span>
                  <p className="text-base font-medium text-text-primary mt-1">"{transcript}"</p>
                </div>
              )}

              {/* Confidence Card Result */}
              {parsedExpense && parsedExpense.amount && (
                <div className="w-full bg-emerald-tint/80 border border-primary/30 p-4 rounded-2xl text-left space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {parsedExpense.confidence === 'high' ? '✓ High Confidence Extract' : '⚠️ Please Confirm Details'}
                    </span>
                    <span className="text-xs font-bold font-mono text-text-primary">
                      {Math.round(parsedExpense.confidenceScore * 100)}% Match
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase">Amount</span>
                      <p className="text-xl font-bold font-mono text-text-primary">₹{parsedExpense.amount}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase">Category</span>
                      <p className="text-sm font-semibold text-text-primary">{parsedExpense.categoryName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase">Description</span>
                      <p className="text-sm font-semibold text-text-primary">{parsedExpense.description || 'Expense'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase">Account</span>
                      <p className="text-sm font-semibold text-text-primary">{parsedExpense.accountName}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleConfirmParsed}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-sm hover:bg-primary-container active:scale-95 transition-all"
                    >
                      Save Expense
                    </button>
                    <button
                      onClick={() => {
                        setAmount(String(parsedExpense.amount));
                        setDescription(parsedExpense.description || '');
                        setMode('manual');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-surface-white text-text-secondary font-semibold text-sm border border-border-subtle hover:bg-surface-muted transition-all"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {/* Shake Test Simulator Callout inside Shake Mode */}
              {mode === 'shake' && (
                <div className="pt-4 border-t border-border-subtle w-full text-center">
                  <p className="text-xs text-text-muted mb-2">Testing on a desktop without motion sensors?</p>
                  <button
                    onClick={triggerShakeTest}
                    className="px-4 py-2 rounded-full bg-surface-white text-primary border border-primary/30 font-semibold text-xs hover:bg-emerald-tint transition-all"
                  >
                    Simulate Shake Motion
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Manual Form */
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex bg-surface-muted p-1 rounded-xl gap-1">
                {(['expense', 'income', 'transfer'] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      type === t ? 'bg-surface-white text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Large Amount Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-2xl font-bold text-text-muted">₹</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border-strong rounded-2xl font-mono text-3xl font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                  autoFocus
                />
              </div>

              {/* Category Pills */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2">Category</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                        categoryId === cat.id
                          ? 'bg-primary text-on-primary border-primary shadow-sm'
                          : 'bg-surface-white text-text-secondary border-border-subtle hover:border-text-muted'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Account</label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full p-3 bg-surface border border-border-subtle rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type}) — Balance: ₹{acc.current_balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description & Merchant */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Dinner with team"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Merchant</label>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Attach Receipt</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="w-full text-xs text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-tint file:text-primary hover:file:bg-emerald-light/60"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-bold text-base shadow-md hover:bg-primary-container active:scale-95 transition-all"
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
