import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

const TOKEN_KEY = 'homie_auth_token';

/**
 * Interceptor HTTP que añade automáticamente el header Authorization: Bearer <token>
 * a todas las peticiones que van a la API del backend.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  let token: string | null = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {
    token = null;
  }

  // Solo inyectar el token en peticiones a nuestra API
  if (token && req.url.includes('/api')) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(authReq);
  }

  return next(req);
};

