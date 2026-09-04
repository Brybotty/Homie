import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rutas que requieren un usuario autenticado.
 * Ejemplo: /checkout
 * Si no está autenticado, redirige a / con un mensaje de aviso.
 */
export const authGuard: CanActivateFn = async (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Si ya está autenticado (hidratado de inmediato desde memoria o localStorage)
  if (auth.isAuthenticated()) return true;

  // 2. Si hay un token guardado pero aún no se ha resuelto el perfil, esperamos a cargarlo
  if (auth.getToken()) {
    await auth.loadCurrentUser();
    if (auth.isAuthenticated()) return true;
  }

  // 3. Redirigir a home y señalizar intención de login
  return router.createUrlTree(['/'], {
    queryParams: { loginRequired: '1' },
  });
};
