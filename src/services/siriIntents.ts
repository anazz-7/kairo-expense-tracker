import { Account, Category, getLocalDateString, getLocalTimeString, ParsedExpense, Transaction } from '../types';
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

    // Expose window.KairoExpenseApp as Web Intent Bridge for iOS Shortcuts & Web Share Target
    if (typeof window !== 'undefined') {
      (window as any).KairoExpenseApp = {
        addExpenseFromIntent: (textOrPayload: string | Partial<ParsedExpense>) => this.handleIntentAdd(textOrPayload),
        parseVoice: (text: string) => this.handleIntentParse(text),
        version: '1.2.0',
        bridgeType: 'Siri Shortcuts & Web Intent Bridge',
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
        amount: textOrPayload.amount ?? null,
        categoryName: textOrPayload.categoryName ?? 'Other',
        categoryId: textOrPayload.categoryId ?? (cats[0]?.id || 'cat-1'),
        merchant: textOrPayload.merchant || null,
        description: textOrPayload.description || 'Intent Expense',
        accountName: textOrPayload.accountName || 'UPI',
        accountId: textOrPayload.accountId || (accs[0]?.id || 'acc-1'),
        date: textOrPayload.date || getLocalDateString(),
        time: textOrPayload.time || getLocalTimeString(),
        type: textOrPayload.type || 'expense',
        confidence: 'high',
        confidenceScore: 1.0,
        rawInput: typeof textOrPayload === 'string' ? textOrPayload : 'App Intent Payload',
        missingFields: [],
      };
    }

    // Strict validation: Reject zero or missing amount
    if (!parsed.amount || parsed.amount <= 0) {
      return {
        success: false,
        message: 'Could not extract a valid expense amount from input.',
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
