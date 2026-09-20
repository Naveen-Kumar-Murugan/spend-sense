/**
 * Thin fetch wrapper around the SpendSense REST API.
 * Unwraps the `{ success, data }` envelope and normalises errors.
 */
import type { ApiErrorBody } from '@/types';
import { config } from './config';
import { ApiError } from './errors';
import { getIdToken } from './auth';

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorBody;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${config.apiUrl.replace(/\/$/, '')}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  });
  return url.toString();
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getIdToken();

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      signal: options.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Could not reach SpendSense. Check your connection.', 0);
  }

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const body = payload?.error ?? {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Try again in a moment.',
    };
    throw ApiError.fromBody(body, response.status);
  }

  return payload.data as T;
}
