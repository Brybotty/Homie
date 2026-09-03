import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductStateService } from '../../core/services/product-state.service';
import { ApiService } from '../../core/services/api.service';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CreateOrderDto, OrderDetail, PaymentMethod } from '../../core/models';
import { COLOMBIA_DEPARTAMENTOS } from '../../core/data/colombia.data';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CopCurrencyPipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      @if (completedOrder()) {
        <!-- Pantalla de Éxito / Confirmación -->
        <div class="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl text-center space-y-6">
          <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              ¡Pedido Confirmado!
            </span>
            <h1 class="text-3xl font-extrabold text-slate-900">Gracias por tu compra</h1>
            <p class="text-sm text-slate-500">
              Hemos recibido tu orden correctamente. Estamos preparando tus productos.
            </p>
          </div>

          <!-- Código de Orden -->
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block text-left w-full space-y-2">
            <div class="flex justify-between text-xs text-slate-500">
              <span>Código de seguimiento:</span>
              <span class="font-bold text-slate-900 font-mono text-sm">{{ completedOrder()!.order_code }}</span>
            </div>
            <div class="flex justify-between text-xs text-slate-500">
              <span>Destinatario:</span>
              <span class="font-semibold text-slate-800">{{ completedOrder()!.customer.full_name }}</span>
            </div>
            <div class="flex justify-between text-xs text-slate-500">
              <span>Dirección de entrega:</span>
              <span class="font-semibold text-slate-800">{{ completedOrder()!.customer.address }}, {{ completedOrder()!.customer.city }}</span>
            </div>
            <div class="flex justify-between text-xs text-slate-500">
              <span>Método de pago:</span>
              <span class="font-bold text-emerald-600">{{ completedOrder()!.payment_method }}</span>
            </div>
            <div class="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total a Pagar:</span>
              <span class="text-emerald-600">{{ completedOrder()!.total_amount | copCurrency }}</span>
            </div>
          </div>

          <!-- Paso Final de Pago Nequi si seleccionó este método -->
          @if (completedOrder()!.payment_method === 'NEQUI') {
            <div class="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 text-left space-y-3 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-[#200020] text-purple-300 font-black text-xs flex items-center justify-center">
                    N
                  </div>
                  <span class="font-extrabold text-sm text-purple-950">Paso Final: Transfiere por Nequi</span>
                </div>
                <span class="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  Pendiente Comprobante
                </span>
              </div>

              <div class="p-3 bg-white rounded-xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-400 block">Total exacto a transferir:</span>
                  <span class="text-xl font-black text-purple-900 font-mono">{{ completedOrder()!.total_amount | copCurrency }}</span>
                </div>
                <div class="sm:text-right flex items-center sm:flex-col justify-between">
                  <span class="text-[10px] uppercase font-bold text-slate-400 block">Número de Celular Nequi:</span>
                  <div class="flex items-center gap-2">
                    <span class="text-base font-black text-slate-900 font-mono">320 618 2526</span>
                    <button
                      type="button"
                      (click)="copyNequiNumber()"
                      class="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                    >
                      {{ nequiCopied() ? '✓ Copiado' : 'Copiar' }}
                    </button>
                  </div>
                </div>
              </div>

              <p class="text-xs text-purple-900 leading-snug">
                📌 <strong>Importante:</strong> Para despachar tu paquete, transfiere a la cuenta Nequi <strong>320 618 2526</strong> y presiona el botón verde abajo para adjuntar la foto o captura de tu comprobante con el código <strong>#{{ completedOrder()!.order_code }}</strong>.
              </p>
            </div>
          }

          <!-- Paso Final de Pago PSE / Wompi si seleccionó este método -->
          @if (completedOrder()!.payment_method === 'PSE') {
            <div class="p-5 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-2xl border border-sky-200 text-left space-y-4 shadow-xs">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    💳
                  </div>
                  <div>
                    <h4 class="font-extrabold text-sm text-sky-950 leading-tight">Pago PSE / Wompi (Bancolombia)</h4>
                    <p class="text-[11px] text-sky-700">Débito desde tu banco y tarjetas</p>
                  </div>
                </div>
                <span class="text-xs font-extrabold text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                  Pasarela Segura
                </span>
              </div>

              <div class="p-4 bg-white rounded-xl border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-400 block">Total de tu orden:</span>
                  <span class="text-2xl font-black text-sky-950 font-mono">{{ completedOrder()!.total_amount | copCurrency }}</span>
                </div>
                <div>
                  <a
                    [href]="wompiPaymentLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 text-white font-extrabold text-sm rounded-xl shadow-md shadow-sky-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>🔒 Pagar ahora en Wompi</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              <div class="p-3 bg-sky-100/70 rounded-xl text-xs text-sky-950 space-y-1 leading-relaxed">
                <p>
                  💡 <strong>Instrucciones:</strong> Haz clic en el botón azul <strong>"Pagar ahora en Wompi"</strong> para ingresar al portal protegido de Bancolombia y realizar tu débito bancario vía <strong>PSE</strong> o tarjeta.
                </p>
                <p class="text-[11px] text-sky-800">
                  Referencia de orden: <strong class="font-mono font-bold text-sky-950">{{ completedOrder()!.order_code }}</strong>
                </p>
              </div>
            </div>
          }

          <!-- Acciones -->
          <div class="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <a
              [href]="getWhatsAppLink()"
              target="_blank"
              class="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <span>Confirmar por WhatsApp</span>
            </a>
            <a
              routerLink="/"
              class="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl flex items-center justify-center transition-all"
            >
              Volver a la Tienda
            </a>
          </div>
        </div>
      } @else if (cart.items().length === 0) {
        <!-- Carrito Vacío -->
        <div class="max-w-md mx-auto py-20 text-center space-y-4">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-900">No hay productos en el carrito</h2>
          <p class="text-slate-500 text-sm">Agrega productos antes de realizar el checkout.</p>
          <a routerLink="/" class="inline-block px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md">
            Explorar Catálogo
          </a>
        </div>
      } @else {
        <!-- Formulario de Checkout en 1 Paso -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <!-- Columna Izquierda: Formulario -->
          <div class="lg:col-span-7 space-y-6">
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              <div class="border-b border-slate-100 pb-4">
                <h2 class="text-2xl font-extrabold text-slate-900">Datos de Envío y Contacto</h2>
                <p class="text-xs text-slate-500 mt-1">Completa los datos para despachar tu pedido en Colombia.</p>
              </div>

              @if (errorMessage()) {
                <div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold">
                  {{ errorMessage() }}
                </div>
              }

              <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <!-- Nombre y Teléfono -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      formControlName="full_name"
                      placeholder="Ej. Juan Pérez"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                    @if (f['full_name'].touched && f['full_name'].invalid) {
                      <span class="text-xs text-rose-600 font-medium">El nombre es obligatorio.</span>
                    }
                  </div>

                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Teléfono WhatsApp (10 dígitos) *
                    </label>
                    <input
                      type="tel"
                      formControlName="phone"
                      placeholder="Ej. 3101234567"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                    @if (f['phone'].touched && f['phone'].invalid) {
                      <span class="text-xs text-rose-600 font-medium">Ingresa un número válido de 10 dígitos.</span>
                    }
                  </div>
                </div>

                <!-- Email y Cédula -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      formControlName="email"
                      placeholder="ejemplo@correo.com"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Cédula / Documento (Opcional)
                    </label>
                    <input
                      type="text"
                      formControlName="document_id"
                      placeholder="Para factura"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <!-- Dirección y Barrio -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="sm:col-span-2">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Dirección de Entrega *
                    </label>
                    <input
                      type="text"
                      formControlName="address"
                      placeholder="Ej. Calle 123 # 45 - 67 Apto 301"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                    @if (f['address'].touched && f['address'].invalid) {
                      <span class="text-xs text-rose-600 font-medium">La dirección es obligatoria.</span>
                    }
                  </div>

                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Barrio
                    </label>
                    <input
                      type="text"
                      formControlName="neighborhood"
                      placeholder="Ej. Cedritos"
                      class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <!-- Departamento y Ciudad / Municipio (Desplegables Oficiales de Colombia DANE) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Departamento Dropdown -->
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Departamento *
                    </label>
                    <div class="relative">
                      <select
                        formControlName="department"
                        (change)="onDepartmentChange($event)"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="" disabled>Selecciona un Departamento</option>
                        @for (dept of departamentos; track dept.departamento) {
                          <option [value]="dept.departamento">{{ dept.departamento }}</option>
                        }
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    @if (f['department'].touched && f['department'].invalid) {
                      <span class="text-xs text-rose-600 font-medium">Selecciona un departamento.</span>
                    }
                  </div>

                  <!-- Ciudad / Municipio Dropdown -->
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Ciudad / Municipio *
                    </label>
                    <div class="relative">
                      <select
                        formControlName="city"
                        [disabled]="availableCities().length === 0"
                        class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="" disabled>
                          {{ availableCities().length === 0 ? 'Primero selecciona un departamento' : 'Selecciona un Municipio' }}
                        </option>
                        @for (city of availableCities(); track city) {
                          <option [value]="city">{{ city }}</option>
                        }
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    @if (f['city'].touched && f['city'].invalid) {
                      <span class="text-xs text-rose-600 font-medium">Selecciona un municipio.</span>
                    }
                  </div>
                </div>

                <!-- Método de Pago -->
                <div class="space-y-3 pt-4 border-t border-slate-100">
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Método de Pago Seleccionado *
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      [ngClass]="f['payment_method'].value === 'CONTRAENTREGA' ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20' : 'border-slate-200 bg-slate-50'"
                      class="p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all"
                    >
                      <input type="radio" formControlName="payment_method" value="CONTRAENTREGA" class="sr-only" />
                      <div class="font-bold text-sm text-slate-900">Contraentrega</div>
                      <div class="text-xs text-slate-500 mt-1">Pagas al recibir en tu puerta</div>
                    </label>

                    <label
                      [ngClass]="f['payment_method'].value === 'NEQUI' ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20' : 'border-slate-200 bg-slate-50'"
                      class="p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all"
                    >
                      <input type="radio" formControlName="payment_method" value="NEQUI" class="sr-only" />
                      <div class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-purple-600"></span>
                        <span>Nequi</span>
                      </div>
                      <div class="text-xs text-slate-500 mt-1">Transferencia al 320 618 2526</div>
                    </label>

                    <label
                      [ngClass]="f['payment_method'].value === 'PSE' ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20' : 'border-slate-200 bg-slate-50'"
                      class="p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all"
                    >
                      <input type="radio" formControlName="payment_method" value="PSE" class="sr-only" />
                      <div class="font-bold text-sm text-slate-900">PSE / Wompi</div>
                      <div class="text-xs text-slate-500 mt-1">Bancolombia y Débito bancario</div>
                    </label>
                  </div>

                  <!-- Detalle Informativo cuando elige Nequi -->
                  @if (f['payment_method'].value === 'NEQUI') {
                    <div class="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3 animate-fade-in">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-lg bg-[#200020] text-purple-300 font-black text-xs flex items-center justify-center">
                            N
                          </div>
                          <span class="font-black text-xs text-purple-950 uppercase tracking-wide">
                            Cuenta Oficial Nequi Homie
                          </span>
                        </div>
                        <span class="px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 text-[10px] font-black">
                          Sin Comisiones
                        </span>
                      </div>

                      <div class="p-3 bg-white rounded-xl border border-purple-100 flex items-center justify-between gap-3 shadow-xs">
                        <div>
                          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Número Celular Nequi
                          </span>
                          <span class="text-base font-black text-purple-950 font-mono tracking-wide">
                            320 618 2526
                          </span>
                        </div>
                        <button
                          type="button"
                          (click)="copyNequiNumber()"
                          class="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                        >
                          {{ nequiCopied() ? '✓ ¡Copiado!' : '📋 Copiar' }}
                        </button>
                      </div>

                      <p class="text-[11px] text-purple-900 leading-snug">
                        💡 Realizas el pedido aquí, abres tu app Nequi, transfieres el monto al <strong>320 618 2526</strong> y envías tu comprobante a nuestro WhatsApp para despacho inmediato.
                      </p>
                    </div>
                  }

                  <!-- Detalle Informativo cuando elige PSE / Wompi -->
                  @if (f['payment_method'].value === 'PSE') {
                    <div class="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-2.5 animate-fade-in">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="text-base">🔒</span>
                          <span class="font-black text-xs text-sky-950 uppercase tracking-wide">
                            Pasarela Segura PSE / Wompi (Bancolombia)
                          </span>
                        </div>
                        <span class="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 text-[10px] font-black">
                          Oficial Bancolombia
                        </span>
                      </div>
                      <p class="text-xs text-sky-900 leading-relaxed">
                        Permite transferencias en tiempo real desde cualquier banco colombiano vía PSE o tarjetas con verificación bancaria segura.
                      </p>
                      @if (!hasWompiConfigured) {
                        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                          <span class="text-base leading-none">⚠️</span>
                          <div class="space-y-1">
                            <p class="font-bold">Aviso de pasarela:</p>
                            <p class="text-[11px] leading-snug text-amber-800">
                              Para garantizar pagos seguros con verificación bancaria, Wompi requiere tu Llave Pública de Bancolombia. Para comprar de inmediato sin demoras, puedes seleccionar <strong>Nequi (320 618 2526)</strong> o <strong>Pago Contraentrega</strong>.
                            </p>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Notas de entrega -->
                <div class="pt-2">
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Instrucciones Especiales de Entrega
                  </label>
                  <textarea
                    formControlName="delivery_notes"
                    rows="2"
                    placeholder="Ej. Dejar en portería con el celador..."
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  ></textarea>
                </div>

                <!-- Botón de Envío -->
                <div class="pt-4">
                  <button
                    type="submit"
                    [disabled]="isSubmitting()"
                    [ngClass]="f['payment_method'].value === 'PSE' ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/30' : f['payment_method'].value === 'NEQUI' ? 'bg-purple-700 hover:bg-purple-800 shadow-purple-700/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'"
                    class="w-full py-4 px-6 text-white font-extrabold text-base rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
                  >
                    @if (isSubmitting()) {
                      <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Generando Pago Seguro...</span>
                    } @else if (f['payment_method'].value === 'PSE') {
                      <span>🔒 Pagar con PSE / Wompi ({{ grandTotal | copCurrency }})</span>
                    } @else if (f['payment_method'].value === 'NEQUI') {
                      <span>Confirmar y Pagar por Nequi ({{ grandTotal | copCurrency }})</span>
                    } @else {
                      <span>Confirmar Pedido Contraentrega ({{ grandTotal | copCurrency }})</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Columna Derecha: Resumen de Pedido -->
          <div class="lg:col-span-5 space-y-6">
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 sticky top-28">
              <h3 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Resumen del Carrito ({{ cart.count() }})
              </h3>

              <!-- Lista de ítems -->
              <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
                @for (item of cart.items(); track item.variant_id) {
                  <div class="flex gap-3 py-2 border-b border-slate-50">
                    <img
                      [src]="getItemImage(item)"
                      [alt]="item.product_name"
                      (error)="onImgError($event)"
                      class="w-14 h-14 object-contain p-1 rounded-xl bg-slate-50 border border-slate-200"
                    />
                    <div class="flex-1 text-xs space-y-1">
                      <h4 class="font-bold text-slate-800 line-clamp-1">{{ item.product_name }}</h4>
                      <p class="text-slate-500">{{ item.variant_name }} × {{ item.quantity }}</p>
                      <p class="font-extrabold text-slate-900">{{ item.retail_price * item.quantity | copCurrency }}</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Desglose de Precios -->
              <div class="space-y-2 pt-2 text-sm">
                <div class="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span class="font-semibold text-slate-800">{{ cart.total() | copCurrency }}</span>
                </div>
                <div class="flex justify-between text-slate-500">
                  <span>Costo de Envío</span>
                  <span class="font-semibold text-emerald-600">{{ shippingCost | copCurrency }}</span>
                </div>
                <div class="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total Final</span>
                  <span class="text-emerald-600 text-xl">{{ grandTotal | copCurrency }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private productState = inject(ProductStateService);
  cart = inject(CartService);

  checkoutForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  completedOrder = signal<OrderDetail | null>(null);

  readonly shippingCost = 12000;

  get grandTotal(): number {
    return this.cart.total() + this.shippingCost;
  }

  get f() {
    return this.checkoutForm.controls;
  }

  getItemImage(item: any): string {
    if (item.image_url && item.image_url.trim()) {
      return item.image_url;
    }
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

  // Geo Data de Colombia (DANE)
  departamentos = COLOMBIA_DEPARTAMENTOS;
  selectedDepartment = signal<string>('Bogotá D.C.');
  availableCities = computed(() => {
    const deptName = this.selectedDepartment();
    if (!deptName) return [];
    const dept = this.departamentos.find((d) => d.departamento.toLowerCase() === deptName.toLowerCase());
    return dept ? dept.ciudades : [];
  });

  // Nequi
  nequiNumber = environment.nequiPhoneNumber || '3206182526';
  nequiCopied = signal<boolean>(false);

  // Wompi Pasarela
  wompiPaymentLink = environment.wompiPaymentLink || 'https://checkout.wompi.co/l/VPOS_I9xaK0';
  get hasWompiConfigured(): boolean {
    return !!(this.wompiPaymentLink || (environment.wompiPublicKey && environment.wompiPublicKey.trim()));
  }

  onDepartmentChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const deptName = target.value;
    this.selectedDepartment.set(deptName);
    const dept = this.departamentos.find((d) => d.departamento === deptName);
    if (dept && dept.ciudades.length === 1) {
      this.checkoutForm.patchValue({ city: dept.ciudades[0] });
    } else {
      this.checkoutForm.patchValue({ city: '' });
    }
  }

  copyNequiNumber(): void {
    navigator.clipboard?.writeText(this.nequiNumber);
    this.nequiCopied.set(true);
    setTimeout(() => this.nequiCopied.set(false), 2500);
  }

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.maxLength(150)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.email]],
      document_id: [''],
      address: ['', Validators.required],
      neighborhood: [''],
      department: ['Bogotá D.C.', Validators.required],
      city: ['Bogotá D.C.', Validators.required],
      payment_method: ['CONTRAENTREGA', Validators.required],
      delivery_notes: [''],
    });
    this.selectedDepartment.set('Bogotá D.C.');
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.cart.items().length === 0) {
      this.errorMessage.set('El carrito está vacío');
      return;
    }

    const formVal = this.checkoutForm.value;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const dto: CreateOrderDto = {
      customer: {
        full_name: formVal.full_name,
        phone: formVal.phone,
        email: formVal.email || undefined,
        document_id: formVal.document_id || undefined,
        address: formVal.address,
        neighborhood: formVal.neighborhood || undefined,
        city: formVal.city,
        department: formVal.department,
      },
      items: this.cart.items().map((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
      })),
      shipping_cost: this.shippingCost,
      discount_amount: 0,
      payment_method: formVal.payment_method as PaymentMethod,
      delivery_notes: formVal.delivery_notes || undefined,
    };

    this.api.createOrder(dto).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (formVal.payment_method === 'PSE') {
            // Para PSE / Wompi: NO confirmamos de inmediato, abrimos el Widget oficial con el monto exacto fijado
            this.launchWompiCheckout(res.data);
          } else {
            // Para Contraentrega o Nequi: confirmación directa del pedido
            this.completedOrder.set(res.data);
            this.cart.clear();
          }
        }
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error || 'Error al procesar el pedido');
        this.isSubmitting.set(false);
      },
    });
  }

  launchWompiCheckout(order: OrderDetail): void {
    const totalInCents = Math.round(order.total_amount * 100);
    const scriptId = 'wompi-checkout-widget-script';

    const openWidget = () => {
      // @ts-ignore
      if (typeof WidgetCheckout !== 'undefined') {
        // @ts-ignore
        const checkout = new WidgetCheckout({
          currency: 'COP',
          amountInCents: totalInCents, // Factura con monto exacto en centavos (NO editable por el cliente)
          reference: order.order_code, // Código único de la orden
          publicKey: environment.wompiPublicKey,
          customerData: {
            email: order.customer.email || undefined,
            fullName: order.customer.full_name,
            phoneNumber: order.customer.phone,
          },
        });

        checkout.open((result: any) => {
          const transaction = result?.transaction;
          if (transaction && transaction.status === 'APPROVED') {
            // Pago exitoso aprobado por el banco -> Se confirma el pedido y se limpia el carrito
            this.completedOrder.set({
              ...order,
              order_status: 'CONFIRMADO',
              payment_status: 'PAGADO',
            });
            this.cart.clear();
          } else if (transaction && transaction.status === 'PENDING') {
            // PSE en proceso de validación bancaria
            this.completedOrder.set({
              ...order,
              order_status: 'PENDIENTE',
              payment_status: 'PENDIENTE',
            });
            this.cart.clear();
          } else {
            // El cliente cerró la ventana o el banco rechazó -> EL PEDIDO NO SE CONFIRMA
            this.errorMessage.set(
              'El pago con PSE / Wompi no fue completado o fue cancelado. Tu pedido NO ha sido confirmado. Puedes intentar nuevamente o pagar con Nequi (320 618 2526) / Contraentrega.'
            );
          }
        });
      } else {
        if (this.wompiPaymentLink) {
          window.open(this.wompiPaymentLink, '_blank');
        }
        this.completedOrder.set(order);
        this.cart.clear();
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.wompi.co/widget.js';
      script.type = 'text/javascript';
      script.onload = openWidget;
      script.onerror = () => {
        this.errorMessage.set('No se pudo cargar la pasarela segura de Wompi. Por favor revisa tu conexión a internet.');
      };
      document.body.appendChild(script);
    } else {
      openWidget();
    }
  }

  getWhatsAppLink(): string {
    const order = this.completedOrder();
    if (!order) return 'https://wa.link/tkwoty';
    const phone = '573206182526';
    const isNequi = order.payment_method === 'NEQUI';
    const isPse = order.payment_method === 'PSE';
    let text = '';
    if (isNequi) {
      text = `¡Hola Homie! Acabo de realizar el pedido *${order.order_code}* por valor de $${order.total_amount}. Mi nombre es ${order.customer.full_name}. Adjunto aquí el comprobante de mi pago Nequi al 3206182526 para programar el despacho de mi paquete.`;
    } else if (isPse) {
      text = `¡Hola Homie! Acabo de realizar el pedido *${order.order_code}* por valor de $${order.total_amount}. Mi nombre es ${order.customer.full_name}. Pagué a través del portal oficial PSE / Wompi. Deseo confirmar mi pedido para despacho.`;
    } else {
      text = `¡Hola Homie! Acabo de realizar el pedido *${order.order_code}* por valor de $${order.total_amount}. Mi nombre es ${order.customer.full_name}. Dirección: ${order.customer.address}, ${order.customer.city} (${order.customer.department}). Deseo confirmar mi pedido para despacho con pago contraentrega.`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
}
