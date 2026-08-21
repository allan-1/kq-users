import { useCallback, useEffect, useRef, useState } from 'react';

import { useNetworkStatusValue } from '@/providers/app-provider';
import type { AppError } from '@/core/errors/app-error';
import { isStaleTimestamp } from '@/core/utils/time';
import type { DataSource, LoadResult } from '@/domain/models/load-result';

export type LoadStatus = 'loading' | 'success' | 'error' | 'empty';

export interface LoadState<T> {
  status: LoadStatus;
  data: T | null;
  source: DataSource | null;
  updatedAt: number | null;
  /** True when data is served from cache and is older than the staleness threshold. */
  isStale: boolean;
  isRefreshing: boolean;
  error: AppError | null;
}

interface Options<T> {
  /** Whether an empty array should map to the `empty` status. */
  treatEmptyAsEmpty?: boolean;
  /** Subscribe to background refresh notifications. */
  subscribe?: (listener: () => void) => () => void;
  /** Read the latest result from the reactive store. */
  getSnapshot?: () => LoadResult<T> | undefined;
  /** Auto-refresh when connectivity is restored. */
  refreshOnReconnect?: boolean;
}

/**
 * Loads a resource through a repository with offline-first semantics.
 * - initial `load` runs on mount (cache-first)
 * - background refreshes surfaced via `subscribe`/`getSnapshot`
 * - `refresh` forces a network round-trip without clearing current data
 * - optionally auto-refreshes when the network is restored
 */
export function useLoadResult<T>(
  load: () => Promise<LoadResult<T>>,
  refresh: () => Promise<LoadResult<T>>,
  options: Options<T>,
): { state: LoadState<T>; refresh: () => Promise<void> } {
  const { treatEmptyAsEmpty = true, subscribe, getSnapshot, refreshOnReconnect = false } = options;

  const networkStatus = useNetworkStatusValue();
  const loadRef = useRef(load);
  const refreshRef = useRef(refresh);

  useEffect(() => {
    loadRef.current = load;
    refreshRef.current = refresh;
  });

  const [state, setState] = useState<LoadState<T>>(() => ({
    status: 'loading',
    data: null,
    source: null,
    updatedAt: null,
    isStale: false,
    isRefreshing: false,
    error: null,
  }));

  const apply = useCallback((result: LoadResult<T>) => {
    if (!result.ok) {
      setState((prev) =>
        prev.data !== null
          ? { ...prev, isRefreshing: false, error: result.error }
          : {
              status: 'error',
              data: null,
              source: null,
              updatedAt: null,
              isStale: false,
              isRefreshing: false,
              error: result.error,
            },
      );
      return;
    }

    const { data, source, updatedAt } = result.data;
    const empty = treatEmptyAsEmpty && Array.isArray(data) && data.length === 0;
    setState((prev) => ({
      status: empty ? 'empty' : 'success',
      data,
      source,
      updatedAt,
      isStale: source === 'cached' && updatedAt !== null && isStaleTimestamp(updatedAt),
      isRefreshing: prev.isRefreshing,
      error: null,
    }));
  }, [treatEmptyAsEmpty]);

  const runInitial = useCallback(async () => {
    const result = await loadRef.current();
    apply(result);
  }, [apply]);

  useEffect(() => {
    void runInitial();
  }, [runInitial]);

  useEffect(() => {
    if (!subscribe || !getSnapshot) return;
    return subscribe(() => {
      const snapshot = getSnapshot();
      if (snapshot) apply(snapshot);
    });
  }, [subscribe, getSnapshot, apply]);

  useEffect(() => {
    if (!refreshOnReconnect) return;
    if (networkStatus === 'online') {
      void refreshRef.current().then((r) => apply(r));
    }
  }, [networkStatus, refreshOnReconnect, apply]);

  const doRefresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isRefreshing: true }));
    const result = await refreshRef.current();
    apply(result);
    setState((prev) => ({ ...prev, isRefreshing: false }));
  }, [apply]);

  return { state, refresh: doRefresh };
}
