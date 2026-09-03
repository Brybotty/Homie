import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function migrate() {
  console.log('🔄 [Migrate] Aplicando migración de autenticación (tabla users)...');
  try {
    // process.cwd() cuando se corre desde backend/ = C:\Users\usuario\Homie\backend
    // El SQL está en la raíz del monorepo (un nivel arriba)
    const sqlPath = path.resolve(process.cwd(), '..', 'migration-users.sql');

    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ [Migrate] No se encontró migration-users.sql en: ${sqlPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('✅ [Migrate] Tabla users creada/actualizada correctamente.');
  } catch (err) {
    console.error('❌ [Migrate] Error aplicando migración:', err);
  } finally {
    await pool.end();
  }
}

migrate();
