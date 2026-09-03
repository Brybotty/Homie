import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rutas que requieren un usuario autenticado.
 * Ejemplo: /checkout
 * Si no está autenticado, redirige a / con un mensaje de aviso.
 */
export const authGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  // Redirigir a home y señalizar intención de checkout
  return router.createUrlTree(['/'], {
    queryParams: { loginRequired: '1' },
  });
};
