/**
 * The only module the UI talks to for data. Each function either calls the
 * live API or the mock store, decided once by `config.useMocks`.
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
  Category,
} from '@/types';
import { config } from './config';
import { request } from './http';
import * as mock from './mock/store';

export async function getDashboard(month?: string): Promise<DashboardData> {
  if (config.useMocks) {
    await mock.latency();
    return mock.getDashboard(month);
  }
  return request<DashboardData>('/dashboard');
}

export async function getTransactions(query: ListTransactionsQuery = {}): Promise<Transaction[]> {
  if (config.useMocks) {
    await mock.latency(320);
    return mock.listTransactions(query);
  }
  return request<Transaction[]>('/transactions', {
    query: {
      search: query.search,
      category: query.category,
      month: query.month,
      limit: query.limit,
    },
  });
}

export async function getTransaction(transactionId: string): Promise<Transaction> {
  if (config.useMocks) {
    await mock.latency(260);
    return mock.getTransaction(transactionId);
  }
  return request<Transaction>(`/transactions/${transactionId}`);
}

export async function updateTransaction(
  transactionId: string,
  patch: UpdateTransactionRequest,
): Promise<Transaction> {
  if (config.useMocks) {
    await mock.latency(380);
    return mock.updateTransaction(transactionId, patch);
  }
  return request<Transaction>(`/transactions/${transactionId}`, { method: 'PATCH', body: patch });
}

export function updateTransactionCategory(
  transactionId: string,
  category: Category,
  subcategory?: string,
): Promise<Transaction> {
  return updateTransaction(transactionId, { category, subcategory });
}

export async function createPayment(payload: CreatePaymentRequest): Promise<PaymentReceipt> {
  if (config.useMocks) {
    await mock.latency(900);
    return mock.createPayment(payload);
  }
  return request<PaymentReceipt>('/payments', { method: 'POST', body: payload });
}

export async function createUpiIntent(payload: CreatePaymentRequest): Promise<PaymentReceipt> {
  if (config.useMocks) {
    await mock.latency(700);
    return mock.createPayment({ ...payload, mode: 'UPI', currency: 'INR' });
  }
  return request<PaymentReceipt>('/payments/upi-intent', {
    method: 'POST',
    body: {
      amount: payload.amount,
      merchant: payload.merchant,
      category: payload.category,
      paymentMethod: payload.paymentMethod,
      receiverUpiId: payload.receiverUpiId,
      note: payload.note,
    },
  });
}

/** Reads the signed-in user's PROFILE item (own UPI ID, etc.). */
export async function getProfile(): Promise<{ userId: string; upiId: string; location: string }> {
  if (config.useMocks) {
    await mock.latency(200);
    return mock.getProfile();
  }
  return request('/profile');
}

/** Saves the user's own UPI ID (and other profile fields) to their PROFILE item. */
export async function updateProfileApi(
  patch: { upiId?: string; location?: string },
): Promise<{ userId: string; upiId: string; location: string; updatedAt: string }> {
  if (config.useMocks) {
    await mock.latency(400);
    return mock.updateProfile(patch);
  }
  return request('/profile', { method: 'PATCH', body: patch });
}

export async function getInsights(month?: string): Promise<InsightsResponse> {
  if (config.useMocks) {
    await mock.latency(500);
    return mock.getInsights(month);
  }
  return request<InsightsResponse>('/insights');
}

export async function askSpendSense(question: string): Promise<FinancialAnswer> {
  if (config.useMocks) {
    await mock.latency(1100);
    return mock.answerQuestion(question);
  }
  return request<FinancialAnswer>('/insights/query', { method: 'POST', body: { question } });
}

/** Unusual spends are derived client-side until the backend exposes them. */
export async function getUnusualSpends(month?: string): Promise<Transaction[]> {
  if (config.useMocks) {
    await mock.latency(300);
    return mock.getUnusualSpends(month);
  }
  const transactions = await getTransactions({ month, limit: 200 });
  return transactions.slice(0, 4);
}
