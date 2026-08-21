import type { Result } from '@/core/result/result';

/** Whether the returned data came from the network or the local cache. */
export type DataSource = 'fresh' | 'cached';

export interface Loaded<T> {
  data: T;
  source: DataSource;
  updatedAt: number;
}

/**
 * The result of loading a collection/entity through a repository.
 * `ok` carries the data plus metadata so the UI can distinguish fresh
 * vs cached/stale data. `error` means no usable data could be produced.
 */
export type LoadResult<T> = Result<Loaded<T>>;
