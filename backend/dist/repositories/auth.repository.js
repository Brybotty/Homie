"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const database_1 = require("../config/database");
class AuthRepository {
    async findByGoogleId(googleId) {
        const res = await database_1.pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
        return res.rows[0] || null;
    }
    async findByEmail(email) {
        const res = await database_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0] || null;
    }
    async findById(id) {
        const res = await database_1.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
    }
    async upsert(profile) {
        const res = await database_1.pool.query(`INSERT INTO users (google_id, email, full_name, avatar_url, is_admin)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (google_id) DO UPDATE
         SET email      = EXCLUDED.email,
             full_name  = EXCLUDED.full_name,
             avatar_url = EXCLUDED.avatar_url,
             is_admin   = EXCLUDED.is_admin
       RETURNING *`, [profile.google_id, profile.email, profile.full_name, profile.avatar_url, profile.is_admin]);
        return res.rows[0];
    }
    async setAdmin(email, is_admin) {
        await database_1.pool.query('UPDATE users SET is_admin = $1 WHERE email = $2', [is_admin, email]);
    }
}
exports.AuthRepository = AuthRepository;
