import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformAdmin } from '../../permissions/platform-admin-policy';
import { AuthSession } from '../../services/login/auth-session.service';
import { loginDestination } from '../../../shared/utils/login/login-navigation';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(AuthSession);
  return session.isAuthenticated()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const guestGuard: CanActivateFn = (route) => {
  const session = inject(AuthSession);
  const router = inject(Router);
  return session.isAuthenticated()
    ? loginDestination(router, route.queryParamMap.get('returnUrl'))
    : true;
};

export const platformAdminGuard: CanActivateFn = () => {
  return isPlatformAdmin(inject(AuthSession).user()?.role)
    ? true
    : inject(Router).createUrlTree(['/events']);
};
