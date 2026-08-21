import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Storage } from '@/core/storage/storage';

export const asyncStorageAdapter: Storage = {
  async getItem(key) {
    return AsyncStorage.getItem(key);
  },
  async setItem(key, value) {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key) {
    await AsyncStorage.removeItem(key);
  },
  async multiGet(keys) {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, string> = {};
    for (const [key, value] of pairs) {
      if (value !== null) result[key] = value;
    }
    return result;
  },
  async multiRemove(keys) {
    await AsyncStorage.multiRemove(keys);
  },
};
