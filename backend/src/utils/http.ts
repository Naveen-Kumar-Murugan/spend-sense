/**
 * HTTP response helpers shared by every Lambda handler.
 *
 * All responses use a consistent envelope:
 *   success: { success: true, data: ... }
 *   failure: { success: false, error: { code, message, details? } }
 */
import type { APIGatewayProxyResult } from 'aws-lambda';
import { AppError, toAppError } from './errors';

const CORS_HEADERS: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PATCH,DELETE',
};

export interface ApiResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export interface HttpResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
}

export function jsonResponse<T>(statusCode: number, data: T): HttpResponse {
    const payload: ApiResponse<T> = { success: true, data };
    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(payload),
    };
}

export function errorResponse(err: unknown): HttpResponse {
    const appError: AppError = toAppError(err);
    const payload: ApiErrorResponse = {
        success: false,
        error: {
            code: appError.code,
            message: appError.message,
            ...(appError.details !== undefined ? { details: appError.details } : {}),
        },
    };
    return {
        statusCode: appError.statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(payload),
    };
}

export function toApiGatewayResult(response: HttpResponse): APIGatewayProxyResult {
    return {
        statusCode: response.statusCode,
        headers: response.headers,
        body: response.body,
    };
}

/** Parses a JSON body defensively, returning `{}` when empty/invalid. */
export function parseJsonBody<T = Record<string, unknown>>(body: string | null | undefined): T {
    if (!body) {
        return {} as T;
    }
    try {
        return JSON.parse(body) as T;
    } catch {
        return {} as T;
    }
}