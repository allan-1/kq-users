import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { createContainer, type Container } from '@/providers/container';
import { NetInfoNetworkMonitor } from '@/core/network/netinfo-network-monitor';
import { NetworkStatus, useNetworkStatus } from '@/core/network/network-monitor';

const ContainerContext = createContext<Container | null>(null);
const NetworkContext = createContext<NetworkStatus>('unknown');

export function AppProvider({ children }: PropsWithChildren) {
  const container = useMemo<Container>(() => {
    const network = new NetInfoNetworkMonitor();
    return createContainer(network);
  }, []);

  const networkStatus = useNetworkStatus(container.network);

  return (
    <ContainerContext.Provider value={container}>
      <NetworkContext.Provider value={networkStatus}>{children}</NetworkContext.Provider>
    </ContainerContext.Provider>
  );
}

export function useContainer(): Container {
  const ctx = useContext(ContainerContext);
  if (!ctx) {
    throw new Error('useContainer must be used within an AppProvider');
  }
  return ctx;
}

export function useNetworkStatusValue(): NetworkStatus {
  return useContext(NetworkContext);
}
