import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from './errorHandler';

const authService = new AuthService();

/**
 * requireAuth — protege rutas que necesitan un usuario autenticado.
 * Lee el JWT del header Authorization: Bearer <token>
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Autenticación requerida. Inicia sesión con Google.', 401);
    }

    const token = header.split(' ')[1];
    const payload = authService.verifyToken(token);

    const user = await authService.getUserById(payload.userId);
    if (!user) {
      throw new AppError('Usuario no encontrado. El token puede ser inválido.', 401);
    }

    req.authUser = user;
    next();
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new AppError('Token inválido o expirado. Vuelve a iniciar sesión.', 401));
    } else {
      next(err);
    }
  }
}

/**
 * requireAdmin — protege rutas exclusivas del propietario.
 * Debe ir DESPUÉS de requireAuth en la cadena de middlewares.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Acceso restringido al panel de administrador.', 401);
    }

    const token = header.split(' ')[1];
    const payload = authService.verifyToken(token);

    if (!payload.is_admin) {
      throw new AppError('Acceso denegado. No tienes permisos de administrador.', 403);
    }

    const user = await authService.getUserById(payload.userId);
    if (!user || !user.is_admin) {
      throw new AppError('Acceso denegado.', 403);
    }

    req.authUser = user;
    next();
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new AppError('Token inválido o expirado.', 401));
    } else {
      next(err);
    }
  }
}
