-- ============================================================================
-- MIGRACIÓN & SEED IDEMPOTENTE: PRODUCTOS DE ACERO Y MARVEL 3D (HOMIE)
-- Archivo: backend/src/database/migrations/seed_acero_marvel_products.sql
-- Motor: PostgreSQL 14+ / Azure Database for PostgreSQL (db-homie)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ASEGURAR CATEGORÍA PADRE 'Mugs' Y SUBCATEGORÍAS ('Mugs de Acero' y 'Marvel 3D')
-- ----------------------------------------------------------------------------

-- Asegurar categoría padre 'mugs'
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

-- Asegurar subcategorías específicas: 'Mugs de Acero' y 'Marvel 3D'
INSERT INTO categories (name, slug, description, parent_id, is_active)
VALUES 
    (
        'Mugs de Acero',
        'mugs-acero',
        'Mugs térmicos y jarras con vaso interior de acero inoxidable y relieves temáticos en resina de alta densidad',
        (SELECT id FROM categories WHERE slug = 'mugs'),
        true
    ),
    (
        'Marvel 3D',
        'mugs-marvel-3d',
        'Mugs escultóricos tridimensionales de personajes, superhéroes y villanos del Universo Marvel',
        (SELECT id FROM categories WHERE slug = 'mugs'),
        true
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = EXCLUDED.parent_id,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 2. INSERCIÓN / ACTUALIZACIÓN IDEMPOTENTE DE PRODUCTOS BASE (14 PRODUCTOS)
-- ----------------------------------------------------------------------------

INSERT INTO products (category_id, name, slug, description, short_description, featured_image_url, is_active)
VALUES
    -- ========================================================================
    -- PRODUCTOS 1 A 8: MUGS DE ACERO (Cat: Mugs de Acero)
    -- ========================================================================
    (
        (SELECT id FROM categories WHERE slug = 'mugs-acero'),
        'Acero | Dragón Borde Dorado',
        'mug-acero-dragon-borde-dorado',
        'Espectacular jarra coleccionable de temática fantástica con diseño de dragón esculpido en alto relieve y remates en borde dorado envejecido. Fabricada con copa interior de acero inoxidable quirúrgico 304 de grado alimenticio que conserva la temperatura ideal tanto para bebidas calientes como frías, y cuerpo exterior en poliresina de alta densidad con acabados góticos pintados a mano. Especificaciones: Material: Acero inoxidable 304 + Poliresina de alta resistencia. Capacidad: 450 ml. Dimensiones: 15 cm de alto x 11 cm de diámetro aprox. Cuidados: Lavar el interior a mano únicamente con agua y esponja suave no abrasiva; limpiar el exterior con paño húmedo; no sumergir completamente; no apto para microondas ni lavavajillas.',
        'Jarra estilo medieval con dragón en relieve, acabados en oro y copa interior de acero inoxidable 304.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-acero'),
        'Acero | Dragón Plata',
        'mug-acero-dragon-plata',
        'Imponente taza jarra de colección inspirada en la mitología medieval, protagonizada por un dragón en relieve con textura de escamas en acabado plata vieja y asa en forma de cola alada. Cuenta con copa interna de acero inoxidable 304 que previene la transmisión de olores y sabores, y coraza exterior de resina premium fundida en frío. Especificaciones: Material: Acero inoxidable 304 grado alimenticio + Resina artística. Capacidad: 450 ml. Dimensiones: 14.5 cm x 10.5 cm aprox. Cuidados: Lavado manual exclusivamente; evitar estropajos o jabones abrasivos sobre el acabado plateado; secar de inmediato con paño suave; no usar en horno microondas ni máquina lavavajillas.',
        'Mug jarra medieval con majestuoso dragón plateado en relieve y vaso térmico de acero inoxidable.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-acero'),
        'Acero | Dragón Verde y Dorado',
        'mug-acero-dragon-verde-dorado',
        'Mug jarra ornamental de alto impacto visual con la figura de un dragón esmeralda enmarcado en filigranas y patrones barrocos dorados. Incorpora un vaso interno de acero inoxidable 304 libre de BPA que aísla la temperatura y facilita una limpieza higiénica, recubierto por una estructura de poliresina resistente y detallada. Especificaciones: Material: Inserto de acero inoxidable 304 + Exterior en resina esculpida. Capacidad: 450 ml. Peso: 480 g aprox. Cuidados: Enjuagar el interior manualmente con jabón suave; no frotar fuertemente los relieves dorados; secar al aire en posición vertical; no apto para lavavajillas ni microondas.',
        'Exclusiva jarra de acero con dragón mitológico verde esmeralda y filigranas en oro viejo.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-acero'),
        'Acero | Fire and Blood',
        'mug-acero-fire-and-blood',
        'Jarra conmemorativa inspirada en el legendario lema de la dinastía de los dragones, decorada con el dragón de tres cabezas en relieve sobre un fondo de roca volcánica y empuñadura de hierro forjado medieval. El vaso interior es de acero inoxidable 304 apto para café caliente, cerveza o hidromiel, manteniendo la temperatura por tiempo prolongado. Especificaciones: Material: Acero inoxidable 304 + Poliresina de alta densidad. Capacidad: 500 ml. Peso: 510 g. Cuidados: Lavado manual cuidadoso con esponja blanda; evitar remojo prolongado del exterior; secar con toalla de microfibra; no utilizar en microondas ni lavavajillas.',
        'Jarra épica inspirada en Fuego y Sangre con escudo de dragón tricéfalo y copa de acero.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-acero'),
        'Acero | King in the North',
        'mug-acero-king-in-the-north',
        'Robusta jarra de colección inspirada en los reyes del invierno, luciendo la emblemática cabeza de lobo huargo tallada en altorrelieve con runas ancestrales y empuñadura de empalizada nórdica. Cuenta con copa interna de acero inoxidable 304 de alta durabilidad higiénica y cuerpo exterior de resina con textura de piedra envejecida. Especificaciones: Material: Acero inoxidable 304 + Resina de modelado. Capacidad: 500 ml. Peso: 510 g. Cuidados: Lavar a mano solo con agua y jabón neutro; no limpiar con esponjillas de alambre; prohibido su uso en microondas y lavaplatos.',
        'Jarra heráldica del Norte con cabeza de lobo huargo en relieve y corazón de acero inoxidable.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-acero'),
        'Acero | La Parca',
        'mug-acero-la-parca',
        'Impactante jarra de estética gótica y dark fantasy con la figura de la Parca sosteniendo su guadaña, rodeada de calaveras talladas y una singular asa con forma de columna vertebral ósea. En su interior alberga un vaso de acero inoxidable 304 térmico que mantiene bebidas frías o calientes en óptimas condiciones. Especificaciones: Material: Acero inoxidable 304 quirúrgico + Resina compuesta. Capacidad: 450 ml. Peso: 490 g. Cuidados: Limpieza manual exclusivamente con agua tibia; no frotar con elementos abrasivos; secar al aire; no apto para microondas ni lavavajillas.',
        'Jarra gótica con la Parca encapuchada, asa de vértebras óseas y vaso interno de acero.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-acero'),
        'Acero | Barril Clásico',
        'mug-acero-barril',
        'Taza jarra clásica inspirada en los tradicionales toneles de madera de roble, con textura de vetas rústicas, cinchas metálicas con remaches simulados y amplia asa ergonómica para un agarre firme. El núcleo interior es un vaso térmico de acero inoxidable 304 grado alimenticio, ideal para conservar la frescura de la cerveza o la temperatura de infusiones. Especificaciones: Material: Acero inoxidable 304 + Poliresina de alta densidad. Capacidad: 550 ml. Peso: 520 g. Cuidados: Lavar el interior a mano con agua y jabón; limpiar el exterior con paño húmedo; secar por completo; no apto para microondas ni lavavajillas.',
        'Jarra cervecera estilo barril de roble con cinchas de hierro y revestimiento interior de acero.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-acero'),
        'Acero | Caballeros Plata',
        'mug-acero-caballeros-plata',
        'Elegante jarra temática inspirada en las órdenes de caballería medievales, luciendo un yelmo de caballero cruzado en relieve, escudo con cruz templaria y empuñadura con remate de espada medieval. Vaso interno en acero inoxidable 304 libre de BPA para máxima inocuidad y coraza externa de resina de modelado con acabado metálico bruñido. Especificaciones: Material: Acero inoxidable 304 + Resina de alta resistencia. Capacidad: 450 ml. Peso: 480 g. Cuidados: Lavar el vaso interior a mano; limpiar suavemente la superficie metálica exterior; no utilizar productos químicos corrosivos; no apto para lavavajillas ni microondas.',
        'Jarra medieval de cruzados con yelmo de caballero en plata pulida y vaso de acero.',
        NULL,
        true
    ),

    -- ========================================================================
    -- PRODUCTOS 9 A 14: MARVEL 3D (Cat: Marvel 3D)
    -- ========================================================================
    (
        (SELECT id FROM categories WHERE slug = 'mugs-marvel-3d'),
        'Marvel | Black Panther 3D',
        'mug-marvel-black-panther',
        'Mug coleccionable de alta gama con el modelado tridimensional fiel de la máscara de Black Panther (Wakanda Forever). Cuenta con los grabados característicos del traje de vibranium, collar de garras y acabado negro satinado con acentos plateados de alta precisión. Fabricado en cerámica esmaltada de alto horneado. Especificaciones: Material: Cerámica dolomita premium esmaltada. Capacidad: 400 ml. Dimensiones: 13 cm alto x 12 cm ancho aprox. Cuidados: Lavar a mano preferentemente con esponja suave para cuidar los detalles escultóricos; secar con toalla suave; no apto para lavavajillas industrial; apto para microondas en calentamiento moderado.',
        'Mug 3D escultórico de la máscara de Black Panther con relieves de vibranium y acabado satinado.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-marvel-3d'),
        'Marvel | Capitán América 3D',
        'mug-marvel-capitan-america',
        'Taza de cerámica con modelado escultórico 3D del rostro y casco táctico del Capitán América, primer vengador. Incluye la ''A'' frontal en relieve, alas laterales talladas y vivos tonos azul, blanco y marrón cuero en su asa resistente. Fabricada en cerámica esmaltada de alta temperatura que garantiza resistencia y durabilidad. Especificaciones: Material: Cerámica de alta densidad. Capacidad: 420 ml. Peso: 430 g. Cuidados: Lavar a mano con esponja suave; no usar blanqueadores ni estropajos metálicos; secar bien tras cada uso; apto para microondas en ciclos cortos.',
        'Mug tridimensional del Capitán América con casco, máscara icónica y la ''A'' patriota en relieve.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-marvel-3d'),
        'Marvel | Deadpool 3D',
        'mug-marvel-deadpool',
        'Divertido mug tridimensional con la inconfundible máscara del mercenario bocazas Wade Wilson (Deadpool). Presenta ojos expresivos en alto relieve con parches negros mate sobre un vibrante rojo carmesí texturizado y asa ergonómica de agarre cómodo. Confeccionado en cerámica moldeada de excelente grosor para mantener el calor de café, té o chocolate. Especificaciones: Material: Cerámica esmaltada de alto horneado. Capacidad: 400 ml. Peso: 420 g. Cuidados: Lavar a mano para preservar la viveza de los esmaltes; no usar detergentes abrasivos; evitar cambios bruscos de temperatura; apto para microondas moderado.',
        'Mug 3D del antihéroe favorito Deadpool con máscara expresiva en relieve rojo escarlata.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-marvel-3d'),
        'Marvel | Iron Man 3D V2',
        'mug-marvel-iron-man-3d-v2',
        'Versión actualizada V2 del mug tridimensional del casco Mark de Tony Stark (Iron Man). Luce un modelado facetado vanguardista con deslumbrante acabado metalizado brillante en rojo intenso y máscara dorada con ojos de efecto reflectivo. Elaborado en cerámica esmaltada de primera calidad con paredes gruesas de gran aislamiento. Especificaciones: Material: Cerámica esmaltada con pigmentos metalizados. Capacidad: 420 ml. Peso: 430 g. Cuidados: Lavar a mano exclusivamente con esponja blanda; NO usar en horno microondas debido a los acabados metalizados; no lavar en máquina lavavajillas.',
        'Mug escultórico 3D del casco Mark de Iron Man con acabado metalizado oro y rojo intenso.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-marvel-3d'),
        'Marvel | Martillo Thor Mjolnir 3D',
        'mug-marvel-martillo-thor-mjolnir',
        'Solo los dignos podrán levantar esta taza escultórica inspirada en el legendario Mjolnir del Dios del Trueno de Marvel. Su diseño reproduce la cabeza de martillo rectangular asgardiana con runas nórdicas en relieve y textura de piedra meteorítica, coronado con una magnífica asa en forma de empuñadura forrada en cuero sintético con correa. Especificaciones: Material: Cerámica esmaltada de alta resistencia. Capacidad: 500 ml. Peso: 460 g. Cuidados: Lavar a mano con agua tibia y jabón neutro; no mojar prolongadamente los apliques de asa; secar verticalmente; no usar en microondas.',
        'Espectacular mug con la forma del mítico martillo Mjolnir de Thor y asa de empuñadura nórdica.',
        NULL,
        true
    ),
    (
        (SELECT id FROM categories WHERE slug = 'mugs-marvel-3d'),
        'Marvel | Spider-Man 3D con Tapa',
        'mug-marvel-spider-man-3d-con-tapa',
        'Fabuloso set de mug tridimensional y tapa a juego de Spider-Man, el Hombre Araña de Marvel. Cuenta con ojos blancos en relieve con bordes negros, textura de telaraña moldeada en toda la superficie y una tapa superior que conserva el vapor y aroma de tus bebidas por mucho más tiempo. Fabricado en cerámica de alta calidad con esmaltado brillante de máxima durabilidad. Especificaciones: Material: Cerámica 100% esmaltada de alto horneado (incluye tapa). Capacidad: 450 ml. Peso: 490 g (con tapa). Cuidados: Lavar ambas piezas a mano con esponja suave; secar cuidadosamente los bordes; evitar caídas o golpes en la tapa; apto para microondas (retirando la tapa).',
        'Mug 3D de Spider-Man con relieve de telaraña y práctica tapa cerámica removible a juego.',
        NULL,
        true
    )
