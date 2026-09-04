"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    /**
     * GET /api/auth/google/callback
     * Passport llama a esto después de validar con Google.
     * Emite JWT y redirige al frontend con el token en la URL.
     */
    googleCallback = (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth/callback?error=auth_failed`);
                return;
            }
            const token = authService.signToken(user);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
            // Redirige al frontend con el JWT como query param
            res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
        }
        catch (err) {
            next(err);
        }
    };
    /**
     * GET /api/auth/me
     * Retorna el perfil del usuario autenticado (requiere requireAuth middleware).
     */
    me = (req, res, next) => {
        try {
            const user = req.authUser;
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
        }
        catch (err) {
            next(err);
        }
    };
    /**
     * POST /api/auth/logout
     * El cliente simplemente elimina su token — no hay nada que revocar en el servidor
     * (tokens stateless). Respondemos 200 para confirmar la intención.
     */
    logout = (_req, res, _next) => {
        res.json({ success: true, data: null, message: 'Sesión cerrada correctamente' });
    };
}
exports.AuthController = AuthController;
