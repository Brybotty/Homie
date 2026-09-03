-- ============================================================================
-- MIGRACIÓN & SEED IDEMPOTENTE: CATÁLOGO COMPLETO DE MUGS (HOMIE)
-- Archivo: backend/src/database/migrations/seed_mugs_catalog.sql
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
    'Mugs',
    'mugs',
    'Mugs temáticos, coleccionables y de diseño',
    NULL,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 2. SUBCATEGORÍAS VINCULADAS AL PADRE 'mugs'
-- ----------------------------------------------------------------------------
INSERT INTO categories (name, slug, description, parent_id, is_active)
VALUES 
    (
        'Anime',
        'mugs-anime',
        'Mugs temáticos y coleccionables de Anime',
        (SELECT id FROM categories WHERE slug = 'mugs'),
        true
    ),
    (
        'Videojuegos',
        'mugs-videojuegos',
        'Mugs temáticos y de diseño de Videojuegos',
        (SELECT id FROM categories WHERE slug = 'mugs'),
        true
    ),
    (
        'Películas y Series Animadas',
        'mugs-series-peliculas',
        'Mugs de películas, series animadas y cultura pop',
        (SELECT id FROM categories WHERE slug = 'mugs'),
        true
    ),
    (
        'Sanrio y Kawaii',
        'mugs-sanrio-kawaii',
        'Mugs estilo Sanrio, ternurines y estética kawaii',
        (SELECT id FROM categories WHERE slug = 'mugs'),
        true
    ),
    (
        'Animales y Mascotas',
        'mugs-animales',
        'Mugs con temática de animales, mascotas y naturaleza',
        (SELECT id FROM categories WHERE slug = 'mugs'),
        true
    ),
    (
        'Deportes y Motor',
        'mugs-deportes-motor',
        'Mugs temáticos de deportes, fútbol y motor',
        (SELECT id FROM categories WHERE slug = 'mugs'),
        true
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = EXCLUDED.parent_id,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 3. PRODUCTOS BASE (41 PRODUCTOS)
-- ----------------------------------------------------------------------------

-- 3.1 Subcategoría: Anime (mugs-anime)
INSERT INTO products (category_id, name, slug, description, short_description, is_active)
VALUES
    (
        (SELECT id FROM categories WHERE slug = 'mugs-anime'),
        'Dragon Ball Esfera del Dragón',
        'mug-dragon-ball-esfera-del-dragon',
        'Mug coleccionable de Dragon Ball con diseño esférico de las esferas del dragón de 4 estrellas. Fabricado en cerámica esmaltada de alta calidad con tapa esférica removible.',
        'Mug Dragon Ball con tapa esférica.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-anime'),
        'Dragon Ball Majin Buu',
        'mug-dragon-ball-majin-buu',
        'Mug escultórico 3D de Majin Buu de Dragon Ball Z. Acabado cerámico de alta fidelidad con tapa.',
        'Mug 3D Majin Buu en cerámica con tapa.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-anime'),
        'Jujutsu Kaisen Suguru Geto',
        'mug-jujutsu-kaisen-suguru-geto',
        'Mug 3D de Suguru Geto de Jujutsu Kaisen. Cerámica esmaltada con tapa temática.',
        'Mug 3D Suguru Geto con tapa.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-anime'),
        'Kimetsu no Yaiba Tanjiro',
        'mug-kimetsu-no-yaiba-tanjiro',
        'Mug coleccionable 3D de Tanjiro Kamado de Demon Slayer / Kimetsu no Yaiba. Incluye caja de presentación.',
        'Mug 3D Tanjiro Kamado con caja especial.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-anime'),
        'Naruto 3D',
        'mug-naruto-3d',
        'Mug escultórico 3D de Naruto Uzumaki. Fabricado en cerámica de alto relieve con finos acabados.',
        'Mug escultórico 3D Naruto Uzumaki.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-anime'),
        'One Piece Luffy Sombrero',
        'mug-one-piece-luffy-sombrero',
        'Mug temático de Monkey D. Luffy de One Piece. Cerámica esmaltada con tapa icónica en forma de sombrero de paja.',
        'Mug Luffy con tapa en forma de sombrero de paja.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-anime'),
        'One Piece Zoro 3D',
        'mug-one-piece-zoro-3d',
        'Mug 3D de Roronoa Zoro de One Piece. Cerámica moldeada con tapa a juego.',
        'Mug 3D Roronoa Zoro con tapa.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-anime'),
        'One Piece Tazas X3',
        'mug-one-piece-tazas-x3',
        'Set de 3 tazas apilables temáticas de One Piece con base y soporte vertical metálico.',
        'Set x3 tazas One Piece con soporte organizador.',
        true
    ),

