import type { NetworkMonitor } from '@/core/network/network-monitor';
import { AppError } from '@/core/errors/app-error';
import { fail } from '@/core/result/result';
import type { PostRemoteDataSource } from '@/data/api/dataSources/post-remote-data-source';
import type { PostLocalDataSource } from '@/data/local/dataSources/post-local-data-source';
import { RefreshCoordinator } from '@/data/repositories/refresh-coordinator';
import type { DataSource, LoadResult } from '@/domain/models/load-result';
import type { Post } from '@/domain/models/post';
import type { PostRepository } from '@/domain/repositories/post-repository';

function loaded<T>(data: T, source: DataSource, updatedAt: number): LoadResult<T> {
  return { ok: true, data: { data, source, updatedAt } };
}

export class RestPostRepository implements PostRepository {
  private readonly coordinator = new RefreshCoordinator();

  constructor(
    private readonly remote: PostRemoteDataSource,
    private readonly local: PostLocalDataSource,
    private readonly network: NetworkMonitor,
  ) {}

  async getPostById(userId: number, id: number): Promise<LoadResult<Post>> {
    const cached = await this.local.getPostById(userId, id);

    if (!this.network.isOnline()) {
      if (cached) {
        const updatedAt = await this.local.getPostsUpdatedAt(userId);
        return loaded(cached, 'cached', updatedAt);
      }
      return fail(new AppError('network', 'You are offline.'));
    }

    const remote = await this.remote.fetchPostById(id);
    if (remote.ok) {
      const posts = await this.local.getPostsByUser(userId);
      if (posts) {
        const merged = posts.data.some((p) => p.id === id)
          ? posts.data.map((p) => (p.id === id ? remote.data : p))
          : [...posts.data, remote.data];
        await this.local.setPosts(userId, merged);
      }
      return loaded(remote.data, 'fresh', Date.now());
    }

    if (cached) {
      const updatedAt = await this.local.getPostsUpdatedAt(userId);
      return loaded(cached, 'cached', updatedAt);
    }
    return remote;
  }

  async getPostsByUser(userId: number): Promise<LoadResult<Post[]>> {
    return this.coordinator.run(`posts:${userId}`, async () => {
      const cached = await this.local.getPostsByUser(userId);

      if (!this.network.isOnline()) {
        if (cached) return loaded(cached.data, 'cached', cached.updatedAt);
        return fail(new AppError('network', 'You are offline.'));
      }

      const remote = await this.remote.fetchPostsByUser(userId);
      if (!remote.ok) {
        if (cached) return loaded(cached.data, 'cached', cached.updatedAt);
        return remote;
      }

      await this.local.setPosts(userId, remote.data);
      const updatedAt = await this.local.getPostsUpdatedAt(userId);
      return loaded(remote.data, 'fresh', updatedAt);
    });
  }
}