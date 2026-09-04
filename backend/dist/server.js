"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
require("./config/passport"); // Registra la estrategia de Google
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const allowedOrigins = [
    FRONTEND_URL,
    'http://localhost:4200',
    'http://127.0.0.1:4200',
];
// Security and middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(new Error(`CORS bloqueado para el origen: ${origin}`));
    },
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Sesiones — sólo necesarias para el dance OAuth2 de Passport
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'homie-session-secret-dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 10 * 60 * 1000, // 10 minutos — sólo para el flujo OAuth
    },
}));
// Root route
app.get('/', (_req, res) => {
    res.json({
        message: 'Bienvenido a la API de Homie E-Commerce',
        version: '1.0.0',
        docs: '/api/health',
    });
});
// API Routes
app.use('/api', routes_1.default);
// Error Handling Middleware
app.use(errorHandler_1.errorHandler);
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 [Homie Backend] Servidor ejecutándose en http://localhost:${PORT}`);
        console.log(`📦 [Homie Backend] Endpoints API listos en http://localhost:${PORT}/api`);
        console.log(`🔐 [Homie Backend] Auth Google: http://localhost:${PORT}/api/auth/google`);
    });
}
exports.default = app;
