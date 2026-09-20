import type { APIGatewayProxyEvent } from 'aws-lambda';
import { UnauthorizedError } from './errors';

/**
 * Identity extracted from a verified JWT (API Gateway Cognito authorizer).
 *
 * The frontend NEVER supplies `userId`; it is always derived here from the
 * claims that API Gateway validated against the Cognito User Pool.
 */
export interface AuthContext {
    userId: string;
    email?: string;
    username?: string;
}

interface CognitoClaims {
    sub?: string;
    email?: string;
    'cognito:username'?: string;
    username?: string;
}

/**
 * Extracts the authenticated identity from an API Gateway (REST/HTTP) event.
 *
 * Note: `sub` is the immutable Cognito user id and is what every DynamoDB key
 * is scoped to.
 */
export function getAuthContext(event: APIGatewayProxyEvent): AuthContext {
    const authorizer = (event.requestContext as { authorizer?: Record<string, unknown> } | undefined)
        ?.authorizer;

    // API Gateway REST Cognito authorizer flattens claims into `claims`.
    const claims =
        (authorizer?.claims as CognitoClaims | undefined) ||
        (authorizer?.jwt as { claims?: CognitoClaims } | undefined)?.claims ||
        (authorizer as unknown as CognitoClaims | undefined);

    const userId = claims?.sub || claims?.['cognito:username'] || claims?.username;

    if (!userId) {
        throw new UnauthorizedError('No authenticated user found on the request.');
    }

    return {
        userId,
        email: claims?.email,
        username: claims?.['cognito:username'] || claims?.username,
    };
}

/** Extracts the request id for log correlation. */
export function getRequestId(event: APIGatewayProxyEvent): string {
    return event.requestContext?.requestId || 'local';
}