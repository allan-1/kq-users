import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { OfflineBanner } from '@/shared/components/offline-banner';
import { LoadableSection } from '@/shared/components/loadable-section';
import type { LoadState } from '@/shared/hooks/use-load-result';
import { AppError } from '@/core/errors/app-error';

describe('EmptyState', () => {
  it('renders the title and message', async () => {
    const { getByText } = await render(<EmptyState title="No results" message="Nothing here." />);
    getByText('No results');
    getByText('Nothing here.');
  });
});

describe('ErrorState', () => {
  it('renders a message and triggers retry', async () => {
    const onRetry = jest.fn();
    const { getByText } = await render(
      <ErrorState title="Unable to load" message="Please try again." onRetry={onRetry} />,
    );

    getByText('Unable to load');
    getByText('Please try again.');

    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('OfflineBanner', () => {
  it('renders the offline message', async () => {
    const { getByText } = await render(<OfflineBanner />);
    getByText('Offline — showing cached data');
  });
});

describe('LoadableSection', () => {
  const base: LoadState<string[]> = {
    status: 'loading',
    data: null,
    source: null,
    updatedAt: null,
    isStale: false,
    isRefreshing: false,
    error: null,
  };

  it('renders skeleton rows while loading without data', async () => {
    const { queryByText } = await render(
      <LoadableSection title="Posts" state={base} renderContent={() => null} />,
    );
    expect(queryByText('Posts')).toBeTruthy();
  });

  it('renders the empty state', async () => {
    const state: LoadState<string[]> = { ...base, status: 'empty', data: [] };
    const { getByText } = await render(
      <LoadableSection title="Posts" state={state} emptyTitle="No posts available" renderContent={() => null} />,
    );
    getByText('No posts available');
  });

  it('renders the error state with retry', async () => {
    const onRetry = jest.fn();
    const state: LoadState<string[]> = {
      ...base,
      status: 'error',
      data: null,
      error: new AppError('server', 'boom'),
    };
    const { getByText } = await render(
      <LoadableSection title="Todos" state={state} onRetry={onRetry} renderContent={() => null} />,
    );
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders content when loaded', async () => {
    const state: LoadState<string[]> = { ...base, status: 'success', data: ['a', 'b'] };
    const { getByText } = await render(
      <LoadableSection
        title="Posts"
        state={state}
        renderContent={(data) => data.map((d) => <Text key={d}>{d}</Text>)}
      />,
    );
    getByText('a');
    getByText('b');
  });
});