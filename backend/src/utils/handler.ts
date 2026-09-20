import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { getAuthContext, getRequestId } from './auth';
import { errorResponse, jsonResponse, toApiGatewayResult } from './http';
import { toAppError } from './errors';
import { logger } from './logger';

/**
 * Shared Lambda handler wrapper.
 *
 * Keeps every AWS-specific concern (event parsing, auth extraction, error
 * mapping, HTTP serialisation) in one place so handlers stay tiny and free of
 * business logic.
 */
export type RouteHandler<T> = (args: {
    event: APIGatewayProxyEvent;
    userId: string;
    requestId: string;
}) => Promise<T>;

export function createHandler<T>(handler: RouteHandler<T>, successStatus = 200) {
    return async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {
        const requestId = getRequestId(event);
        const log = logger.child({ requestId });

        // Handle CORS preflight.
        if (event.httpMethod === 'OPTIONS') {
            return toApiGatewayResult(jsonResponse(200, { ok: true }));
        }

        try {
            const { userId } = getAuthContext(event);
            log.info('Request received', { userId, route: `${event.httpMethod} ${event.path}` });

            const result = await handler({ event, userId, requestId });
            return toApiGatewayResult(jsonResponse(successStatus, result));
        } catch (err) {
            const appError = toAppError(err);
            log.error('Request failed', { code: appError.code, status: appError.statusCode });
            return toApiGatewayResult(errorResponse(appError));
        }
    };
}