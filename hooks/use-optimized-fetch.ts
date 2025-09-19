import { useState, useEffect, useCallback, useRef } from 'react';

interface FetchOptions {
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
  debounce?: number;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function useOptimizedFetch<T = any>(
  url: string | null,
  options: FetchOptions = {}
) {
  const {
    cache: useCache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    retries = 3,
    timeout = 10000,
    debounce = 300
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const abortController = useRef<AbortController | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (fetchUrl: string) => {
    // Check cache first
    if (useCache && cache.has(fetchUrl)) {
      const cached = cache.get(fetchUrl)!;
      if (Date.now() - cached.timestamp < cached.ttl) {
        setState(prev => ({ ...prev, data: cached.data, loading: false }));
        return;
      }
    }

    // Abort previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    setState(prev => ({ ...prev, loading: true, error: null }));

    let attempt = 0;
    while (attempt < retries) {
      try {
        const timeoutId = setTimeout(() => {
          abortController.current?.abort();
        }, timeout);

        const response = await fetch(fetchUrl, {
          signal: abortController.current.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Cache the result
        if (useCache) {
          cache.set(fetchUrl, {
            data,
            timestamp: Date.now(),
            ttl: cacheTTL
          });
        }

        setState({ data, loading: false, error: null });
        return;

      } catch (error) {
        attempt++;
        
        if (error instanceof Error && error.name === 'AbortError') {
          return; // Request was aborted, don't retry
        }

        if (attempt >= retries) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }));
        } else {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
  }, [useCache, cacheTTL, retries, timeout]);

  const debouncedFetch = useCallback((fetchUrl: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchData(fetchUrl);
    }, debounce);
  }, [fetchData, debounce]);

  useEffect(() => {
    if (url) {
      debouncedFetch(url);
    }

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [url, debouncedFetch]);

  const refetch = useCallback(() => {
    if (url) {
      // Clear cache for this URL
      cache.delete(url);
      fetchData(url);
    }
  }, [url, fetchData]);

  return {
    ...state,
    refetch
  };
}

// Hook for optimized mutations
export function useOptimizedMutation<T = any, V = any>() {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const mutate = useCallback(async (url: string, variables: V) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  return {
    ...state,
    mutate
  };
}