import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { ProductStateService } from './product-state.service';
import { OrderDetail, OrderStatus, UpdateOrderStatusDto, OrderFinancialSummary } from '../models';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderStateService {
  private api = inject(ApiService);
  private productState = inject(ProductStateService);

  private _orders = signal<OrderDetail[]>([]);
  private _financialSummary = signal<OrderFinancialSummary[]>([]);
  private _loading = signal(false);
  private _statusFilter = signal<OrderStatus | 'ALL'>('ALL');
  private _totalOrders = signal(0);

  readonly orders = this._orders.asReadonly();
  readonly financialSummary = this._financialSummary.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly statusFilter = this._statusFilter.asReadonly();
  readonly totalOrders = this._totalOrders.asReadonly();

  loadOrders(status?: OrderStatus | 'ALL'): void {
    this._loading.set(true);
    const filter = status || this._statusFilter();
    this._statusFilter.set(filter);

    this.api
      .getOrders({
        status: filter === 'ALL' ? undefined : filter,
        limit: 50,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this._orders.set(res.data);
            this._totalOrders.set(res.total);
          }
          this._loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando pedidos', err);
          this._loading.set(false);
        },
      });
  }

  loadFinancialMetrics(): void {
    this.api.getFinancialSummary().subscribe({
      next: (res) => {
        if (res.success) {
          this._financialSummary.set(res.data);
        }
      },
      error: (err) => {
        console.error('Error cargando métricas financieras', err);
      },
    });
  }

  updateOrderStatus(id: number, dto: UpdateOrderStatusDto): Observable<any> {
    return this.api.updateOrderStatus(id, dto).pipe(
      tap(() => {
        this.loadOrders();
        this.loadFinancialMetrics();
        this.productState.loadProducts();
      })
    );
  }

  setStatusFilter(status: OrderStatus | 'ALL'): void {
    this.loadOrders(status);
  }
}
