export interface HierarchyUser {
  id: string;
  values: string[];
  details?: { Roles?: string[] };
  addedBy?: string;
}
export interface UserHierarchyNode {
  user: HierarchyUser;
  children: UserHierarchyNode[];
  note: string;
}
/** Preserve unknown provenance and break malformed creator cycles without hiding users. */
export function buildUserHierarchy(users: HierarchyUser[], search = ''): UserHierarchyNode[] {
  const byEmail = new Map(users.map((user) => [user.values[1].trim().toLowerCase(), user]));
  const nodes = new Map(
    users.map((user) => [user.id, { user, children: [], note: '' } as UserHierarchyNode]),
  );
  const roots: UserHierarchyNode[] = [];
  for (const user of users) {
    const creator = user.addedBy?.trim().toLowerCase();
    const parent = creator ? byEmail.get(creator) : undefined;
    const seen = new Set([user.id]);
    let ancestor = parent;
    while (ancestor && !seen.has(ancestor.id)) {
      seen.add(ancestor.id);
      ancestor = byEmail.get(ancestor.addedBy?.trim().toLowerCase() || '');
    }
    const node = nodes.get(user.id)!;
    if (parent && !ancestor) nodes.get(parent.id)!.children.push(node);
    else {
      node.note = ancestor
        ? 'Creator link contains a cycle'
        : creator
          ? 'Added by ' + user.addedBy + ' (creator not in this list)'
          : 'Unknown / legacy creator';
      roots.push(node);
    }
  }
  const query = search.trim().toLowerCase();
  const filter = (node: UserHierarchyNode): UserHierarchyNode | null => {
    const children = node.children
      .map(filter)
      .filter((child): child is UserHierarchyNode => child !== null);
    const matches = [
      node.user.values[0],
      node.user.values[1],
      node.user.addedBy,
      ...(node.user.details?.Roles || []),
      node.user.values[4],
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
    return matches || children.length
      ? { ...node, children: matches ? node.children : children }
      : null;
  };
  return roots.map(filter).filter((node): node is UserHierarchyNode => node !== null);
}
