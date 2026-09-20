import { PaymentMethod, CATEGORY_META, Category, inferSubcategory } from '../constants/categories';
import { Transaction } from '../models/Transaction';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { getTransactionRepository } from '../repositories/repositoryFactory';
import { PaymentError, ValidationError } from '../utils/errors';
import { generateTransactionId } from '../utils/id';
import { nowIso } from '../utils/dates';
import { CreatePaymentRequest } from '../utils/validation';

/**
 * PaymentService
 *
 * Owns the "pay → record → return receipt" flow. It is intentionally isolated
 * behind this service so the demo payment provider can later be swapped for a
 * real payment/UPI provider without touching controllers.
 *
 * Demo mode always succeeds, guaranteeing a reliable hackathon demo.
 * UPI mode generates a deep-link intent; the transaction is created as PENDING
 * and is NOT marked successful merely because the browser returned from an
 * external app.
 */

export type PaymentMode = 'DEMO' | 'UPI';

export interface PaymentReceipt {
    paymentId: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    mode: PaymentMode;
    amount: number;
    currency: string;
    merchant: string;
    category: Category;
    subcategory: string;
    paymentMethod: PaymentMethod;
    /** Present for UPI mode: the receiver's UPI ID the payment targets. */
    receiverUpiId?: string;
    /** Present for UPI mode: ready-to-open deep link. */
    upiUrl?: string;
    /** UPI surface status marker: INITIATED (never implies success). */
    initiatedStatus?: 'INITIATED';
    message: string;
    /** Present for UPI mode: the intent the client should open. */
    upiIntent?: {
        uri: string;
        payeeVpa: string;
        transactionRef: string;
    };
    transaction?: Transaction;
}

export interface UpiIntent {
    uri: string;
    payeeVpa: string;
    transactionRef: string;
}

export class PaymentService {
    constructor(private readonly repository: ITransactionRepository = getTransactionRepository()) { }

    /**
     * Validates a payment request. Malformed amounts/categories are rejected
     * before anything is written to DynamoDB.
     */
    validatePayment(request: CreatePaymentRequest): void {
        if (!Number.isFinite(request.amount) || request.amount <= 0) {
            throw new ValidationError('Amount must be greater than zero.', 'INVALID_AMOUNT');
        }
        if (!request.merchant || request.merchant.trim().length === 0) {
            throw new ValidationError('Merchant is required.', 'MISSING_MERCHANT');
        }
    }

    /**
     * Creates a payment. Demo mode writes a SUCCESS transaction immediately.
     * UPI mode writes a PENDING transaction and returns a deep-link intent.
     */
    async createPayment(userId: string, request: CreatePaymentRequest): Promise<PaymentReceipt> {
        this.validatePayment(request);

        if (request.mode === 'UPI') {
            return this.createUpiPayment(userId, request);
        }
        return this.createDemoPayment(userId, request);
    }

    private async createDemoPayment(
        userId: string,
        request: CreatePaymentRequest
    ): Promise<PaymentReceipt> {
        const transaction = await this.record(userId, request, 'SUCCESS');

        return {
            paymentId: transaction.transactionId,
            status: 'SUCCESS',
            mode: 'DEMO',
            amount: transaction.amount,
            currency: transaction.currency,
            merchant: transaction.merchant,
            category: transaction.category,
            subcategory: transaction.subcategory,
            paymentMethod: transaction.paymentMethod,
            message: `Payment of ${transaction.currency} ${transaction.amount} to ${transaction.merchant} was successful.`,
            transaction,
        };
    }

    private async createUpiPayment(
        userId: string,
        request: CreatePaymentRequest
    ): Promise<PaymentReceipt> {
        if (request.paymentMethod !== 'UPI') {
            throw new PaymentError('UPI mode requires the UPI payment method.');
        }

        const transaction = await this.record(userId, request, 'PENDING');
        const intent = this.buildUpiIntent(transaction, request.receiverUpiId);
        const receiverUpiId = intent.payeeVpa;

        return {
            paymentId: transaction.transactionId,
            /** UPI intent surface status: INITIATED until independently verified. */
            status: 'PENDING',
            initiatedStatus: 'INITIATED' as const,
            mode: 'UPI',
            amount: transaction.amount,
            currency: transaction.currency,
            merchant: transaction.merchant,
            category: transaction.category,
            subcategory: transaction.subcategory,
            paymentMethod: transaction.paymentMethod,
            receiverUpiId,
            upiUrl: intent.uri,
            message:
                'UPI payment initiated. Complete the payment in your UPI app. ' +
                'SpendSense cannot read the external app’s private result, so this transaction stays PENDING until confirmed.',
            upiIntent: intent,
            transaction,
        };
    }

    /**
     * Updates a payment's status. Used to reconcile a PENDING UPI intent once
     * the user confirms (or a webhook/provider later reports the real result).
     */
    async updatePaymentStatus(
        userId: string,
        transactionId: string,
        status: 'SUCCESS' | 'PENDING' | 'FAILED'
    ): Promise<Transaction> {
        const existing = await this.repository.findById(userId, transactionId);
        if (!existing) {
            throw new PaymentError('Payment not found.');
        }
        // Status is a first-class field handled via a dedicated write path so
        // that the repository stays focused on generic field updates.
        return this.persistStatus(userId, existing, status);
    }

    /**
     * Standard UPI deep-link builder.
     *
     * Format: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<note>&tr=<ref>
     * All values are URL-encoded via `URLSearchParams`. The payee VPA is the
     * receiver's UPI ID entered by the payer (falling back to the configured
     * SpendSense VPA for legacy demo payments).
     */
    buildUpiIntent(transaction: Transaction, receiverUpiId?: string): UpiIntent {
        const payeeVpa = receiverUpiId?.trim() || process.env.UPI_PAYEE_VPA || 'spendsense@upi';
        const params = new URLSearchParams({
            pa: payeeVpa,
            pn: transaction.merchant,
            am: transaction.amount.toFixed(2),
            cu: transaction.currency || 'INR',
            tn: transaction.note || `${CATEGORY_META[transaction.category].label} payment via SpendSense`,
            tr: transaction.transactionId,
        });
        return {
            uri: `upi://pay?${params.toString()}`,
            payeeVpa,
            transactionRef: transaction.transactionId,
        };
    }

    private async record(
        userId: string,
        request: CreatePaymentRequest,
        status: 'SUCCESS' | 'PENDING' | 'FAILED'
    ): Promise<Transaction> {
        const createdAt = nowIso();
        const transaction: Transaction = {
            transactionId: generateTransactionId(),
            userId,
            amount: Math.round(request.amount * 100) / 100,
            currency: request.currency || 'INR',
            merchant: request.merchant,
            category: request.category,
            subcategory:
                (request.subcategory as never) || inferSubcategory(request.category, request.merchant),
            paymentMethod: request.paymentMethod,
            status,
            note: request.note,
            createdAt,
            updatedAt: createdAt,
        };

        return this.repository.create(transaction);
    }

    private async persistStatus(
        userId: string,
        transaction: Transaction,
        status: 'SUCCESS' | 'PENDING' | 'FAILED'
    ): Promise<Transaction> {
        const updated: Transaction = { ...transaction, status, updatedAt: nowIso() };
        // Recreate the item with updated status (single-table put is idempotent).
        await this.repository.delete(userId, transaction.transactionId, transaction.createdAt);
        return this.repository.create(updated);
    }
}

export const paymentService = new PaymentService();