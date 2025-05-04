/**
 * useFetch.ts
 * 
 * A lightweight, reusable data fetching hook inspired by React Query.
 * Provides loading states, error handling, and automatic retries.
 * 
 * USAGE:
 * ------
 * This hook simplifies data fetching by handling common patterns like loading states,
 * error handling, and retry logic. It returns an object with {data, isPending, error}.
 * 
 * PARAMETERS:
 * -----------
 * - url: The endpoint URL to fetch from
 * - options: Standard fetch options (method, headers, body, etc.) plus additional parameters:
 *   - maxRetries: Maximum number of retry attempts (default: 3)
 *   - retryDelay: Milliseconds between retry attempts (default: 1000)
 *   - enabled: Toggle to control whether the fetch request executes (default: true)
 *             Use this to conditionally fetch data based on dependencies or user interaction
 * 
 * RETURN VALUE:
 * -------------
 * Returns an object containing:
 * - data: The fetched data (null before first successful fetch)
 * - isPending: Boolean indicating if a request is in progress
 * - error: Error message if the request failed, otherwise null
 * 
 * TYPE PARAMETER:
 * ---------------
 * The generic type parameter <T> should match your expected return data structure
 */

import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  isPending: boolean;
  error: string | null;
}

interface UseFetchOptions {
  /**
   * Maximum number of retry attempts after failed requests
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Delay in milliseconds between retry attempts
   * @default 1000
   */
  retryDelay?: number;
  
  /**
   * Controls whether the fetch request executes
   * Use this to:
   * - Delay fetching until certain conditions are met
   * - Pause/resume fetching based on user interaction
   * - Wait for dependencies before making the request
   * @default true
   */
  enabled?: boolean;
}

export function useFetch<T>(
  url: string, 
  options?: RequestInit & UseFetchOptions
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isPending: true,
    error: null,
  });

  const {
    maxRetries = 3,
    retryDelay = 1000,
    enabled = true,
    ...fetchOptions
  } = options || {};

  useEffect(() => {
    // Don't fetch if not enabled
    if (!enabled) {
      setState(prev => ({ ...prev, isPending: false }));
      return;
    }

    let isMounted = true;
    let retryCount = 0;

    const fetchData = async () => {
      try {
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setState({
            data: data,
            isPending: false,
            error: null,
          });
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchData, retryDelay);
          return;
        }

        if (isMounted) {
          setState({
            data: null,
            isPending: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
          });
        }
      }
    };

    setState({ data: null, isPending: true, error: null });
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, JSON.stringify(fetchOptions), enabled, maxRetries, retryDelay]);

  return state;
}