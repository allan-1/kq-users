import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { useLoadResult } from '@/shared/hooks/use-load-result';
import type { LoadResult } from '@/domain/models/load-result';

jest.mock('@/providers/app-provider', () => ({
  useNetworkStatusValue: () => 'unknown',
}));

const fresh = (data: number[]): LoadResult<number[]> => ({
  ok: true,
  data: { data, source: 'fresh', updatedAt: 1 },
});

const staleCached = (data: number[]): LoadResult<number[]> => ({
  ok: true,
  data: { data, source: 'cached', updatedAt: 1 },
});

function Probe({
  load,
  refresh,
}: {
  load: () => Promise<LoadResult<number[]>>;
  refresh: () => Promise<LoadResult<number[]>>;
}) {
  const { state, refresh: doRefresh } = useLoadResult<number[]>(load, refresh, {});
  const json = JSON.stringify({
    status: state.status,
    isRefreshing: state.isRefreshing,
    isStale: state.isStale,
    data: state.data,
  });
  return (
    <Pressable onPress={doRefresh} testID="probe">
      <Text testID="state">{json}</Text>
    </Pressable>
  );
}

function readState(element: { props: { children?: string } }) {
  return JSON.parse(element.props.children ?? '{}');
}

describe('useLoadResult', () => {
  it('applies the initial load result', async () => {
    const load = jest.fn().mockResolvedValue(fresh([1, 2, 3]));
    const { getByTestId } = await render(<Probe load={load} refresh={jest.fn()} />);

    await waitFor(() => {
      const state = readState(getByTestId('state'));
      expect(state.status).toBe('success');
      expect(state.data).toEqual([1, 2, 3]);
      expect(state.isStale).toBe(false);
    });
  });

  it('flags stale data when served from an old cache', async () => {
    const load = jest.fn().mockResolvedValue(staleCached([1]));
    const { getByTestId } = await render(<Probe load={load} refresh={jest.fn()} />);

    await waitFor(() => {
      const state = readState(getByTestId('state'));
      expect(state.status).toBe('success');
      expect(state.isStale).toBe(true);
    });
  });

  it('resets isRefreshing after a refresh completes', async () => {
    const load = jest.fn().mockResolvedValue(fresh([1]));
    const refresh = jest.fn().mockResolvedValue(fresh([2]));

    const { getByTestId } = await render(<Probe load={load} refresh={refresh} />);

    await waitFor(() => expect(readState(getByTestId('state')).status).toBe('success'));

    await fireEvent.press(getByTestId('probe'));

    await waitFor(() => {
      const state = readState(getByTestId('state'));
      expect(state.isRefreshing).toBe(false);
      expect(state.data).toEqual([2]);
    });
  });

  it('keeps existing data when a refresh fails', async () => {
    const load = jest.fn().mockResolvedValue(fresh([1]));
    const refresh = jest.fn().mockResolvedValue({ ok: false, error: new Error('boom') });

    const { getByTestId } = await render(<Probe load={load} refresh={refresh} />);
    await waitFor(() => expect(readState(getByTestId('state')).status).toBe('success'));

    await fireEvent.press(getByTestId('probe'));

    await waitFor(() => {
      const state = readState(getByTestId('state'));
      expect(state.isRefreshing).toBe(false);
      expect(state.data).toEqual([1]);
    });
  });
});