'use client';

import { useCallback, useState } from 'react';
import { apiCall } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T = unknown>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (endpoint: string, fetchOptions?: RequestInit) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiCall<T>(endpoint, fetchOptions);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return { data, isLoading, error, execute };
}
