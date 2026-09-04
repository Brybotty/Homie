import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ProductWithVariants, Category, Collection, ProductVariant, CreateProductDto, UpdateProductDto } from '../../../core/models';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'app-product-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, CopCurrencyPipe],
  template: `
    <div class="space-y-8">
      <!-- ─── Header & Top Actions ─────────────────────────────────── -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight">Gestor de Productos</h1>
          <p class="text-slate-400 text-sm mt-1">
            Administra precios, stock, imágenes y descripciones de todos los productos y subcategorías.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="openCreateModal()"
            class="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <!-- ─── Toast / Notification Alert ────────────────────────────── -->
      @if (toast()) {
        <div
          class="p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg transition-all animate-fade-in"
          [ngClass]="toast()!.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'"
        >
          <div class="flex items-center gap-2">
            @if (toast()!.type === 'success') {
              <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            } @else {
              <svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            <span>{{ toast()!.message }}</span>
          </div>
          <button (click)="toast.set(null)" class="text-slate-400 hover:text-white ml-4">✕</button>
        </div>
      }

      <!-- ─── Metrics Dashboard Quick Bar ──────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <p class="text-xs text-slate-400 font-medium">Total Productos</p>
          <p class="text-2xl font-black text-white mt-1">{{ products().length }}</p>
        </div>
        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <p class="text-xs text-slate-400 font-medium">Total Variantes</p>
          <p class="text-2xl font-black text-emerald-400 mt-1">{{ totalVariantsCount() }}</p>
        </div>
        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <p class="text-xs text-slate-400 font-medium">Unidades en Stock</p>
          <p class="text-2xl font-black text-blue-400 mt-1">{{ totalStockUnits() }}</p>
        </div>
        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <p class="text-xs text-slate-400 font-medium">Variantes Sin Stock</p>
          <p class="text-2xl font-black text-rose-400 mt-1">{{ outOfStockCount() }}</p>
        </div>
      </div>

      <!-- ─── Search & Filters Bar ─────────────────────────────────── -->
      <div class="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <!-- Search Input -->
        <div class="relative flex-1">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por nombre, SKU, código de mayorista o slug..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          />
          <svg class="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Filter Category (Jerárquico) -->
        <div class="flex items-center gap-2">
          <select
            [(ngModel)]="selectedCategorySlug"
            class="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Todas las Categorías</option>
            @for (parent of parentCategories(); track parent.id) {
              <optgroup [label]="'☕ ' + parent.name">
                <option [value]="parent.slug">Todos los {{ parent.name }}</option>
                @for (sub of getSubcategoriesFor(parent.id); track sub.id) {
                  <option [value]="sub.slug">{{ parent.name }} → {{ sub.name }}</option>
                }
              </optgroup>
            }
          </select>

          <!-- Filter Stock -->
          <select
            [(ngModel)]="stockFilter"
            class="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Todos los Stocks</option>
            <option value="IN_STOCK">Con Stock (>0)</option>
            <option value="OUT_OF_STOCK">Agotados (0)</option>
          </select>
        </div>
      </div>

      <!-- ─── Product Inventory List ────────────────────────────────── -->
      <div class="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-white">Catálogo de Productos</h2>
            <span class="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
              {{ filteredProducts().length }} de {{ products().length }}
            </span>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            @if (hasUnsavedOrder()) {
              <button
                (click)="saveOrder()"
                [disabled]="isSavingOrder()"
                class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer animate-pulse"
              >
                <span>💾</span>
                <span>{{ isSavingOrder() ? 'Guardando orden...' : 'Guardar Nuevo Orden' }}</span>
              </button>
            }
            <div class="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <span class="text-emerald-400 font-bold">↕️ Arrastrar para organizar:</span>
              <span>Usa el control ⋮⋮ o las flechas ▲▼ para acomodar el orden en la tienda</span>
            </div>
            @if (isLoading()) {
              <span class="text-xs text-emerald-400 font-semibold animate-pulse">Cargando catálogo...</span>
            }
          </div>
        </div>

        @if (filteredProducts().length === 0 && !isLoading()) {
          <div class="py-16 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p class="text-slate-400 text-sm font-semibold">No se encontraron productos con los filtros aplicados.</p>
            <button
              (click)="resetFilters()"
              class="px-4 py-2 bg-slate-800 text-emerald-400 rounded-xl text-xs font-bold hover:bg-slate-700"
            >
              Restablecer Filtros
            </button>
          </div>
        } @else {
          <div class="space-y-4">
            @for (product of filteredProducts(); track product.id; let idx = $index) {
              <div
                class="p-5 bg-slate-900 rounded-2xl border transition-all duration-200 space-y-4"
                [ngClass]="{
                  'border-slate-800/80 hover:border-slate-700': dragOverIndex() !== idx,
                  'border-emerald-500 bg-emerald-950/20 scale-[1.01] shadow-lg shadow-emerald-500/10': dragOverIndex() === idx,
                  'opacity-40': draggedIndex() === idx
                }"
                (dragover)="onDragOver($event, idx)"
                (dragleave)="onDragLeave(idx)"
                (drop)="onDrop($event, idx)"
                (dragend)="onDragEnd()"
              >
                <!-- Product Header Row -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex items-start gap-3 sm:gap-4">
                    <!-- Control Arrastrar & Soltar + Número de Orden Editable -->
                    <div
                      class="flex flex-col items-center justify-center gap-1 shrink-0 p-1.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/80 transition-all select-none"
                      title="Escribe un número para mover la posición directamente, o arrastra con las flechas"
                    >
                      <div class="flex items-center gap-0.5" title="Escribe el número de posición y presiona Enter">
                        <span class="text-[9px] font-bold text-slate-500">#</span>
                        <input
                          type="number"
                          [value]="idx + 1"
                          min="1"
                          [max]="products().length"
                          (click)="$event.stopPropagation()"
                          (change)="onOrderInputChange(product, idx, $event)"
                          (keydown.enter)="onOrderInputEnter($event)"
                          class="w-11 text-center py-0.5 px-0.5 bg-slate-900 border border-slate-700 hover:border-emerald-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded text-[11px] font-mono font-black text-emerald-400 focus:outline-none transition-all cursor-text"
                        />
                      </div>
                      <div
                        class="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white"
                        draggable="true"
                        (dragstart)="onDragStart($event, idx)"
                        title="Arrastra para cambiar el orden"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      
                      <!-- Mini flechas subir/bajar para accesibilidad y dispositivos móviles -->
                      <div class="flex flex-col gap-0.5">
                        <button
                          type="button"
                          (click)="$event.stopPropagation(); moveProduct(product, -1)"
                          [disabled]="idx === 0"
                          class="px-1 py-0.2 rounded hover:bg-slate-700 text-[9px] text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Mover una posición arriba"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          (click)="$event.stopPropagation(); moveProduct(product, 1)"
                          [disabled]="idx === filteredProducts().length - 1"
                          class="px-1 py-0.2 rounded hover:bg-slate-700 text-[9px] text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Mover una posición abajo"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <!-- Image with preview -->
                    <div class="relative group shrink-0">
                      <img
                        [src]="product.featured_image_url || 'HomieIcon.png'"
                        [alt]="product.name"
                        class="w-16 h-16 rounded-xl object-contain bg-slate-950 border border-slate-800 p-1"
                        (error)="onImgError($event)"
                      />
                    </div>

                    <div class="space-y-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="font-bold text-white text-base leading-snug">{{ product.name }}</h3>
                        
                        <!-- Jerarquía de Categoría Badge -->
                        @if (product.parent_category_name) {
                          <span class="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                            {{ product.parent_category_name }} → {{ product.category_name }}
                          </span>
                        } @else if (product.category_name) {
                          <span class="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                            {{ product.category_name }}
                          </span>
                        }

                        <!-- Colecciones Asignadas Badges -->
                        @if (product.collection_ids && product.collection_ids.length > 0) {
                          @for (colId of product.collection_ids; track colId) {
                            @let col = getCollectionById(colId);
                            @if (col) {
                              <span class="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800 text-purple-300 text-[10px] font-bold flex items-center gap-1">
                                <span>🛍️</span>
                                <span>{{ col.name }}</span>
                              </span>
                            }
                          }
                        }

                        <span
                          [ngClass]="product.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'"
                          class="px-2 py-0.5 rounded-md border text-[10px] font-bold"
                        >
                          {{ product.is_active ? 'Activo en Tienda' : 'Oculto' }}
                        </span>
                      </div>

                      <p class="text-xs text-slate-400 font-normal line-clamp-1">
                        {{ product.short_description || product.description || 'Sin descripción' }}
                      </p>

                      <div class="flex items-center gap-3 text-xs text-slate-500 font-mono">
                        <span>Slug: {{ product.slug }}</span>
                        <span>•</span>
                        <span>{{ product.variants.length }} variante(s)</span>
                      </div>
                    </div>
                  </div>

                  <!-- Actions Top Right -->
                  <div class="flex items-center gap-2 self-end sm:self-center">
                    <a
                      [routerLink]="['/producto', product.slug]"
                      target="_blank"
                      class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Ver en la tienda"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span class="hidden sm:inline">Ver Tienda</span>
                    </a>

                    <button
                      (click)="openEditModal(product)"
                      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar Todo</span>
                    </button>
                  </div>
                </div>

                <!-- Variants Table -->
                <div class="overflow-x-auto rounded-xl border border-slate-800/80">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                        <th class="py-2.5 px-3.5">Variante / Foto</th>
                        <th class="py-2.5 px-3 font-mono">SKU Homie</th>
                        <th class="py-2.5 px-3 font-mono">SKU Proveedor</th>
                        <th class="py-2.5 px-3 text-right">Costo Mayorista</th>
                        <th class="py-2.5 px-3 text-right">Precio Venta</th>
                        <th class="py-2.5 px-3 text-center">Margen</th>
                        <th class="py-2.5 px-3 text-center">Stock</th>
                        <th class="py-2.5 px-3.5 text-right">Ajustes Rápidos</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50 bg-slate-950/30">
                      @for (v of product.variants; track v.id) {
                        <tr class="hover:bg-slate-800/40 transition-colors">
                          <td class="py-2.5 px-3.5 text-slate-200">
                            <div class="flex items-center gap-2">
                              @if (v.image_url) {
                                <img
                                  [src]="v.image_url"
                                  [alt]="v.variant_name"
                                  class="w-7 h-7 rounded-lg object-contain bg-slate-900 border border-slate-800 p-0.5 shrink-0"
                                  (error)="onImgError($event)"
                                />
                              }
                              <span class="font-medium text-slate-200">{{ v.variant_name }}</span>
                            </div>
                          </td>
                          <td class="py-2.5 px-3 font-mono text-slate-400">{{ v.sku }}</td>
                          <td class="py-2.5 px-3 font-mono text-slate-500">{{ v.supplier_sku || '-' }}</td>
                          <td class="py-2.5 px-3 text-right text-amber-400 font-semibold font-mono">
                            {{ v.wholesale_price | copCurrency }}
                          </td>
                          <td class="py-2.5 px-3 text-right text-emerald-400 font-bold font-mono">
                            {{ v.retail_price | copCurrency }}
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            @let margin = v.retail_price - v.wholesale_price;
                            @let marginPct = v.retail_price > 0 ? (margin / v.retail_price) * 100 : 0;
                            <span
                              [ngClass]="marginPct >= 25 ? 'text-emerald-400 bg-emerald-500/10' : (marginPct >= 15 ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10')"
                              class="px-2 py-0.5 rounded text-[10px] font-bold font-mono inline-block"
                            >
                              +{{ margin | copCurrency }} ({{ marginPct | number:'1.0-0' }}%)
                            </span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            <span
                              [ngClass]="v.stock_quantity > 5 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : (v.stock_quantity > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20')"
                              class="px-2.5 py-1 rounded-lg text-xs font-bold font-mono border inline-block"
                            >
                              {{ v.stock_quantity }} un.
                            </span>
                          </td>
                          <td class="py-2.5 px-3.5 text-right">
                            <div class="flex items-center justify-end gap-1.5">
                              <button
                                (click)="openQuickPriceModal(product, v)"
                                class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Editar Precio"
                              >
                                💲 Precio
                              </button>
                              <button
                                (click)="openQuickStockModal(product, v)"
                                class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Editar Cantidad de Stock"
                              >
                                📦 Stock
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- ─── MODAL COMPLETO: CREAR / EDITAR PRODUCTO & VARIANTES ──── -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <!-- Backdrop -->
          <div (click)="closeModal()" class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>

          <!-- Modal Container -->
          <div
            class="relative w-full max-w-4xl bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            (click)="$event.stopPropagation()"
          >
            <!-- Header Modal -->
            <div class="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  @if (isEditing()) {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  }
                </div>
                <div>
                  <h2 class="text-xl font-black text-white">
                    {{ isEditing() ? 'Editar Producto: ' + editingProduct()?.name : 'Crear Nuevo Producto' }}
                  </h2>
                  <p class="text-xs text-slate-400">
                    {{ isEditing() ? 'Actualiza precio, cantidad, fotos, descripciones y subcategorías.' : 'Ingresa los datos del producto base y sus variantes asociadas.' }}
                  </p>
                </div>
              </div>

              <button
                (click)="closeModal()"
                class="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <!-- Modal Tabs -->
            <div class="flex border-b border-slate-800 bg-slate-900/20 px-6 overflow-x-auto scrollbar-none">
              <button
                (click)="activeTab.set('general')"
                [ngClass]="activeTab() === 'general' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'"
                class="py-3 px-4 text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap"
              >
                1. Info & Categoría
              </button>
              <button
                (click)="activeTab.set('description')"
                [ngClass]="activeTab() === 'description' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'"
                class="py-3 px-4 text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap"
              >
                2. Descripciones
              </button>
              <button
                (click)="activeTab.set('image')"
                [ngClass]="activeTab() === 'image' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'"
                class="py-3 px-4 text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap"
              >
                3. Imagen Principal
              </button>
              <button
                (click)="activeTab.set('variants')"
                [ngClass]="activeTab() === 'variants' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'"
                class="py-3 px-4 text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <span>4. Variantes, Precios & Stock</span>
                <span class="px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-800 text-[10px]">
                  {{ variantsFormArray.length }}
                </span>
                @if (variantsFormArray.invalid && variantsFormArray.touched) {
                  <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Hay errores en las variantes"></span>
                }
              </button>
            </div>

            <!-- Modal Body (Scrollable Form) -->
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- TAB 1: GENERAL -->
              @if (activeTab() === 'general') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      formControlName="name"
                      (input)="onNameChange()"
                      placeholder="Ej. Dragon Ball Esfera del Dragón"
                      class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Slug (URL Amigable) *
                      </label>
                      <input
                        type="text"
                        formControlName="slug"
                        placeholder="mug-dragon-ball-esfera-del-dragon"
                        class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Categoría / Subcategoría
                      </label>
                      <select
                        formControlName="category_id"
                        class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      >
                        <option [ngValue]="null">-- Sin Categoría --</option>
                        @for (parent of parentCategories(); track parent.id) {
                          <optgroup [label]="'☕ ' + parent.name">
                            <option [value]="parent.id">{{ parent.name }} (Categoría Principal)</option>
                            @for (sub of getSubcategoriesFor(parent.id); track sub.id) {
                              <option [value]="sub.id">{{ parent.name }} → {{ sub.name }}</option>
                            }
                          </optgroup>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="pt-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      formControlName="is_active"
                      class="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-800 focus:ring-emerald-500"
                    />
                    <label for="is_active" class="text-xs font-semibold text-slate-200 cursor-pointer">
                      Producto activo y visible para los clientes en la tienda online
                    </label>
                  </div>

                  <!-- Colecciones Temáticas Asignadas -->
                  <div class="space-y-2 pt-4 border-t border-slate-800">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Colecciones Temáticas (Círculos & Stories de la tienda)
                    </label>
                    <p class="text-[11px] text-slate-400">
                      Selecciona en cuáles colecciones quieres incluir este producto (puedes marcar varias sin alterar su categoría principal):
                    </p>
                    <div class="flex flex-wrap gap-2 pt-1">
                      @for (coll of collections(); track coll.id) {
                        @let selected = isCollectionSelected(coll.id);
                        <button
                          type="button"
                          (click)="toggleProductCollection(coll.id)"
                          class="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border"
                          [ngClass]="selected
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'"
                        >
                          <span>{{ selected ? '✓' : '+' }}</span>
                          <span>{{ coll.name }}</span>
                        </button>
                      }
                      @if (collections().length === 0) {
                        <span class="text-xs text-slate-500 italic">No hay colecciones creadas aún.</span>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- TAB 2: DESCRIPCIONES -->
              @if (activeTab() === 'description') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Descripción Corta (Card del Catálogo)
                    </label>
                    <input
                      type="text"
                      formControlName="short_description"
                      placeholder="Resumen atractivo de 1 línea..."
                      class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    <p class="text-[11px] text-slate-500 mt-1">Se muestra debajo del título en las tarjetas del catálogo.</p>
                  </div>

                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Descripción Detallada y Especificaciones
                    </label>
                    <textarea
                      formControlName="description"
                      rows="6"
                      placeholder="Incluye detalles sobre el material (cerámica esmaltada, acero inox), capacidad en ml, si incluye tapa, dimensiones y cuidados..."
                      class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>
              }

              <!-- TAB 3: IMAGEN PRINCIPAL -->
              @if (activeTab() === 'image') {
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      URL de Imagen Destacada
                    </label>
                    <input
                      type="text"
                      formControlName="featured_image_url"
                      placeholder="https://images.unsplash.com/... o HomieIcon.png"
                      class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <!-- Image Preview Box -->
                  <div class="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
                    @let imgUrl = productForm.get('featured_image_url')?.value;
                    @if (imgUrl) {
                      <div class="space-y-2 text-center">
                        <img
                          [src]="imgUrl"
                          alt="Vista previa de producto"
                          class="max-h-48 max-w-full rounded-xl object-contain border border-slate-800 bg-slate-950 p-2 shadow-lg mx-auto"
                          (error)="onImgError($event)"
                        />
                        <p class="text-[11px] text-emerald-400 font-mono">Vista previa en tiempo real</p>
                      </div>
                    } @else {
                      <div class="text-center space-y-2 text-slate-500">
                        <svg class="w-12 h-12 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p class="text-xs">Pega una URL de imagen arriba para ver la vista previa.</p>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- TAB 4: VARIANTES, PRECIOS & STOCK -->
              @if (activeTab() === 'variants') {
                <div class="space-y-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-sm font-bold text-white uppercase tracking-wider">Variantes de Producto</h3>
                      <p class="text-xs text-slate-400">Edita el precio mayorista, precio al público, cantidad de stock y foto de cada variante.</p>
                    </div>

                    <button
                      type="button"
                      (click)="addVariantGroup()"
                      class="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Agregar Variante</span>
                    </button>
                  </div>

                  <div formArrayName="variants" class="space-y-4">
                    @for (variantGroup of variantsFormArray.controls; track $index) {
                      <div
                        [formGroupName]="$index"
                        class="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 relative"
                      >
                        <!-- Top Bar of Variant Card -->
                        <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
                          <div class="flex items-center gap-2">
                            <span class="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                              {{ $index + 1 }}
                            </span>
                            <span class="text-xs font-bold text-white">
                              {{ variantGroup.get('variant_name')?.value || 'Nueva Variante' }}
                            </span>
                          </div>

                          @if (variantsFormArray.length > 1) {
                            <button
                              type="button"
                              (click)="removeVariantGroup($index)"
                              class="text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors"
                            >
                              Eliminar Variante
                            </button>
                          }
                        </div>

                        <!-- Variant Fields Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div class="sm:col-span-2">
                            <label class="block text-[11px] font-bold text-slate-400 mb-1">Nombre Variante *</label>
                            <input
                              type="text"
                              formControlName="variant_name"
                              placeholder="Ej. Cerámica con tapa esférica"
                              class="w-full px-3 py-2 rounded-lg bg-slate-950 border text-white text-xs focus:outline-none transition-colors"
                              [ngClass]="variantGroup.get('variant_name')?.invalid && (variantGroup.get('variant_name')?.touched || isSubmitted()) ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'"
                            />
                            @if (variantGroup.get('variant_name')?.invalid && (variantGroup.get('variant_name')?.touched || isSubmitted())) {
                              <p class="text-[10px] text-rose-400 mt-1">El nombre de la variante es obligatorio.</p>
                            }
                          </div>

                          <div>
                            <div class="flex items-center justify-between mb-1">
                              <label class="block text-[11px] font-bold text-slate-400">SKU Homie *</label>
                              <button
                                type="button"
                                (click)="generateVariantSku(variantGroup, $index)"
                                class="text-[10px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                                title="Generar SKU automático"
                              >
                                Auto SKU
                              </button>
                            </div>
                            <input
                              type="text"
                              formControlName="sku"
                              placeholder="KH301"
                              class="w-full px-3 py-2 rounded-lg bg-slate-950 border text-white text-xs font-mono uppercase focus:outline-none transition-colors"
                              [ngClass]="variantGroup.get('sku')?.invalid && (variantGroup.get('sku')?.touched || isSubmitted()) ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'"
                            />
                            @if (variantGroup.get('sku')?.invalid && (variantGroup.get('sku')?.touched || isSubmitted())) {
                              <p class="text-[10px] text-rose-400 mt-1">El SKU es obligatorio y único.</p>
                            }
                          </div>

                          <div>
                            <label class="block text-[11px] font-bold text-slate-400 mb-1">SKU Proveedor</label>
                            <input
                              type="text"
                              formControlName="supplier_sku"
                              placeholder="KH301"
                              class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </div>

                          <!-- Precios & Margen en tiempo real -->
                          <div>
                            <label class="block text-[11px] font-bold text-amber-400 mb-1">Costo Mayorista (COP) *</label>
                            <input
                              type="number"
                              formControlName="wholesale_price"
                              placeholder="32000"
                              class="w-full px-3 py-2 rounded-lg bg-slate-950 border text-amber-300 text-xs font-mono focus:outline-none font-bold transition-colors"
                              [ngClass]="variantGroup.get('wholesale_price')?.invalid && (variantGroup.get('wholesale_price')?.touched || isSubmitted()) ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'"
                            />
                          </div>

                          <div>
                            <label class="block text-[11px] font-bold text-emerald-400 mb-1">Precio Venta (COP) *</label>
                            <input
                              type="number"
                              formControlName="retail_price"
                              placeholder="45000"
                              class="w-full px-3 py-2 rounded-lg bg-slate-950 border text-emerald-300 text-xs font-mono focus:outline-none font-bold transition-colors"
                              [ngClass]="variantGroup.get('retail_price')?.invalid && (variantGroup.get('retail_price')?.touched || isSubmitted()) ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500'"
                            />
                          </div>

                          <!-- Margen Estimado -->
                          <div>
                            <label class="block text-[11px] font-bold text-slate-400 mb-1">Margen por Unidad</label>
                            @let wp = variantGroup.get('wholesale_price')?.value || 0;
                            @let rp = variantGroup.get('retail_price')?.value || 0;
                            @let prof = rp - wp;
                            @let pPct = rp > 0 ? (prof / rp) * 100 : 0;
                            <div class="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                              <span [ngClass]="pPct >= 20 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'">
                                +{{ prof | copCurrency }} ({{ pPct | number:'1.0-0' }}%)
                              </span>
                            </div>
                          </div>

                          <!-- Stock Control with +/- buttons -->
                          <div>
                            <label class="block text-[11px] font-bold text-slate-400 mb-1">Cantidad de Stock *</label>
                            <div class="flex items-center">
                              <button
                                type="button"
                                (click)="adjustGroupStock(variantGroup, -1)"
                                class="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-l-lg text-xs font-bold"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                formControlName="stock_quantity"
                                class="w-full px-2 py-2 bg-slate-950 border-y border-slate-800 text-white text-xs font-mono text-center focus:outline-none"
                              />
                              <button
                                type="button"
                                (click)="adjustGroupStock(variantGroup, 1)"
                                class="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-r-lg text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <!-- Variant Image URL with Mini Preview -->
                          <div class="sm:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-400 mb-1">URL Foto Variante (Opcional)</label>
                            <div class="flex items-center gap-3">
                              <input
                                type="text"
                                formControlName="image_url"
                                placeholder="https://..."
                                class="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                              />
                              @let vImg = variantGroup.get('image_url')?.value;
                              @if (vImg) {
                                <img
                                  [src]="vImg"
                                  alt="Preview variante"
                                  class="w-8 h-8 rounded-lg object-contain bg-slate-950 border border-slate-800 p-0.5"
                                  (error)="onImgError($event)"
                                />
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </form>

            <!-- Modal Footer -->
            <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between">
              <button
                type="button"
                (click)="closeModal()"
                class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>

              <div class="flex items-center gap-3">
                @if (activeTab() !== 'variants') {
                  <button
                    type="button"
                    (click)="nextTab()"
                    class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                  >
                    Siguiente Pestaña →
                  </button>
                }

                <button
                  type="button"
                  (click)="saveProduct()"
                  [disabled]="isSaving()"
                  class="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Guardar Cambios' : 'Crear Producto') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ─── POPUP RÁPIDO: AJUSTAR STOCK ──────────────────────────── -->
      @if (quickStockVariant()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div (click)="quickStockVariant.set(null)" class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>

          <div class="relative z-10 w-full max-w-sm bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 class="text-base font-bold text-white">Ajuste Rápido de Stock</h3>
              <button (click)="quickStockVariant.set(null)" class="text-slate-400 hover:text-white">✕</button>
            </div>

            <div class="space-y-1">
              <p class="text-xs font-semibold text-slate-300">{{ quickStockVariant()!.variant.variant_name }}</p>
              <p class="text-[11px] font-mono text-slate-500">SKU: {{ quickStockVariant()!.variant.sku }}</p>
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400">Cantidad en Inventario:</label>
              <div class="flex items-center justify-center gap-2">
                <button
                  (click)="quickStockCount.set(mathMax(0, quickStockCount() - 5))"
                  class="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  -5
                </button>
                <button
                  (click)="quickStockCount.set(mathMax(0, quickStockCount() - 1))"
                  class="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  -1
                </button>
                <input
                  type="number"
                  [(ngModel)]="quickStockCount"
                  min="0"
                  class="w-24 px-3 py-2 text-center rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-base font-bold focus:border-emerald-500 focus:outline-none"
                />
                <button
                  (click)="quickStockCount.set(quickStockCount() + 1)"
                  class="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  +1
                </button>
                <button
                  (click)="quickStockCount.set(quickStockCount() + 5)"
                  class="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  +5
                </button>
              </div>
            </div>

            <div class="pt-3 flex justify-end gap-2">
              <button
                (click)="quickStockVariant.set(null)"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                (click)="saveQuickStock()"
                [disabled]="isSaving()"
                class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Guardar Stock
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ─── POPUP RÁPIDO: AJUSTAR PRECIO ──────────────────────────── -->
      @if (quickPriceVariant()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div (click)="quickPriceVariant.set(null)" class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>

          <div class="relative z-10 w-full max-w-sm bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 class="text-base font-bold text-white">Ajuste Rápido de Precios</h3>
              <button (click)="quickPriceVariant.set(null)" class="text-slate-400 hover:text-white">✕</button>
            </div>

            <div class="space-y-1">
              <p class="text-xs font-semibold text-slate-300">{{ quickPriceVariant()!.variant.variant_name }}</p>
              <p class="text-[11px] font-mono text-slate-500">SKU: {{ quickPriceVariant()!.variant.sku }}</p>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-amber-400 mb-1">Costo Mayorista (COP):</label>
                <input
                  type="number"
                  [(ngModel)]="quickWholesale"
                  class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-emerald-400 mb-1">Precio de Venta al Detal (COP):</label>
                <input
                  type="number"
                  [(ngModel)]="quickRetail"
                  class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-mono text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              @let qProfit = quickRetail() - quickWholesale();
              @let qMargin = quickRetail() > 0 ? (qProfit / quickRetail()) * 100 : 0;
              <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex justify-between items-center font-mono">
                <span class="text-slate-400">Ganancia neta:</span>
                <span [ngClass]="qMargin >= 20 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'">
                  +{{ qProfit | copCurrency }} ({{ qMargin | number:'1.0-0' }}%)
                </span>
              </div>
            </div>

            <div class="pt-3 flex justify-end gap-2">
              <button
                (click)="quickPriceVariant.set(null)"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                (click)="saveQuickPrice()"
                [disabled]="isSaving()"
                class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Guardar Precios
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  // Data signals
  products = signal<ProductWithVariants[]>([]);
  categories = signal<Category[]>([]);
  collections = signal<Collection[]>([]);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  // Drag and Drop / Reordering signals
  draggedIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);
  hasUnsavedOrder = signal<boolean>(false);
  isSavingOrder = signal<boolean>(false);

  // Filters
  searchQuery = signal<string>('');
  selectedCategorySlug = signal<string>('ALL');
  stockFilter = signal<string>('ALL');

  // Modal State
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  editingProduct = signal<ProductWithVariants | null>(null);
  activeTab = signal<'general' | 'description' | 'image' | 'variants'>('general');

  // Quick action popups
  quickStockVariant = signal<{ product: ProductWithVariants; variant: ProductVariant } | null>(null);
  quickStockCount = signal<number>(0);

  quickPriceVariant = signal<{ product: ProductWithVariants; variant: ProductVariant } | null>(null);
  quickWholesale = signal<number>(0);
  quickRetail = signal<number>(0);

  // Reactive Form
  productForm!: FormGroup;

  get variantsFormArray(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  // Parent Categories computed
  parentCategories = computed(() => {
    return this.categories().filter((c) => !c.parent_id);
  });

  getSubcategoriesFor(parentId: number): Category[] {
    return this.categories().filter((c) => c.parent_id === parentId);
  }

  // Filtered products computed
  filteredProducts = computed(() => {
    let list = this.products();
    const query = this.searchQuery().toLowerCase().trim();
    const categorySlug = this.selectedCategorySlug();
    const stock = this.stockFilter();

    if (categorySlug !== 'ALL') {
      const cat = this.categories().find((c) => c.slug === categorySlug);
      if (cat) {
        if (!cat.parent_id) {
          // Categoría padre seleccionada: coincidir con la categoría o cualquier subcategoría suya
          list = list.filter(
            (p) =>
              p.category_slug === cat.slug ||
              p.category_parent_id === cat.id ||
              p.parent_category_name?.toLowerCase() === cat.name.toLowerCase() ||
              p.category_name?.toLowerCase() === cat.name.toLowerCase()
          );
        } else {
          // Subcategoría específica seleccionada
          list = list.filter(
            (p) => p.category_slug === cat.slug || p.category_name?.toLowerCase() === cat.name.toLowerCase()
          );
        }
      }
    }

    if (stock === 'IN_STOCK') {
      list = list.filter((p) => p.variants.some((v) => v.stock_quantity > 0));
    } else if (stock === 'OUT_OF_STOCK') {
      list = list.filter((p) => p.variants.every((v) => v.stock_quantity === 0));
    }

    if (query) {
      list = list.filter((p) => {
        const matchName = p.name.toLowerCase().includes(query);
        const matchSlug = p.slug.toLowerCase().includes(query);
        const matchDesc = p.description?.toLowerCase().includes(query) || false;
        const matchVariant = p.variants.some(
          (v) =>
            v.variant_name.toLowerCase().includes(query) ||
            v.sku.toLowerCase().includes(query) ||
            (v.supplier_sku && v.supplier_sku.toLowerCase().includes(query))
        );
        return matchName || matchSlug || matchDesc || matchVariant;
      });
    }

    return list;
  });

  // Summary Metrics Computeds
  totalVariantsCount = computed(() => {
    return this.products().reduce((acc, p) => acc + p.variants.length, 0);
  });

  totalStockUnits = computed(() => {
    return this.products().reduce((acc, p) => acc + p.variants.reduce((vAcc, v) => vAcc + v.stock_quantity, 0), 0);
  });

  outOfStockCount = computed(() => {
    return this.products().reduce((acc, p) => acc + p.variants.filter((v) => v.stock_quantity === 0).length, 0);
  });

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      slug: ['', Validators.required],
      category_id: [null],
      collection_ids: [[]],
      description: [''],
      short_description: [''],
      featured_image_url: [''],
      is_active: [true],
      variants: this.fb.array([]),
    });
  }

  getCollectionById(id: number): Collection | undefined {
    return this.collections().find((c) => c.id === id);
  }

  toggleProductCollection(collId: number): void {
    const current: number[] = this.productForm.get('collection_ids')?.value || [];
    const exists = current.includes(collId);
    const updated = exists ? current.filter((id) => id !== collId) : [...current, collId];
    this.productForm.patchValue({ collection_ids: updated });
    this.productForm.markAsDirty();
  }

  isCollectionSelected(collId: number): boolean {
    const current: number[] = this.productForm.get('collection_ids')?.value || [];
    return current.includes(collId);
  }

  createVariantGroup(v?: Partial<ProductVariant>): FormGroup {
    return this.fb.group({
      id: [v?.id || null],
      variant_name: [v?.variant_name || '', Validators.required],
      sku: [v?.sku || '', Validators.required],
      supplier_sku: [v?.supplier_sku || ''],
      image_url: [v?.image_url || ''],
      wholesale_price: [v?.wholesale_price ?? 0, [Validators.required, Validators.min(0)]],
      retail_price: [v?.retail_price ?? 0, [Validators.required, Validators.min(0)]],
      stock_quantity: [v?.stock_quantity ?? 0, [Validators.required, Validators.min(0)]],
      weight_grams: [v?.weight_grams ?? 350],
      is_active: [v?.is_active ?? true],
    });
  }

  addVariantGroup(v?: Partial<ProductVariant>): void {
    const nextIndex = this.variantsFormArray.length + 1;
    let defaultSku = v?.sku || '';
    let defaultWholesale = v?.wholesale_price ?? 0;
    let defaultRetail = v?.retail_price ?? 0;

    // Si es una variante nueva y no se especificó SKU, sugerir uno único
    if (!defaultSku) {
      const slug = this.productForm?.get('slug')?.value || this.productForm?.get('name')?.value || '';
      const cleanPrefix = slug
        ? slug.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6)
        : 'HOM';
      const rand = Math.floor(100 + Math.random() * 900);
      defaultSku = `${cleanPrefix}-V${nextIndex}-${rand}`;
    }

    // Si ya existe al menos una variante y no se pasaron precios, heredar los de la primera
    if (this.variantsFormArray.length > 0 && v?.wholesale_price === undefined) {
      const firstGroup = this.variantsFormArray.at(0);
      defaultWholesale = firstGroup.get('wholesale_price')?.value || 0;
      defaultRetail = firstGroup.get('retail_price')?.value || 0;
    }

    this.variantsFormArray.push(
      this.createVariantGroup({
        ...v,
        sku: defaultSku,
        wholesale_price: defaultWholesale,
        retail_price: defaultRetail,
      })
    );
  }

  generateVariantSku(group: any, index: number): void {
    const slug = this.productForm.get('slug')?.value || this.productForm.get('name')?.value || '';
    const cleanPrefix = slug
      ? slug.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6)
      : 'HOM';
    const rand = Math.floor(100 + Math.random() * 900);
    const sku = `${cleanPrefix}-V${index + 1}-${rand}`;
    group.patchValue({ sku });
    group.get('sku')?.markAsDirty();
  }

  removeVariantGroup(index: number): void {
    if (this.variantsFormArray.length > 1) {
      this.variantsFormArray.removeAt(index);
    }
  }

  adjustGroupStock(group: any, delta: number): void {
    const current = group.get('stock_quantity')?.value || 0;
    group.patchValue({ stock_quantity: Math.max(0, current + delta) });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.api.getCategories(false).subscribe({
      next: (res) => {
        if (res.success) this.categories.set(res.data);
      },
    });

    this.api.getAllCollectionsAdmin().subscribe({
      next: (res) => {
        if (res.success) this.collections.set(res.data);
      },
    });

    this.api.getProducts({ limit: 100 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.products.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategorySlug.set('ALL');
    this.stockFilter.set('ALL');
  }

  // ─── Drag & Drop / Reordering Logic ──────────────────────────────
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.dragOverIndex() !== index) {
      this.dragOverIndex.set(index);
    }
  }

  onDragLeave(index: number): void {
    if (this.dragOverIndex() === index) {
      this.dragOverIndex.set(null);
    }
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    const sourceIndex = this.draggedIndex();
    this.dragOverIndex.set(null);
    this.draggedIndex.set(null);

    if (sourceIndex === null || sourceIndex === targetIndex) return;

    this.reorderArray(sourceIndex, targetIndex);
  }

  onDragEnd(): void {
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }

  onOrderInputChange(product: ProductWithVariants, currentFilteredIdx: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawVal = parseInt(input.value, 10);
    if (isNaN(rawVal)) {
      input.value = (currentFilteredIdx + 1).toString();
      return;
    }
    const totalCount = this.products().length;
    const targetPos = Math.max(1, Math.min(totalCount, rawVal));
    const targetIndex = targetPos - 1;

    const sourceIndex = this.products().findIndex((p) => p.id === product.id);
    if (sourceIndex === -1) return;

    if (sourceIndex !== targetIndex) {
      this.reorderArray(sourceIndex, targetIndex);
      this.showToast(`¡"${product.name}" movido al orden #${targetPos} y guardado!`, 'success');
    } else {
      input.value = (currentFilteredIdx + 1).toString();
    }
  }

  onOrderInputEnter(event: Event): void {
    (event.target as HTMLInputElement).blur();
  }

  moveProduct(product: ProductWithVariants, direction: -1 | 1): void {
    const sourceIndex = this.products().findIndex((p) => p.id === product.id);
    if (sourceIndex === -1) return;
    const targetIndex = sourceIndex + direction;
    if (targetIndex < 0 || targetIndex >= this.products().length) return;
    this.reorderArray(sourceIndex, targetIndex);
  }

  private reorderArray(fromIndex: number, toIndex: number): void {
    const current = [...this.products()];
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    this.products.set(current);
    this.hasUnsavedOrder.set(true);

    // Guardado automático inmediato con notificación
    this.saveOrder();
  }

  saveOrder(): void {
    this.isSavingOrder.set(true);
    const productIds = this.products().map((p) => p.id);
    this.api.reorderProducts(productIds).subscribe({
      next: (res) => {
        if (res.success) {
          this.hasUnsavedOrder.set(false);
          this.toast.set({
            message: '¡Nuevo orden de productos guardado! Ya se refleja en la tienda.',
            type: 'success',
          });
          setTimeout(() => this.toast.set(null), 3500);
        }
        this.isSavingOrder.set(false);
      },
      error: (err) => {
        this.toast.set({
          message: err.error?.error || 'Error al guardar el nuevo orden de productos.',
          type: 'error',
        });
        this.isSavingOrder.set(false);
      },
    });
  }

  // Open Create Modal
  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingProduct.set(null);
    this.isSubmitted.set(false);
    this.activeTab.set('general');
    this.initForm();
    this.addVariantGroup();
    this.isModalOpen.set(true);
  }

  // Open Edit Modal with full product data
  openEditModal(product: ProductWithVariants): void {
    this.isEditing.set(true);
    this.editingProduct.set(product);
    this.isSubmitted.set(false);
    this.activeTab.set('general');

    this.productForm = this.fb.group({
      id: [product.id],
      name: [product.name, Validators.required],
      slug: [product.slug, Validators.required],
      category_id: [product.category_id],
      collection_ids: [product.collection_ids ? [...product.collection_ids] : []],
      description: [product.description || ''],
      short_description: [product.short_description || ''],
      featured_image_url: [product.featured_image_url || ''],
      is_active: [product.is_active],
      variants: this.fb.array([]),
    });

    if (product.variants && product.variants.length > 0) {
      for (const v of product.variants) {
        this.addVariantGroup(v);
      }
    } else {
      this.addVariantGroup();
    }

    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isSubmitted.set(false);
    this.isModalOpen.set(false);
  }

  nextTab(): void {
    if (this.activeTab() === 'general') this.activeTab.set('description');
    else if (this.activeTab() === 'description') this.activeTab.set('image');
    else if (this.activeTab() === 'image') this.activeTab.set('variants');
  }

  onNameChange(): void {
    if (!this.isEditing()) {
      const name = this.productForm.get('name')?.value || '';
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.productForm.patchValue({ slug });
    }
  }

  saveProduct(): void {
    this.isSubmitted.set(true);
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();

      // Navegar a la pestaña que tiene el error para que el usuario sepa qué falta
      if (this.productForm.get('name')?.invalid || this.productForm.get('slug')?.invalid) {
        this.activeTab.set('general');
        this.showToast('Por favor completa el nombre y slug obligatorios en Información Básica.', 'error');
      } else if (this.variantsFormArray.invalid) {
        this.activeTab.set('variants');
        this.showToast('Por favor completa los campos obligatorios de las variantes (Nombre, SKU y Precios).', 'error');
      } else {
        this.showToast('Por favor completa todos los campos requeridos en el formulario.', 'error');
      }
      return;
    }

    this.isSaving.set(true);
    const formVal = this.productForm.value;

    // Normalizar variantes: NO enviar id: null para variantes nuevas
    const cleanVariants = formVal.variants.map((v: any) => {
      const item: any = {
        variant_name: (v.variant_name || '').trim(),
        sku: (v.sku || '').trim().toUpperCase(),
        supplier_sku: v.supplier_sku?.trim() || null,
        wholesale_price: Number(v.wholesale_price) || 0,
        retail_price: Number(v.retail_price) || 0,
        stock_quantity: Number(v.stock_quantity) || 0,
        weight_grams: Number(v.weight_grams) || 350,
        image_url: v.image_url?.trim() || null,
        is_active: v.is_active !== undefined ? Boolean(v.is_active) : true,
      };
      if (v.id) {
        item.id = Number(v.id);
      }
      return item;
    });

    if (this.isEditing() && formVal.id) {
      // Actualizar producto existente
      const updateDto: UpdateProductDto = {
        name: formVal.name?.trim(),
        slug: formVal.slug?.trim(),
        category_id: formVal.category_id || null,
        collection_ids: formVal.collection_ids || [],
        description: formVal.description || '',
        short_description: formVal.short_description || '',
        featured_image_url: formVal.featured_image_url || '',
        is_active: formVal.is_active,
        variants: cleanVariants,
      };

      this.api.updateProduct(formVal.id, updateDto).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('¡Producto y variantes actualizados exitosamente!', 'success');
            this.closeModal();
            this.loadData();
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          this.handleApiError(err, 'Error al actualizar el producto.');
          this.isSaving.set(false);
        },
      });
    } else {
      // Crear nuevo producto
      const createDto: CreateProductDto = {
        name: formVal.name?.trim(),
        slug: formVal.slug?.trim(),
        category_id: formVal.category_id || null,
        collection_ids: formVal.collection_ids || [],
        description: formVal.description || '',
        short_description: formVal.short_description || '',
        featured_image_url: formVal.featured_image_url || '',
        is_active: formVal.is_active,
        variants: cleanVariants,
      };

      this.api.createProduct(createDto).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('¡Producto creado exitosamente!', 'success');
            this.closeModal();
            this.loadData();
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          this.handleApiError(err, 'Error al crear el producto.');
          this.isSaving.set(false);
        },
      });
    }
  }

  handleApiError(err: any, defaultMsg: string): void {
    let msg = err.error?.error || defaultMsg;
    if (err.error?.details) {
      if (Array.isArray(err.error.details)) {
        const details = err.error.details.map((d: any) => d.message || d.msg || `${d.field}: inválido`).join(', ');
        msg = `${msg}: ${details}`;
      } else if (typeof err.error.details === 'string') {
        msg = `${msg} (${err.error.details})`;
      }
    }
    this.showToast(msg, 'error');
  }

  // Quick Stock Adjustment Popup
  openQuickStockModal(product: ProductWithVariants, variant: ProductVariant): void {
    this.quickStockVariant.set({ product, variant });
    this.quickStockCount.set(variant.stock_quantity);
  }

  saveQuickStock(): void {
    const item = this.quickStockVariant();
    if (!item) return;

    this.isSaving.set(true);
    this.api.updateVariantStock(item.variant.id, this.quickStockCount()).subscribe({
      next: () => {
        this.showToast(`Stock actualizado para '${item.variant.variant_name}'`, 'success');
        this.quickStockVariant.set(null);
        this.loadData();
        this.isSaving.set(false);
      },
      error: (err) => {
        this.showToast(err.error?.error || 'Error al actualizar el stock.', 'error');
        this.isSaving.set(false);
      },
    });
  }

  // Quick Price Adjustment Popup
  openQuickPriceModal(product: ProductWithVariants, variant: ProductVariant): void {
    this.quickPriceVariant.set({ product, variant });
    this.quickWholesale.set(variant.wholesale_price);
    this.quickRetail.set(variant.retail_price);
  }

  saveQuickPrice(): void {
    const item = this.quickPriceVariant();
    if (!item) return;

    this.isSaving.set(true);
    this.api
      .updateVariant(item.variant.id, {
        wholesale_price: this.quickWholesale(),
        retail_price: this.quickRetail(),
      })
      .subscribe({
        next: () => {
          this.showToast(`Precios actualizados para '${item.variant.variant_name}'`, 'success');
          this.quickPriceVariant.set(null);
          this.loadData();
          this.isSaving.set(false);
        },
        error: (err) => {
          this.showToast(err.error?.error || 'Error al actualizar los precios.', 'error');
          this.isSaving.set(false);
        },
      });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }

  onImgError(event: any): void {
    event.target.src = 'HomieIcon.png';
  }

  mathMax(a: number, b: number): number {
    return Math.max(a, b);
  }
}
