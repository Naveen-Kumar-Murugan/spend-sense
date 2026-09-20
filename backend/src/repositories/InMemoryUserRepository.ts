import { User } from '../models/User';
import { UserRepository } from './UserRepository';

/**
 * InMemoryUserRepository
 *
 * Local-development twin of UserRepository (PROFILE items). Selected by
 * ProfileController when USE_IN_MEMORY_STORE=true, so GET/PATCH /profile run on
 * the dev server with zero AWS dependencies. Data lives for the process
 * lifetime only. Mirrors the real repository's create-if-missing update
 * semantics; `upsert` is not overridden because only findById/update are used
 * by the profile flow.
 */
export class InMemoryUserRepository extends UserRepository {
    private readonly store = new Map<string, User>();

    async findById(userId: string): Promise<User | null> {
        return this.store.get(userId) ?? null;
    }

    async update(
        userId: string,
        updates: Partial<Pick<User, 'upiId' | 'location' | 'displayName'>>,
    ): Promise<User | null> {
        const existing = this.store.get(userId);
        const base: User =
            existing ?? {
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
        this.store.set(userId, updated);
        return updated;
    }
}
