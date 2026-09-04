import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PaginatedResponse,
  Category,
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto,
  ProductWithVariants,
  CreateProductDto,
  UpdateProductDto,
  UpdateVariantDto,
  UpdateOrderStatusDto,
  OrderDetail,
  CreateOrderDto,
  ProductVariant,
  OrderFinancialSummary,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Categories
  getCategories(onlyActive = true): Observable<ApiResponse<Category[]>> {
    const params = new HttpParams().set('active', onlyActive.toString());
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/categories`, { params });
  }

  createCategory(category: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.baseUrl}/categories`, category);
  }

  // Collections (Colecciones estilo Stories / Temáticas)
  getCollections(onlyActive = true): Observable<ApiResponse<Collection[]>> {
    const params = new HttpParams().set('active', onlyActive.toString());
    return this.http.get<ApiResponse<Collection[]>>(`${this.baseUrl}/collections`, { params });
  }

  getAllCollectionsAdmin(): Observable<ApiResponse<Collection[]>> {
    return this.http.get<ApiResponse<Collection[]>>(`${this.baseUrl}/collections`);
  }

  getCollectionById(id: number): Observable<ApiResponse<Collection>> {
    return this.http.get<ApiResponse<Collection>>(`${this.baseUrl}/collections/${id}`);
  }

  getCollectionBySlug(slug: string): Observable<ApiResponse<Collection>> {
    return this.http.get<ApiResponse<Collection>>(`${this.baseUrl}/collections/slug/${slug}`);
  }

  createCollection(dto: CreateCollectionDto): Observable<ApiResponse<Collection>> {
    return this.http.post<ApiResponse<Collection>>(`${this.baseUrl}/collections`, dto);
  }

  updateCollection(id: number, dto: UpdateCollectionDto): Observable<ApiResponse<Collection>> {
    return this.http.put<ApiResponse<Collection>>(`${this.baseUrl}/collections/${id}`, dto);
  }

  setCollectionProducts(id: number, product_ids: number[]): Observable<ApiResponse<Collection>> {
    return this.http.post<ApiResponse<Collection>>(`${this.baseUrl}/collections/${id}/products`, { product_ids });
  }

  deleteCollection(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/collections/${id}`);
  }

  // Products
  getProducts(options?: {
    category?: string;
    collection?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<ProductWithVariants>> {
    let params = new HttpParams();
    if (options?.category) params = params.set('category', options.category);
    if (options?.collection) params = params.set('collection', options.collection);
    if (options?.active !== undefined) params = params.set('active', options.active.toString());
    if (options?.page) params = params.set('page', options.page.toString());
    if (options?.limit) params = params.set('limit', options.limit.toString());

    return this.http.get<PaginatedResponse<ProductWithVariants>>(`${this.baseUrl}/products`, { params });
  }

  getProductBySlug(slug: string): Observable<ApiResponse<ProductWithVariants>> {
    return this.http.get<ApiResponse<ProductWithVariants>>(`${this.baseUrl}/products/${slug}`);
  }

  createProduct(dto: CreateProductDto): Observable<ApiResponse<ProductWithVariants>> {
    return this.http.post<ApiResponse<ProductWithVariants>>(`${this.baseUrl}/products`, dto);
  }

  updateProduct(id: number, dto: UpdateProductDto): Observable<ApiResponse<ProductWithVariants>> {
    return this.http.put<ApiResponse<ProductWithVariants>>(`${this.baseUrl}/products/${id}`, dto);
  }

  reorderProducts(productIds: number[]): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/products/reorder`, { product_ids: productIds });
  }

  updateVariant(variantId: number, dto: UpdateVariantDto): Observable<ApiResponse<ProductVariant>> {
    return this.http.put<ApiResponse<ProductVariant>>(`${this.baseUrl}/products/variants/${variantId}`, dto);
  }

  updateVariantStock(variantId: number, stock_quantity: number): Observable<ApiResponse<ProductVariant>> {
    return this.http.patch<ApiResponse<ProductVariant>>(`${this.baseUrl}/products/variants/${variantId}/stock`, {
      stock_quantity,
    });
  }

  // Orders
  createOrder(dto: CreateOrderDto): Observable<ApiResponse<OrderDetail>> {
    return this.http.post<ApiResponse<OrderDetail>>(`${this.baseUrl}/orders`, dto);
  }

  getOrders(options?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<OrderDetail>> {
    let params = new HttpParams();
    if (options?.status && options.status !== 'ALL') params = params.set('status', options.status);
    if (options?.page) params = params.set('page', options.page.toString());
    if (options?.limit) params = params.set('limit', options.limit.toString());

    return this.http.get<PaginatedResponse<OrderDetail>>(`${this.baseUrl}/orders`, { params });
  }

  getOrderById(id: number): Observable<ApiResponse<OrderDetail>> {
    return this.http.get<ApiResponse<OrderDetail>>(`${this.baseUrl}/orders/${id}`);
  }

  updateOrderStatus(id: number, dto: UpdateOrderStatusDto): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/orders/${id}/status`, dto);
  }

  getFinancialSummary(): Observable<ApiResponse<OrderFinancialSummary[]>> {
    return this.http.get<ApiResponse<OrderFinancialSummary[]>>(`${this.baseUrl}/orders/financial/summary`);
  }

  syncWompiOrder(id: number): Observable<ApiResponse<OrderDetail>> {
    return this.http.post<ApiResponse<OrderDetail>>(`${this.baseUrl}/orders/${id}/sync-wompi`, {});
  }
}
