import { Transaction, UpdateTransactionInput } from '../models/Transaction';

/**
 * Storage-agnostic contract for transaction persistence.
 *
 * Both the DynamoDB-backed repository and the in-memory (local dev) repository
 * implement this interface, so services never depend on a specific store.
 */
export interface ITransactionRepository {
    create(transaction: Transaction): Promise<Transaction>;

    findById(userId: string, transactionId: string): Promise<Transaction | null>;

    findByUser(userId: string): Promise<Transaction[]>;

    update(
        userId: string,
        transactionId: string,
        createdAt: string,
        updates: UpdateTransactionInput,
        updatedAt: string
    ): Promise<Transaction | null>;

    delete(userId: string, transactionId: string, createdAt: string): Promise<void>;
}