// express-augment.d.ts
// Augmenta el tipo Request de Express para incluir el usuario autenticado
import { User } from './types/auth.types';

declare global {
  namespace Express {
    interface Request {
      authUser?: User;
    }
  }
}
