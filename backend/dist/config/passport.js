"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value || '';
        const user = await authService.upsertUser({
            google_id: profile.id,
            email,
            full_name: profile.displayName || null,
            avatar_url: profile.photos?.[0]?.value || null,
        });
        done(null, user);
    }
    catch (err) {
        done(err);
    }
}));
// Serialización mínima — solo guardamos el id en sesión
passport_1.default.serializeUser((user, done) => done(null, user.id));
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await authService.getUserById(id);
        done(null, user);
    }
    catch (err) {
        done(err);
    }
});
exports.default = passport_1.default;
