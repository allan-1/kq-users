import { mapPost, mapPosts } from '@/data/mappers/post-mapper';

describe('post-mapper', () => {
  it('maps a DTO into a domain model', () => {
    const post = mapPost({ id: 3, userId: 1, title: 'Title', body: 'Body' });
    expect(post).toEqual({ id: 3, userId: 1, title: 'Title', body: 'Body' });
  });

  it('maps a list of DTOs', () => {
    const posts = mapPosts([
      { id: 1, userId: 1, title: 'A', body: 'B' },
      { id: 2, userId: 1, title: 'C', body: 'D' },
    ]);
    expect(posts).toHaveLength(2);
    expect(posts[1].id).toBe(2);
  });
});