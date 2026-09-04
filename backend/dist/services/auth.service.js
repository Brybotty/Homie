"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_1 = require("../repositories/auth.repository");
const repo = new auth_repository_1.AuthRepository();
class AuthService {
    /** Email(s) que tendrán acceso admin — leer del .env */
    static adminEmails() {
        const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
        return raw
            .split(',')
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
    }
    isAdminEmail(email) {
        return AuthService.adminEmails().includes(email.toLowerCase());
    }
    async upsertUser(profile) {
        const is_admin = this.isAdminEmail(profile.email);
        return repo.upsert({ ...profile, is_admin });
    }
    async getUserById(id) {
        return repo.findById(id);
    }
    signToken(user) {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error('JWT_SECRET no está configurado en .env');
        const payload = {
            userId: user.id,
            email: user.email,
            is_admin: user.is_admin,
        };
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '30d' });
    }
    verifyToken(token) {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error('JWT_SECRET no está configurado en .env');
        return jsonwebtoken_1.default.verify(token, secret);
    }
}
exports.AuthService = AuthService;
