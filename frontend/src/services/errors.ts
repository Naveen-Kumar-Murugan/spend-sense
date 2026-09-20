import type { ApiErrorBody } from '@/types';

/** Normalised error thrown by every service function. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown[];

  constructor(code: string, message: string, status = 500, details?: unknown[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static fromBody(body: ApiErrorBody, status: number): ApiError {
    return new ApiError(body.code, body.message, status, body.details);
  }
}

/** Copy shown to people when something fails — never raw error text. */
export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Try again in a moment.';
}
