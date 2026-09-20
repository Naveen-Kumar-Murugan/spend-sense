/**
 * In-memory mock backend. Mirrors the SpendSense API contract one-for-one so
 * `services/api.ts` can switch to the live endpoints without UI changes.
 */
import type {
  CreatePaymentRequest,
  DashboardData,
  FinancialAnswer,
  InsightsResponse,
  ListTransactionsQuery,
  PaymentReceipt,
  Transaction,
  UpdateTransactionRequest,
} from '@/types';
import { CATEGORY_META } from '@/constants/categories';
import { PAYEE_VPA } from '@/constants';
import {
  buildDashboard,
  detectUnusualSpends,
  sortByDateDesc,
  transactionsForMonth,
} from '@/utils/analytics';
import { formatCurrency, monthKey } from '@/utils/format';
import { ApiError } from '@/services/errors';
import { CURRENT_MONTH, DEMO_USER_ID, generateTransactions } from './data';

const STORAGE_KEY = 'spendsense.mock.transactions.v1';

function readPersisted(): Transaction[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : null;
  } catch {
    return null;
  }
}

function persist(transactions: Transaction[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    /* storage unavailable — the session simply will not survive a reload */
  }
}

let transactions: Transaction[] = readPersisted() ?? generateTransactions();

export const latency = (ms = 420): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function newTransactionId(): string {
  return `txn_${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
}

export function resetMockData(): void {
  transactions = generateTransactions();
  persist(transactions);
}

export function listTransactions(query: ListTransactionsQuery = {}): Transaction[] {
  const { search, category, month, limit = 100 } = query;
  const needle = search?.trim().toLowerCase();

  return sortByDateDesc(
    transactions.filter((txn) => {
      if (category && txn.category !== category) return false;
      if (month && txn.createdAt.slice(0, 7) !== month) return false;
      if (needle) {
        const haystack = `${txn.merchant} ${txn.note ?? ''} ${txn.subcategory}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    }),
  ).slice(0, Math.min(limit, 200));
}

export function getTransaction(transactionId: string): Transaction {
  const found = transactions.find((txn) => txn.transactionId === transactionId);
  if (!found) throw new ApiError('NOT_FOUND', 'That transaction no longer exists.', 404);
  return found;
}

