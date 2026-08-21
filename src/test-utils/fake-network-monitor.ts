import type { NetworkMonitor, NetworkStatus } from '@/core/network/network-monitor';

export class FakeNetworkMonitor implements NetworkMonitor {
  private online: boolean;
  private listeners = new Set<() => void>();

  constructor(online = true) {
    this.online = online;
  }

  setOnline(online: boolean) {
    this.online = online;
    for (const listener of this.listeners) listener();
  }

  isOnline(): boolean {
    return this.online;
  }

  getStatus(): NetworkStatus {
    return this.online ? 'online' : 'offline';
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}