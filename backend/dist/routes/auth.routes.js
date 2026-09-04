"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../config/passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const controller = new auth_controller_1.AuthController();
/**
 * Inicia el flujo OAuth2 con Google.
 * El usuario es redirigido a la pantalla de consentimiento de Google.
 */
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}));
/**
 * Google redirige aquí tras el consentimiento.
 * Passport valida el código, crea/actualiza el usuario y emite el JWT.
 */
router.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/auth/callback?error=auth_failed`,
}), controller.googleCallback);
/** Perfil del usuario autenticado (requiere JWT válido). */
router.get('/me', authMiddleware_1.requireAuth, controller.me);
/** Logout — el cliente elimina su token localmente. */
router.post('/logout', controller.logout);
exports.default = router;
