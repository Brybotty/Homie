import { Router } from 'express';
import passport from '../config/passport';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
const controller = new AuthController();

/**
 * Inicia el flujo OAuth2 con Google.
 * El usuario es redirigido a la pantalla de consentimiento de Google.
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

/**
 * Google redirige aquí tras el consentimiento.
 * Passport valida el código, crea/actualiza el usuario y emite el JWT.
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth/callback?error=auth_failed`,
  }),
  controller.googleCallback
);

/** Perfil del usuario autenticado (requiere JWT válido). */
router.get('/me', requireAuth, controller.me);

/** Logout — el cliente elimina su token localmente. */
router.post('/logout', controller.logout);

export default router;
