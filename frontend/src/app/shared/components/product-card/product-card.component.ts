import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductWithVariants } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { CopCurrencyPipe } from '../../pipes/cop-currency.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CopCurrencyPipe],
  template: `
    <div class="group bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      <!-- Badge de categoría y agotado -->
      <div class="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col items-start gap-1 max-w-[calc(100%-1rem)] pointer-events-none">
        @if (categoryBadge) {
          <span class="inline-flex items-center px-2 sm:px-2.5 py-0.5 bg-white/95 backdrop-blur-md text-[9px] sm:text-[11px] font-bold text-emerald-800 rounded-full shadow-xs border border-emerald-100/80 truncate max-w-full">
            {{ categoryBadge }}
          </span>
        }
        @if (!hasStock) {
          <span class="inline-flex items-center px-2 sm:px-2.5 py-0.5 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
            Agotado
          </span>
        }
      </div>

      <!-- Imagen -->
      <a [routerLink]="['/producto', product.slug]" class="block relative aspect-square bg-slate-50 overflow-hidden cursor-pointer">
        <img
          [src]="displayImage"
          [alt]="product.name"
          class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </a>

      <!-- Contenido -->
      <div class="p-3 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <a [routerLink]="['/producto', product.slug]" class="block">
            <h3 class="font-bold text-slate-900 text-xs sm:text-base line-clamp-1 group-hover:text-emerald-600 transition-colors" [title]="product.name">
              {{ product.name }}
            </h3>
          </a>
          <!-- Descripción con altura controlada para móvil y desktop -->
          <p class="text-slate-500 text-[11px] sm:text-xs line-clamp-1 sm:line-clamp-2 mt-1 leading-snug h-[1.15rem] sm:h-[2.25rem] overflow-hidden" [title]="product.short_description || product.description || ''">
            {{ product.short_description || product.description || 'Diseño exclusivo y calidad garantizada.' }}
          </p>
        </div>

        <div class="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div class="min-w-0 flex-1">
            <span class="text-[9px] sm:text-xs text-slate-400 block leading-none mb-0.5">Desde</span>
            <span class="text-xs sm:text-base font-black text-slate-900 truncate block leading-tight">
              {{ minPrice | copCurrency }}
            </span>
          </div>

          <a
            [routerLink]="['/producto', product.slug]"
            class="shrink-0 inline-flex items-center justify-center px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all duration-200 cursor-pointer"
          >
            <span class="hidden sm:inline">Ver opciones</span>
            <span class="sm:hidden">Ver</span>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductWithVariants;

  get displayImage(): string {
    if (this.product.featured_image_url) return this.product.featured_image_url;
    if (this.product.variants && this.product.variants.length > 0 && this.product.variants[0].image_url) {
      return this.product.variants[0].image_url;
    }
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop';
  }

  get minPrice(): number {
    if (!this.product.variants || this.product.variants.length === 0) return 0;
    return Math.min(...this.product.variants.map((v) => v.retail_price));
  }

  get hasStock(): boolean {
    if (!this.product.variants || this.product.variants.length === 0) return false;
    return this.product.variants.some((v) => v.stock_quantity > 0);
  }

  get categoryBadge(): string {
    const parent = this.product.parent_category_name;
    const cat = this.product.category_name;

    if (parent && cat) {
      // Normalizar categoría principal a 1 término para armonizar visualmente con "Mugs"
      const shortParent = parent.toLowerCase().includes('termo') ? 'Termos' : parent;

      // Normalizar subcategorías compuestas largas para que los globos tengan dimensiones similares
      let shortCat = cat;
      const lower = cat.toLowerCase();

      if (lower.includes('tumbler') || lower.includes('oficina')) {
        shortCat = 'Tumblers & Oficina';
      } else if (lower.includes('fitness') || lower.includes('gym') || lower.includes('deportivos')) {
        shortCat = 'Deportivos & Gym';
      } else if (lower.includes('animación') || lower.includes('personajes') || lower.includes('kawaii')) {
        shortCat = 'Animación & Kawaii';
      } else if (lower.includes('deportes') || lower.includes('temático')) {
        shortCat = 'Deportes';
      } else if (lower.includes('película') || lower.includes('series')) {
        shortCat = 'Películas & Series';
      } else if (lower.includes('animales') || lower.includes('mascotas')) {
        shortCat = 'Animales';
      }

      return `${shortParent} • ${shortCat}`;
    }

    return cat || parent || '';
  }
}
