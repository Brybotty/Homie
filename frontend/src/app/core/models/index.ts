export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
}

export interface Product {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  featured_image_url: string | null;
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  supplier_sku: string | null;
  variant_name: string;
  wholesale_price: number;
  retail_price: number;
  stock_quantity: number;
  weight_grams: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon_svg: string | null;
  badge: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
  product_ids?: number[];
}

export interface CreateCollectionDto {
  name: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  icon_svg?: string | null;
  badge?: string | null;
  display_order?: number;
  is_active?: boolean;
  product_ids?: number[];
}

export interface UpdateCollectionDto extends Partial<CreateCollectionDto> {}

export interface ProductWithVariants extends Product {
  category_name?: string | null;
  category_slug?: string | null;
  category_parent_id?: number | null;
  parent_category_name?: string | null;
  variants: ProductVariant[];
  collection_ids?: number[];
}

export interface Customer {
  id: number;
  full_name: string;
  email: string | null;
  phone: string;
  document_id: string | null;
  address: string;
  neighborhood: string | null;
  city: string;
  department: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'DESPACHADO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type PaymentStatus =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'CONTRAENTREGA'
  | 'RECHAZADO'
  | 'REEMBOLSADO';

export type PaymentMethod =
  | 'WOMPI'
  | 'NEQUI'
  | 'PSE'
  | 'CONTRAENTREGA'
  | 'TRANSFERENCIA'
  | 'TARJETA';

export interface Order {
  id: number;
  customer_id: number;
  order_code: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  shipping_carrier: string | null;
  tracking_number: string | null;
  delivery_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number | null;
  product_name_snapshot: string;
  variant_name_snapshot: string;
  sku_snapshot: string;
  unit_price: number;
  unit_cost: number;
  quantity: number;
  total_price: number;
  created_at: string;
}

export interface OrderDetail extends Order {
  customer: Customer;
  items: OrderItem[];
}

export interface CreateVariantDto {
  sku: string;
  supplier_sku?: string;
  variant_name: string;
  wholesale_price: number;
  retail_price: number;
  stock_quantity?: number;
  weight_grams?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface UpdateVariantDto {
  id?: number;
  sku?: string;
  supplier_sku?: string | null;
  variant_name?: string;
  wholesale_price?: number;
  retail_price?: number;
  stock_quantity?: number;
  weight_grams?: number;
  image_url?: string | null;
  is_active?: boolean;
}

export interface CreateProductDto {
  category_id?: number | null;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  featured_image_url?: string;
  is_active?: boolean;
  collection_ids?: number[];
  variants: CreateVariantDto[];
}

export interface UpdateProductDto {
  category_id?: number | null;
  name?: string;
  slug?: string;
  description?: string | null;
  short_description?: string | null;
  featured_image_url?: string | null;
  is_active?: boolean;
  collection_ids?: number[];
  variants?: UpdateVariantDto[];
}

export interface CreateOrderItemDto {
  variant_id: number;
  quantity: number;
}

export interface CustomerDataDto {
  full_name: string;
  phone: string;
  email?: string;
  document_id?: string;
  address: string;
  neighborhood?: string;
  city: string;
  department: string;
  notes?: string;
}

export interface CreateOrderDto {
  customer: CustomerDataDto;
  items: CreateOrderItemDto[];
  shipping_cost?: number;
  discount_amount?: number;
  payment_method?: PaymentMethod;
  delivery_notes?: string;
}

export interface UpdateOrderStatusDto {
  order_status?: OrderStatus;
  payment_status?: PaymentStatus;
  shipping_carrier?: string;
  tracking_number?: string;
  delivery_notes?: string;
}

export interface OrderFinancialSummary {
  order_id: number;
  order_code: string;
  created_at: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  revenue_total: number;
  total_cogs_mayorista: number;
  shipping_cost: number;
  gross_profit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
}
