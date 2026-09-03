import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus, PaymentStatus } from '../../../core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [ngClass]="badgeClass"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-xs"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: OrderStatus | PaymentStatus | string;
  @Input() type: 'order' | 'payment' = 'order';

  get badgeClass(): string {
    if (this.type === 'order') {
      switch (this.status as OrderStatus) {
        case 'PENDIENTE':
          return 'bg-amber-50 text-amber-800 border-amber-200';
        case 'CONFIRMADO':
          return 'bg-sky-50 text-sky-800 border-sky-200';
        case 'EN_PREPARACION':
          return 'bg-purple-50 text-purple-800 border-purple-200';
        case 'DESPACHADO':
          return 'bg-indigo-50 text-indigo-800 border-indigo-200';
        case 'ENTREGADO':
          return 'bg-emerald-50 text-emerald-800 border-emerald-200';
        case 'CANCELADO':
          return 'bg-rose-50 text-rose-800 border-rose-200';
        default:
          return 'bg-slate-50 text-slate-700 border-slate-200';
      }
    } else {
      switch (this.status as PaymentStatus) {
        case 'PENDIENTE':
          return 'bg-amber-50 text-amber-800 border-amber-200';
        case 'PAGADO':
          return 'bg-emerald-50 text-emerald-800 border-emerald-200';
        case 'CONTRAENTREGA':
          return 'bg-orange-50 text-orange-800 border-orange-200';
        case 'RECHAZADO':
          return 'bg-rose-50 text-rose-800 border-rose-200';
        case 'REEMBOLSADO':
          return 'bg-slate-50 text-slate-800 border-slate-200';
        default:
          return 'bg-slate-50 text-slate-700 border-slate-200';
      }
    }
  }

  get dotClass(): string {
    if (this.type === 'order') {
      switch (this.status as OrderStatus) {
        case 'PENDIENTE': return 'bg-amber-500';
        case 'CONFIRMADO': return 'bg-sky-500';
        case 'EN_PREPARACION': return 'bg-purple-500';
        case 'DESPACHADO': return 'bg-indigo-500';
        case 'ENTREGADO': return 'bg-emerald-500';
        case 'CANCELADO': return 'bg-rose-500';
        default: return 'bg-slate-400';
      }
    } else {
      switch (this.status as PaymentStatus) {
        case 'PENDIENTE': return 'bg-amber-500';
        case 'PAGADO': return 'bg-emerald-500';
        case 'CONTRAENTREGA': return 'bg-orange-500';
        case 'RECHAZADO': return 'bg-rose-500';
        case 'REEMBOLSADO': return 'bg-slate-400';
        default: return 'bg-slate-400';
      }
    }
  }
}
