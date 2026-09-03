import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../types';
import { User } from '../types/auth.types';

const authService = new AuthService();


export class AuthController {
  /**
   * GET /api/auth/google/callback
   * Passport llama a esto después de validar con Google.
   * Emite JWT y redirige al frontend con el token en la URL.
   */
  googleCallback = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth/callback?error=auth_failed`
        );
        return;
      }

      const token = authService.signToken(user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

      // Redirige al frontend con el JWT como query param
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/auth/me
   * Retorna el perfil del usuario autenticado (requiere requireAuth middleware).
   */
  me = (req: Request, res: Response<ApiResponse<any>>, next: NextFunction): void => {
    try {
      const user = (req as any).authUser as User;
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          is_admin: user.is_admin,
        },
      });
    } catch (err) {
      next(err);
    }
  };


  /**
   * POST /api/auth/logout
   * El cliente simplemente elimina su token — no hay nada que revocar en el servidor
   * (tokens stateless). Respondemos 200 para confirmar la intención.
   */
  logout = (_req: Request, res: Response, _next: NextFunction): void => {
    res.json({ success: true, data: null, message: 'Sesión cerrada correctamente' });
  };
}
