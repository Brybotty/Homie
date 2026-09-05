import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function runSeed() {
  console.log('🔄 [Seed Acero & Marvel] Iniciando inserción de 14 productos en PostgreSQL (db-homie)...');
  const client = await pool.connect();
  try {
    const candidates = [
      path.resolve(__dirname, '../database/migrations/seed_acero_marvel_products.sql'),
      path.resolve(__dirname, '../../database/migrations/seed_acero_marvel_products.sql'),
      path.resolve(process.cwd(), 'src/database/migrations/seed_acero_marvel_products.sql'),
      path.resolve(process.cwd(), 'backend/src/database/migrations/seed_acero_marvel_products.sql')
    ];

    const sqlPath = candidates.find(p => fs.existsSync(p));
    if (!sqlPath) {
      console.error('❌ [Seed Acero & Marvel] No se encontró el archivo seed_acero_marvel_products.sql');
      process.exit(1);
    }

    console.log(`📄 [Seed Acero & Marvel] Leyendo script SQL desde: ${sqlPath}`);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    await client.query(sqlContent);
    console.log('✅ [Seed Acero & Marvel] ¡Migración ejecutada con éxito total e idempotencia!');

    // Consultar los 14 productos insertados con su stock, categoría y precios
    const skus = [
      'AC-DRG-01', 'AC-DRG-02', 'AC-DRG-03', 'AC-GOT-01', 'AC-GOT-02',
      'AC-PRC-01', 'AC-BRL-01', 'AC-CBL-01', '26N-443', '234-CA',
      '2501-55', '2506-49', 'GC-19', 'SM-3D-TP'
    ];

    const result = await client.query(`
      SELECT 
        p.id AS prod_id,
        p.name AS producto,
        c.name AS categoria,
        pv.sku,
        pv.wholesale_price AS precio_mayor,
        pv.retail_price AS precio_detal,
        pv.stock_quantity AS stock_disponible,
        COALESCE(col.name, 'Sin colección') AS coleccion
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_collections pc ON p.id = pc.product_id
      LEFT JOIN collections col ON pc.collection_id = col.id
      WHERE pv.sku = ANY($1)
      ORDER BY c.name, pv.sku
    `, [skus]);

    console.log('\n📊 [Resumen de Productos en Base de Datos]');
    console.table(result.rows);
    console.log(`\n✨ Total de productos verificados: ${result.rows.length} / 14`);
  } catch (error) {
    console.error('❌ [Seed Acero & Marvel] Error ejecutando la migración:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
