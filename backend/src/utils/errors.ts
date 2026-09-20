/**
 * Application error types.
 *
 * `AppError` carries a stable machine-readable `code` plus an HTTP status so
 * that the controller/response layer can serialise a consistent error envelope
 * without leaking internals.
 */
export type ErrorCode =
    | 'VALIDATION_ERROR'
    | 'INVALID_AMOUNT'
    | 'MISSING_MERCHANT'
    | 'INVALID_CATEGORY'
    | 'INVALID_SUBCATEGORY'
    | 'INVALID_PAYMENT_METHOD'
    | 'UNAUTHORIZED'
    | 'NOT_FOUND'
    | 'PAYMENT_FAILED'
    | 'BEDROCK_FAILED'
    | 'STORAGE_FAILED'
    | 'INTERNAL_ERROR';

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(code: ErrorCode, message: string, statusCode = 400, details?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message: string, code: ErrorCode = 'VALIDATION_ERROR', details?: unknown) {
        super(code, message, 400, details);
        this.name = 'ValidationError';
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required.') {
        super('UNAUTHORIZED', message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found.') {
        super('NOT_FOUND', message, 404);
        this.name = 'NotFoundError';
    }
}

export class PaymentError extends AppError {
    constructor(message = 'Payment could not be processed.') {
        super('PAYMENT_FAILED', message, 402);
        this.name = 'PaymentError';
    }
}

export class BedrockError extends AppError {
    constructor(message = 'AI insight generation failed.') {
        super('BEDROCK_FAILED', message, 502);
        this.name = 'BedrockError';
    }
}

export class StorageError extends AppError {
    constructor(message = 'A storage error occurred.') {
        super('STORAGE_FAILED', message, 500);
        this.name = 'StorageError';
    }
}

export function toAppError(err: unknown): AppError {
    if (err instanceof AppError) {
        return err;
    }
    if (err instanceof Error) {
        return new AppError('INTERNAL_ERROR', err.message, 500);
    }
    return new AppError('INTERNAL_ERROR', 'An unknown error occurred.', 500);
}