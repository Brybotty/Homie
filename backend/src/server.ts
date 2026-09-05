import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import './config/passport'; // Registra la estrategia de Google

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : [];

const allowedOrigins = [
  ...envOrigins,
  'https://homie-mugs.com',
  'https://www.homie-mugs.com',
  'http://homie-mugs.com',
  'http://www.homie-mugs.com',
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// Security and middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.vercel.app') ||
        normalizedOrigin.endsWith('.homie-mugs.com') ||
        normalizedOrigin.endsWith('.azurewebsites.net')
      ) {
        return callback(null, true);
      }
      console.warn(`[CORS] Origen no permitido: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones — sólo necesarias para el dance OAuth2 de Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'homie-session-secret-dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 minutos — sólo para el flujo OAuth
    },
  })
);

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Bienvenido a la API de Homie E-Commerce',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 [Homie Backend] Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📦 [Homie Backend] Endpoints API listos en http://localhost:${PORT}/api`);
    console.log(`🔐 [Homie Backend] Auth Google: http://localhost:${PORT}/api/auth/google`);
  });
}

export default app;
