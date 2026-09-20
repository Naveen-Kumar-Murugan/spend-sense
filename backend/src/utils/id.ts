import { randomUUID } from 'crypto';

/**
 * Generates a collision-resistant, human-readable identifier.
 *
 * Example: `txn_9f1c2b7e-...`
 */
export function generateId(prefix: string): string {
    const uuid = randomUUID().replace(/-/g, '').slice(0, 20);
    return `${prefix}_${uuid}`;
}

export function generateTransactionId(): string {
    return generateId('txn');
}

export function generatePaymentId(): string {
    return generateId('pay');
}