import { useCallback, useEffect, useRef, useState } from 'react';
import { toUserMessage } from '@/services/errors';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  setData: (value: T) => void;
}

/**
 * Runs an async loader on mount and whenever `deps` change, guarding against
 * out-of-order responses.
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const requestId = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    const id = requestId.current + 1;
    requestId.current = id;
    setLoading(true);
    setError(null);

    loaderRef
      .current()
      .then((result) => {
        if (requestId.current !== id) return;
        setData(result);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (requestId.current !== id) return;
        setError(toUserMessage(cause));
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  return { data, loading, error, refresh, setData };
}
