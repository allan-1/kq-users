import NetInfo from '@react-native-community/netinfo';

import { logger } from '@/core/logger/logger';
import type { NetworkMonitor, NetworkStatus } from '@/core/network/network-monitor';

const DEBOUNCE_MS = 1000;

export class NetInfoNetworkMonitor implements NetworkMonitor {
  private status: NetworkStatus = 'unknown';
  private listeners = new Set<() => void>();
  private unsubscribe: (() => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.start();
  }

  private start() {
    this.unsubscribe = NetInfo.addEventListener((state) => {
      const next: NetworkStatus = state.isConnected === null ? 'unknown' : state.isConnected ? 'online' : 'offline';

      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        if (next === this.status) return;
        if (next === 'offline') {
          logger.info('offline-mode-detected');
        } else if (this.status === 'offline' && next === 'online') {
          logger.info('network-restored');
        }
        this.status = next;
        this.emit();
      }, DEBOUNCE_MS);
    });
  }

  isOnline(): boolean {
    return this.status === 'online';
  }

  getStatus(): NetworkStatus {
    return this.status;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
