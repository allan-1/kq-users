/// <reference types="jest" />

jest.mock('@react-native-community/netinfo', () => {
  const listeners = new Set<jest.Mock>();

  return {
    __esModule: true,
    default: {
      fetch: jest.fn().mockResolvedValue({ isConnected: true, type: 'wifi' }),
      addEventListener: jest.fn((listener: jest.Mock) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      }),
      _emitForTesting: (state: unknown) => {
        listeners.forEach((listener) => listener(state));
      },
    },
  };
});

jest.mock('@/core/logger/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));