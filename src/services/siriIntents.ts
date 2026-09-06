import { Account, Category, ParsedExpense, Transaction } from '../types';
import { parseVoiceExpense } from './voiceParser';

export interface SiriIntentResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
  parsedExpense?: ParsedExpense;
}

export class SiriIntentsService {
  private addTransactionHandler?: (parsed: ParsedExpense) => Transaction;
  private categoriesProvider?: () => Category[];
  private accountsProvider?: () => Account[];

  public registerHandlers(
    addFn: (parsed: ParsedExpense) => Transaction,
    getCats: () => Category[],
    getAccs: () => Account[]
  ) {
    this.addTransactionHandler = addFn;
    this.categoriesProvider = getCats;
    this.accountsProvider = getAccs;

    // Attach to window object for external Siri / App Intents / Web Share / PWA triggers
    if (typeof window !== 'undefined') {
      (window as any).KairoExpenseApp = {
        addExpenseFromIntent: (textOrPayload: string | Partial<ParsedExpense>) => this.handleIntentAdd(textOrPayload),
        parseVoice: (text: string) => this.handleIntentParse(text),
        version: '1.0.0',
      };
    }
  }

  public handleIntentParse(text: string): ParsedExpense {
    const cats = this.categoriesProvider ? this.categoriesProvider() : [];
    const accs = this.accountsProvider ? this.accountsProvider() : [];
    return parseVoiceExpense(text, cats, accs);
  }

  public handleIntentAdd(textOrPayload: string | Partial<ParsedExpense>): SiriIntentResponse {
    if (!this.addTransactionHandler) {
      return {
        success: false,
        message: 'Kairo Expense Engine is not initialized yet.',
      };
    }

    let parsed: ParsedExpense;

    if (typeof textOrPayload === 'string') {
      parsed = this.handleIntentParse(textOrPayload);
    } else {
      const cats = this.categoriesProvider ? this.categoriesProvider() : [];
      const accs = this.accountsProvider ? this.accountsProvider() : [];
      parsed = {
        amount: textOrPayload.amount ?? 0,
        categoryName: textOrPayload.categoryName ?? 'Other',
        categoryId: textOrPayload.categoryId ?? (cats[0]?.id || 'cat-1'),
        merchant: textOrPayload.merchant || null,
        description: textOrPayload.description || 'Siri Expense',
        accountName: textOrPayload.accountName || 'UPI',
        accountId: textOrPayload.accountId || (accs[0]?.id || 'acc-1'),
        date: textOrPayload.date || new Date().toISOString().split('T')[0],
        time: textOrPayload.time || '12:00',
        type: textOrPayload.type || 'expense',
        confidence: 'high',
        confidenceScore: 1.0,
        rawInput: typeof textOrPayload === 'string' ? textOrPayload : 'App Intent Payload',
        missingFields: [],
      };
    }

    if (!parsed.amount || parsed.amount <= 0) {
      return {
        success: false,
        message: 'Could not extract valid amount from input.',
        parsedExpense: parsed,
      };
    }

    const createdTx = this.addTransactionHandler(parsed);

    return {
      success: true,
      message: `Successfully logged ₹${createdTx.amount} for ${createdTx.description}`,
      transaction: createdTx,
      parsedExpense: parsed,
    };
  }
}

export const siriIntentsService = new SiriIntentsService();
