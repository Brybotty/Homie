import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductStateService } from '../../../../core/services/product-state.service';
import { Collection } from '../../../../core/models';

@Component({
  selector: 'app-thematic-collections',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-2" aria-label="Colecciones Temáticas">
      <!-- Header de la sección -->
      <div class="flex items-center justify-between px-1 mb-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span class="text-emerald-500">🔥</span>
            <span>Explora por Colección</span>
          </span>
          <span class="text-[10px] text-slate-400 font-medium hidden sm:inline">• Filtro rápido</span>
        </div>
        @if (state.selectedThematic()) {
          <button
            (click)="selectThematic(null)"
            class="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Limpiar filtro</span>
            <span>✕</span>
          </button>
        }
      </div>

      <!-- Barra deslizable horizontal estilo Stories de Instagram -->
      <div
        class="flex items-center gap-3 sm:gap-4 overflow-x-auto py-2 px-1 scroll-smooth select-none scrollbar-none"
        style="-ms-overflow-style: none; scrollbar-width: none;"
      >
        <!-- Botón Especial: Todos -->
        <button
          (click)="selectThematic(null)"
          class="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none cursor-pointer transition-transform active:scale-95"
          title="Ver catálogo completo"
        >
          <div
            class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 shadow-xs"
            [ngClass]="
              !state.selectedThematic()
                ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 shadow-md shadow-emerald-500/20'
                : 'bg-gradient-to-tr from-slate-200 via-slate-300 to-slate-200 group-hover:from-emerald-400 group-hover:to-teal-500'
            "
          >
            <div class="w-full h-full rounded-full flex flex-col items-center justify-center p-2 text-white border-2 border-white shadow-inner bg-gradient-to-br from-slate-800 to-slate-950">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
          </div>
          <span
            class="text-[11px] sm:text-xs font-bold text-center tracking-tight truncate max-w-[64px] sm:max-w-[76px] transition-colors"
            [ngClass]="!state.selectedThematic() ? 'text-emerald-700 font-extrabold' : 'text-slate-700 group-hover:text-slate-900'"
          >
            Todos
          </span>
        </button>

        <!-- Colecciones dinámicas de la Base de Datos -->
        @for (coll of displayCollections(); track coll.id) {
          @let isActive = state.selectedThematic() === coll.slug;
          <button
            (click)="selectThematic(coll.slug)"
            class="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none cursor-pointer transition-transform active:scale-95"
            [title]="coll.name + ' (' + (coll.product_count || 0) + ' productos)'"
          >
            <!-- Círculo exterior tipo Stories con animación al hover -->
            <div
              class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2.5px] transition-all duration-300 group-hover:scale-105 shadow-xs"
              [ngClass]="
                isActive
                  ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-gradient-to-tr from-slate-200 via-slate-300 to-slate-200 group-hover:from-emerald-400 group-hover:to-teal-500'
              "
            >
              <!-- Círculo interior con imagen personalizada o gradiente temático -->
              <div class="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-inner bg-slate-900 flex items-center justify-center">
                @if (coll.image_url) {
                  <img
                    [src]="coll.image_url"
                    [alt]="coll.name"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                } @else {
                  <div
                    class="w-full h-full flex items-center justify-center text-white font-black text-sm uppercase bg-gradient-to-br from-emerald-600 to-teal-800"
                  >
                    {{ coll.name.substring(0, 2) }}
                  </div>
                }
              </div>

              <!-- Badge de colección (ej: Top, Hot, Nuevo) -->
              @if (coll.badge) {
                <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-slate-900 text-[8px] font-black text-amber-300 rounded-full border border-slate-800 uppercase shadow-xs whitespace-nowrap">
                  {{ coll.badge }}
                </span>
              }
            </div>

            <!-- Nombre de la colección -->
            <span
              class="text-[11px] sm:text-xs font-bold text-center tracking-tight truncate max-w-[64px] sm:max-w-[76px] transition-colors"
              [ngClass]="isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-700 group-hover:text-slate-900'"
            >
              {{ coll.name }}
            </span>
          </button>
        }
      </div>
    </section>
  `,
})
export class ThematicCollectionsComponent {
  state = inject(ProductStateService);

  // Muestra las colecciones de la base de datos cargadas por el admin
  displayCollections = computed(() => {
    return this.state.collections();
  });

  selectThematic(slug: string | null): void {
    this.state.setThematic(slug);
  }
}
