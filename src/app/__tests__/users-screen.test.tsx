import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import UsersScreen from '@/app/index';
import { AppError } from '@/core/errors/app-error';
import type { LoadState } from '@/shared/hooks/use-load-result';
import type { User } from '@/domain/models/user';

jest.mock('@/features/users/hooks/use-users', () => ({
  useUsers: () => ({ state: mockState, refresh: jest.fn() }),
}));

    jest.mock('@/providers/app-provider', () => ({
  useNetworkStatusValue: () => mockNetworkStatus,
}));

jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require('react-native');
  return {
    useRouter: () => ({ push: jest.fn() }),
    Link: (props: { children: React.ReactNode }) => React.createElement(Text, null, props.children),
  };
});

const users: User[] = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'sincere@april.biz',
    phone: '',
    website: '',
    address: { street: 's', suite: '', city: 'c', zipcode: 'z', geo: { lat: '', lng: '' } },
    company: { name: '', catchPhrase: '', bs: '' },
  },
];

let mockState: LoadState<User[]> = {
  status: 'loading',
  data: null,
  source: null,
  updatedAt: null,
  isRefreshing: false,
  isStale: false,
  error: null,
};
let mockNetworkStatus: 'online' | 'offline' | 'unknown' = 'online';

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
      <UsersScreen />
    </SafeAreaProvider>,
  );
}

describe('UsersScreen', () => {
  beforeEach(() => {
    mockState = {
      status: 'loading',
      data: null,
      source: null,
      updatedAt: null,
      isRefreshing: false,
      isStale: false,
      error: null,
    };
    mockNetworkStatus = 'online';
  });

  it('renders a loading skeleton initially', async () => {
    const { queryByText } = await renderScreen();
    expect(queryByText('Users')).toBeTruthy();
  });

  it('renders the list of users when loaded', async () => {
    mockState = {
      status: 'success',
      data: users,
      source: 'fresh',
      updatedAt: 123,
      isRefreshing: false,
      isStale: false,
      error: null,
    };
    const { getByText } = await renderScreen();
    getByText('Leanne Graham');
    getByText('@Bret');
  });

  it('renders the empty state when there are no users', async () => {
    mockState = {
      status: 'empty',
      data: [],
      source: 'fresh',
      updatedAt: 123,
      isRefreshing: false,
      isStale: false,
      error: null,
    };
    const { getByText } = await renderScreen();
    getByText('No users available');
  });

  it('renders the error state with retry when load fails', async () => {
    mockState = {
      status: 'error',
      data: null,
      source: null,
      updatedAt: null,
      isRefreshing: false,
      isStale: false,
      error: new AppError('server', 'boom'),
    };
    const { getByText } = await renderScreen();
    getByText('Retry');
  });

  it('renders the offline banner when offline', async () => {
    mockState = {
      status: 'success',
      data: users,
      source: 'cached',
      updatedAt: 123,
      isRefreshing: false,
      isStale: false,
      error: null,
    };
    mockNetworkStatus = 'offline';
    const { getByText } = await renderScreen();
    getByText('Offline — showing cached data');
  });
});
