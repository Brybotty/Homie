import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'copCurrency',
  standalone: true,
})
export class CopCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '$0';
    }
    const num = Math.round(Number(value));
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}
