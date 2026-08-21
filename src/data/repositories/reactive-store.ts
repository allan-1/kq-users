import type { LoadResult } from '@/domain/models/load-result';

/**
 * A tiny reactive in-memory store of the latest LoadResult per key.
 * When a background refresh updates a key, subscribers are notified
 * so hooks can re-render with fresh data without re-running the full
 * load flow.
 */
export class ReactiveStore {
  private store = new Map<string, LoadResult<unknown>>();
  private listeners = new Set<() => void>();

  get<T>(key: string): LoadResult<T> | undefined {
    return this.store.get(key) as LoadResult<T> | undefined;
  }

  set<T>(key: string, value: LoadResult<T>): void {
    this.store.set(key, value as LoadResult<unknown>);
    this.notify();
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