-- 3.2 Subcategoría: Videojuegos (mugs-videojuegos)
    (
        (SELECT id FROM categories WHERE slug = 'mugs-videojuegos'),
        'Minecraft Mugs',
        'mug-minecraft',
        'Mug cúbico temático estilo bloques de Minecraft. Fabricado en cerámica resistente.',
        'Mug cuadrado temático Minecraft.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-videojuegos'),
        'Mug Game Over Negro',
        'mug-game-over-negro',
        'Taza gamer de cerámica negra con asas laterales ergonómicas en forma de control de consola.',
        'Mug gamer negro con asas de control.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-videojuegos'),
        'Mug Zelda Ojo Sheikah',
        'mug-zelda',
        'Mug de The Legend of Zelda con relieve del Ojo Sheikah y detalles en tonos dorados y azules.',
        'Mug The Legend of Zelda Ojo Sheikah.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-videojuegos'),
        'Pokémon Pokebola',
        'mug-pokemon-pokebola',
        'Mug esférico 3D con el diseño de la clásica Pokéball de Pokémon. Cerámica esmaltada brillante con asa ergonómica.',
        'Mug esférico Pokébola Pokémon.',
        true
    ),

-- 3.3 Subcategoría: Películas y Series Animadas (mugs-series-peliculas)
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Chicas Superpoderosas Burbuja 3D',
        'mug-chicas-sp-burbuja-3d',
        'Mug 3D de Burbuja de Las Chicas Superpoderosas. Fabricado en cerámica con tapa moldeada.',
        'Mug 3D Burbuja con tapa.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Chicas Superpoderosas Bellota 3D',
        'mug-chicas-sp-bellota-3d',
        'Mug 3D de Bellota de Las Chicas Superpoderosas. Cerámica esmaltada con tapa.',
        'Mug 3D Bellota con tapa.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Cenicienta Lucifer Mug',
        'mug-cenicienta-lucifer',
        'Mug mate en relieve 3D del gato Lucifer de Cenicienta de Disney. Acabado premium texturizado.',
        'Mug Lucifer Cenicienta mate 3D.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Disney Mickey Pantalones V1',
        'mug-disney-mickey-pantalones-v1',
        'Mug 3D de Mickey Mouse inspirado en sus icónicos pantalones rojos con detalles de zapatos como soporte.',
        'Mug 3D Mickey pantalones con soporte.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Disney Minnie Falda 3D',
        'mug-disney-minnie-falda-3d',
        'Mug 3D de Minnie Mouse con falda de lunares en relieve y soporte estilizado de zapatos amarillos.',
        'Mug 3D Minnie falda con soporte.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Harry Potter Calderos',
        'mug-harry-potter-calderos',
        'Mug con forma de caldero de pociones de Harry Potter, con patas de soporte y escudo de Hogwarts.',
        'Mug caldero de pociones Harry Potter.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Harry Potter Hedwig Mug',
        'mug-harry-potter-hedwig',
        'Mug 3D de la lechuza Hedwig de Harry Potter. Cerámica blanca esculpida con plumas en relieve.',
        'Mug 3D lechuza Hedwig Harry Potter.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Marvel Deadpool',
        'mug-marvel-deadpool',
        'Mug 3D de Deadpool con máscara y detalles texturizados en relieve. Cerámica de alta calidad.',
        'Mug 3D máscara de Deadpool Marvel.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Monsters Inc Mike Wazowski 3D',
        'mug-monsters-inc-mike-wazowski-3d',
        'Mug esférico 3D de Mike Wazowski de Monsters Inc. Cerámica verde esmaltada con cuernitos y ojo en relieve.',
        'Mug 3D Mike Wazowski Monsters Inc.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Mug Gromit',
        'mug-gromit',
        'Mug escultórico 3D de Gromit de Wallace y Gromit. Diseño icónico y divertido en cerámica esmaltada.',
        'Mug 3D escultórico de Gromit.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Snoopy Hocico',
        'mug-snoopy-hocico',
        'Mug 3D con el rostro y hocico de Snoopy en alto relieve. Incluye caja coleccionable.',
        'Mug 3D Snoopy hocico con caja.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Star Wars Grogu Cuerpo 3D',
        'mug-star-wars-grogu-cuerpo-3d',
        'Mug 3D de cuerpo completo de Grogu (Baby Yoda) de The Mandalorian / Star Wars.',
        'Mug 3D cuerpo completo Grogu Star Wars.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Stitch Boca Azul Oscuro',
        'mug-stitch-boca-azul-oscuro',
        'Mug 3D de Stitch de Disney con relieve en boca y orejas estilizadas. Color azul profundo.',
        'Mug 3D Stitch relieve azul oscuro.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Toy Story Hamm 3D',
        'mug-toy-story-hamm-3d',
        'Mug 3D en forma del cerdito Hamm de Toy Story con diseño de alcancía en cerámica rosa.',
        'Mug 3D alcancía Hamm Toy Story.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Zootopia Judy Mug',
        'mug-zootopia-judy',
        'Mug 3D de Judy Hopps de Zootopia con rostro y orejas esculpidas en cerámica de alta calidad.',
        'Mug 3D Judy Hopps Zootopia.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-series-peliculas'),
        'Zootopia Nick Mug',
        'mug-zootopia-nick',
        'Mug 3D del zorro Nick Wilde de Zootopia con detalles de rostro y orejas en relieve.',
        'Mug 3D Nick Wilde Zootopia.',
        true
    ),

