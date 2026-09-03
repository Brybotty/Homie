import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function runBottlesSeed() {
  console.log('🔄 [Seed Bottles] Iniciando migración y sembrado del catálogo de Termos y Botellas en PostgreSQL (Azure)...');
  const client = await pool.connect();
  try {
    const candidates = [
      path.resolve(__dirname, '../database/migrations/seed_bottles_catalog.sql'),
      path.resolve(__dirname, '../../src/database/migrations/seed_bottles_catalog.sql')
    ];
    const sqlPath = candidates.find((p) => fs.existsSync(p));
    if (!sqlPath) {
      console.error(`❌ [Seed Bottles] No se encontró el archivo SQL en ninguna de las rutas:`, candidates);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sqlContent);
    console.log('✅ [Seed Bottles] ¡Catálogo de Termos y Botellas, subcategorías y variantes sembrado exitosamente con total idempotencia!');

    // Consultar resumen insertado
    const catCount = await client.query("SELECT COUNT(*) FROM categories WHERE slug = 'termos-botellas' OR parent_id = (SELECT id FROM categories WHERE slug = 'termos-botellas')");
    const prodCount = await client.query("SELECT COUNT(*) FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug = 'termos-botellas' OR parent_id = (SELECT id FROM categories WHERE slug = 'termos-botellas'))");
    const varCount = await client.query("SELECT COUNT(*) FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE p.category_id IN (SELECT id FROM categories WHERE slug = 'termos-botellas' OR parent_id = (SELECT id FROM categories WHERE slug = 'termos-botellas'))");

    console.log(`📊 [Resumen en BD - Termos y Botellas]`);
    console.log(`   - Categorías & Subcategorías: ${catCount.rows[0].count}`);
    console.log(`   - Productos base: ${prodCount.rows[0].count}`);
    console.log(`   - Variantes activas: ${varCount.rows[0].count}`);
  } catch (err) {
    console.error('❌ [Seed Bottles] Error ejecutando la migración:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runBottlesSeed();
