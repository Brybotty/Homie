import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderStateService } from '../../../core/services/order-state.service';
import { OrderDetail, OrderStatus, PaymentStatus } from '../../../core/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'app-order-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent, CopCurrencyPipe],
  template: `
    <div class="space-y-8">
      <!-- Title & Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight">Gestor de Pedidos</h1>
          <p class="text-slate-400 text-sm mt-1">Control de despachos, pagos contraentrega y guías de transporte.</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="refresh()"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        @for (f of filters; track f.value) {
          <button
            (click)="setFilter(f.value)"
            [ngClass]="orderState.statusFilter() === f.value ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/20' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'"
            class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0"
          >
            {{ f.label }}
          </button>
        }
      </div>

      <!-- Orders List / Table -->
      <div class="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-sm">
        @if (orderState.loading()) {
          <div class="py-16 text-center text-slate-400 text-xs animate-pulse">
            Cargando pedidos...
          </div>
        } @else if (orderState.orders().length === 0) {
          <div class="py-16 text-center space-y-2">
            <div class="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-slate-500 mx-auto">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-300">No hay pedidos con el filtro actual</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (order of orderState.orders(); track order.id) {
              <div class="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
                <!-- Header de Orden -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div class="flex items-center gap-3">
                    <span class="font-mono font-black text-white text-base">{{ order.order_code }}</span>
                    <app-status-badge [status]="order.order_status" type="order"></app-status-badge>
                    <app-status-badge [status]="order.payment_status" type="payment"></app-status-badge>
                  </div>

                  <div class="flex items-center gap-2 text-xs flex-wrap justify-end">
                    <span class="text-slate-400">{{ order.created_at | date:'short' }}</span>
                    @if (order.payment_status !== 'PAGADO' && (order.payment_method === 'PSE' || order.payment_method === 'WOMPI')) {
                      <button
                        (click)="syncWompi(order.id)"
                        [disabled]="syncingId() === order.id"
                        class="px-2.5 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-600 hover:text-white rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        title="Verificar estado de la transacción en Wompi"
                      >
                        <svg class="w-3.5 h-3.5" [class.animate-spin]="syncingId() === order.id" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{{ syncingId() === order.id ? 'Consultando...' : 'Verificar Wompi' }}</span>
                      </button>
                    }
                    <button
                      (click)="openTrackingModal(order)"
                      class="px-3 py-1.5 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      Gestionar Guía / Estado
                    </button>
                  </div>
                </div>

                <!-- Datos del Cliente y Despacho -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div class="space-y-1">
                    <span class="text-slate-500 uppercase tracking-wider font-bold">Cliente</span>
                    <p class="font-bold text-slate-200">{{ order.customer.full_name }}</p>
                    <p class="text-slate-400">Tel: <span class="text-slate-200 font-mono">{{ order.customer.phone }}</span></p>
                    @if (order.customer.email) {
                      <p class="text-slate-400">{{ order.customer.email }}</p>
                    }
                  </div>

                  <div class="space-y-1">
                    <span class="text-slate-500 uppercase tracking-wider font-bold">Destino Entrega</span>
                    <p class="text-slate-200">{{ order.customer.address }}</p>
                    <p class="text-slate-400">{{ order.customer.neighborhood || '' }} {{ order.customer.city }} ({{ order.customer.department }})</p>
                    @if (order.delivery_notes) {
                      <p class="text-amber-400/90 italic">"{{ order.delivery_notes }}"</p>
                    }
                  </div>

                  <div class="space-y-1">
                    <span class="text-slate-500 uppercase tracking-wider font-bold">Transporte & Guía</span>
                    @if (order.tracking_number) {
                      <p class="text-slate-200 font-bold">Transportadora: <span class="text-emerald-400">{{ order.shipping_carrier }}</span></p>
                      <p class="text-slate-400 font-mono">Guía: <span class="text-white">{{ order.tracking_number }}</span></p>
                    } @else {
                      <p class="text-amber-400 italic">Pendiente por generar guía</p>
                    }
                    <p class="text-slate-400">Método de pago: <span class="text-slate-200 font-bold">{{ order.payment_method }}</span></p>
                  </div>
                </div>

                <!-- Items -->
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Productos en la Orden</span>
                  <div class="divide-y divide-slate-800/60">
                    @for (item of order.items; track item.id) {
                      <div class="py-1.5 flex justify-between items-center text-xs">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-slate-300">{{ item.product_name_snapshot }}</span>
                          <span class="text-slate-500 text-[11px]">({{ item.variant_name_snapshot }})</span>
                          <span class="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">SKU: {{ item.sku_snapshot }}</span>
                        </div>
                        <div class="flex items-center gap-4">
                          <span class="text-slate-400">{{ item.quantity }} un. × {{ item.unit_price | copCurrency }}</span>
                          <span class="font-extrabold text-slate-200">{{ item.total_price | copCurrency }}</span>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span class="text-slate-400">Subtotal: {{ order.subtotal | copCurrency }} | Envío: {{ order.shipping_cost | copCurrency }}</span>
                    <span class="text-sm font-black text-emerald-400">Total: {{ order.total_amount | copCurrency }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Modal de Actualización de Guía / Estado -->
      @if (selectedOrder()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 w-full max-w-lg space-y-6 shadow-2xl">
            <div class="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 class="text-lg font-black text-white">Actualizar Pedido</h3>
                <p class="text-xs text-emerald-400 font-mono">{{ selectedOrder()!.order_code }}</p>
              </div>
              <button
                (click)="closeModal()"
                class="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-900"
              >
                ✕
              </button>
            </div>

            <form [formGroup]="statusForm" (ngSubmit)="saveOrderStatus()" class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Estado del Pedido</label>
                <select
                  formControlName="order_status"
                  class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CONFIRMADO">CONFIRMADO</option>
                  <option value="EN_PREPARACION">EN PREPARACIÓN</option>
                  <option value="DESPACHADO">DESPACHADO</option>
                  <option value="ENTREGADO">ENTREGADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Estado del Pago</label>
                <select
                  formControlName="payment_status"
                  class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="PAGADO">PAGADO</option>
                  <option value="CONTRAENTREGA">CONTRAENTREGA</option>
                  <option value="RECHAZADO">RECHAZADO</option>
                  <option value="REEMBOLSADO">REEMBOLSADO</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Empresa Transportadora</label>
                <input
                  type="text"
                  formControlName="shipping_carrier"
                  placeholder="Ej. Inter Rapidísimo, Servientrega, Envía, Coordinadora"
                  class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Número de Guía de Rastreo</label>
                <input
                  type="text"
                  formControlName="tracking_number"
                  placeholder="Ej. 700012345678"
                  class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderManagerComponent implements OnInit {
  orderState = inject(OrderStateService);
  private fb = inject(FormBuilder);

  selectedOrder = signal<OrderDetail | null>(null);
  statusForm!: FormGroup;

  readonly filters: { label: string; value: OrderStatus | 'ALL' }[] = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Pendientes', value: 'PENDIENTE' },
    { label: 'Confirmados', value: 'CONFIRMADO' },
    { label: 'En Preparación', value: 'EN_PREPARACION' },
    { label: 'Despachados', value: 'DESPACHADO' },
    { label: 'Entregados', value: 'ENTREGADO' },
    { label: 'Cancelados', value: 'CANCELADO' },
  ];

  ngOnInit(): void {
    this.refresh();
    this.statusForm = this.fb.group({
      order_status: ['PENDIENTE', Validators.required],
      payment_status: ['PENDIENTE', Validators.required],
      shipping_carrier: [''],
      tracking_number: [''],
    });
  }

  refresh(): void {
    this.orderState.loadOrders();
  }

  setFilter(status: OrderStatus | 'ALL'): void {
    this.orderState.setStatusFilter(status);
  }

  openTrackingModal(order: OrderDetail): void {
    this.selectedOrder.set(order);
    this.statusForm.patchValue({
      order_status: order.order_status,
      payment_status: order.payment_status,
      shipping_carrier: order.shipping_carrier || '',
      tracking_number: order.tracking_number || '',
    });
  }

  closeModal(): void {
    this.selectedOrder.set(null);
  }

  saveOrderStatus(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.orderState.updateOrderStatus(order.id, this.statusForm.value).subscribe({
      next: () => {
        this.closeModal();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al actualizar el estado');
      },
    });
  }

  syncingId = signal<number | null>(null);

  syncWompi(orderId: number): void {
    this.syncingId.set(orderId);
    this.orderState.syncWompi(orderId).subscribe({
      next: (res) => {
        this.syncingId.set(null);
        alert(res.message || 'Estado de la orden sincronizado con Wompi exitosamente');
      },
      error: (err) => {
        this.syncingId.set(null);
        alert(err.error?.message || err.error?.error || 'No se pudo consultar Wompi o no hay transacción registrada');
      },
    });
  }
}
