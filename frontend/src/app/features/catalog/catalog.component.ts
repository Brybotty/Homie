import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductStateService } from '../../core/services/product-state.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { FeaturedBannerSliderComponent } from './components/featured-banner-slider/featured-banner-slider.component';
import { ThematicCollectionsComponent } from './components/thematic-collections/thematic-collections.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    FeaturedBannerSliderComponent,
    ThematicCollectionsComponent,
  ],
  template: `
    <div class="space-y-6 sm:space-y-10 pb-16">
      <!-- ─── SLIDER DINÁMICO DE ARTÍCULOS DESTACADOS ────────────────── -->
      <section class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
        <app-featured-banner-slider></app-featured-banner-slider>
      </section>

      <!-- ─── BARRA DE BÚSQUEDA & COLECCIONES TEMÁTICAS ──────────────── -->
      <section class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        <!-- Barra de Búsqueda Rápida Mobile-First -->
        <div class="relative flex items-center max-w-2xl mx-auto w-full">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Buscar por anime, marvel, videojuegos, termos, mugs..."
            class="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs text-xs sm:text-sm transition-all"
          />
          <svg class="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          @if (searchQuery) {
            <button
              (click)="searchQuery = ''; onSearchChange('')"
              class="absolute right-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          }
        </div>

        <!-- Barra Horizontal de Colecciones Circulares (Estilo Instagram Stories) -->
        <app-thematic-collections></app-thematic-collections>
      </section>

      <!-- ─── Main Catalog Content ──────────────────────────────────── -->
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        
        <!-- Categorías Principales (Nivel 1) -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" style="-ms-overflow-style: none; scrollbar-width: none;">
            <!-- Botón Todos -->
            <button
              (click)="selectCategory(null)"
              [ngClass]="state.selectedCategorySlug() === null ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
              class="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <span>Todos los Productos</span>
            </button>

            <!-- Categorías Padre (Mugs, Termos, Hogar, etc.) -->
            @for (parent of state.parentCategories(); track parent.id) {
              <button
                (click)="selectCategory(parent.slug)"
                [ngClass]="state.activeParentCategory()?.id === parent.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'"
                class="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>{{ parent.name }}</span>
              </button>
            }
          </div>

          <!-- Subcategorías Dinámicas (Nivel 2) -->
          @if (state.activeSubcategories().length > 0) {
            <div class="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center gap-2 overflow-x-auto scrollbar-none animate-fade-in" style="-ms-overflow-style: none; scrollbar-width: none;">
              <span class="text-xs font-bold text-emerald-400 shrink-0 px-1 flex items-center gap-1">
                <span>Colecciones de {{ state.activeParentCategory()!.name }}:</span>
              </span>

              <!-- Ver Todos los de la categoría padre -->
              <button
                (click)="selectCategory(state.activeParentCategory()!.slug)"
                [ngClass]="state.selectedCategorySlug() === state.activeParentCategory()!.slug ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'"
                class="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0"
              >
                Todos los {{ state.activeParentCategory()!.name }}
              </button>

              <!-- Lista de Subcategorías -->
              @for (sub of state.activeSubcategories(); track sub.id) {
                <button
                  (click)="selectCategory(sub.slug)"
                  [ngClass]="state.selectedCategorySlug() === sub.slug ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0"
                >
                  {{ sub.name }}
                </button>
              }
            </div>
          }
        </div>

        <!-- Active Filter indicator if thematic is active -->
        @if (state.selectedThematic()) {
          <div class="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-2.5">
            <div class="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <span>Filtrando por colección:</span>
              <span class="uppercase tracking-wider px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px]">
                {{ state.selectedThematic() }}
              </span>
            </div>
            <button
              (click)="state.setThematic(null)"
              class="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline"
            >
              Mostrar todo
            </button>
          </div>
        }

        <!-- Products Grid (Mobile-First: 2 columnas con gap optimizado) -->
        @if (state.loading()) {
          <!-- Skeleton Loading -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            @for (item of [1, 2, 3, 4, 5, 6, 7, 8]; track item) {
              <div class="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-100 space-y-3 animate-pulse">
                <div class="aspect-square bg-slate-200 rounded-xl"></div>
                <div class="h-4 bg-slate-200 rounded-md w-3/4"></div>
                <div class="h-3 bg-slate-100 rounded-md w-1/2"></div>
                <div class="h-8 bg-slate-200 rounded-xl w-full mt-2"></div>
              </div>
            }
          </div>
        } @else if (state.error()) {
          <div class="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-700">
            <p class="font-bold">{{ state.error() }}</p>
            <button
              (click)="state.loadProducts()"
              class="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        } @else if (state.filteredProducts().length === 0) {
          <div class="py-16 text-center space-y-4">
            <div class="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-800">No encontramos productos</h3>
            <p class="text-sm text-slate-500">Prueba con otra búsqueda o limpia los filtros activos.</p>
            <div class="flex items-center justify-center gap-3 pt-2">
              <button
                (click)="searchQuery = ''; onSearchChange(''); state.setThematic(null); selectCategory(null)"
                class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-emerald-600/20 transition-all"
              >
                Ver todos los productos
              </button>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            @for (product of state.filteredProducts(); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class CatalogComponent implements OnInit {
  state = inject(ProductStateService);
  searchQuery = '';

  ngOnInit(): void {
    this.state.loadCategories();
    this.state.loadCollections();
    this.state.loadProducts();
  }

  selectCategory(slug: string | null): void {
    this.state.setCategory(slug);
  }

  onSearchChange(query: string): void {
    this.state.setSearch(query);
  }
}
