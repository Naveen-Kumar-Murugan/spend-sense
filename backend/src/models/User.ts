/**
 * Application-level user profile.
 *
 * Identity is owned by Cognito; this model only stores a lightweight mirror so
 * that preferences / metadata can be persisted alongside the user's data.
 */
export interface User {
    userId: string;
    email: string;
    displayName: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserItem extends User {
    PK: string;
    SK: string;
    entityType: 'USER';
}

export const USER_PROFILE_SK = 'PROFILE';

export function toUserItem(user: User): UserItem {
    return {
        ...user,
        PK: `USER#${user.userId}`,
        SK: USER_PROFILE_SK,
        entityType: 'USER',
    };
}