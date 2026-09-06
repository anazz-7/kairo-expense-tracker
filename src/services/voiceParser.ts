import { Account, Category, ConfidenceLevel, ParsedExpense, TransactionType } from '../types';

// Default categories dictionary for keyword matching
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food': ['dinner', 'lunch', 'breakfast', 'food', 'restaurant', 'burger', 'pizza', 'coffee', 'tea', 'cafe', 'swiggy', 'zomato', 'kfc', 'mcdonalds', 'dominos', 'starbucks', 'snacks', 'eating out', 'groceries', 'supermarket'],
  'Transport': ['uber', 'ola', 'cab', 'taxi', 'auto', 'metro', 'bus', 'train', 'flight', 'ticket', 'toll', 'parking', 'transport', 'commute'],
  'Fuel': ['fuel', 'petrol', 'diesel', 'gas', 'shell', 'hpcl', 'bpcl', 'iocl', 'gas station'],
  'Shopping': ['shopping', 'clothes', 'shoes', 'amazon', 'flipkart', 'myntra', 'zara', 'nike', 'electronics', 'mall', 'purchase'],
  'Bills': ['bill', 'electricity', 'water', 'wifi', 'internet', 'broadband', 'phone', 'recharge', 'mobile', 'rent', 'utility', 'subscription'],
  'Entertainment': ['movie', 'netflix', 'cinema', 'spotify', 'prime', 'game', 'concert', 'event', 'bowling', 'party'],
  'Health': ['pharmacy', 'medicine', 'doctor', 'hospital', 'gym', 'health', 'fitness', 'clinic', 'dentist', 'pills'],
  'Rent': ['rent', 'house rent', 'flat rent', 'lease'],
  'Education': ['books', 'course', 'tuition', 'fee', 'school', 'college', 'udemy', 'coursera'],
  'Travel': ['hotel', 'airbnb', 'flight', 'vacation', 'trip', 'tour', 'resort'],
  'Business': ['office', 'software', 'domain', 'hosting', 'client', 'supplies', 'business'],
  'Salary': ['salary', 'paycheck', 'stipend', 'bonus', 'income', 'freelance', 'dividend'],
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
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
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
  'hdbc': 'Bank',
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
  } else if (/\b(transferred|transfer|moved|sent to bank|paid to upi)\b/.test(lower)) {
    type = 'transfer';
  }

  // 2. Amount Extraction
  // Patterns: ₹450, 450 rs, 450 rupees, spent 450, for 3000, 1200 electricity, 500 fuel
  const currencyPatterns = [
    /(?:₹|rs\.?|rupees|inr|\$)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:₹|rs\.?|rupees|inr|\$)/i,
    /(?:spent|paid|bought|cost|add|log|for|amount of)\s+([\d,]+(?:\.\d{1,2})?)/i,
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

  // Map categoryName to categoryId if list provided
  if (categoryName && categories.length > 0) {
    const found = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
    if (found) {
      categoryId = found.id;
    }
  }

  // Fallback category if none detected
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
    // Default to UPI or Cash or first account
    const upiAcc = accounts.find(a => a.type === 'UPI');
    accountId = upiAcc ? upiAcc.id : accounts[0].id;
    accountName = upiAcc ? upiAcc.name : accounts[0].name;
  }

  // 6. Description extraction if empty
  if (!description) {
    // Clean out numbers, currency symbols, and account keywords
    let cleanDesc = lower
      .replace(/(?:spent|paid|bought|add|log|for|on|using|via|with|at|rs\.?|rupees|inr|₹|\$)/g, '')
      .replace(/\b([\d,]+(?:\.\d{1,2})?)\b/g, '')
      .trim();

    if (cleanDesc.length > 2) {
      description = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
    } else {
      description = categoryName || 'Expense';
    }
  }

  // 7. Date & Time
  const now = new Date();
  let dateStr = now.toISOString().split('T')[0];
  if (lower.includes('yesterday')) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    dateStr = yesterday.toISOString().split('T')[0];
  }
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 8. Confidence Calculation
  const missingFields: string[] = [];
  let score = 0;

  if (amount !== null) {
    score += 0.5;
  } else {
    missingFields.push('amount');
  }

  if (categoryName && categoryName !== 'Other') {
    score += 0.3;
  } else {
    missingFields.push('category');
  }

  if (description && description.length > 0) {
    score += 0.2;
  }

  let confidence: ConfidenceLevel = 'low';
  if (score >= 0.8) {
    confidence = 'high';
  } else if (score >= 0.5) {
    confidence = 'medium';
  }

  return {
    amount,
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
    confidenceScore: score,
    rawInput: cleaned,
    missingFields,
  };
}
