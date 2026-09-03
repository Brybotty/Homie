-- ============================================================================
-- MIGRACIÓN & SEED IDEMPOTENTE: CATÁLOGO COMPLETO DE TERMOS Y BOTELLAS (HOMIE)
-- Archivo: backend/src/database/migrations/seed_bottles_catalog.sql
-- Motor: PostgreSQL 14+ / Azure Database for PostgreSQL (db-homie)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. ASEGURAR COLUMNA DE JERARQUÍA (parent_id) EN CATEGORÍAS
-- ----------------------------------------------------------------------------
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INT REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- ----------------------------------------------------------------------------
-- 1. CATEGORÍA PRINCIPAL (PADRE)
-- ----------------------------------------------------------------------------
INSERT INTO categories (name, slug, description, parent_id, is_active)
VALUES (
    'Termos y Botellas',
    'termos-botellas',
    'Termos, botilitos térmicos, shakers y travel tumblers en acero inoxidable',
    NULL,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. SUBCATEGORÍAS VINCULADAS AL PADRE 'termos-botellas'
-- ----------------------------------------------------------------------------
INSERT INTO categories (name, slug, description, parent_id, is_active)
VALUES 
    (
        'Tumblers, Oficina y Estilo Urbano',
        'termos-tumblers-oficina',
        'Tumblers, termos de oficina, travel mugs y estilo urbano en acero inoxidable',
        (SELECT id FROM categories WHERE slug = 'termos-botellas'),
        true
    ),
    (
        'Deportivos, Fitness y Gym',
        'termos-deportivos-fitness',
        'Termos deportivos, shakers, botilitos fitness y botellas para gimnasio',
        (SELECT id FROM categories WHERE slug = 'termos-botellas'),
        true
    ),
    (
        'Personajes, Animación y Kawaii',
        'termos-personajes-animacion',
        'Termos y botilitos de personajes de animación, Disney, películas y estética kawaii',
        (SELECT id FROM categories WHERE slug = 'termos-botellas'),
        true
    ),
    (
        'Deportes y Temáticos',
        'termos-tematicos-deportes',
        'Termos con diseño temático de fútbol, deportes y estilos únicos',
        (SELECT id FROM categories WHERE slug = 'termos-botellas'),
        true
    )
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. PRODUCTOS BASE (14 PRODUCTOS)
-- ----------------------------------------------------------------------------

-- 3.1 Subcategoría: Tumblers, Oficina y Estilo Urbano (termos-tumblers-oficina)
INSERT INTO products (category_id, name, slug, description, short_description, is_active)
VALUES
    (
        (SELECT id FROM categories WHERE slug = 'termos-tumblers-oficina'),
        'Termo tipo Stanley Manija Arriba 800 ml',
        'termo-tipo-stanley-manija-arriba-800ml',
        'Termo travel tumbler tipo Stanley con manija superior ergonómica y pitillo. Fabricado en acero inoxidable térmico de doble pared con capacidad de 800 ml, ideal para oficina, viajes y uso diario manteniendo bebidas frías o calientes por horas.',
        'Termo tipo Stanley de 800 ml en acero inoxidable con manija superior y pitillo.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-tumblers-oficina'),
        'Termo Yeti Manija 350 ml',
        'termo-yeti-manija-350ml',
        'Termo estilo Yeti de 350 ml con agarre metálico ergonómico. Fabricado en acero inoxidable de grado alimenticio con aislamiento al vacío para mantener la temperatura óptima de café o bebidas frías.',
        'Termo Yeti de 350 ml en acero inoxidable con agarre metálico.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-tumblers-oficina'),
        'Termo Silicón 1000 ml',
        'termo-silicon-1000ml',
        'Termo de gran capacidad (1000 ml / 1 Litro) fabricado en acero inoxidable con recubrimiento exterior de silicón antideslizante y suave al tacto. Excelente conservación térmica y resistencia a caídas.',
        'Termo de 1000 ml en acero inoxidable con recubrimiento antideslizante de silicón.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-tumblers-oficina'),
        'Termo Silicón 450 ml',
        'termo-silicon-450ml',
        'Termo compacto de 450 ml en acero inoxidable con funda protectora de silicón y tapa acrílica hermética con boquilla ergonómica. Práctico para café de oficina y traslados diarios.',
        'Termo de 450 ml en acero inoxidable con silicón y tapa acrílica.',
        true
    ),

