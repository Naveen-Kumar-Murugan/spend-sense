import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { documentClient, getTableName } from './dynamoClient';
import { User, UserItem, USER_PROFILE_SK, toUserItem } from '../models/User';
import { StorageError } from '../utils/errors';

/**
 * UserRepository
 *
 * Stores a lightweight profile mirror keyed by the Cognito `sub`. Identity
 * itself remains owned by Cognito.
 *
 *   PK: USER#{userId}
 *   SK: PROFILE
 */
export class UserRepository {
    /** Resolved lazily so importing the class never requires AWS config. */
    private get tableName(): string {
        return getTableName();
    }

    async findById(userId: string): Promise<User | null> {
        try {
            const response = await documentClient.send(
                new GetCommand({
                    TableName: this.tableName,
                    Key: { PK: `USER#${userId}`, SK: USER_PROFILE_SK },
                })
            );
            if (!response.Item) {
                return null;
            }
            const { PK: _pk, SK: _sk, entityType: _entityType, ...user } = response.Item as UserItem;
            return user;
        } catch (err) {
            throw new StorageError(`Failed to load user: ${(err as Error).message}`);
        }
    }

    async upsert(user: User): Promise<User> {
        try {
            await documentClient.send(
                new PutCommand({
                    TableName: this.tableName,
                    Item: toUserItem(user),
                })
            );
            return user;
        } catch (err) {
            throw new StorageError(`Failed to save user: ${(err as Error).message}`);
        }
    }

    /**
     * Partial update of the PROFILE item (e.g. saving the user's UPI ID).
     * Creates the profile item if it does not exist yet.
     */
    async update(
        userId: string,
        updates: Partial<Pick<User, 'upiId' | 'location' | 'displayName'>>,
    ): Promise<User | null> {
        try {
            const existing = await this.findById(userId);
            const base: User =
                existing ??
                {
                    userId,
                    email: '',
                    displayName: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: '',
                };

            const updated: User = {
                ...base,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            await documentClient.send(
                new PutCommand({
                    TableName: this.tableName,
                    Item: toUserItem(updated),
                })
            );
            return updated;
        } catch (err) {
            throw new StorageError(`Failed to update user: ${(err as Error).message}`);
        }
    }
}

export const userRepository = new UserRepository();

