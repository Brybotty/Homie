import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductStateService } from '../../../../core/services/product-state.service';
import { CartService } from '../../../../core/services/cart.service';
import { CopCurrencyPipe } from '../../../../shared/pipes/cop-currency.pipe';
import { ProductWithVariants, ProductVariant } from '../../../../core/models';

interface DynamicFeaturedSlide {
  id: number;
  slug: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  bgGradient: string;
  glowColor: string;
  product: ProductWithVariants;
  variant: ProductVariant;
}

@Component({
  selector: 'app-featured-banner-slider',
  standalone: true,
  imports: [CommonModule, RouterLink, CopCurrencyPipe],
  template: `
    @if (slides().length > 0) {
      <div
        class="relative overflow-hidden rounded-3xl shadow-2xl transition-all select-none group"
        (mouseenter)="pauseAutoPlay()"
        (mouseleave)="resumeAutoPlay()"
        (touchstart)="pauseAutoPlay()"
        (touchend)="resumeAutoPlay()"
      >
        @let slide = currentSlide();

        @if (slide) {
          <!-- Contenedor del Slide actual con animación suave -->
          <div
            class="relative min-h-[360px] sm:min-h-[420px] lg:min-h-[440px] flex items-center p-6 sm:p-10 lg:p-14 text-white transition-all duration-700 ease-out"
            [ngClass]="slide.bgGradient"
          >
            <!-- Ambient Glow Decorativo -->
            <div
              class="absolute -right-16 -top-16 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
              [ngClass]="slide.glowColor"
            ></div>
            <div class="absolute -left-10 -bottom-10 w-64 h-64 rounded-full blur-3xl opacity-20 bg-emerald-500 pointer-events-none"></div>

            <!-- Grid Contenido: Texto izquierda, Producto derecha -->
            <div class="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full max-w-6xl mx-auto">
              
              <!-- Columna Texto & Acciones -->
              <div class="md:col-span-7 space-y-4 sm:space-y-6 text-left">
                <!-- Badge superior -->
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border shadow-md backdrop-blur-md"
                    [ngClass]="slide.badgeColor"
                  >
                    {{ slide.badge }}
                  </span>
                  <span class="text-[11px] text-emerald-300/80 font-bold hidden sm:inline">
                    • Envío rápido a toda Colombia
                  </span>
                </div>

                <!-- Título Principal del Producto Real -->
                <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                  {{ slide.title }}
                </h2>

                <!-- Descripción Real del Producto -->
                <p class="text-xs sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3">
                  {{ slide.description }}
                </p>

                <!-- Precio & Botones de Acción -->
                <div class="pt-2 sm:pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <!-- Precio al Detal -->
                  <div class="flex flex-col">
                    <span class="text-[10px] sm:text-xs text-emerald-300 font-bold uppercase tracking-wider">Precio especial</span>
                    <span class="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {{ slide.price | copCurrency }}
                    </span>
                  </div>

                  <!-- Botones -->
                  <div class="flex items-center gap-3">
                    <!-- Botón Primario: Agregar al carrito con variante real -->
                    <button
                      (click)="addToCart(slide)"
                      class="px-5 sm:px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      @if (addedToCartId() === slide.id) {
                        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>¡Agregado!</span>
                      } @else {
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Agregar al Carrito</span>
                      }
                    </button>

                    <!-- Botón Secundario: Ver producto real -->
                    <a
                      [routerLink]="['/producto', slide.slug]"
                      class="px-4 sm:px-5 py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Ver Detalle</span>
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Columna Marco Redondo de Exhibición para el Producto -->
              <div class="md:col-span-5 flex justify-center items-center relative py-2 sm:py-4">
                <a [routerLink]="['/producto', slide.slug]" class="block relative cursor-pointer group/img select-none">
                  <!-- Halo de resplandor ambiental circular posterior -->
                  <div class="absolute -inset-4 rounded-full blur-3xl opacity-50 bg-emerald-400/30 group-hover/img:opacity-75 transition-opacity duration-500"></div>

                  <!-- Anillo decorativo exterior con gradiente dinámico -->
                  <div class="relative p-1.5 sm:p-2.5 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-amber-300 shadow-2xl group-hover/img:scale-105 transition-transform duration-500 ease-out">
                    
                    <!-- Bisel intermedio circular tipo glassmorphism -->
                    <div class="p-1 sm:p-1.5 rounded-full bg-slate-950/80 border border-white/20 backdrop-blur-md">
                      
                      <!-- Marco Redondo Central de la Imagen -->
                      <div class="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/90 via-slate-900/95 to-slate-950 shadow-inner flex items-center justify-center border border-white/10">
                        
                        <!-- Línea circular de acento / órbita sutil -->
                        <div class="absolute inset-3 sm:inset-4 rounded-full border border-dashed border-white/15 pointer-events-none"></div>

                        <!-- Reflejo de cristal curvo superior -->
                        <div class="absolute -top-1/3 left-1/4 w-full h-full bg-gradient-to-b from-white/15 to-transparent rounded-full pointer-events-none transform -rotate-12"></div>

                        <!-- Imagen del producto encajada de forma circular y elegante -->
                        <img
                          [src]="slide.imageUrl"
                          [alt]="slide.title"
                          class="w-full h-full object-cover p-3 sm:p-5 rounded-full group-hover/img:scale-110 transition-transform duration-500 ease-out drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                          loading="eager"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Badge flotante al pie del marco redondo -->
                  <div class="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1 rounded-full bg-slate-950/90 text-[10px] sm:text-xs font-black text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                    <span class="text-xs">✦</span>
                    <span>Destacado Homie</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Flechas de navegación (Prev / Next) -->
          @if (slides().length > 1) {
            <button
              (click)="prevSlide()"
              class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer"
              aria-label="Slide anterior"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              (click)="nextSlide()"
              class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer"
              aria-label="Siguiente slide"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Indicadores Dots inferiores -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10">
              @for (item of slides(); track item.id; let idx = $index) {
                <button
                  (click)="goToSlide(idx)"
                  class="transition-all duration-300 rounded-full cursor-pointer"
                  [ngClass]="
                    idx === currentIndex()
                      ? 'w-6 h-2 bg-emerald-400 shadow-xs shadow-emerald-400/50'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                  "
                  [attr.aria-label]="'Ir al slide ' + (idx + 1)"
                ></button>
              }
            </div>
          }
        }
      </div>
    } @else {
      <!-- Placeholder de Carga / Skeleton mientras cargan los productos reales -->
      <div class="w-full min-h-[360px] rounded-3xl bg-slate-900/80 animate-pulse flex items-center justify-center p-8 text-center border border-slate-800">
        <div class="space-y-3">
          <div class="w-32 h-6 bg-slate-800 rounded-full mx-auto"></div>
          <div class="w-64 h-8 bg-slate-800 rounded-xl mx-auto"></div>
          <div class="w-48 h-4 bg-slate-800/60 rounded mx-auto"></div>
        </div>
      </div>
    }
  `,
})
export class FeaturedBannerSliderComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private state = inject(ProductStateService);

  currentIndex = signal<number>(0);
  addedToCartId = signal<number | null>(null);
  private intervalId: any = null;
  private isPaused = false;

  private readonly stylesConfig = [
    {
      badge: '🔥 Más Vendido',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      bgGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80',
      glowColor: 'bg-amber-500',
    },
    {
      badge: '✨ Edición Destacada',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      bgGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/90',
      glowColor: 'bg-emerald-500',
    },
    {
      badge: '⚡ Tendencia Viral',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      bgGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/80',
      glowColor: 'bg-teal-400',
    },
    {
      badge: '💎 Coleccionable Homie',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
      bgGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80',
      glowColor: 'bg-indigo-500',
    },
  ];

  // Slides 100% reactivos generados ÚNICAMENTE a partir de productos reales que existen en la BD
  readonly slides = computed<DynamicFeaturedSlide[]>(() => {
    const prods = this.state.products();
    if (!prods || prods.length === 0) return [];

    // Tomar productos que tengan imagen y variantes válidas
    const validProds = prods.filter(
      (p) => (p.featured_image_url || p.variants?.[0]?.image_url) && p.variants && p.variants.length > 0
    );

    const candidates = validProds.slice(0, 4);

    return candidates.map((p, i) => {
      const cfg = this.stylesConfig[i % this.stylesConfig.length];
      const variant = p.variants[0];
      const minPrice = Math.min(...p.variants.map((v) => v.retail_price));
      const image = p.featured_image_url || variant.image_url || '';

      return {
        id: p.id,
        slug: p.slug,
        badge: cfg.badge,
        badgeColor: cfg.badgeColor,
        title: p.name,
        description: p.short_description || p.description || 'Diseño de alta calidad garantizado.',
        price: minPrice,
        imageUrl: image,
        bgGradient: cfg.bgGradient,
        glowColor: cfg.glowColor,
        product: p,
        variant: variant,
      };
    });
  });

  currentSlide = computed(() => {
    const list = this.slides();
    if (list.length === 0) return null;
    const idx = this.currentIndex() % list.length;
    return list[idx];
  });

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.intervalId = setInterval(() => {
      if (!this.isPaused && this.slides().length > 1) {
        this.nextSlide();
      }
    }, 5000);
  }

  stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  pauseAutoPlay(): void {
    this.isPaused = true;
  }

  resumeAutoPlay(): void {
    this.isPaused = false;
  }

  nextSlide(): void {
    const len = this.slides().length;
    if (len > 1) {
      this.currentIndex.update((prev) => (prev + 1) % len);
    }
  }

  prevSlide(): void {
    const len = this.slides().length;
    if (len > 1) {
      this.currentIndex.update((prev) => (prev - 1 + len) % len);
    }
  }

  goToSlide(index: number): void {
    this.currentIndex.set(index);
  }

  addToCart(slide: DynamicFeaturedSlide): void {
    // Agregar directamente la variante REAL del producto a través de CartService con su imagen real
    this.cartService.addItem(slide.variant, slide.product.name, 1, slide.imageUrl);

    this.addedToCartId.set(slide.id);
    setTimeout(() => {
      this.addedToCartId.set(null);
    }, 2000);
  }
}