export function updateTransaction(
  transactionId: string,
  patch: UpdateTransactionRequest,
): Transaction {
  const index = transactions.findIndex((txn) => txn.transactionId === transactionId);
  if (index === -1) throw new ApiError('NOT_FOUND', 'That transaction no longer exists.', 404);
  if (Object.keys(patch).length === 0) {
    throw new ApiError('VALIDATION_ERROR', 'Change at least one field before saving.', 400);
  }
  if (patch.category && patch.subcategory) {
    if (!CATEGORY_META[patch.category].subcategories.includes(patch.subcategory)) {
      throw new ApiError(
        'INVALID_SUBCATEGORY',
        'That sub-category does not belong to this category.',
        400,
      );
    }
  }

  const updated: Transaction = {
    ...transactions[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  transactions = [...transactions.slice(0, index), updated, ...transactions.slice(index + 1)];
  persist(transactions);
  return updated;
}

export function createPayment(request: CreatePaymentRequest): PaymentReceipt {
  if (!Number.isFinite(request.amount) || request.amount <= 0) {
    throw new ApiError('INVALID_AMOUNT', 'Amount must be greater than ₹0.', 400);
  }
  if (!request.merchant.trim()) {
    throw new ApiError('MISSING_MERCHANT', 'Add who you are paying.', 400);
  }

  const mode = request.mode ?? 'DEMO';
  const now = new Date().toISOString();
  const paymentId = newTransactionId();
  const subcategory = request.subcategory || CATEGORY_META[request.category].subcategories[0];

  const transaction: Transaction = {
    transactionId: paymentId,
    userId: DEMO_USER_ID,
    amount: Math.round(request.amount * 100) / 100,
    currency: request.currency ?? 'INR',
    merchant: request.merchant.trim(),
    category: request.category,
    subcategory,
    paymentMethod: request.paymentMethod,
    status: mode === 'UPI' ? 'PENDING' : 'SUCCESS',
    note: request.note?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  transactions = [transaction, ...transactions];
  persist(transactions);

  const receipt: PaymentReceipt = {
    paymentId,
    status: transaction.status,
    mode,
    amount: transaction.amount,
    currency: transaction.currency,
    merchant: transaction.merchant,
    category: transaction.category,
    subcategory,
    paymentMethod: transaction.paymentMethod,
    message:
      mode === 'UPI'
        ? 'Open your UPI app to finish this payment.'
        : 'Payment recorded successfully.',
    transaction,
  };

  if (mode === 'UPI') {
    receipt.upiIntent = {
      uri: `upi://pay?pa=${PAYEE_VPA}&pn=${encodeURIComponent(transaction.merchant)}&am=${transaction.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`${CATEGORY_META[transaction.category].label} payment via SpendSense`)}&tr=${paymentId}`,
      payeeVpa: PAYEE_VPA,
      transactionRef: paymentId,
    };
  }

  return receipt;
}

export function confirmUpiPayment(transactionId: string): Transaction {
  const transaction = getTransaction(transactionId);
  return updateTransactionStatus(transaction.transactionId, 'SUCCESS');
}

function updateTransactionStatus(transactionId: string, status: Transaction['status']): Transaction {
  const index = transactions.findIndex((txn) => txn.transactionId === transactionId);
  const updated: Transaction = {
    ...transactions[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  transactions = [...transactions.slice(0, index), updated, ...transactions.slice(index + 1)];
  persist(transactions);
  return updated;
}

export function getDashboard(month: string = CURRENT_MONTH): DashboardData {
  return buildDashboard(transactions, month);
}

export function getInsights(month: string = CURRENT_MONTH): InsightsResponse {
  const dashboard = buildDashboard(transactions, month);
  return { insights: dashboard.insights, generatedBy: 'FALLBACK', month };
}

export function getUnusualSpends(month: string = CURRENT_MONTH): Transaction[] {
  return detectUnusualSpends(transactions, month);
}

export function getAllTransactions(): Transaction[] {
  return transactions;
}

/**
 * Rule-based stand-in for `POST /insights/query`. Answers read like the
 * Bedrock responses the backend will return, and carry the same evidence.
 */
export function answerQuestion(question: string): FinancialAnswer {
  const dashboard = buildDashboard(transactions, CURRENT_MONTH);
  const text = question.toLowerCase();
  const respond = (answer: string, evidence: Record<string, unknown>): FinancialAnswer => ({
    question,
    answer,
    generatedBy: 'FALLBACK',
    evidence,
  });

  if (/subscription|recurring|renew/.test(text)) {
    if (dashboard.recurringPayments.length === 0) {
      return respond('No repeating charges have shown up in your history yet.', {});
    }
    const list = dashboard.recurringPayments
      .slice(0, 5)
      .map((item) => `${item.merchant} (${formatCurrency(item.amount)} ${item.frequency.toLowerCase()})`)
      .join(', ');
    return respond(
      `You have ${dashboard.recurringPayments.length} repeating charges: ${list}. Together they come to about ${formatCurrency(dashboard.estimatedMonthlyRecurring)} a month.`,
      {
        count: dashboard.recurringPayments.length,
        estimatedMonthlyTotal: dashboard.estimatedMonthlyRecurring,
      },
    );
  }

  if (/food|eat|swiggy|zomato|grocer/.test(text)) {
    const food = dashboard.categoryBreakdown.find((item) => item.category === 'FOOD');
    const previous = transactionsForMonth(
      transactions,
      monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)),
    ).filter((txn) => txn.category === 'FOOD');
    const previousTotal = previous.reduce((total, txn) => total + txn.amount, 0);
    if (!food) return respond('No food spending has been recorded this month.', {});
    const delta = food.amount - previousTotal;
    return respond(
      `Food is ${formatCurrency(food.amount)} this month across ${food.transactionCount} payments — ${formatCurrency(Math.abs(delta))} ${delta >= 0 ? 'more' : 'less'} than last month. It is ${food.percentage}% of your total spending.`,
      { category: 'FOOD', amount: food.amount, previousAmount: previousTotal, change: delta },
    );
  }

  if (/most|largest|biggest|top|where/.test(text)) {
    const [top] = dashboard.categoryBreakdown;
    const [merchant] = dashboard.topMerchants;
    if (!top) return respond('There is nothing to compare yet this month.', {});
    return respond(
      `${CATEGORY_META[top.category].label} takes the largest share at ${formatCurrency(top.amount)} (${top.percentage}%). Your biggest single merchant is ${merchant?.merchant ?? '—'} at ${formatCurrency(merchant?.amount ?? 0)}.`,
      { category: top.category, amount: top.amount, merchant: merchant?.merchant },
    );
  }

  if (/more|increase|why|higher|up/.test(text)) {
    const [top] = dashboard.categoryBreakdown;
    return respond(
      `You are ${formatCurrency(Math.abs(dashboard.monthOverMonthChange))} ${dashboard.monthOverMonthChange >= 0 ? 'above' : 'below'} last month (${dashboard.monthOverMonthChangePercentage}%). The largest contributor is ${CATEGORY_META[top?.category ?? 'OTHER'].label} at ${formatCurrency(top?.amount ?? 0)} across ${top?.transactionCount ?? 0} payments.`,
      {
        totalSpent: dashboard.totalSpent,
        previousMonthTotal: dashboard.previousMonthTotal,
        change: dashboard.monthOverMonthChange,
      },
    );
  }

  if (/save|saving|cut|reduce/.test(text)) {
    const [top] = dashboard.categoryBreakdown;
    return respond(
      `Trimming ${CATEGORY_META[top?.category ?? 'OTHER'].label.toLowerCase()} by 15% would free up about ${formatCurrency((top?.amount ?? 0) * 0.15)} a month. Cancelling one unused subscription would add roughly ${formatCurrency(dashboard.estimatedMonthlyRecurring / Math.max(dashboard.recurringPayments.length, 1))}.`,
      { category: top?.category, amount: top?.amount },
    );
  }

  return respond(
    `You have spent ${formatCurrency(dashboard.totalSpent)} across ${dashboard.transactionCount} payments this month. ${CATEGORY_META[dashboard.categoryBreakdown[0]?.category ?? 'OTHER'].label} leads at ${formatCurrency(dashboard.categoryBreakdown[0]?.amount ?? 0)}. Ask about a category, a merchant, or your subscriptions for more detail.`,
    { totalSpent: dashboard.totalSpent, transactionCount: dashboard.transactionCount },
  );
}
