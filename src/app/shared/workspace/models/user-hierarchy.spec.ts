import { buildUserHierarchy, HierarchyUser } from './user-hierarchy';
const user = (id: string, email: string, addedBy?: string): HierarchyUser => ({
  id,
  values: [id, email, '', '', 'Active'],
  details: { Roles: ['DB Head'] },
  addedBy,
});
describe('Creator hierarchy', () => {
  it('nests all generations and keeps ancestors of a matching descendant', () => {
    const rows = [
      user('root', 'root@example.com'),
      user('child', 'child@example.com', 'ROOT@example.com'),
      user('grandchild', 'grand@example.com', 'child@example.com'),
    ];
    const tree = buildUserHierarchy(rows);
    expect(tree[0].children[0].children[0].user.id).toBe('grandchild');
    expect(buildUserHierarchy(rows, 'grandchild')[0].children[0].children[0].user.id).toBe(
      'grandchild',
    );
  });
  it('retains missing creators and breaks self-links and cycles without hiding users', () => {
    const tree = buildUserHierarchy([
      user('orphan', 'orphan@example.com', 'missing@example.com'),
      user('a', 'a@example.com', 'b@example.com'),
      user('b', 'b@example.com', 'a@example.com'),
      user('self', 'self@example.com', 'self@example.com'),
    ]);
    expect(tree).toHaveLength(4);
    expect(tree[0].note).toContain('missing@example.com');
    expect(tree[1].note).toContain('cycle');
  });
});
