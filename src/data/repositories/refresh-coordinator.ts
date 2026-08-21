import { logger } from '@/core/logger/logger';

/**
 * Coordinates background refreshes across repositories:
 * - deduplicates concurrent requests for the same key
 * - notifies subscribers when a refresh completes
 * Used so revalidation doesn't hammer the API and hooks can react
 * to cache updates.
 */
export class RefreshCoordinator {
  private listeners = new Set<() => void>();
  private inflight = new Map<string, Promise<unknown>>();

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

  async run<T>(key: string, task: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(key);
    if (existing) {
      logger.debug('request-deduplicated', { key });
      return existing as Promise<T>;
    }

    const promise = task().finally(() => {
      this.inflight.delete(key);
      this.notify();
    });
    this.inflight.set(key, promise);
    return promise;
  }
}
