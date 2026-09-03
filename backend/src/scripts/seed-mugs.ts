import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function runMugsSeed() {
  console.log('🔄 [Seed Mugs] Iniciando migración y sembrado del catálogo de Mugs en PostgreSQL (Azure)...');
  const client = await pool.connect();
  try {
    const sqlPath = path.resolve(__dirname, '../database/migrations/seed_mugs_catalog.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ [Seed Mugs] No se encontró el archivo SQL en: ${sqlPath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sqlContent);
    console.log('✅ [Seed Mugs] ¡Catálogo de Mugs, subcategorías y variantes sembrado exitosamente con total idempotencia!');

    // Consultar resumen insertado
    const catCount = await client.query("SELECT COUNT(*) FROM categories WHERE slug = 'mugs' OR parent_id = (SELECT id FROM categories WHERE slug = 'mugs')");
    const prodCount = await client.query("SELECT COUNT(*) FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug = 'mugs' OR parent_id = (SELECT id FROM categories WHERE slug = 'mugs'))");
    const varCount = await client.query("SELECT COUNT(*) FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE p.category_id IN (SELECT id FROM categories WHERE slug = 'mugs' OR parent_id = (SELECT id FROM categories WHERE slug = 'mugs'))");

    console.log(`📊 [Resumen en BD]`);
    console.log(`   - Categorías & Subcategorías de Mugs: ${catCount.rows[0].count}`);
    console.log(`   - Productos de Mugs: ${prodCount.rows[0].count}`);
    console.log(`   - Variantes de Mugs: ${varCount.rows[0].count}`);
  } catch (err) {
    console.error('❌ [Seed Mugs] Error ejecutando la migración:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMugsSeed();
