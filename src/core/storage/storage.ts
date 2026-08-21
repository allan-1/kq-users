/**
 * Storage abstraction used by the local data sources.
 * Implementations may be backed by AsyncStorage, MMKV, SQLite, etc.
 * The rest of the application must depend on this interface only.
 */
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiGet(keys: string[]): Promise<Record<string, string>>;
  multiRemove(keys: string[]): Promise<void>;
}
