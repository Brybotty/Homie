import { Injectable, signal, computed } from '@angular/core';
import { ProductVariant } from '../models';

export interface CartItem {
  variant_id: number;
  sku: string;
  product_name: string;
  variant_name: string;
  retail_price: number;
  quantity: number;
  image_url: string | null;
  max_stock: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'homie_cart_v1';
  private _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((acc, i) => acc + i.quantity, 0));
  readonly totalItems = this.count;
  readonly total = computed(() => this._items().reduce((acc, i) => acc + i.retail_price * i.quantity, 0));
  readonly isOpen = signal(false);

  private loadFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._items()));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }

  addItem(variant: ProductVariant, productName: string, quantity = 1, productImage?: string | null): boolean {
    const current = [...this._items()];
    const index = current.findIndex((i) => i.variant_id === variant.id);
    const resolvedImage = (variant.image_url && variant.image_url.trim()) ? variant.image_url : (productImage || null);

    if (index > -1) {
      const newQty = current[index].quantity + quantity;
      if (newQty > variant.stock_quantity) {
        return false;
      }
      current[index] = {
        ...current[index],
        quantity: newQty,
        image_url: current[index].image_url || resolvedImage,
      };
    } else {
      if (quantity > variant.stock_quantity) {
        return false;
      }
      current.push({
        variant_id: variant.id,
        sku: variant.sku,
        product_name: productName,
        variant_name: variant.variant_name,
        retail_price: variant.retail_price,
        quantity,
        image_url: resolvedImage,
        max_stock: variant.stock_quantity,
      });
    }

    this._items.set(current);
    this.saveToStorage();
    this.openCart();
    return true;
  }

  updateItemImage(variantId: number, imageUrl: string): void {
    if (!imageUrl) return;
    const current = this._items().map((item) => {
      if (item.variant_id === variantId && (!item.image_url || item.image_url !== imageUrl)) {
        return { ...item, image_url: imageUrl };
      }
      return item;
    });
    this._items.set(current);
    this.saveToStorage();
  }

  updateQuantity(variantId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(variantId);
      return;
    }

    const current = this._items().map((item) => {
      if (item.variant_id === variantId) {
        const validQty = Math.min(quantity, item.max_stock);
        return { ...item, quantity: validQty };
      }
      return item;
    });

    this._items.set(current);
    this.saveToStorage();
  }

  removeItem(variantId: number): void {
    const filtered = this._items().filter((i) => i.variant_id !== variantId);
    this._items.set(filtered);
    this.saveToStorage();
  }

  clear(): void {
    this._items.set([]);
    this.saveToStorage();
  }

  toggleCart(): void {
    this.isOpen.update((v) => !v);
  }

  openCart(): void {
    this.isOpen.set(true);
  }

  closeCart(): void {
    this.isOpen.set(false);
  }
}
