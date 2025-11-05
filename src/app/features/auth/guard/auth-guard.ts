import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../service/auth-service';

export const authGuard: CanActivateChildFn = (childRoute, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/home']);
  }

  const userRole = authService.getRole();

  const requiredRole = childRoute.data['role'];

  if (requiredRole && userRole !== requiredRole) {
    console.warn(`Acceso denegado: se requiere rol ${requiredRole}, pero el usuario tiene rol ${userRole}`);
    return router.createUrlTree(['/home']);
  }

  return true;
};