-- 3.4 Subcategoría: Sanrio y Kawaii (mugs-sanrio-kawaii)
    (
        (SELECT id FROM categories WHERE slug = 'mugs-sanrio-kawaii'),
        'Hello Kitty Sentada Rosa',
        'mug-hello-kitty-sentada-rosa',
        'Mug 3D de Hello Kitty sentada en tono rosa pastel con moño en relieve. Cerámica esmaltada.',
        'Mug 3D Hello Kitty rosa pastel.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-sanrio-kawaii'),
        'Kuromi 3D Gris',
        'mug-kuromi-3d-gris',
        'Mug 3D de Kuromi en color gris/negro con diseño apilable y orejitas en relieve.',
        'Mug 3D Kuromi gris apilable.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-sanrio-kawaii'),
        'Mug 3D Pochacco',
        'mug-3d-pochacco',
        'Mug 3D de Pochacco de Sanrio. Cerámica blanca con orejas negras y caja de regalo.',
        'Mug 3D Pochacco con caja de regalo.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-sanrio-kawaii'),
        'Mug Ternurines',
        'mug-ternurines',
        'Mug estilo vintage inspirado en los Ternurines / Calico Critters. Cerámica decorada en tonos suaves.',
        'Mug 3D Ternurines estilo vintage.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-sanrio-kawaii'),
        'Torre X4 Kuromi',
        'mug-torre-x4-kuromi',
        'Set de 4 tazas apilables con diseños de Kuromi sobre torre soporte organizadora metálica.',
        'Torre x4 tazas apilables Kuromi con soporte.',
        true
    ),

-- 3.5 Subcategoría: Animales y Mascotas (mugs-animales)
    (
        (SELECT id FROM categories WHERE slug = 'mugs-animales'),
        'Animales Dinosaurio 3D',
        'mug-animales-dinosaurio-3d',
        'Mug de dinosaurio con asa ergonómica en forma de cola y escamas en relieve 3D.',
        'Mug dinosaurio 3D con asa de cola.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-animales'),
        'Animales Oso Hi Coffee',
        'mug-animales-oso-hi-coffee',
        'Mug de oso con tapa de cerámica esculpida y mensaje decorativo Hi Coffee. Ideal para café o té.',
        'Mug con tapa de oso Hi Coffee.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-animales'),
        'Animales Pug 3D',
        'mug-animales-pug-3d',
        'Mug escultórico con la carita arrugada y tierna de un perrito Pug en 3D.',
        'Mug 3D escultórico perrito Pug.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-animales'),
        'Animales Tiburón 3D',
        'mug-animales-tiburon-3d',
        'Mug temático marino en forma de cabeza de tiburón con boca abierta y aleta dorsal.',
        'Mug 3D cabeza de tiburón marina.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-animales'),
        'Animales Torre 4 Gatos Colores',
        'mug-animales-torre-4-gatos-colores',
        'Set de 4 tazas apilables con gatitos de diferentes colores sobre torre organizadora vertical.',
        'Set torre x4 tazas gatos de colores.',
        true
    ),

