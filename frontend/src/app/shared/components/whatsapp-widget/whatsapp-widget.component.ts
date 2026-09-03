import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductStateService } from '../../../core/services/product-state.service';

@Component({
  selector: 'app-whatsapp-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ─── WIDGET FLOTANTE DE WHATSAPP ─────────────────────────────────── -->
    <div class="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto">

      <!-- Modal Card Emergente de Chat -->
      @if (isOpen()) {
        <div
          class="mb-3 w-[calc(100vw-2.5rem)] sm:w-96 max-w-[380px] bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right animate-fade-in text-slate-800"
        >
          <!-- Header del Asesor -->
          <div class="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-4 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <!-- Avatar Asesor con punto verde -->
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-base shadow-inner">
                  ☕
                </div>
                <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-700 rounded-full"></span>
              </div>

              <div>
                <h4 class="font-bold text-sm leading-tight text-white">Asesor Homie</h4>
                <div class="flex items-center gap-1.5 text-[11px] text-emerald-100 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>En línea • Respuesta rápida</span>
                </div>
              </div>
            </div>

            <!-- Botón Cerrar Card -->
            <button
              (click)="toggleOpen()"
              class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          <!-- Cuerpo del Chat -->
          <div class="p-4 bg-slate-50 space-y-3 max-h-[380px] overflow-y-auto">
            <!-- Burbuja de Bienvenida -->
            <div class="flex items-start gap-2 max-w-[90%]">
              <div class="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-xs text-xs text-slate-700 space-y-1">
                <p class="font-semibold text-slate-900">¡Hola! 👋 Bienvenido a Homie.</p>
                <p class="text-slate-600 leading-relaxed">
                  ¿Cómo podemos ayudarte hoy con tus mugs, termos o pedidos?
                </p>
                @if (productContext()) {
                  <div class="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                    <span class="text-base">📦</span>
                    <div class="text-[10px] leading-tight">
                      <p class="font-bold text-emerald-900 line-clamp-1">{{ productContext()!.product.name }}</p>
                      <p class="text-emerald-700 font-mono">SKU: {{ productContext()!.sku }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Si el usuario seleccionó la opción de rastreo, mostramos la tarjeta explicativa -->
            @if (showTrackingInfo()) {
              <div class="bg-emerald-900 text-white p-3.5 rounded-2xl text-xs space-y-2.5 shadow-md animate-fade-in">
                <div class="flex items-center justify-between border-b border-emerald-800 pb-1.5">
                  <span class="font-bold flex items-center gap-1.5 text-emerald-300">
                    <span>📦 Rastrear Pedido Nacional</span>
                  </span>
                  <button (click)="showTrackingInfo.set(false)" class="text-slate-400 hover:text-white text-[10px]">✕</button>
                </div>
                <p class="text-emerald-100 text-[11px] leading-relaxed">
                  Despachamos por <strong class="text-white">Envía, Interrapidísimo y Coordinadora</strong> con cobertura en toda Colombia.
                </p>
                <div class="space-y-1 text-[11px] text-emerald-200 bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/80">
                  <p>• <strong>Bogotá / Sabana:</strong> 1 a 2 días hábiles.</p>
                  <p>• <strong>Ciudades Principales:</strong> 2 a 3 días hábiles.</p>
                  <p>• <strong>Otros Municipios:</strong> 3 a 5 días hábiles.</p>
                </div>
                <p class="text-[10px] text-emerald-300/90">
                  ¿Tienes tu número de guía? Puedes consultarlo directamente con nuestro asesor:
                </p>
                <a
                  [href]="buildWhatsAppUrl('¡Hola Homie! Deseo rastrear mi pedido nacional. ¿Podrían ayudarme con el estado de mi envío?')"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-center text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <span>Consultar Guía por WhatsApp</span>
                  <span>→</span>
                </a>
              </div>
            }

            <!-- Opciones Rápidas del Asistente -->
            <div class="space-y-2 pt-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Elige una opción rápida:
              </span>

              <!-- Opción 1: Rastrear Pedido -->
              <button
                (click)="toggleTrackingInfo()"
                class="w-full text-left p-3 bg-white hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 rounded-2xl transition-all flex items-center justify-between text-xs font-semibold text-slate-800 group cursor-pointer shadow-xs"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base group-hover:scale-110 transition-transform">📦</span>
                  <span>¿Cómo rastrear mi pedido nacional?</span>
                </div>
                <svg class="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- Opción 2: Hablar con un asesor (contextual) -->
              <a
                [href]="advisorUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full text-left p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl transition-all flex items-center justify-between text-xs font-extrabold shadow-md shadow-emerald-600/20 group cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base group-hover:scale-110 transition-transform">💬</span>
                  <span>Hablar con un asesor humano</span>
                </div>
                <svg class="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Footer del modal -->
          <div class="p-2.5 bg-white border-t border-slate-100 text-center">
            <span class="text-[10px] text-slate-400 font-medium">
              Atención de Lunes a Sábado de 8:00 AM a 8:00 PM
            </span>
          </div>
        </div>
      }

      <!-- Botón Principal Flotante -->
      <button
        (click)="toggleOpen()"
        class="relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold px-4 py-3.5 rounded-full shadow-2xl shadow-emerald-900/30 hover:shadow-emerald-500/40 transition-all duration-300 cursor-pointer group"
        aria-label="Abrir asistente de WhatsApp"
      >
        <!-- Ícono oficial de WhatsApp SVG -->
        <svg class="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>

        <span class="text-xs font-extrabold tracking-tight hidden sm:inline">WhatsApp</span>

        <!-- Badge de disponibilidad en línea con pulso animado -->
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
      </button>
    </div>
  `,
})
export class WhatsAppWidgetComponent {
  private state = inject(ProductStateService);

  readonly BASE_LINK = 'https://wa.link/tkwoty';

  isOpen = signal<boolean>(false);
  showTrackingInfo = signal<boolean>(false);

  // Detecta si el usuario está visualizando un producto específico en la tienda
  productContext = computed(() => {
    const product = this.state.currentDetailProduct();
    if (!product) return null;
    const variant = this.state.currentDetailVariant() || (product.variants?.[0] ?? null);
    return {
      product,
      variant,
      sku: variant?.sku || product.slug,
    };
  });

  // URL contextual para hablar con un asesor
  advisorUrl = computed(() => {
    const ctx = this.productContext();
    if (ctx) {
      return this.buildWhatsAppUrl(
        `¡Hola Homie! Tengo una duda sobre el producto *${ctx.product.name}* (SKU: ${ctx.sku}). ¿Podrían asesorarme?`
      );
    }
    return this.buildWhatsAppUrl('¡Hola Homie! Me gustaría hablar con un asesor sobre sus productos.');
  });

  toggleOpen(): void {
    this.isOpen.update((v) => !v);
    if (!this.isOpen()) {
      this.showTrackingInfo.set(false);
    }
  }

  toggleTrackingInfo(): void {
    this.showTrackingInfo.update((v) => !v);
  }

  buildWhatsAppUrl(message: string): string {
    // Si la URL corta es wa.link, concatenamos el parámetro de texto codificado
    const encoded = encodeURIComponent(message);
    return `${this.BASE_LINK}?text=${encoded}`;
  }
}
