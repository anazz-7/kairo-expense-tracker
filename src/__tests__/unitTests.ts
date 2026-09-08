import { computeAccountBalances } from '../services/balanceEngine.ts';
import { parseVoiceExpense } from '../services/voiceParser.ts';
import { Account, Category, getLocalDateString, Transaction } from '../types/index.ts';

const mockAccounts: Account[] = [
  { id: 'acc-cash', user_id: 'u1', name: 'Cash', type: 'Cash', opening_balance: 1000, current_balance: 1000, created_at: '' },
  { id: 'acc-bank', user_id: 'u1', name: 'Bank', type: 'Bank', opening_balance: 5000, current_balance: 5000, created_at: '' },
  { id: 'acc-upi', user_id: 'u1', name: 'UPI', type: 'UPI', opening_balance: 2000, current_balance: 2000, created_at: '' },
];

const mockCategories: Category[] = [
  { id: 'cat-food', user_id: 'u1', name: 'Food', type: 'expense', icon: 'restaurant', color: '#006948', created_at: '' },
  { id: 'cat-fuel', user_id: 'u1', name: 'Fuel', type: 'expense', icon: 'local_gas_station', color: '#8B5CF6', created_at: '' },
];

export function runAutomatedTests() {
  console.log('=== Running Kairo Automated Test Suite ===');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Voice Parser Amount Extraction
  const p1 = parseVoiceExpense('Spent 450 on dinner using UPI', mockCategories, mockAccounts);
  assert(p1.amount === 450, 'Voice Parser extracts numeric amount 450');
  assert(p1.categoryName === 'Food', 'Voice Parser maps dinner to Food category');
  assert(p1.confidence === 'high', 'Voice Parser gives high confidence for 450 dinner');

  // TEST 2: Voice Parser Zero Amount Rejection Bug Fix
  const p2 = parseVoiceExpense('I had lunch at Swiggy', mockCategories, mockAccounts);
  assert(p2.amount === null, 'Voice Parser returns null amount when no price is spoken (prevents ₹0 transactions)');
  assert(p2.confidence === 'low', 'Voice Parser marks missing amount as low confidence');

  // TEST 3: Voice Parser Timezone-Safe Local Date
  const todayLocal = getLocalDateString(new Date());
  assert(p1.date === todayLocal, 'Voice Parser uses timezone-safe local date format YYYY-MM-DD');

  // TEST 4: Balance Engine Source-of-Truth Preservation
  const mockTx: Transaction[] = [
    { id: 't1', user_id: 'u1', account_id: 'acc-cash', category_id: 'cat-food', type: 'expense', amount: 200, date: todayLocal, time: '12:00', description: 'Lunch', created_at: '', updated_at: '' },
    { id: 't2', user_id: 'u1', account_id: 'acc-bank', destination_account_id: 'acc-upi', category_id: 'cat-other', type: 'transfer', amount: 1000, date: todayLocal, time: '13:00', description: 'Transfer', created_at: '', updated_at: '' }
  ];

  const updatedAccs = computeAccountBalances(mockAccounts, mockTx);
  const cashAcc = updatedAccs.find(a => a.id === 'acc-cash');
  const bankAcc = updatedAccs.find(a => a.id === 'acc-bank');
  const upiAcc = updatedAccs.find(a => a.id === 'acc-upi');

  assert(cashAcc?.current_balance === 800, 'Cash balance correctly reduced from 1000 to 800');
  assert(cashAcc?.opening_balance === 1000, 'Cash opening_balance remains unchanged as 1000 (Source of Truth preserved)');
  assert(bankAcc?.current_balance === 4000, 'Bank balance reduced by 1000 transfer');
  assert(upiAcc?.current_balance === 3000, 'UPI balance increased by 1000 transfer');

  console.log(`=== Test Results: ${passed} passed, ${failed} failed ===`);
  return failed === 0;
}
