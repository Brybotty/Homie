"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
async function seed() {
    console.log('🌱 [Seed] Iniciando sembrado de datos para Homie E-Commerce...');
    const client = await database_1.pool.connect();
    try {
        await client.query('BEGIN');
        // 1. Categorías
        console.log('📂 [Seed] Creando categorías...');
        const catMugsRes = await client.query(`
      INSERT INTO categories (name, slug, description, image_url, is_active)
      VALUES 
        ('Mugs & Cerámica', 'mugs-ceramica', 'Mugs de colección 3D, tazas artesanales y cerámica nórdica', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop', true),
        ('Termos & Botilos', 'termos-botilos', 'Termos inteligentes con sensor LED, botilos térmicos de acero inox', 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?q=80&w=800&auto=format&fit=crop', true),
        ('Hogar & Estilo', 'hogar-estilo', 'Artículos exclusivos para decoración, menaje y confort', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop', true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, slug;
    `);
        const catMap = new Map();
        for (const row of catMugsRes.rows) {
            catMap.set(row.slug, row.id);
        }
        const catMugsId = catMap.get('mugs-ceramica') || 1;
        const catTermosId = catMap.get('termos-botilos') || 2;
        const catHogarId = catMap.get('hogar-estilo') || 3;
        // 2. Productos y Variantes
        console.log('📦 [Seed] Creando productos y variantes...');
        // Producto 1: Mug Capibara 3D
        const p1 = await client.query(`
      INSERT INTO products (category_id, name, slug, description, short_description, featured_image_url, is_active)
      VALUES ($1, 'Mug 3D Coleccionable Capibara con Tapa', 'mug-3d-capibara', 
              'Hermoso mug de cerámica esmaltada de alta temperatura con forma 3D de Capibara. Incluye tapa y cuchara con detalle en resina. Capacidad de 400ml, apto para microondas y lavavajillas.',
              'Mug 3D en cerámica esmaltada de 400ml con tapa y cuchara.',
              'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop', true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id;
    `, [catMugsId]);
        const p1Id = p1.rows[0].id;
        await client.query(`
      INSERT INTO product_variants (product_id, sku, supplier_sku, variant_name, wholesale_price, retail_price, stock_quantity, weight_grams, image_url, is_active)
      VALUES 
        ($1, 'HOM-MUG-CAP-BRW', 'AYHH432-BRW', 'Capibara Café Clásico - 400ml', 18500.00, 48900.00, 24, 380, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop', true),
        ($1, 'HOM-MUG-CAP-CRM', 'AYHH432-CRM', 'Capibara Crema & Durazno - 400ml', 18500.00, 48900.00, 18, 380, 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=800&auto=format&fit=crop', true)
      ON CONFLICT (sku) DO UPDATE SET retail_price = EXCLUDED.retail_price, stock_quantity = EXCLUDED.stock_quantity;
    `, [p1Id]);
        // Producto 2: Termo LED Inteligente
        const p2 = await client.query(`
      INSERT INTO products (category_id, name, slug, description, short_description, featured_image_url, is_active)
      VALUES ($1, 'Termo Inteligente con Sensor Digital LED 500ml', 'termo-inteligente-led-500ml', 
              'Termo de doble pared de acero inoxidable 304 con pantalla táctil LED que indica la temperatura exacta en grados Celsius. Mantiene bebidas frías hasta por 24 horas y calientes por 12 horas.',
              'Termo digital de acero inoxidable con sensor touch de temperatura.',
              'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?q=80&w=800&auto=format&fit=crop', true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id;
    `, [catTermosId]);
        const p2Id = p2.rows[0].id;
        await client.query(`
      INSERT INTO product_variants (product_id, sku, supplier_sku, variant_name, wholesale_price, retail_price, stock_quantity, weight_grams, image_url, is_active)
      VALUES 
        ($1, 'HOM-TRM-LED-BLK', 'TRM-DIG-01', 'Negro Mate Premium - 500ml', 21000.00, 56000.00, 30, 320, 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?q=80&w=800&auto=format&fit=crop', true),
        ($1, 'HOM-TRM-LED-WHT', 'TRM-DIG-02', 'Blanco Nieve - 500ml', 21000.00, 56000.00, 15, 320, 'https://images.unsplash.com/photo-1536939459926-301728717817?q=80&w=800&auto=format&fit=crop', true),
        ($1, 'HOM-TRM-LED-PNK', 'TRM-DIG-03', 'Rosa Pastel - 500ml', 21000.00, 56000.00, 12, 320, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop', true)
      ON CONFLICT (sku) DO UPDATE SET retail_price = EXCLUDED.retail_price, stock_quantity = EXCLUDED.stock_quantity;
    `, [p2Id]);
        // Producto 3: Botilo Térmico Inox Adventure 750ml
        const p3 = await client.query(`
      INSERT INTO products (category_id, name, slug, description, short_description, featured_image_url, is_active)
      VALUES ($1, 'Botilo Térmico Inox Adventure 750ml', 'botilo-inox-adventure-750ml', 
              'Botella deportiva de acero inoxidable con agarradera ergonómica y pitillo de silicona antigoteo. Ideal para gimnasio, senderismo y trabajo diario.',
              'Botilo térmico de 750ml con pitillo y agarradera ergonómica.',
              'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop', true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id;
    `, [catTermosId]);
        const p3Id = p3.rows[0].id;
        await client.query(`
      INSERT INTO product_variants (product_id, sku, supplier_sku, variant_name, wholesale_price, retail_price, stock_quantity, weight_grams, image_url, is_active)
      VALUES 
        ($1, 'HOM-BOT-ADV-GRN', 'BOT-750-GRN', 'Verde Oliva Militar - 750ml', 24000.00, 62000.00, 20, 420, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop', true),
        ($1, 'HOM-BOT-ADV-NVY', 'BOT-750-NVY', 'Azul Marino Profundo - 750ml', 24000.00, 62000.00, 16, 420, 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop', true)
      ON CONFLICT (sku) DO UPDATE SET retail_price = EXCLUDED.retail_price, stock_quantity = EXCLUDED.stock_quantity;
    `, [p3Id]);
        // Producto 4: Set Tazas Cerámica Nórdica
        const p4 = await client.query(`
      INSERT INTO products (category_id, name, slug, description, short_description, featured_image_url, is_active)
      VALUES ($1, 'Set 4 Tazas Cerámica Estilo Nórdico', 'set-4-tazas-nordicas', 
              'Set de 4 tazas con textura rústica mate y base de corcho protector. Acabado elegante para café expresso, capuchino o infusiones.',
              'Set x4 tazas de café estilo nórdico con base antideslizante.',
              'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=800&auto=format&fit=crop', true)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id;
    `, [catHogarId]);
        const p4Id = p4.rows[0].id;
        await client.query(`
      INSERT INTO product_variants (product_id, sku, supplier_sku, variant_name, wholesale_price, retail_price, stock_quantity, weight_grams, image_url, is_active)
      VALUES 
        ($1, 'HOM-SET-TAZ-TER', 'SET-TAZ-TER', 'Set 4 Tazas Terracota Cálido', 32000.00, 79900.00, 10, 850, 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=800&auto=format&fit=crop', true),
        ($1, 'HOM-SET-TAZ-GRY', 'SET-TAZ-GRY', 'Set 4 Tazas Gris Piedra', 32000.00, 79900.00, 14, 850, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop', true)
      ON CONFLICT (sku) DO UPDATE SET retail_price = EXCLUDED.retail_price, stock_quantity = EXCLUDED.stock_quantity;
    `, [p4Id]);
        // 3. Clientes de Ejemplo
        console.log('👥 [Seed] Creando clientes...');
        const cust1 = await client.query(`
      INSERT INTO customers (full_name, email, phone, document_id, address, neighborhood, city, department, notes)
      VALUES ('Camila Rodríguez', 'camila.rodriguez@gmail.com', '3104567890', '1018492019', 'Cra 15 # 118 - 45 Apto 502', 'Unicentro', 'Bogotá D.C.', 'Cundinamarca', 'Portería 24 horas')
      RETURNING id;
    `);
        const cust1Id = cust1.rows[0].id;
        const cust2 = await client.query(`
      INSERT INTO customers (full_name, email, phone, document_id, address, neighborhood, city, department, notes)
      VALUES ('Mateo Gómez', 'mateo.gomez@hotmail.com', '3208765432', '1032849102', 'Calle 10A # 37 - 24', 'El Poblado', 'Medellín', 'Antioquia', 'Llamar antes de entregar')
      RETURNING id;
    `);
        const cust2Id = cust2.rows[0].id;
        // 4. Órdenes de Ejemplo para Vista Financiera
        console.log('📋 [Seed] Creando órdenes y snapshots de ítems...');
        // Orden 1 (Entregada / Pagada)
        const o1 = await client.query(`
      INSERT INTO orders (customer_id, order_code, subtotal, shipping_cost, discount_amount, total_amount, order_status, payment_status, payment_method, shipping_carrier, tracking_number)
      VALUES ($1, 'HOM-2026-001', 104900.00, 12000.00, 0.00, 116900.00, 'ENTREGADO', 'PAGADO', 'CONTRAENTREGA', 'Inter Rapidísimo', '7000849201')
      RETURNING id;
    `, [cust1Id]);
        const o1Id = o1.rows[0].id;
        await client.query(`
      INSERT INTO order_items (order_id, variant_id, product_name_snapshot, variant_name_snapshot, sku_snapshot, unit_price, unit_cost, quantity, total_price)
      VALUES 
        ($1, 1, 'Mug 3D Coleccionable Capibara con Tapa', 'Capibara Café Clásico - 400ml', 'HOM-MUG-CAP-BRW', 48900.00, 18500.00, 1, 48900.00),
        ($1, 3, 'Termo Inteligente con Sensor Digital LED 500ml', 'Negro Mate Premium - 500ml', 'HOM-TRM-LED-BLK', 56000.00, 21000.00, 1, 56000.00);
    `, [o1Id]);
        // Orden 2 (En Preparación / Pagado PSE)
        const o2 = await client.query(`
      INSERT INTO orders (customer_id, order_code, order_status, payment_status, payment_method, subtotal, shipping_cost, discount_amount, total_amount, delivery_notes)
      VALUES ($1, 'HOM-2026-002', 'EN_PREPARACION', 'PAGADO', 'PSE', 79900.00, 12000.00, 0.00, 91900.00, 'Dejar en recepción del edificio')
      RETURNING id;
    `, [cust2Id]);
        const o2Id = o2.rows[0].id;
        await client.query(`
      INSERT INTO order_items (order_id, variant_id, product_name_snapshot, variant_name_snapshot, sku_snapshot, unit_price, unit_cost, quantity, total_price)
      VALUES 
        ($1, 7, 'Set 4 Tazas Cerámica Estilo Nórdico', 'Set 4 Tazas Terracota Cálido', 'HOM-SET-TAZ-TER', 79900.00, 32000.00, 1, 79900.00);
    `, [o2Id]);
        // 5. Lote Inicial Proveedor Bogotá (En Acumulación)
        console.log('🏭 [Seed] Creando lote de reabastecimiento con proveedor en Bogotá...');
        const batchRes = await client.query(`
      INSERT INTO supplier_batches (batch_code, supplier_name, status, total_units, total_cost, notes)
      VALUES ('BATCH-BOG-2026-01', 'Importaciones Mayoristas Bogotá S.A.S.', 'EN_ACUMULACION', 15, 298500.00, 'Lote programado para despacho el viernes')
      RETURNING id;
    `);
        const batchId = batchRes.rows[0].id;
        await client.query(`
      INSERT INTO supplier_batch_items (batch_id, variant_id, quantity_ordered, unit_cost_agreed, quantity_received)
      VALUES 
        ($1, 1, 6, 18500.00, 0),
        ($1, 3, 5, 21000.00, 0),
        ($1, 5, 4, 24000.00, 0);
    `, [batchId]);
        await client.query('COMMIT');
        console.log('✨ [Seed] ¡Sembrado de datos finalizado con éxito!');
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ [Seed] Error en el sembrado de datos:', error);
    }
    finally {
        client.release();
        await database_1.pool.end();
    }
}
seed();
