/**
 * Payment orchestration. The UI calls these instead of `api.ts` directly so a
 * real UPI handshake can be added later without touching the payment screens.
 */
import type { CreatePaymentRequest, PaymentReceipt, Transaction } from '@/types';
import { createPayment, createUpiIntent, getTransaction } from './api';
import { config } from './config';
import * as mock from './mock/store';

export interface PaymentInput extends Omit<CreatePaymentRequest, 'mode'> {
  mode: 'DEMO' | 'UPI';
}

export async function submitPayment(input: PaymentInput): Promise<PaymentReceipt> {
  const payload: CreatePaymentRequest = { currency: 'INR', ...input };
  return input.mode === 'UPI' ? createUpiIntent(payload) : createPayment(payload);
}

/** Opens the payer's UPI app. Returns false when no handler is available. */
export function openUpiApp(uri: string): boolean {
  try {
    window.location.href = uri;
    return true;
  } catch {
    return false;
  }
}

/**
 * SpendSense cannot read the result of an external UPI app, so a pending
 * payment stays pending until the payer confirms it here.
 */
export async function confirmUpiPayment(transactionId: string): Promise<Transaction> {
  if (config.useMocks) {
    await mock.latency(600);
    return mock.confirmUpiPayment(transactionId);
  }
  return getTransaction(transactionId);
}
