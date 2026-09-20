import type { APIGatewayProxyEvent } from "aws-lambda";
import { parseOrThrow, updateProfileSchema } from "../utils/validation";
import { InMemoryUserRepository } from "../repositories/InMemoryUserRepository";
import { userRepository, UserRepository } from "../repositories/UserRepository";

/**
 * Resolves the profile store: the real DynamoDB repository in production, an
 * in-memory twin when USE_IN_MEMORY_STORE=true (local dev server).
 */
function defaultRepository(): UserRepository {
  return process.env.USE_IN_MEMORY_STORE === "true"
    ? new InMemoryUserRepository()
    : userRepository;
}

/**
 * ProfileController
 *
 * Exposes the authenticated user's profile. The user id always comes from the
 * Cognito JWT (never the request body), so a user can only ever read/update
 * their own PROFILE item.
 */
export class ProfileController {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository = defaultRepository()) {
    this.repository = repository;
  }

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.repository.findById(userId);
    return {
      userId,
      upiId: user?.upiId ?? '',
      location: user?.location ?? '',
    };
  }

  async updateProfile(
    userId: string,
    event: APIGatewayProxyEvent,
  ): Promise<Record<string, unknown>> {
    let body: unknown = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        body = {};
      }
    }
    const parsed = parseOrThrow(updateProfileSchema, body);
    const user = await this.repository.update(userId, {
      ...(parsed.upiId !== undefined ? { upiId: parsed.upiId || undefined } : {}),
      ...(parsed.location !== undefined ? { location: parsed.location || undefined } : {}),
    });
    return {
      userId,
      upiId: user?.upiId ?? '',
      location: user?.location ?? '',
      updatedAt: user?.updatedAt ?? '',
    };
  }
}

export const profileController = new ProfileController();