import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductStateService } from '../../../core/services/product-state.service';
import { CopCurrencyPipe } from '../../pipes/cop-currency.pipe';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, CopCurrencyPipe],
  template: `
    @if (cart.isOpen()) {
      <!-- Backdrop -->
      <div
        (click)="cart.closeCart()"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity duration-300"
      ></div>

      <!-- Drawer -->
      <aside
        class="fixed inset-y-0 right-0 max-w-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out"
      >
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-extrabold text-slate-900">Tu Carrito</h2>
            <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              {{ cart.count() }}
            </span>
          </div>
          <button
            (click)="cart.closeCart()"
            class="p-2 text-slate-600 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          @if (cart.items().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-center py-12">
              <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-800">Tu carrito está vacío</h3>
              <p class="text-sm text-slate-600 mt-1 max-w-[220px]">
                Explora nuestras colecciones y llena tu hogar de magia.
              </p>
              <button
                (click)="cart.closeCart()"
                class="mt-6 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Explorar Catálogo
              </button>
            </div>
          } @else {
            @for (item of cart.items(); track item.variant_id) {
              <div class="flex gap-4 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                <img
                  [src]="getItemImage(item)"
                  [alt]="item.product_name"
                  (error)="onImgError($event)"
                  class="w-20 h-20 object-contain p-1 rounded-xl bg-white border border-slate-200"
                />
                <div class="flex-1 flex flex-col justify-between">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-sm font-bold text-slate-900 line-clamp-1">{{ item.product_name }}</h4>
                      <p class="text-xs text-slate-500 font-medium">{{ item.variant_name }}</p>
                    </div>
                    <button
                      (click)="cart.removeItem(item.variant_id)"
                      class="text-slate-600 hover:text-rose-500 transition-colors p-1"
                      title="Eliminar"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div class="flex items-center justify-between mt-2">
                    <span class="text-sm font-extrabold text-slate-900">
                      {{ item.retail_price * item.quantity | copCurrency }}
                    </span>

                    <div class="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        (click)="cart.updateQuantity(item.variant_id, item.quantity - 1)"
                        class="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                      >
                        -
                      </button>
                      <span class="px-2.5 text-xs font-bold text-slate-800">{{ item.quantity }}</span>
                      <button
                        (click)="cart.updateQuantity(item.variant_id, item.quantity + 1)"
                        class="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                        [disabled]="item.quantity >= item.max_stock"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <!-- Footer / Checkout button -->
        @if (cart.items().length > 0) {
          <div class="p-6 border-t border-slate-100 bg-white space-y-4">
            <div class="space-y-1.5">
              <div class="flex justify-between text-sm text-slate-500 font-medium">
                <span>Subtotal</span>
                <span class="text-slate-900 font-semibold">{{ cart.total() | copCurrency }}</span>
              </div>
              <div class="flex justify-between text-sm text-slate-500 font-medium">
                <span>Envío</span>
                <span class="text-emerald-600 font-bold text-xs">Desde $8.000 (Cali) / $12.000 Nal.</span>
              </div>
              <div class="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Estimado</span>
                <span class="text-emerald-600 text-lg">{{ cart.total() | copCurrency }}</span>
              </div>
            </div>

            <a
              [routerLink]="['/checkout']"
              (click)="cart.closeCart()"
              class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <span>Continuar al Pago</span>
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        }
      </aside>
    }
  `,
})
export class CartSidebarComponent {
  cart = inject(CartService);
  private productState = inject(ProductStateService);

  getItemImage(item: any): string {
    if (item.image_url && item.image_url.trim()) {
      return item.image_url;
    }
    // Buscar en el estado global de productos para recuperar la imagen real
    const prod = this.productState.products().find(
      (p) =>
        p.name.toLowerCase() === item.product_name.toLowerCase() ||
        p.variants.some((v) => v.id === item.variant_id || v.sku === item.sku)
    );
    const found = prod?.featured_image_url || prod?.variants.find((v) => v.id === item.variant_id)?.image_url;
    if (found) {
      this.cart.updateItemImage(item.variant_id, found);
      return found;
    }
    return '/HomieIcon.png';
  }

  onImgError(event: any): void {
    event.target.src = '/HomieIcon.png';
  }
}