-- 3.6 Subcategoría: Deportes y Motor (mugs-deportes-motor)
    (
        (SELECT id FROM categories WHERE slug = 'mugs-deportes-motor'),
        'CR7 3D',
        'mug-cr7-3d',
        'Mug de colección con rostro esculpido en 3D y homenaje a Cristiano Ronaldo CR7.',
        'Mug 3D Cristiano Ronaldo CR7.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-deportes-motor'),
        'Messi 3D',
        'mug-messi-3d',
        'Mug escultórico en 3D con homenaje a Lionel Messi. Cerámica de alta calidad.',
        'Mug 3D Lionel Messi.',
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-deportes-motor'),
        'Mug Acero Motor',
        'mug-acero-motor',
        'Mug estilo industrial en acero inoxidable y resina esculpida con diseño de bloque de motor V8.',
        'Mug industrial en acero y resina bloque de motor.',
        true
    )
ON CONFLICT (slug) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 4. VARIANTES PRINCIPALES POR DEFECTO (product_variants)
-- ----------------------------------------------------------------------------

-- 4.1 Variantes: Anime
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
        (SELECT id FROM products WHERE slug = 'mug-dragon-ball-esfera-del-dragon'),
        'KH301',
        'KH301',
        'Cerámica con tapa esférica',
        32000.00,
        45000.00,
        0,
        380,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-dragon-ball-majin-buu'),
        'QH40461',
        'QH40461',
        'Cerámica 3D con tapa',
        32000.00,
        50000.00,
        0,
        400,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-jujutsu-kaisen-suguru-geto'),
        'M258-844',
        'M258-844',
        'Cerámica 3D con tapa',
        39000.00,
        55000.00,
        0,
        420,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-kimetsu-no-yaiba-tanjiro'),
        '26N-432',
        '26N-432',
        'Cerámica 3D con caja',
        39000.00,
        55000.00,
        0,
        450,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-naruto-3d'),
        'KH234N',
        'KH234N',
        'Cerámica 3D escultórica',
        34000.00,
        48000.00,
        0,
        390,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-one-piece-luffy-sombrero'),
        '641-4SO',
        '641-4SO',
        'Cerámica con tapa sombrero',
        45000.00,
        65000.00,
        0,
        420,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-one-piece-zoro-3d'),
        'M258-847',
        'M258-847',
        'Cerámica 3D con tapa',
        40000.00,
        55000.00,
        0,
        420,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-one-piece-tazas-x3'),
        '26N-444',
        '26N-444',
        'Set 3 tazas con soporte',
        75000.00,
        100000.00,
        0,
        950,
        true
    ),

-- 4.2 Variantes: Videojuegos
    (
        (SELECT id FROM products WHERE slug = 'mug-minecraft'),
        'KH322B',
        'KH322B',
        'Cerámica cuadrada temática',
        33000.00,
        48000.00,
        0,
        420,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-game-over-negro'),
        'HM-MUG-GAMEOVER',
        NULL,
        'Cerámica con asas control',
        25000.00,
        35000.00,
        0,
        380,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-zelda'),
        '25643-OJO',
        '25643-OJO',
        'Cerámica cúbica Ojo Sheikah',
        32000.00,
        45000.00,
        0,
        400,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-pokemon-pokebola'),
        'QH4476',
        'QH4476',
        'Cerámica esférica',
        28000.00,
        40000.00,
        0,
        360,
        true
    ),

-- 4.3 Variantes: Películas y Series Animadas
    (
        (SELECT id FROM products WHERE slug = 'mug-chicas-sp-burbuja-3d'),
        'PYM032',
        'PYM032',
        'Cerámica 3D con tapa',
        33000.00,
        50000.00,
        0,
        400,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-chicas-sp-bellota-3d'),
        'PYM008',
        'PYM008',
        'Cerámica 3D con tapa',
        33000.00,
        50000.00,
        0,
        400,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-cenicienta-lucifer'),
        'RUD-663GL',
        'RUD-663GL',
        'Cerámica mate relieve 3D',
        30000.00,
        40000.00,
        0,
        380,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-disney-mickey-pantalones-v1'),
        'KH269',
        'KH269',
        'Cerámica 3D con zapatos',
        32000.00,
        45000.00,
        0,
        420,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-disney-minnie-falda-3d'),
        '8833',
        '8833',
        'Cerámica 3D con zapatos',
        32000.00,
        45000.00,
        0,
        420,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-harry-potter-calderos'),
        '58-CAL',
        '58-CAL',
        'Cerámica caldero',
        35000.00,
        48000.00,
        0,
        450,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-harry-potter-hedwig'),
        'QH4097',
        'QH4097',
        'Cerámica 3D lechuza',
        36000.00,
        48000.00,
        0,
        430,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-marvel-deadpool'),
        '2501-55',
        '2501-55',
        'Cerámica 3D',
        32000.00,
        48000.00,
        0,
        390,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-monsters-inc-mike-wazowski-3d'),
        'PYM021',
        'PYM021',
        'Cerámica 3D esférica',
        32000.00,
        45000.00,
        0,
        390,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-gromit'),
        'KH313',
        'KH313',
        'Cerámica 3D escultórica',
        39000.00,
        50000.00,
        0,
        420,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-snoopy-hocico'),
        'RUD-625SN',
        'RUD-625SN',
        'Cerámica 3D con caja',
        38000.00,
        50000.00,
        0,
        430,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-star-wars-grogu-cuerpo-3d'),
        '26N-63BA',
        '26N-63BA',
        'Cerámica 3D cuerpo completo',
        32000.00,
        45000.00,
        0,
        410,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-stitch-boca-azul-oscuro'),
        'DS007',
        'DS007',
        'Cerámica 3D relieve boca',
        34000.00,
        45000.00,
        0,
        400,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-toy-story-hamm-3d'),
        'HM-MUG-HAMM3D',
        NULL,
        'Cerámica 3D alcancía',
        32000.00,
        45000.00,
        0,
        380,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-zootopia-judy'),
        'RUD-639CO',
        'RUD-639CO',
        'Cerámica 3D rostro',
        34000.00,
        45000.00,
        0,
        390,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-zootopia-nick'),
        'RUD-636ZZ',
        'RUD-636ZZ',
        'Cerámica 3D rostro',
        34000.00,
        45000.00,
        0,
        390,
        true
    ),

