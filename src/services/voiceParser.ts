import { Account, Category, ConfidenceLevel, getLocalDateString, getLocalTimeString, ParsedExpense, TransactionType } from '../types';

// Word-to-number dictionary for natural English & Indian English speech
const WORD_NUMBERS: Record<string, number> = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
  'hundred': 100, 'thousand': 1000, 'lakh': 100000,
};

// Default categories dictionary for keyword matching
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food': ['dinner', 'lunch', 'breakfast', 'food', 'restaurant', 'burger', 'pizza', 'coffee', 'tea', 'cafe', 'swiggy', 'zomato', 'kfc', 'mcdonalds', 'dominos', 'starbucks', 'snacks', 'eating', 'groceries', 'supermarket', 'tiffin', 'biryani', 'chai'],
  'Transport': ['uber', 'ola', 'cab', 'taxi', 'auto', 'metro', 'bus', 'train', 'flight', 'ticket', 'toll', 'parking', 'transport', 'commute', 'rapido'],
  'Fuel': ['fuel', 'petrol', 'diesel', 'gas', 'shell', 'hpcl', 'bpcl', 'iocl', 'gas station'],
  'Shopping': ['shopping', 'clothes', 'shoes', 'amazon', 'flipkart', 'myntra', 'zara', 'nike', 'electronics', 'mall', 'purchase', 'dress', 'shirt'],
  'Bills': ['bill', 'electricity', 'water', 'wifi', 'internet', 'broadband', 'phone', 'recharge', 'mobile', 'rent', 'utility', 'subscription', 'eb bill'],
  'Entertainment': ['movie', 'netflix', 'cinema', 'spotify', 'prime', 'game', 'concert', 'event', 'bowling', 'party', 'hotstar'],
  'Health': ['pharmacy', 'medicine', 'doctor', 'hospital', 'gym', 'health', 'fitness', 'clinic', 'dentist', 'pills', 'medical'],
  'Rent': ['rent', 'house rent', 'flat rent', 'lease'],
  'Education': ['books', 'course', 'tuition', 'fee', 'school', 'college', 'udemy', 'coursera'],
  'Travel': ['hotel', 'airbnb', 'vacation', 'trip', 'tour', 'resort', 'stay'],
  'Business': ['office', 'software', 'domain', 'hosting', 'client', 'supplies', 'business'],
  'Salary': ['salary', 'paycheck', 'stipend', 'bonus', 'income', 'freelance', 'dividend', 'credited'],
};

// Known merchant names dictionary
const MERCHANTS: Record<string, string> = {
  'kfc': 'Food',
  'mcdonalds': 'Food',
  'dominos': 'Food',
  'starbucks': 'Food',
  'swiggy': 'Food',
  'zomato': 'Food',
  'amazon': 'Shopping',
  'flipkart': 'Shopping',
  'myntra': 'Shopping',
  'zara': 'Shopping',
  'nike': 'Shopping',
  'uber': 'Transport',
  'ola': 'Transport',
  'rapido': 'Transport',
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'hotstar': 'Entertainment',
  'shell': 'Fuel',
};

// Account keyword matching
const ACCOUNT_KEYWORDS: Record<string, string> = {
  'upi': 'UPI',
  'gpay': 'UPI',
  'phonepe': 'UPI',
  'paytm': 'UPI',
  'cash': 'Cash',
  'bank': 'Bank',
  'hdfc': 'Bank',
  'icici': 'Bank',
  'sbi': 'Bank',
  'card': 'Credit Card',
  'credit card': 'Credit Card',
  'wallet': 'Wallet',
};