ON CONFLICT (slug) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    featured_image_url = COALESCE(products.featured_image_url, EXCLUDED.featured_image_url),
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 3. INSERCIÓN / ACTUALIZACIÓN IDEMPOTENTE DE VARIANTES CON STOCK
-- ----------------------------------------------------------------------------
-- Stock Acero: 20 unidades
-- Stock Marvel: 15 unidades
-- Imagen: NULL (para asociar desde panel de admin)

INSERT INTO product_variants (
    product_id,
    sku,
    supplier_sku,
    variant_name,
    wholesale_price,
    retail_price,
    stock_quantity,
    weight_grams,
    image_url,
    is_active
)
VALUES
    -- 1. Acero | Dragón borde dorado: Sku 'AC-DRG-01', Mayor $30.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-acero-dragon-borde-dorado'),
        'AC-DRG-01',
        'AC-DRG-01',
        'Acero Inoxidable 304 + Resina 450ml',
        30000.00,
        45000.00,
        20,
        480,
        NULL,
        true
    ),
    -- 2. Acero | dragón plata: Sku 'AC-DRG-02', Mayor $30.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-acero-dragon-plata'),
        'AC-DRG-02',
        'AC-DRG-02',
        'Acero Inoxidable 304 + Resina 450ml',
        30000.00,
        45000.00,
        20,
        480,
        NULL,
        true
    ),
    -- 3. Acero | Dragon verde y dorado: Sku 'AC-DRG-03', Mayor $30.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-acero-dragon-verde-dorado'),
        'AC-DRG-03',
        'AC-DRG-03',
        'Acero Inoxidable 304 + Resina 450ml',
        30000.00,
        45000.00,
        20,
        480,
        NULL,
        true
    ),
    -- 4. Acero | fire and blood: Sku 'AC-GOT-01', Mayor $30.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-acero-fire-and-blood'),
        'AC-GOT-01',
        'AC-GOT-01',
        'Acero Inoxidable 304 + Resina 500ml',
        30000.00,
        45000.00,
        20,
        510,
        NULL,
        true
    ),
    -- 5. Acero | king in the north: Sku 'AC-GOT-02', Mayor $30.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-acero-king-in-the-north'),
        'AC-GOT-02',
        'AC-GOT-02',
        'Acero Inoxidable 304 + Resina 500ml',
        30000.00,
        45000.00,
        20,
        510,
        NULL,
        true
    ),
    -- 6. Acero | La parca: Sku 'AC-PRC-01', Mayor $30.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-acero-la-parca'),
        'AC-PRC-01',
        'AC-PRC-01',
        'Acero Inoxidable 304 + Resina 450ml',
        30000.00,
        45000.00,
        20,
        490,
        NULL,
        true
    ),
    -- 7. Acero barril: Sku 'AC-BRL-01', Mayor $30.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-acero-barril'),
        'AC-BRL-01',
        'AC-BRL-01',
        'Acero Inoxidable 304 + Resina 550ml',
        30000.00,
        45000.00,
        20,
        520,
        NULL,
        true
    ),
    -- 8. Acero caballeros plata: Sku 'AC-CBL-01', Mayor $30.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-acero-caballeros-plata'),
        'AC-CBL-01',
        'AC-CBL-01',
        'Acero Inoxidable 304 + Resina 450ml',
        30000.00,
        45000.00,
        20,
        480,
        NULL,
        true
    ),
    -- 9. Marvel | Black Panther: Ref '26N-443', Mayor $32.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-marvel-black-panther'),
        '26N-443',
        '26N-443',
        'Cerámica Escultórica 3D 400ml',
        32000.00,
        45000.00,
        15,
        420,
        NULL,
        true
    ),
    -- 10. Marvel | Capitán América: Ref '234-CA', Mayor $33.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-marvel-capitan-america'),
        '234-CA',
        '234-CA',
        'Cerámica Escultórica 3D 420ml',
        33000.00,
        45000.00,
        15,
        430,
        NULL,
        true
    ),
    -- 11. Marvel | Deadpool: Ref '2501-55', Mayor $32.000, Detal $48.000
    (
        (SELECT id FROM products WHERE slug = 'mug-marvel-deadpool'),
        '2501-55',
        '2501-55',
        'Cerámica Escultórica 3D 400ml',
        32000.00,
        48000.00,
        15,
        420,
        NULL,
        true
    ),
    -- 12. Marvel | Iron man 3D V2: Ref '2506-49', Mayor $33.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-marvel-iron-man-3d-v2'),
        '2506-49',
        '2506-49',
        'Cerámica Metalizada 3D 420ml',
        33000.00,
        45000.00,
        15,
        430,
        NULL,
        true
    ),
    -- 13. Marvel | Martillo Thor: Ref 'GC-19', Mayor $32.000, Detal $45.000
    (
        (SELECT id FROM products WHERE slug = 'mug-marvel-martillo-thor-mjolnir'),
        'GC-19',
        'GC-19',
        'Cerámica Escultórica Mjolnir 500ml',
        32000.00,
        45000.00,
        15,
        460,
        NULL,
        true
    ),
    -- 14. Marvel | Spider-man 3D con tapa: Ref 'SM-3D-TP', Mayor $36.000, Detal $50.000
    (
        (SELECT id FROM products WHERE slug = 'mug-marvel-spider-man-3d-con-tapa'),
        'SM-3D-TP',
        'SM-3D-TP',
        'Cerámica 3D con Tapa Removible 450ml',
        36000.00,
        50000.00,
        15,
        490,
        NULL,
        true
    )
ON CONFLICT (sku) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    supplier_sku = EXCLUDED.supplier_sku,
    variant_name = EXCLUDED.variant_name,
    wholesale_price = EXCLUDED.wholesale_price,
    retail_price = EXCLUDED.retail_price,
    stock_quantity = EXCLUDED.stock_quantity,
    weight_grams = EXCLUDED.weight_grams,
    image_url = COALESCE(product_variants.image_url, EXCLUDED.image_url),
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 4. ASOCIAR PRODUCTOS DE MARVEL A LA COLECCIÓN 'Marvel & Superhéroes'
-- ----------------------------------------------------------------------------

INSERT INTO product_collections (product_id, collection_id)
SELECT p.id, c.id 
FROM products p, collections c 
WHERE c.slug = 'marvel' 
  AND p.slug IN (
    'mug-marvel-black-panther',
    'mug-marvel-capitan-america',
    'mug-marvel-deadpool',
    'mug-marvel-iron-man-3d-v2',
    'mug-marvel-martillo-thor-mjolnir',
    'mug-marvel-spider-man-3d-con-tapa'
  )
ON CONFLICT (product_id, collection_id) DO NOTHING;

COMMIT;
