import { PRIMARY_OUTLET, Router, UrlTree } from '@angular/router';

/** Shared return navigation: allow the protected workspace, rejecting external and auxiliary URLs. */
export function loginDestination(router: Router, returnUrl: string | null): UrlTree {
  const fallback = router.createUrlTree(['/app']);
  if (
    !returnUrl ||
    !/^\/(app|events)(?:[?#]|$)/.test(returnUrl || '') ||
    /[\\\u0000-\u001f]/.test(returnUrl)
  ) {
    return fallback;
  }

  try {
    const tree = router.parseUrl(returnUrl);
    const primary = tree.root.children[PRIMARY_OUTLET];
    if (
      Object.keys(tree.root.children).length !== 1 ||
      primary?.segments.length !== 1 ||
      !['app', 'events'].includes(primary.segments[0].path) ||
      Object.keys(primary.children).length !== 0
    ) {
      return fallback;
    }
    return tree;
  } catch {
    return fallback;
  }
}