-- 3.2 Subcategoría: Deportivos, Fitness y Gym (termos-deportivos-fitness)
    (
        (SELECT id FROM categories WHERE slug = 'termos-deportivos-fitness'),
        'Termo Shotay 720 ml',
        'termo-shotay-720ml',
        'Botilito térmico deportivo premium Shotay de 720 ml. Construido en acero inoxidable con manija rígida de acero para fácil transporte, boquilla con pitillo y sellado antiderrame.',
        'Termo deportivo Shotay 720 ml en acero inoxidable con manija y pitillo.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-deportivos-fitness'),
        'Termo Proteína GYM',
        'termo-proteina-gym',
        'Shaker térmico para gimnasio fabricado en acero inoxidable con compartimento inferior desmontable para almacenamiento de proteína, polvos o suplementos. Aislamiento térmico y tapa hermética.',
        'Termo shaker para proteína y suplementos en acero inoxidable.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-deportivos-fitness'),
        'Sitarayuri Imantado 800 ml',
        'sitarayuri-imantado-800ml',
        'Botella térmica deportiva Sitarayuri de 800 ml en acero inoxidable con innovador sistema de tapa imantada de retención rápida y pitillo integrado. Gran capacidad y durabilidad para entrenamientos.',
        'Botella térmica Sitarayuri 800 ml con tapa imantada y pitillo.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-deportivos-fitness'),
        'Sitarayuri Botella 800 ml',
        'sitarayuri-botella-800ml',
        'Botella de agua térmica Sitarayuri de 800 ml en acero inoxidable con agarre de silicón texturizado y tapa de cierre imantado. Ideal para hidratación deportiva y outdoor.',
        'Botella térmica Sitarayuri 800 ml con agarre de silicón y tapa imantada.',
        true
    ),

-- 3.3 Subcategoría: Personajes, Animación y Kawaii (termos-personajes-animacion)
    (
        (SELECT id FROM categories WHERE slug = 'termos-personajes-animacion'),
        'Termo Stitch 500 ml',
        'termo-stitch-500ml',
        'Termo coleccionable con diseño de Stitch de Disney de 500 ml. Fabricado en acero inoxidable con boquilla de doble función, traba de apertura de doble seguro y cordón de transporte.',
        'Termo Stitch 500 ml en acero inoxidable con tapa de doble seguro.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-personajes-animacion'),
        'Termos Disney 880 ml',
        'termos-disney-880ml',
        'Termo de gran volumen Disney de 880 ml en acero inoxidable con tapa domo 3D coleccionable, filtro infusionador integrado y manija ergonómica.',
        'Termo Disney 880 ml en acero inoxidable con tapa domo 3D y filtro.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-personajes-animacion'),
        'Toy Story Termo 420 ml',
        'toy-story-termo-420ml',
        'Termo infantil coleccionable de Toy Story de 420 ml. Fabricado en acero inoxidable con figuras en tapa 3D de personajes, correa ajustable para llevar al hombro y botón de apertura rápida.',
        'Termo Toy Story 420 ml en acero inoxidable con tapa 3D y correa.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-personajes-animacion'),
        'Termo Snoopy Doble Seguro',
        'termo-snoopy-doble-seguro',
        'Termo temático de Snoopy / Peanuts fabricado en acero inoxidable con pitillo de silicona y tapa con traba hermética de doble seguro para evitar derrames accidentales.',
        'Termo Snoopy en acero inoxidable con pitillo y traba de seguridad.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'termos-personajes-animacion'),
        'Straw Cup Gatos 540 ml',
        'straw-cup-gatos-540ml',
        'Vaso térmico Straw Cup con estampado de gatitos de 540 ml. Acero inoxidable de doble pared térmica, con pitillo flexible, tapa hermética y manija transportadora.',
        'Vaso térmico Straw Cup con diseño de gatos 540 ml y pitillo.',
        true
    ),

