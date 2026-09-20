import { Category, isValidSubcategory, SUBCATEGORIES } from '../constants/categories';
import { Transaction, UpdateTransactionInput } from '../models/Transaction';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { getTransactionRepository } from '../repositories/repositoryFactory';
import { NotFoundError, ValidationError } from '../utils/errors';
import { nowIso } from '../utils/dates';
import { ListTransactionsQuery } from '../utils/validation';

/**
 * TransactionService
 *
 * Business logic for reading and modifying transactions. Contains no DynamoDB
 * SDK calls; persistence is delegated to TransactionRepository. Every method is
 * scoped to the authenticated `userId`.
 */
export class TransactionService {
    private readonly repository: ITransactionRepository;

    constructor(repository: ITransactionRepository = getTransactionRepository()) {
        this.repository = repository;
    }

    async getTransactions(
        userId: string,
        query: ListTransactionsQuery = { limit: 100 }
    ): Promise<Transaction[]> {
        const all = await this.repository.findByUser(userId);

        let filtered = all;
        if (query.search) {
            const needle = query.search.toLowerCase();
            filtered = filtered.filter((t) => t.merchant.toLowerCase().includes(needle));
        }
        if (query.category) {
            filtered = filtered.filter((t) => t.category === query.category);
        }
        if (query.month) {
            filtered = filtered.filter((t) => t.createdAt.slice(0, 7) === query.month);
        }

        return filtered.slice(0, query.limit);
    }

    async getAllForUser(userId: string): Promise<Transaction[]> {
        return this.repository.findByUser(userId);
    }

    async getTransaction(userId: string, transactionId: string): Promise<Transaction> {
        const txn = await this.repository.findById(userId, transactionId);
        if (!txn) {
            throw new NotFoundError('Transaction not found.');
        }
        return txn;
    }

    async updateTransaction(
        userId: string,
        transactionId: string,
        updates: UpdateTransactionInput
    ): Promise<Transaction> {
        const existing = await this.repository.findById(userId, transactionId);
        if (!existing) {
            throw new NotFoundError('Transaction not found.');
        }

        // If the category changes and no explicit subcategory is supplied, fall
        // back to the first valid subcategory for the new category.
        if (updates.category && updates.category !== existing.category && !updates.subcategory) {
            updates.subcategory = (SUBCATEGORIES[updates.category] as readonly string[])[0] as never;
        }

        if (updates.category && updates.subcategory) {
            this.assertValidSubcategory(updates.category, updates.subcategory);
        }

        const updated = await this.repository.update(
            userId,
            transactionId,
            existing.createdAt,
            updates,
            nowIso()
        );

        if (!updated) {
            throw new NotFoundError('Transaction not found.');
        }
        return updated;
    }

    private assertValidSubcategory(category: Category, subcategory: string): void {
        if (!isValidSubcategory(category, subcategory)) {
            throw new ValidationError(
                `Subcategory "${subcategory}" is not valid for category "${category}".`,
                'INVALID_SUBCATEGORY'
            );
        }
    }
}

export const transactionService = new TransactionService();