-- 4.4 Variantes: Sanrio y Kawaii
    (
        (SELECT id FROM products WHERE slug = 'mug-hello-kitty-sentada-rosa'),
        '2501-59SE',
        '2501-59SE',
        'Cerámica 3D cuerpo completo',
        36000.00,
        48000.00,
        0,
        400,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-kuromi-3d-gris'),
        'PY2302',
        'PY2302',
        'Cerámica 3D apilable',
        28000.00,
        42000.00,
        0,
        360,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-3d-pochacco'),
        '26N-203',
        '26N-203',
        'Cerámica 3D con caja',
        32000.00,
        45000.00,
        0,
        420,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-ternurines'),
        '26N-424',
        '26N-424',
        'Cerámica 3D vintage',
        40000.00,
        50000.00,
        0,
        410,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-torre-x4-kuromi'),
        'HM-MUG-TORREKUROMI',
        NULL,
        'Set 4 tazas apilables',
        30000.00,
        45000.00,
        0,
        850,
        true
    ),

-- 4.5 Variantes: Animales y Mascotas
    (
        (SELECT id FROM products WHERE slug = 'mug-animales-dinosaurio-3d'),
        '26N-434D',
        '26N-434D',
        'Cerámica con asa de cola',
        30000.00,
        45000.00,
        0,
        380,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-animales-oso-hi-coffee'),
        '26N-139O',
        '26N-139O',
        'Cerámica con tapa de oso',
        30000.00,
        40000.00,
        0,
        380,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-animales-pug-3d'),
        '26N-100P',
        '26N-100P',
        'Cerámica escultórica',
        30000.00,
        45000.00,
        0,
        390,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-animales-tiburon-3d'),
        '25N-426T',
        '25N-426T',
        'Cerámica 3D marina',
        30000.00,
        45000.00,
        0,
        390,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-animales-torre-4-gatos-colores'),
        '26N-256G',
        '26N-256G',
        'Set 4 tazas con torre',
        20000.00,
        32000.00,
        0,
        850,
        true
    ),

-- 4.6 Variantes: Deportes y Motor
    (
        (SELECT id FROM products WHERE slug = 'mug-cr7-3d'),
        'YM-12CR',
        'YM-12CR',
        'Cerámica con rostro 3D',
        36000.00,
        50000.00,
        0,
        400,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-messi-3d'),
        'YM-11ME',
        'YM-11ME',
        'Cerámica con rostro 3D',
        36000.00,
        50000.00,
        0,
        400,
        true
    ),
    (
        (SELECT id FROM products WHERE slug = 'mug-acero-motor'),
        'HM-MUG-ACEROMOTOR',
        NULL,
        'Acero inoxidable y resina V8',
        30000.00,
        45000.00,
        0,
        450,
        true
    )
ON CONFLICT (sku) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    supplier_sku = EXCLUDED.supplier_sku,
    variant_name = EXCLUDED.variant_name,
    wholesale_price = EXCLUDED.wholesale_price,
    retail_price = EXCLUDED.retail_price,
    is_active = EXCLUDED.is_active;

COMMIT;
