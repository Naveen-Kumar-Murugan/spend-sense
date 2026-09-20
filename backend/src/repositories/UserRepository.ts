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
}

