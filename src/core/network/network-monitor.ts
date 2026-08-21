import { useSyncExternalStore } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'unknown';

/**
 * Abstraction over the device network state.
 * The rest of the application must depend on this interface,
 * never on NetInfo directly.
 */
export interface NetworkMonitor {
  isOnline(): boolean;
  getStatus(): NetworkStatus;
  subscribe(listener: () => void): () => void;
}

export function useNetworkStatus(monitor: NetworkMonitor): NetworkStatus {
  return useSyncExternalStore(
    (cb) => monitor.subscribe(cb),
    () => monitor.getStatus(),
    () => 'unknown',
  );
}
