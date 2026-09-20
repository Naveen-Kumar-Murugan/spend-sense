import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { documentClient, getTableName } from './dynamoClient';
import {
    Transaction,
    TransactionItem,
    UpdateTransactionInput,
    fromItem,
    toItem,
    transactionSk,
    userPk,
} from '../models/Transaction';
import { StorageError } from '../utils/errors';

/**
 * TransactionRepository
 *
 * The ONLY layer that knows about DynamoDB specifics (key shapes, SDK calls,
 * single-table layout). Services depend on this interface and stay storage
 * agnostic.
 *
 * Single-table design:
 *   PK: USER#{userId}
 *   SK: TXN#{createdAt}#{transactionId}
 */
export class TransactionRepository {
    /** Resolved lazily so importing the class never requires AWS config. */
    private get tableName(): string {
        return getTableName();
    }

    /** Persists a new transaction. */
    async create(transaction: Transaction): Promise<Transaction> {
        try {
            await documentClient.send(
                new PutCommand({
                    TableName: this.tableName,
                    Item: toItem(transaction),
                    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
                })
            );
            return transaction;
        } catch (err) {
            throw new StorageError(`Failed to create transaction: ${(err as Error).message}`);
        }
    }

    /** Finds a single transaction belonging to a user. */
    async findById(userId: string, transactionId: string): Promise<Transaction | null> {
        try {
            // The SK embeds the createdAt timestamp, so we locate by scanning the
            // user's partition and matching the transactionId. This keeps the MVP
            // simple while remaining O(user transactions).
            const all = await this.findByUser(userId);
            return all.find((txn) => txn.transactionId === transactionId) ?? null;
        } catch (err) {
            if (err instanceof StorageError) {
                throw err;
            }
            throw new StorageError(`Failed to load transaction: ${(err as Error).message}`);
        }
    }

    /** Returns every transaction for a user, newest first. */
    async findByUser(userId: string): Promise<Transaction[]> {
        try {
            const results: Transaction[] = [];
            let lastEvaluatedKey: Record<string, unknown> | undefined;

            do {
                const response = await documentClient.send(
                    new QueryCommand({
                        TableName: this.tableName,
                        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
                        ExpressionAttributeValues: {
                            ':pk': userPk(userId),
                            ':skPrefix': 'TXN#',
                        },
                        ScanIndexForward: false, // newest first
                        ExclusiveStartKey: lastEvaluatedKey,
                    })
                );

                for (const item of response.Items ?? []) {
                    results.push(fromItem(item as TransactionItem));
                }
                lastEvaluatedKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
            } while (lastEvaluatedKey);

            return results;
        } catch (err) {
            throw new StorageError(`Failed to query transactions: ${(err as Error).message}`);
        }
    }

    /** Updates mutable fields (category/subcategory/merchant/note). */
    async update(
        userId: string,
        transactionId: string,
        createdAt: string,
        updates: UpdateTransactionInput,
        updatedAt: string
    ): Promise<Transaction | null> {
        try {
            const sets: string[] = [];
            const names: Record<string, string> = {};
            const values: Record<string, unknown> = {};

            if (updates.category !== undefined) {
                sets.push('#category = :category');
                names['#category'] = 'category';
                values[':category'] = updates.category;
            }
            if (updates.subcategory !== undefined) {
                sets.push('#subcategory = :subcategory');
                names['#subcategory'] = 'subcategory';
                values[':subcategory'] = updates.subcategory;
            }
            if (updates.merchant !== undefined) {
                sets.push('#merchant = :merchant');
                names['#merchant'] = 'merchant';
                values[':merchant'] = updates.merchant;
            }
            if (updates.note !== undefined) {
                sets.push('#note = :note');
                names['#note'] = 'note';
                values[':note'] = updates.note;
            }

            // Always bump updatedAt.
            sets.push('#updatedAt = :updatedAt');
            names['#updatedAt'] = 'updatedAt';
            values[':updatedAt'] = updatedAt;

            const response = await documentClient.send(
                new UpdateCommand({
                    TableName: this.tableName,
                    Key: {
                        PK: userPk(userId),
                        SK: transactionSk(createdAt, transactionId),
                    },
                    UpdateExpression: `SET ${sets.join(', ')}`,
                    ExpressionAttributeNames: names,
                    ExpressionAttributeValues: values,
                    ConditionExpression: 'attribute_exists(PK)',
                    ReturnValues: 'ALL_NEW',
                })
            );

            return response.Attributes ? fromItem(response.Attributes as TransactionItem) : null;
        } catch (err) {
            if ((err as { name?: string }).name === 'ConditionalCheckFailedException') {
                return null;
            }
            throw new StorageError(`Failed to update transaction: ${(err as Error).message}`);
        }
    }

    /** Deletes a transaction (used by tooling/tests). */
    async delete(userId: string, transactionId: string, createdAt: string): Promise<void> {
        try {
            await documentClient.send(
                new DeleteCommand({
                    TableName: this.tableName,
                    Key: {
                        PK: userPk(userId),
                        SK: transactionSk(createdAt, transactionId),
                    },
                })
            );
        } catch (err) {
            throw new StorageError(`Failed to delete transaction: ${(err as Error).message}`);
        }
    }

    /**
     * Retrieves a system-stored item by its full key. Exposed mainly for the
     * seeder and health checks.
     */
    async getByKey(pk: string, sk: string): Promise<Transaction | null> {
        try {
            const response = await documentClient.send(
                new GetCommand({
                    TableName: this.tableName,
                    Key: { PK: pk, SK: sk },
                })
            );
            return response.Item ? fromItem(response.Item as TransactionItem) : null;
        } catch (err) {
            throw new StorageError(`Failed to get transaction: ${(err as Error).message}`);
        }
    }
}

