import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para el panel de administrador.
 * Requiere que el usuario esté autenticado Y tenga is_admin = true.
 * Ejemplo: /admin/**
 */
export const adminGuard: CanActivateFn = async (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Si ya está autenticado como administrador (pre-hidratado desde localStorage)
  if (auth.isAuthenticated() && auth.isAdmin()) return true;

  // 2. Si hay token pero el perfil aún no se ha cargado/confirmado
  if (auth.getToken() && (!auth.isAuthenticated() || !auth.user())) {
    await auth.loadCurrentUser();
    if (auth.isAuthenticated() && auth.isAdmin()) return true;
  }

  // 3. Si no está autenticado
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/'], { queryParams: { loginRequired: '1' } });
  }

  // 4. Autenticado pero no es admin → redirigir a home con error
  return router.createUrlTree(['/'], { queryParams: { forbidden: '1' } });
};
