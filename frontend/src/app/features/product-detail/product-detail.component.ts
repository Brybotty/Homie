import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { ProductStateService } from '../../core/services/product-state.service';
import { ProductWithVariants, ProductVariant } from '../../core/models';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CopCurrencyPipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8 flex-wrap">
        <a routerLink="/" class="hover:text-emerald-600 transition-colors">Inicio</a>
        <span>/</span>
        <a routerLink="/" class="hover:text-emerald-600 transition-colors">Catálogo</a>
        @if (product()?.parent_category_name) {
          <span>/</span>
          <span class="text-slate-600 font-medium">{{ product()!.parent_category_name }}</span>
        }
        @if (product()?.category_name) {
          <span>/</span>
          <span class="text-slate-600 font-medium">{{ product()!.category_name }}</span>
        }
        <span>/</span>
        <span class="text-slate-900 font-semibold truncate">{{ product()?.name || 'Cargando...' }}</span>
      </nav>

      @if (loading()) {
        <!-- Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 animate-pulse">
          <div class="aspect-square bg-slate-200 rounded-3xl"></div>
          <div class="space-y-6">
            <div class="h-8 bg-slate-200 rounded-lg w-3/4"></div>
            <div class="h-6 bg-slate-200 rounded-lg w-1/4"></div>
            <div class="h-24 bg-slate-100 rounded-xl"></div>
            <div class="h-12 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      } @else if (error() || !product()) {
        <div class="py-20 text-center space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">Producto no encontrado</h2>
          <p class="text-slate-500 text-sm">El producto que buscas no existe o ha sido desactivado.</p>
          <a routerLink="/" class="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
            Volver a la Tienda
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <!-- Galería / Imagen Principal -->
          <div class="space-y-4">
            <div class="aspect-square bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden relative">
              <img
                [src]="currentImage()"
                [alt]="product()!.name"
                class="w-full h-full object-cover object-center"
              />
              @if (currentVariant() && currentVariant()!.stock_quantity <= 0) {
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                  <span class="px-4 py-2 bg-rose-600 text-white font-bold text-sm rounded-xl shadow-lg">
                    Agotado en esta variante
                  </span>
                </div>
              }
            </div>

            <!-- Miniaturas de variantes -->
            @if (product()!.variants.length > 1) {
              <div class="flex items-center gap-3 overflow-x-auto pb-2">
                @for (v of product()!.variants; track v.id) {
                  <button
                    (click)="selectVariant(v)"
                    [ngClass]="currentVariant()?.id === v.id ? 'ring-2 ring-emerald-600 ring-offset-2' : 'opacity-70 hover:opacity-100'"
                    class="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 transition-all cursor-pointer"
                  >
                    <img
                      [src]="v.image_url || product()!.featured_image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=200&auto=format&fit=crop'"
                      [alt]="v.variant_name"
                      class="w-full h-full object-cover"
                    />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Información de Compra -->
          <div class="flex flex-col justify-between space-y-6">
            <div class="space-y-4">
              @if (product()!.parent_category_name && product()!.category_name) {
                <span class="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider border border-emerald-200">
                  {{ product()!.parent_category_name }} • {{ product()!.category_name }}
                </span>
              } @else if (product()!.category_name) {
                <span class="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {{ product()!.category_name }}
                </span>
              }

              <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {{ product()!.name }}
              </h1>

              <!-- Precio y Stock -->
              <div class="flex items-baseline gap-4 pt-2">
                <span class="text-3xl sm:text-4xl font-black text-slate-900">
                  {{ currentPrice() | copCurrency }}
                </span>

                @if (currentVariant()) {
                  @if (currentVariant()!.stock_quantity > 0) {
                    <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {{ currentVariant()!.stock_quantity }} unidades disponibles
                    </span>
                  } @else {
                    <span class="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                      Sin unidades disponibles
                    </span>
                  }
                }
              </div>

              <!-- Descripción -->
              <div class="prose prose-sm text-slate-600 leading-relaxed pt-2">
                <p>{{ product()!.description || product()!.short_description || 'Sin descripción detallada.' }}</p>
              </div>

              <!-- Selector de Variantes (Botones) -->
              @if (product()!.variants.length > 0) {
                <div class="space-y-3 pt-4 border-t border-slate-100">
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Selecciona tu modelo / color:
                  </label>
                  <div class="flex flex-wrap gap-2.5">
                    @for (v of product()!.variants; track v.id) {
                      <button
                        (click)="selectVariant(v)"
                        [disabled]="!v.is_active"
                        [ngClass]="{
                          'bg-slate-900 text-white shadow-md': currentVariant()?.id === v.id,
                          'bg-white text-slate-700 border border-slate-200 hover:border-slate-400': currentVariant()?.id !== v.id,
                          'opacity-40 cursor-not-allowed': !v.is_active
                        }"
                        class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>{{ v.variant_name }}</span>
                        @if (v.stock_quantity <= 0) {
                          <span class="text-[10px] text-rose-400 font-bold">(Agotado)</span>
                        }
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Selector de Cantidad -->
              <div class="space-y-2 pt-2">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cantidad:
                </label>
                <div class="flex items-center gap-4">
                  <div class="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      (click)="decreaseQty()"
                      class="w-9 h-9 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span class="w-12 text-center font-bold text-sm text-slate-900">{{ quantity() }}</span>
                    <button
                      (click)="increaseQty()"
                      class="w-9 h-9 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      [disabled]="currentVariant() ? quantity() >= currentVariant()!.stock_quantity : true"
                    >
                      +
                    </button>
                  </div>

                  @if (currentVariant()) {
                    <span class="text-xs text-slate-600">
                      SKU: <span class="font-mono text-slate-700">{{ currentVariant()!.sku }}</span>
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="space-y-3 pt-6 border-t border-slate-100">
              <button
                (click)="addToCart()"
                [disabled]="!canAddToCart"
                [ngClass]="canAddToCart ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                class="w-full py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>{{ canAddToCart ? 'Agregar al Carrito (' + (currentPrice() * quantity() | copCurrency) + ')' : 'Variante Agotada' }}</span>
              </button>

              <div class="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-500">
                <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Pago Contraentrega Seguro</span>
                </div>
                <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Despacho 24-48 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cart = inject(CartService);
  private productState = inject(ProductStateService);

  product = signal<ProductWithVariants | null>(null);
  currentVariant = signal<ProductVariant | null>(null);
  quantity = signal<number>(1);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  currentPrice = computed(() => {
    return this.currentVariant()?.retail_price || 0;
  });

  currentImage = computed(() => {
    const v = this.currentVariant();
    if (v && v.image_url) return v.image_url;
    const p = this.product();
    if (p && p.featured_image_url) return p.featured_image_url;
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop';
  });

  get canAddToCart(): boolean {
    const v = this.currentVariant();
    return !!v && v.is_active && v.stock_quantity >= this.quantity();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.productState.currentDetailProduct.set(null);
    this.productState.currentDetailVariant.set(null);
  }

  loadProduct(slug: string): void {
    this.loading.set(true);
    this.api.getProductBySlug(slug).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.product.set(res.data);
          this.productState.currentDetailProduct.set(res.data);
          if (res.data.variants && res.data.variants.length > 0) {
            this.currentVariant.set(res.data.variants[0]);
            this.productState.currentDetailVariant.set(res.data.variants[0]);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Error cargando el producto');
        this.loading.set(false);
      },
    });
  }

  selectVariant(variant: ProductVariant): void {
    this.currentVariant.set(variant);
    this.productState.currentDetailVariant.set(variant);
    this.quantity.set(1);
  }

  increaseQty(): void {
    const v = this.currentVariant();
    if (v && this.quantity() < v.stock_quantity) {
      this.quantity.update((q) => q + 1);
    }
  }

  decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart(): void {
    const p = this.product();
    const v = this.currentVariant();
    if (p && v && this.canAddToCart) {
      const img = this.currentImage() || v.image_url || p.featured_image_url;
      this.cart.addItem(v, p.name, this.quantity(), img);
    }
  }
}