-- 3.4 Subcategoría: Deportes y Temáticos (termos-tematicos-deportes)
    (
        (SELECT id FROM categories WHERE slug = 'termos-tematicos-deportes'),
        'Termo Tapa Balón',
        'termo-tapa-balon',
        'Termo deportivo con tapa giratoria en relieve 3D en forma de balón de fútbol. Construcción sólida en acero inoxidable térmico para mantener las bebidas frías durante partidos o entrenamientos.',
        'Termo en acero inoxidable con tapa en forma de balón de fútbol.',
        true
    )
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. VARIANTES PRINCIPALES POR DEFECTO (product_variants)
-- ----------------------------------------------------------------------------

-- 4.1 Variantes: Tumblers, Oficina y Estilo Urbano
INSERT INTO product_variants (
    product_id,
    sku,
    supplier_sku,
    variant_name,
    wholesale_price,
    retail_price,
    stock_quantity,
    weight_grams,
    is_active
)
VALUES
    (
        (SELECT id FROM products WHERE slug = 'termo-tipo-stanley-manija-arriba-800ml'),
        'SD05',
        'SD05',
        'Acero inoxidable, 800 ml con pitillo y manija superior',
        36000.00,
        50000.00,
        0,
        450,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'termo-yeti-manija-350ml'),
        'TR-1',
        'TR-1',
        'Acero inoxidable, 350 ml con agarre metálico',
        37000.00,
        50000.00,
        0,
        320,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'termo-silicon-1000ml'),
        'RUD-144',
        'RUD-144',
        'Acero inoxidable con recubrimiento de silicón, 1000 ml',
        48000.00,
        65000.00,
        0,
        550,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'termo-silicon-450ml'),
        'RUD-141VA',
        'RUD-141VA',
        'Acero inoxidable con silicón y tapa acrílica, 450 ml',
        36000.00,
        45000.00,
        0,
        350,
        true
    ),

-- 4.2 Variantes: Deportivos, Fitness y Gym
    (
        (SELECT id FROM products WHERE slug = 'termo-shotay-720ml'),
        'ST-8918',
        'ST-8918',
        'Acero inoxidable con pitillo y manija de acero, 720 ml',
        65000.00,
        105000.00,
        0,
        480,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'termo-proteina-gym'),
        '6001',
        '6001',
        'Acero inoxidable con compartimento para suplementos',
        52000.00,
        68000.00,
        0,
        420,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'sitarayuri-imantado-800ml'),
        'K12-87',
        'K12-87',
        'Acero inoxidable con tapa imantada y pitillo, 800 ml',
        58000.00,
        75000.00,
        0,
        490,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'sitarayuri-botella-800ml'),
        'K12-19',
        'K12-19',
        'Acero inoxidable con agarre de silicón y tapa imantada, 800 ml',
        45000.00,
        60000.00,
        0,
        460,
        true
    ),

-- 4.3 Variantes: Personajes, Animación y Kawaii
    (
        (SELECT id FROM products WHERE slug = 'termo-stitch-500ml'),
        '80592',
        '80592',
        'Acero inoxidable con doble función y doble seguro, 500 ml',
        28000.00,
        38000.00,
        0,
        360,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'termos-disney-880ml'),
        'MZXS-087',
        'MZXS-087',
        'Acero inoxidable con tapa domo 3D y filtro, 880 ml',
        70000.00,
        85000.00,
        0,
        520,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'toy-story-termo-420ml'),
        'RUD-500',
        'RUD-500',
        'Acero inoxidable con tapa 3D y correa, 420 ml',
        60000.00,
        75000.00,
        0,
        340,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'termo-snoopy-doble-seguro'),
        'HM-TERMO-SNOOPY',
        NULL,
        'Acero inoxidable con pitillo y traba hermética',
        35000.00,
        48000.00,
        0,
        380,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'straw-cup-gatos-540ml'),
        'HM-STRAW-GATOS',
        NULL,
        'Acero inoxidable con pitillo y manija, 540 ml',
        48000.00,
        60000.00,
        0,
        390,
        true
    ),

-- 4.4 Variantes: Deportes y Temáticos
    (
        (SELECT id FROM products WHERE slug = 'termo-tapa-balon'),
        'CB26031F',
        'CB26031F',
        'Acero inoxidable con tapa giratoria en forma de balón de fútbol',
        40000.00,
        55000.00,
        0,
        410,
        true
    )
ON CONFLICT (sku) DO NOTHING;

COMMIT;