export function parseVoiceExpense(
  text: string,
  categories: Category[] = [],
  accounts: Account[] = []
): ParsedExpense {
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();

  let amount: number | null = null;
  let categoryName: string | null = null;
  let categoryId: string | null = null;
  let merchant: string | null = null;
  let description: string | null = null;
  let accountName: string | null = null;
  let accountId: string | null = null;
  let type: TransactionType = 'expense';

  // 1. Transaction Type Detection
  if (/\b(received|got|earned|salary|credited|income|bonus|cashback)\b/.test(lower)) {
    type = 'income';
  } else if (/\b(transferred|transfer|moved|sent to bank|paid to upi|to upi)\b/.test(lower)) {
    type = 'transfer';
  }

  // 2. Amount Extraction (Numbers & 'K' notation: e.g. 2.5k, 500, 1,250, ₹1500)
  const numKMatch = lower.match(/\b([\d.]+)\s*k\b/i);
  if (numKMatch && numKMatch[1]) {
    const val = parseFloat(numKMatch[1]) * 1000;
    if (!isNaN(val) && val > 0) amount = val;
  }

  if (amount === null) {
    const currencyPatterns = [
      /(?:₹|rs\.?|rupees|inr|\$)\s*([\d,]+(?:\.\d{1,2})?)/i,
      /([\d,]+(?:\.\d{1,2})?)\s*(?:₹|rs\.?|rupees|inr|\$)/i,
      /(?:spent|paid|bought|cost|add|log|for|around|about|gave)\s+([\d,]+(?:\.\d{1,2})?)/i,
      /\b([\d,]+(?:\.\d{1,2})?)\b/
    ];

    for (const pattern of currencyPatterns) {
      const match = lower.match(pattern);
      if (match && match[1]) {
        const rawNum = match[1].replace(/,/g, '');
        const parsedNum = parseFloat(rawNum);
        if (!isNaN(parsedNum) && parsedNum > 0) {
          amount = parsedNum;
          break;
        }
      }
    }
  }

  // Text number word fallback (e.g. "five hundred")
  if (amount === null) {
    if (lower.includes('five hundred')) amount = 500;
    else if (lower.includes('thousand')) amount = 1000;
    else if (lower.includes('two thousand')) amount = 2000;
  }

  // 3. Merchant Detection
  for (const [mName, defaultCat] of Object.entries(MERCHANTS)) {
    if (lower.includes(mName)) {
      merchant = mName.toUpperCase();
      if (!categoryName) {
        categoryName = defaultCat;
      }
      break;
    }
  }

  // 4. Category Detection
  if (!categoryName) {
    for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(lower)) {
          categoryName = catName;
          if (!description) {
            description = kw.charAt(0).toUpperCase() + kw.slice(1);
          }
          break;
        }
      }
      if (categoryName) break;
    }
  }

  // Map categoryName to categoryId
  if (categoryName && categories.length > 0) {
    const found = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
    if (found) categoryId = found.id;
  }

  if (!categoryName) {
    categoryName = type === 'income' ? 'Salary' : 'Other';
    if (categories.length > 0) {
      const fallback = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
      if (fallback) categoryId = fallback.id;
    }
  }

  // 5. Account Detection
  for (const [accKw, accName] of Object.entries(ACCOUNT_KEYWORDS)) {
    if (lower.includes(accKw)) {
      accountName = accName;
      break;
    }
  }

  if (accountName && accounts.length > 0) {
    const found = accounts.find(a => a.type === accountName || a.name.toLowerCase().includes(accountName!.toLowerCase()));
    if (found) accountId = found.id;
  }

  if (!accountId && accounts.length > 0) {
    const upiAcc = accounts.find(a => a.type === 'UPI');
    accountId = upiAcc ? upiAcc.id : accounts[0].id;
    accountName = upiAcc ? upiAcc.name : accounts[0].name;
  }

  // 6. Description extraction
  if (!description) {
    let cleanDesc = lower
      .replace(/(?:spent|paid|bought|add|log|for|on|using|via|with|at|rs\.?|rupees|inr|₹|\$|macha|around|about)/g, '')
      .replace(/\b([\d,]+(?:\.\d{1,2})?)\b/g, '')
      .trim();

    if (cleanDesc.length > 2) {
      description = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
    } else {
      description = categoryName || 'Expense';
    }
  }

  // 7. Timezone-safe Local Date & Time Parsing
  const now = new Date();
  let dateStr = getLocalDateString(now);

  if (lower.includes('yesterday') || lower.includes('last night')) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    dateStr = getLocalDateString(yesterday);
  }

  const timeStr = getLocalTimeString(now);

  // 8. Strict Confidence Calculation (Prevents ₹0 transactions & ambiguous saves)
  const missingFields: string[] = [];
  let score = 0;

  if (amount !== null && amount > 0) {
    score += 0.55;
  } else {
    missingFields.push('amount');
  }

  if (categoryName && categoryName !== 'Other') {
    score += 0.25;
  } else {
    missingFields.push('category');
  }

  if (description && description.length > 0) {
    score += 0.20;
  }

  let confidence: ConfidenceLevel = 'low';
  if (amount === null || amount <= 0) {
    confidence = 'low';
    score = 0;
  } else if (score >= 0.85) {
    confidence = 'high';
  } else if (score >= 0.5) {
    confidence = 'medium';
  }

  return {
    amount: (amount && amount > 0) ? amount : null,
    categoryName,
    categoryId: categoryId || (categories[0]?.id ?? 'cat-1'),
    merchant,
    description,
    accountName: accountName || 'UPI',
    accountId: accountId || (accounts[0]?.id ?? 'acc-1'),
    date: dateStr,
    time: timeStr,
    type,
    confidence,
    confidenceScore: parseFloat(score.toFixed(2)),
    rawInput: cleaned,
    missingFields,
  };
}
