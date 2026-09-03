import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function initDb() {
  console.log('🔄 [DB Init] Verificando y creando tablas en PostgreSQL...');
  try {
    const sqlPath = path.resolve(__dirname, '../../../Untitled-1.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ [DB Init] No se encontró el archivo de esquema en: ${sqlPath}`);
      process.exit(1);
    }

    const schemaSql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ [DB Init] Esquema y tablas creados/actualizados exitosamente.');
  } catch (error) {
    console.error('❌ [DB Init] Error ejecutando el esquema:', error);
  } finally {
    await pool.end();
  }
}

initDb();
