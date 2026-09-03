-- ============================================================================
-- ESQUEMA DE BASE DE DATOS: HOMIE E-COMMERCE (PostgreSQL)
-- ============================================================================

-- 1. FUNCIONES DE UTILIDAD
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 2. TABLAS DE CATÁLOGO Y PRODUCTOS
-- ============================================================================

-- Categorías (Mugs, Termos, Botilos, Cocina/Hogar, etc.)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Productos base
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(300),
    featured_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Variantes de producto
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    supplier_sku VARCHAR(100),            -- Código de referencia del proveedor en Bogotá (ej. AYHH432)
    variant_name VARCHAR(150) NOT NULL,   -- Ej. "Capibara 3D - 400ml - Café" o "Termo Inox 600ml - Negro"
    wholesale_price NUMERIC(12, 2) NOT NULL CHECK (wholesale_price >= 0),
    retail_price NUMERIC(12, 2) NOT NULL CHECK (retail_price >= 0),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    weight_grams INT DEFAULT 350,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CLIENTES Y GESTIÓN DE PEDIDOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30) NOT NULL,
    document_id VARCHAR(30),
    address TEXT NOT NULL,
    neighborhood VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE RESTRICT,
    order_code VARCHAR(30) UNIQUE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost NUMERIC(12, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
    discount_amount NUMERIC(12, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    order_status VARCHAR(50) DEFAULT 'PENDIENTE' 
        CHECK (order_status IN ('PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO', 'CANCELADO')),
    payment_status VARCHAR(50) DEFAULT 'PENDIENTE' 
        CHECK (payment_status IN ('PENDIENTE', 'PAGADO', 'CONTRAENTREGA', 'RECHAZADO', 'REEMBOLSADO')),
    payment_method VARCHAR(50) 
        CHECK (payment_method IN ('WOMPI', 'NEQUI', 'PSE', 'CONTRAENTREGA', 'TRANSFERENCIA', 'TARJETA')),
    shipping_carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(250) NOT NULL,
    variant_name_snapshot VARCHAR(150) NOT NULL,
    sku_snapshot VARCHAR(100) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. REABASTECIMIENTO Y LOTES CON PROVEEDOR (BOGOTÁ)
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_batches (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(150) DEFAULT 'Importaciones Bogotá',
    status VARCHAR(50) DEFAULT 'EN_ACUMULACION' 
        CHECK (status IN ('EN_ACUMULACION', 'PEDIDO_A_PROVEEDOR', 'EN_TRANSITO', 'RECIBIDO_EN_BODEGA', 'CANCELADO')),
    total_units INT DEFAULT 0 CHECK (total_units >= 0),
    total_cost NUMERIC(12, 2) DEFAULT 0 CHECK (total_cost >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_batch_items (
    id SERIAL PRIMARY KEY,
    batch_id INT NOT NULL REFERENCES supplier_batches(id) ON DELETE CASCADE,
    variant_id INT REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity_ordered INT NOT NULL CHECK (quantity_ordered > 0),
    unit_cost_agreed NUMERIC(12, 2) NOT NULL CHECK (unit_cost_agreed >= 0),
    quantity_received INT DEFAULT 0 CHECK (quantity_received >= 0)
);

-- ============================================================================
-- 5. ÍNDICES DE RENDIMIENTO
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================================================
-- 6. TRIGGERS PARA TIMESTAMP AUTOMÁTICO
-- ============================================================================

DROP TRIGGER IF EXISTS update_categories_modtime ON categories;
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_variants_modtime ON product_variants;
CREATE TRIGGER update_variants_modtime BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_modtime ON customers;
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_modtime ON orders;
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_batches_modtime ON supplier_batches;
CREATE TRIGGER update_batches_modtime BEFORE UPDATE ON supplier_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. VISTA FINANCIERA (UTILIDAD NETA)
-- ============================================================================

CREATE OR REPLACE VIEW v_order_financial_summary AS
SELECT 
    o.id AS order_id,
    o.order_code,
    o.created_at,
    o.order_status,
    o.payment_status,
    CASE WHEN o.order_status = 'CANCELADO' THEN 0 ELSE o.total_amount END AS revenue_total,
    CASE WHEN o.order_status = 'CANCELADO' THEN 0 ELSE COALESCE(SUM(oi.unit_cost * oi.quantity), 0) END AS total_cogs_mayorista,
    CASE WHEN o.order_status = 'CANCELADO' THEN 0 ELSE o.shipping_cost END AS shipping_cost,
    CASE WHEN o.order_status = 'CANCELADO' THEN 0 ELSE (o.total_amount - COALESCE(SUM(oi.unit_cost * oi.quantity), 0) - o.shipping_cost) END AS gross_profit
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_code, o.created_at, o.order_status, o.payment_status, o.total_amount, o.shipping_cost;