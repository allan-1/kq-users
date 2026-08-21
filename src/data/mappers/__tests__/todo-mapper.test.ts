import { mapTodos } from '@/data/mappers/todo-mapper';

describe('todo-mapper', () => {
  it('maps a DTO into a domain model', () => {
    const todos = mapTodos([{ id: 1, userId: 1, title: 'Todo', completed: false }]);
    expect(todos[0]).toEqual({ id: 1, userId: 1, title: 'Todo', completed: false });
  });

  it('maps completion status', () => {
    const todos = mapTodos([{ id: 2, userId: 1, title: 'Done', completed: true }]);
    expect(todos[0].completed).toBe(true);
  });
});