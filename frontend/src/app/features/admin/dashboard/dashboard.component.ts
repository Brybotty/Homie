import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderStateService } from '../../../core/services/order-state.service';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CopCurrencyPipe, StatusBadgeComponent],
  template: `
    <div class="space-y-8">
      <!-- Top Title -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight">Dashboard & Finanzas</h1>
          <p class="text-slate-400 text-sm mt-1">
            Métricas calculadas en tiempo real con la vista financiera de PostgreSQL (<span class="font-mono text-xs text-emerald-400">v_order_financial_summary</span>).
          </p>
        </div>

        <button
          (click)="refresh()"
          class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Actualizar Datos</span>
        </button>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Revenue Total -->
        <div class="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2 shadow-sm">
          <div class="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Ingresos Totales</span>
            <div class="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white">
            {{ totalRevenue() | copCurrency }}
          </div>
          <p class="text-[11px] text-slate-500">Ventas brutas acumuladas</p>
        </div>

        <!-- Costo Mayorista (COGS Bogotá) -->
        <div class="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2 shadow-sm">
          <div class="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Costo Mercancía (COGS)</span>
            <div class="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-amber-400">
            {{ totalCogs() | copCurrency }}
          </div>
          <p class="text-[11px] text-slate-500">Costo compra proveedor Bogotá</p>
        </div>

        <!-- Utilidad Bruta Real -->
        <div class="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2 shadow-sm">
          <div class="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Utilidad Bruta</span>
            <div class="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-400">
            {{ grossProfit() | copCurrency }}
          </div>
          <p class="text-[11px] text-slate-500">
            Margen de ganancia: <span class="font-bold text-emerald-400">{{ marginPercentage() }}%</span>
          </p>
        </div>

        <!-- Pedidos Registrados -->
        <div class="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2 shadow-sm">
          <div class="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pedidos Activos</span>
            <div class="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white">
            {{ activeOrdersCount() }}
          </div>
          <p class="text-[11px] text-slate-500">
            Pendientes: <span class="text-amber-400 font-bold">{{ pendingCount() }}</span>
            @if (cancelledOrdersCount() > 0) {
              <span class="text-slate-600"> • </span>
              Cancelados: <span class="text-rose-400 font-bold">{{ cancelledOrdersCount() }}</span>
            }
          </p>
        </div>
      </div>

      <!-- Tabla de Resumen Financiero por Orden -->
      <div class="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 class="text-lg font-bold text-white">Rentabilidad por Pedido</h2>
            <p class="text-xs text-slate-400">Desglose de ingresos vs costo mayorista por orden (los pedidos cancelados se excluyen del total).</p>
          </div>
          <a
            routerLink="/admin/ordenes"
            class="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Ver todas las órdenes →
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th class="py-3 px-4">Código</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4">Pago</th>
                <th class="py-3 px-4 text-right">Ingreso Venta</th>
                <th class="py-3 px-4 text-right">Costo Bogotá</th>
                <th class="py-3 px-4 text-right">Envío</th>
                <th class="py-3 px-4 text-right">Margen Neto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-medium">
              @if (financialSummary().length === 0) {
                <tr>
                  <td colspan="7" class="py-8 text-center text-slate-500">
                    No hay registros financieros disponibles todavía.
                  </td>
                </tr>
              } @else {
                @for (item of financialSummary(); track item.order_id) {
                  <tr
                    [ngClass]="item.order_status === 'CANCELADO' ? 'opacity-60 bg-slate-900/40' : 'hover:bg-slate-900/60'"
                    class="transition-colors"
                  >
                    <td class="py-3.5 px-4 font-mono font-bold text-white">
                      {{ item.order_code }}
                      @if (item.order_status === 'CANCELADO') {
                        <span class="ml-1.5 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-sans font-bold">
                          Sin cobro ($0)
                        </span>
                      }
                    </td>
                    <td class="py-3.5 px-4">
                      <app-status-badge [status]="item.order_status" type="order"></app-status-badge>
                    </td>
                    <td class="py-3.5 px-4">
                      <app-status-badge [status]="item.payment_status" type="payment"></app-status-badge>
                    </td>
                    <td
                      [ngClass]="item.order_status === 'CANCELADO' ? 'text-slate-500 line-through' : 'text-slate-200'"
                      class="py-3.5 px-4 text-right font-bold"
                    >
                      {{ item.revenue_total | copCurrency }}
                    </td>
                    <td
                      [ngClass]="item.order_status === 'CANCELADO' ? 'text-slate-500 line-through' : 'text-amber-400'"
                      class="py-3.5 px-4 text-right font-semibold"
                    >
                      {{ item.total_cogs_mayorista | copCurrency }}
                    </td>
                    <td class="py-3.5 px-4 text-right text-slate-400">
                      {{ item.shipping_cost | copCurrency }}
                    </td>
                    <td
                      [ngClass]="item.order_status === 'CANCELADO' ? 'text-slate-500' : 'text-emerald-400'"
                      class="py-3.5 px-4 text-right font-extrabold"
                    >
                      {{ item.gross_profit | copCurrency }}
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private orderState = inject(OrderStateService);

  financialSummary = this.orderState.financialSummary;
  orders = this.orderState.orders;

  // Filtro de órdenes activas (excluye CANCELADO)
  activeFinancials = computed(() =>
    this.financialSummary().filter((curr) => curr.order_status !== 'CANCELADO')
  );

  totalRevenue = computed(() =>
    this.activeFinancials().reduce((acc, curr) => acc + curr.revenue_total, 0)
  );

  totalCogs = computed(() =>
    this.activeFinancials().reduce((acc, curr) => acc + curr.total_cogs_mayorista, 0)
  );

  grossProfit = computed(() =>
    this.activeFinancials().reduce((acc, curr) => acc + curr.gross_profit, 0)
  );

  marginPercentage = computed(() => {
    const rev = this.totalRevenue();
    if (rev === 0) return 0;
    return Math.round((this.grossProfit() / rev) * 100);
  });

  activeOrdersCount = computed(() =>
    this.orders().filter((o) => o.order_status !== 'CANCELADO').length
  );

  cancelledOrdersCount = computed(() =>
    this.orders().filter((o) => o.order_status === 'CANCELADO').length
  );

  pendingCount = computed(() =>
    this.orders().filter((o) => o.order_status === 'PENDIENTE').length
  );

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.orderState.loadFinancialMetrics();
    this.orderState.loadOrders();
  }
}
