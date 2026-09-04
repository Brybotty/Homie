import { pool } from '../config/database';
import { User } from '../types/auth.types';

export class AuthRepository {
  async findByGoogleId(googleId: string): Promise<User | null> {
    const res = await pool.query<User>(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return res.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const res = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return res.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const res = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  async upsert(profile: {
    google_id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    is_admin: boolean;
  }): Promise<User> {
    const res = await pool.query<User>(
      `INSERT INTO users (google_id, email, full_name, avatar_url, is_admin)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (google_id) DO UPDATE
         SET email      = EXCLUDED.email,
             full_name  = EXCLUDED.full_name,
             avatar_url = EXCLUDED.avatar_url,
             is_admin   = EXCLUDED.is_admin
       RETURNING *`,
      [profile.google_id, profile.email, profile.full_name, profile.avatar_url, profile.is_admin]
    );
    return res.rows[0];
  }

  async setAdmin(email: string, is_admin: boolean): Promise<void> {
    await pool.query(
      'UPDATE users SET is_admin = $1 WHERE email = $2',
      [is_admin, email]
    );
  }
}
