import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { User, JwtPayload } from '../types/auth.types';

const repo = new AuthRepository();

export class AuthService {
  /** Email(s) que tendrán acceso admin — leer del .env */
  private static adminEmails(): string[] {
    const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
    return raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }

  isAdminEmail(email: string): boolean {
    return AuthService.adminEmails().includes(email.toLowerCase());
  }

  async upsertUser(profile: {
    google_id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  }): Promise<User> {
    const is_admin = this.isAdminEmail(profile.email);
    return repo.upsert({ ...profile, is_admin });
  }

  async getUserById(id: number): Promise<User | null> {
    return repo.findById(id);
  }

  signToken(user: User): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no está configurado en .env');

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      is_admin: user.is_admin,
    };

    return jwt.sign(payload, secret, { expiresIn: '30d' });
  }

  verifyToken(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no está configurado en .env');
    return jwt.verify(token, secret) as JwtPayload;
  }
}
