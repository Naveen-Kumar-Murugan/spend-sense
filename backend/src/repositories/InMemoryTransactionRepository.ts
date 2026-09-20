import { Transaction, UpdateTransactionInput } from '../models/Transaction';
import { ITransactionRepository } from './ITransactionRepository';

/**
 * InMemoryTransactionRepository
 *
 * A local-development implementation of ITransactionRepository. It lets the
 * backend run with zero AWS dependencies for the hackathon demo, while the
 * production path (Lambda → DynamoDB) uses TransactionRepository unchanged.
 *
 * Data is seeded from `src/data/demoTransactions.ts` at startup.
 */
export class InMemoryTransactionRepository implements ITransactionRepository {
    private readonly store = new Map<string, Transaction[]>();

    constructor(seed: Transaction[] = []) {
        for (const txn of seed) {
            this.createSync(txn);
        }
    }

    private createSync(transaction: Transaction): void {
        const list = this.store.get(transaction.userId) ?? [];
        list.push(transaction);
        this.store.set(transaction.userId, list);
    }

    async create(transaction: Transaction): Promise<Transaction> {
        const list = this.store.get(transaction.userId) ?? [];
        // Guard against duplicate ids (idempotent put semantics).
        const existingIndex = list.findIndex((t) => t.transactionId === transaction.transactionId);
        if (existingIndex >= 0) {
            list[existingIndex] = transaction;
        } else {
            list.push(transaction);
        }
        this.store.set(transaction.userId, list);
        return transaction;
    }

    async findById(userId: string, transactionId: string): Promise<Transaction | null> {
        const list = this.store.get(userId) ?? [];
        return list.find((t) => t.transactionId === transactionId) ?? null;
    }

    async findByUser(userId: string): Promise<Transaction[]> {
        const list = this.store.get(userId) ?? [];
        // Newest first, mirroring the DynamoDB query.
        return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    async update(
        userId: string,
        transactionId: string,
        _createdAt: string,
        updates: UpdateTransactionInput,
        updatedAt: string
    ): Promise<Transaction | null> {
        const list = this.store.get(userId) ?? [];
        const index = list.findIndex((t) => t.transactionId === transactionId);
        if (index < 0) {
            return null;
        }
        list[index] = { ...list[index], ...updates, updatedAt };
        return list[index];
    }

    async delete(userId: string, transactionId: string, _createdAt: string): Promise<void> {
        const list = this.store.get(userId) ?? [];
        this.store.set(
            userId,
            list.filter((t) => t.transactionId !== transactionId)
        );
    }
}