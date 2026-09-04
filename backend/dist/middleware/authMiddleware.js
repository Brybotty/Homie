"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const auth_service_1 = require("../services/auth.service");
const errorHandler_1 = require("./errorHandler");
const authService = new auth_service_1.AuthService();
/**
 * requireAuth — protege rutas que necesitan un usuario autenticado.
 * Lee el JWT del header Authorization: Bearer <token>
 */
async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Autenticación requerida. Inicia sesión con Google.', 401);
        }
        const token = header.split(' ')[1];
        const payload = authService.verifyToken(token);
        const user = await authService.getUserById(payload.userId);
        if (!user) {
            throw new errorHandler_1.AppError('Usuario no encontrado. El token puede ser inválido.', 401);
        }
        req.authUser = user;
        next();
    }
    catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            next(new errorHandler_1.AppError('Token inválido o expirado. Vuelve a iniciar sesión.', 401));
        }
        else {
            next(err);
        }
    }
}
/**
 * requireAdmin — protege rutas exclusivas del propietario.
 * Debe ir DESPUÉS de requireAuth en la cadena de middlewares.
 */
async function requireAdmin(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Acceso restringido al panel de administrador.', 401);
        }
        const token = header.split(' ')[1];
        const payload = authService.verifyToken(token);
        if (!payload.is_admin) {
            throw new errorHandler_1.AppError('Acceso denegado. No tienes permisos de administrador.', 403);
        }
        const user = await authService.getUserById(payload.userId);
        if (!user || !user.is_admin) {
            throw new errorHandler_1.AppError('Acceso denegado.', 403);
        }
        req.authUser = user;
        next();
    }
    catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            next(new errorHandler_1.AppError('Token inválido o expirado.', 401));
        }
        else {
            next(err);
        }
    }
}
