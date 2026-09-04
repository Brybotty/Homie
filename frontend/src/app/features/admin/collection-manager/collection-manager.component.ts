import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Collection, ProductWithVariants, Category } from '../../../core/models';

@Component({
  selector: 'app-collection-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 max-w-7xl mx-auto pb-16">
      <!-- ─── Header Principal ──────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-black text-white tracking-tight">Gestor de Colecciones</h2>
            <span class="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
              Estilo Stories & Temáticas
            </span>
          </div>
          <p class="text-sm text-slate-400 mt-1">
            Personaliza las colecciones de la tienda, cambia sus imágenes y agrega productos libremente sin alterar sus categorías principales.
          </p>
        </div>

        <button
          (click)="openCreateModal()"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Colección</span>
        </button>
      </div>

      <!-- ─── Toast de Notificación ──────────────────────────────────── -->
      @if (toast()) {
        <div
          class="p-4 rounded-2xl border flex items-center justify-between animate-fade-in"
          [ngClass]="
            toast()!.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/80 border-rose-800 text-rose-200'
          "
        >
          <div class="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <span>{{ toast()!.type === 'success' ? '✅' : '⚠️' }}</span>
            <span>{{ toast()!.message }}</span>
          </div>
          <button (click)="toast.set(null)" class="text-xs text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      }

      <!-- ─── Grid de Colecciones ────────────────────────────────────── -->
      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="bg-slate-950/60 rounded-3xl p-6 border border-slate-800 animate-pulse space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-slate-800 shrink-0"></div>
                <div class="space-y-2 flex-1">
                  <div class="h-4 bg-slate-800 rounded-md w-3/4"></div>
                  <div class="h-3 bg-slate-800/60 rounded-md w-1/2"></div>
                </div>
              </div>
              <div class="h-10 bg-slate-800/40 rounded-xl"></div>
            </div>
          }
        </div>
      } @else if (collections().length === 0) {
        <div class="py-16 text-center bg-slate-950/40 rounded-3xl border border-slate-800 space-y-3">
          <p class="text-lg font-bold text-slate-300">No hay colecciones creadas todavía</p>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Crea colecciones como "Anime", "Marvel", "Sanrio" o "Capibaras" para mostrarlas en los círculos de la tienda.
          </p>
          <button
            (click)="openCreateModal()"
            class="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Crear Primera Colección
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (c of collections(); track c.id) {
            <div class="bg-slate-950/80 rounded-3xl p-5 border border-slate-800/80 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between group">
              <div class="space-y-3">
                <!-- Fila Superior: Avatar Circular Story + Título + Status -->
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3.5 min-w-0">
                    <!-- Avatar Circular (Preview estilo Stories) -->
                    <div class="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 to-teal-400 shrink-0 shadow-sm">
                      <div class="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-slate-950 flex items-center justify-center">
                        @if (c.image_url) {
                          <img [src]="c.image_url" [alt]="c.name" class="w-full h-full object-cover" />
                        } @else {
                          <span class="text-xs font-black text-emerald-400 uppercase">
                            {{ c.name.substring(0, 2) }}
                          </span>
                        }
                      </div>
                      @if (c.badge) {
                        <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-slate-900 text-[8px] font-black text-amber-300 rounded-full border border-slate-700 uppercase whitespace-nowrap">
                          {{ c.badge }}
                        </span>
                      }
                    </div>

                    <div class="min-w-0">
                      <h3 class="text-base font-bold text-white truncate" [title]="c.name">{{ c.name }}</h3>
                      <p class="text-xs text-slate-500 font-mono truncate">/{{ c.slug }}</p>
                    </div>
                  </div>

                  <!-- Estado Activo -->
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                    [ngClass]="c.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'"
                  >
                    {{ c.is_active ? 'Activa' : 'Oculta' }}
                  </span>
                </div>

                <!-- Descripción -->
                <p class="text-xs text-slate-400 line-clamp-2 min-h-[2rem]">
                  {{ c.description || 'Sin descripción detallada.' }}
                </p>

                <!-- Conteo de Productos Asignados -->
                <div class="p-2.5 bg-slate-900/90 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <span class="text-slate-400 flex items-center gap-1.5">
                    <span>🛍️</span>
                    <span>Productos asignados:</span>
                  </span>
                  <span class="font-extrabold text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50">
                    {{ c.product_count || 0 }} productos
                  </span>
                </div>
              </div>

              <!-- Acciones de la Tarjeta -->
              <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <!-- Gestionar Productos (Asignar sin quitar categorías) -->
                <button
                  (click)="openProductsModal(c)"
                  class="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Seleccionar qué productos pertenecen a esta colección"
                >
                  <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Asignar Productos</span>
                </button>

                <!-- Editar Datos / Imagen -->
                <button
                  (click)="openEditModal(c)"
                  class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                  title="Editar datos e imagen"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <!-- Eliminar -->
                <button
                  (click)="deleteCollection(c)"
                  class="p-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Eliminar colección"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- ─── MODAL: CREAR / EDITAR DATOS DE COLECCIÓN ────────────────── -->
      @if (isEditModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div (click)="closeEditModal()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

          <div class="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-xl w-full p-6 sm:p-8 z-10 shadow-2xl space-y-6 text-white animate-scale-up">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 class="text-lg font-black text-white">
                {{ isEditing() ? 'Editar Colección' : 'Crear Nueva Colección' }}
              </h3>
              <button (click)="closeEditModal()" class="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form [formGroup]="collectionForm" (ngSubmit)="saveCollection()" class="space-y-4">
              <!-- Nombre y Slug -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Nombre de la Colección *</label>
                  <input
                    type="text"
                    formControlName="name"
                    (input)="onNameChange()"
                    placeholder="Ej. Capibaras Chill"
                    class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Slug URL *</label>
                  <input
                    type="text"
                    formControlName="slug"
                    placeholder="ej. capibaras-chill"
                    class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <!-- URL de la Imagen con Preview en Vivo -->
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">URL de la Imagen (Avatar / Ícono de Colección)</label>
                <div class="flex items-center gap-3">
                  <input
                    type="text"
                    formControlName="image_url"
                    placeholder="https://images.unsplash.com/... o enlace de imagen"
                    class="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <!-- Preview circular en vivo -->
                  <div class="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 to-teal-400 shrink-0 shadow-sm overflow-hidden">
                    <div class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      @if (collectionForm.get('image_url')?.value) {
                        <img
                          [src]="collectionForm.get('image_url')?.value"
                          alt="Preview"
                          class="w-full h-full object-cover"
                          (error)="onImageError($event)"
                        />
                      } @else {
                        <span class="text-[10px] text-slate-500 font-bold">Sin foto</span>
                      }
                    </div>
                  </div>
                </div>
                <p class="text-[10px] text-slate-500 mt-1">
                  Esta imagen se mostrará dentro del círculo estilo Stories de Instagram en la tienda.
                </p>
              </div>

              <!-- Badge y Orden -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Badge / Etiqueta (Opcional)</label>
                  <input
                    type="text"
                    formControlName="badge"
                    placeholder="Ej. Top, Hot, Kawaii, Gamer..."
                    class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Orden de Visualización</label>
                  <input
                    type="number"
                    formControlName="display_order"
                    class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Descripción</label>
                <textarea
                  formControlName="description"
                  rows="2"
                  placeholder="Breve descripción de los productos que componen esta colección..."
                  class="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <!-- Activo / Visible -->
              <div class="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active_coll"
                  formControlName="is_active"
                  class="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-800 focus:ring-emerald-500"
                />
                <label for="is_active_coll" class="text-xs font-semibold text-slate-300 cursor-pointer">
                  Colección activa (visible para los clientes en la tienda)
                </label>
              </div>

              <!-- Botones del Formulario -->
              <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  (click)="closeEditModal()"
                  class="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="collectionForm.invalid || isSaving()"
                  class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {{ isSaving() ? 'Guardando...' : 'Guardar Colección' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ─── MODAL: GESTIÓN Y ASIGNACIÓN DE PRODUCTOS EN LA COLECCIÓN ── -->
      @if (isProductsModalOpen() && selectedCollection()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div (click)="closeProductsModal()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

          <div class="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-4xl w-full max-h-[90vh] flex flex-col z-10 shadow-2xl text-white animate-scale-up overflow-hidden">
            <!-- Header del Modal -->
            <div class="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg font-bold">
                  🛍️
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-black text-white">
                    Asignar Productos a: {{ selectedCollection()!.name }}
                  </h3>
                  <p class="text-xs text-emerald-400 font-semibold">
                    💡 Asignar productos a esta colección no cambia ni quita su categoría principal (ej: Mugs o Termos).
                  </p>
                </div>
              </div>

              <button (click)="closeProductsModal()" class="text-slate-400 hover:text-white text-sm cursor-pointer font-bold">✕</button>
            </div>

            <!-- Barra de Filtros en el Selector de Productos -->
            <div class="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <!-- Búsqueda -->
              <div class="relative flex-1 w-full">
                <input
                  type="text"
                  [(ngModel)]="productFilterQuery"
                  placeholder="Buscar productos por nombre, SKU..."
                  class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <!-- Filtro de Categoría -->
              <select
                [(ngModel)]="productFilterCategory"
                class="w-full sm:w-48 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Todas las Categorías</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>

              <!-- Botones Rápidos -->
              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  (click)="selectAllFilteredProducts()"
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Marcar visibles
                </button>
                <button
                  type="button"
                  (click)="clearSelectedProducts()"
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Desmarcar todos
                </button>
              </div>
            </div>

            <!-- Lista de Productos con Checkboxes -->
            <div class="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-800/60">
              @for (prod of filteredCandidateProducts(); track prod.id) {
                @let isSelected = selectedProductIds().has(prod.id);
                <div
                  (click)="toggleProductSelection(prod.id)"
                  class="pt-2 first:pt-0 flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors"
                  [ngClass]="isSelected ? 'bg-emerald-950/30 border border-emerald-800/40' : 'hover:bg-slate-800/40'"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <!-- Checkbox -->
                    <input
                      type="checkbox"
                      [checked]="isSelected"
                      (click)="$event.stopPropagation(); toggleProductSelection(prod.id)"
                      class="w-4 h-4 rounded text-emerald-600 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />

                    <!-- Imagen -->
                    <img
                      [src]="prod.featured_image_url || (prod.variants && prod.variants[0]?.image_url) || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop'"
                      [alt]="prod.name"
                      class="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                    />

                    <!-- Info -->
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-white truncate">{{ prod.name }}</p>
                      <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {{ prod.category_name || prod.parent_category_name || 'Sin Categoría' }}
                        </span>
                        <span>•</span>
                        <span class="font-mono text-emerald-400 font-semibold">
                          {{ (prod.variants && prod.variants[0]?.sku) || prod.slug }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Estado en la Colección -->
                  <div class="shrink-0 pl-2">
                    <span
                      class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                      [ngClass]="isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800/80 text-slate-400'"
                    >
                      {{ isSelected ? '✓ En Colección' : '+ Añadir' }}
                    </span>
                  </div>
                </div>
              }
            </div>

            <!-- Footer con Conteo y Guardado -->
            <div class="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <div class="text-xs text-slate-300">
                <span class="font-bold text-emerald-400">{{ selectedProductIds().size }}</span>
                <span> productos seleccionados en esta colección</span>
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  (click)="closeProductsModal()"
                  class="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  (click)="saveCollectionProducts()"
                  [disabled]="isSaving()"
                  class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {{ isSaving() ? 'Guardando...' : 'Guardar Asignación' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CollectionManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  collections = signal<Collection[]>([]);
  allProducts = signal<ProductWithVariants[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal Crear/Editar
  isEditModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingCollection = signal<Collection | null>(null);
  collectionForm!: FormGroup;

  // Modal Asignar Productos
  isProductsModalOpen = signal<boolean>(false);
  selectedCollection = signal<Collection | null>(null);
  selectedProductIds = signal<Set<number>>(new Set());

  // Filtros en modal de productos
  productFilterQuery = '';
  productFilterCategory = 'ALL';

  // Productos candidatos filtrados
  filteredCandidateProducts = computed(() => {
    let list = this.allProducts();
    const q = this.productFilterQuery.toLowerCase().trim();
    const cat = this.productFilterCategory;

    if (cat !== 'ALL') {
      const catId = parseInt(cat, 10);
      list = list.filter((p) => p.category_id === catId || p.category_parent_id === catId);
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.variants.some((v) => v.sku.toLowerCase().includes(q))
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.collectionForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      image_url: [''],
      badge: [''],
      display_order: [0],
      is_active: [true],
    });
  }

  loadData(): void {
    this.isLoading.set(true);

    this.api.getAllCollectionsAdmin().subscribe({
      next: (res) => {
        if (res.success) {
          this.collections.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

    // Cargar productos para asignación (hasta 500 productos)
    this.api.getProducts({ limit: 500 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.allProducts.set(res.data);
        }
      },
      error: (err) => {
        console.error('Error cargando productos para colecciones:', err);
      },
    });

    // Cargar categorías para filtros
    this.api.getCategories(false).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(res.data);
        }
      },
    });
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }

  onNameChange(): void {
    if (!this.isEditing()) {
      const name = this.collectionForm.get('name')?.value || '';
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.collectionForm.patchValue({ slug });
    }
  }

  onImageError(e: any): void {
    e.target.style.display = 'none';
  }

  // ─── MODAL CREAR / EDITAR ──────────────────────────────────────────
  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingCollection.set(null);
    this.collectionForm.reset({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      badge: '',
      display_order: (this.collections().length + 1) * 10,
      is_active: true,
    });
    this.isEditModalOpen.set(true);
  }

  openEditModal(coll: Collection): void {
    this.isEditing.set(true);
    this.editingCollection.set(coll);
    this.collectionForm.patchValue({
      name: coll.name,
      slug: coll.slug,
      description: coll.description || '',
      image_url: coll.image_url || '',
      badge: coll.badge || '',
      display_order: coll.display_order ?? 0,
      is_active: coll.is_active,
    });
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  saveCollection(): void {
    if (this.collectionForm.invalid) return;

    this.isSaving.set(true);
    const formVal = this.collectionForm.value;

    if (this.isEditing() && this.editingCollection()) {
      this.api.updateCollection(this.editingCollection()!.id, formVal).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('¡Colección actualizada exitosamente!', 'success');
            this.closeEditModal();
            this.loadData();
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          this.showToast(err.error?.error || 'Error al actualizar la colección.', 'error');
          this.isSaving.set(false);
        },
      });
    } else {
      this.api.createCollection(formVal).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('¡Colección creada exitosamente!', 'success');
            this.closeEditModal();
            this.loadData();
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          this.showToast(err.error?.error || 'Error al crear la colección.', 'error');
          this.isSaving.set(false);
        },
      });
    }
  }

  deleteCollection(coll: Collection): void {
    if (confirm(`¿Estás seguro de eliminar la colección "${coll.name}"? Los productos seguirán existiendo intactos.`)) {
      this.api.deleteCollection(coll.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Colección eliminada exitosamente.', 'success');
            this.loadData();
          }
        },
        error: (err) => {
          this.showToast(err.error?.error || 'Error al eliminar la colección.', 'error');
        },
      });
    }
  }

  // ─── MODAL ASIGNAR PRODUCTOS ───────────────────────────────────────
  openProductsModal(coll: Collection): void {
    this.selectedCollection.set(coll);
    const currentIds = new Set<number>(coll.product_ids || []);
    this.selectedProductIds.set(currentIds);
    this.productFilterQuery = '';
    this.productFilterCategory = 'ALL';
    this.isProductsModalOpen.set(true);
  }

  closeProductsModal(): void {
    this.isProductsModalOpen.set(false);
    this.selectedCollection.set(null);
  }

  toggleProductSelection(productId: number): void {
    const updated = new Set(this.selectedProductIds());
    if (updated.has(productId)) {
      updated.delete(productId);
    } else {
      updated.add(productId);
    }
    this.selectedProductIds.set(updated);
  }

  selectAllFilteredProducts(): void {
    const updated = new Set(this.selectedProductIds());
    for (const p of this.filteredCandidateProducts()) {
      updated.add(p.id);
    }
    this.selectedProductIds.set(updated);
  }

  clearSelectedProducts(): void {
    this.selectedProductIds.set(new Set());
  }

  saveCollectionProducts(): void {
    if (!this.selectedCollection()) return;

    this.isSaving.set(true);
    const collectionId = this.selectedCollection()!.id;
    const productIds = Array.from(this.selectedProductIds());

    this.api.setCollectionProducts(collectionId, productIds).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('¡Productos de la colección actualizados exitosamente!', 'success');
          this.collections.update((cols) =>
            cols.map((c) =>
              c.id === collectionId
                ? { ...c, product_ids: productIds, product_count: productIds.length }
                : c
            )
          );
          this.closeProductsModal();
          this.loadData();
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        this.showToast(err.error?.error || 'Error al guardar los productos de la colección.', 'error');
        this.isSaving.set(false);
      },
    });
  }
}
