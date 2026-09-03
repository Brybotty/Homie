import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para el panel de administrador.
 * Requiere que el usuario esté autenticado Y tenga is_admin = true.
 * Ejemplo: /admin/**
 */
export const adminGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.isAdmin()) return true;

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/'], { queryParams: { loginRequired: '1' } });
  }

  // Autenticado pero no es admin → redirigir a home con error
  return router.createUrlTree(['/'], { queryParams: { forbidden: '1' } });
};
