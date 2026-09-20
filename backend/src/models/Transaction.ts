import type { Category, PaymentMethod, Subcategory, TransactionStatus } from '../constants/categories';

/**
 * Domain model for a transaction.
 *
 * This is the shape used by the service layer. The repository layer is
 * responsible for translating between this model and the DynamoDB item shape
 * (which additionally carries `PK` / `SK` keys).
 */
export interface Transaction {
    transactionId: string;
    userId: string;
    amount: number;
    currency: string;
    merchant: string;
    category: Category;
    subcategory: Subcategory;
    paymentMethod: PaymentMethod;
    status: TransactionStatus;
    note?: string;
    /** ISO-8601 timestamp of when the transaction was created. */
    createdAt: string;
    updatedAt: string;
}

/** Input accepted by the service layer when creating a transaction. */
export interface CreateTransactionInput {
    amount: number;
    merchant: string;
    category: Category;
    subcategory?: Subcategory;
    paymentMethod: PaymentMethod;
    status?: TransactionStatus;
    note?: string;
    /** Optional explicit timestamp (used by the seeder for realistic history). */
    createdAt?: string;
}

/** Fields that may be updated after creation. */
export interface UpdateTransactionInput {
    category?: Category;
    subcategory?: Subcategory;
    merchant?: string;
    note?: string;
}

/** DynamoDB single-table item shape for a transaction. */
export interface TransactionItem extends Transaction {
    PK: string;
    SK: string;
    entityType: 'TRANSACTION';
}

export function userPk(userId: string): string {
    return `USER#${userId}`;
}

export function transactionSk(createdAt: string, transactionId: string): string {
    return `TXN#${createdAt}#${transactionId}`;
}

export function toItem(txn: Transaction): TransactionItem {
    return {
        ...txn,
        PK: userPk(txn.userId),
        SK: transactionSk(txn.createdAt, txn.transactionId),
        entityType: 'TRANSACTION',
    };
}

export function fromItem(item: TransactionItem): Transaction {
    const { PK: _pk, SK: _sk, entityType: _entityType, ...txn } = item;
    return txn;
}