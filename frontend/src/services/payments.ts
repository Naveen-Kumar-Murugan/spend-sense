/**
 * Payment orchestration. The UI calls these instead of `api.ts` directly so a
 * real UPI handshake can be added later without touching the payment screens.
 */
import type { CreatePaymentRequest, PaymentReceipt, Transaction } from '@/types';
import { createPayment, createUpiIntent } from './api';
import { request } from './http';
import { config } from './config';
import * as mock from './mock/store';

export interface PaymentInput extends Omit<CreatePaymentRequest, 'mode'> {
  mode: 'DEMO' | 'UPI';
}

export async function submitPayment(input: PaymentInput): Promise<PaymentReceipt> {
  const payload: CreatePaymentRequest = { currency: 'INR', ...input };
  return input.mode === 'UPI' ? createUpiIntent(payload) : createPayment(payload);
}

/**
 * Opens the payer's UPI app. Returns false when the device cannot handle a
 * `upi://` deep link — on desktop browsers there is no UPI handler, so the UI
 * can tell the user to copy the link to a phone instead.
 */
export function openUpiApp(uri: string): boolean {
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return false;
  }
  try {
    window.location.href = uri;
    return true;
  } catch {
    return false;
  }
}

/**
 * SpendSense cannot read the result of an external UPI app, so a pending
 * payment stays pending until the payer confirms it here. Calls the confirm
 * endpoint, which flips the transaction from PENDING to SUCCESS.
 */
export async function confirmUpiPayment(transactionId: string): Promise<Transaction> {
  if (config.useMocks) {
    await mock.latency(600);
    return mock.confirmUpiPayment(transactionId);
  }
  return request<Transaction>(`/payments/${transactionId}/confirm`, { method: 'POST' });
}
