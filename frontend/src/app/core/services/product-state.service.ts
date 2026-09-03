import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { ProductWithVariants, ProductVariant, Category, Collection } from '../models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductStateService {
  private api = inject(ApiService);

  private _products = signal<ProductWithVariants[]>([]);
  private _categories = signal<Category[]>([]);
  private _collections = signal<Collection[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedCategorySlug = signal<string | null>(null);
  private _selectedThematic = signal<string | null>(null);
  private _searchQuery = signal<string>('');

  // Currently viewed product in detail page (for context-aware widgets)
  readonly currentDetailProduct = signal<ProductWithVariants | null>(null);
  readonly currentDetailVariant = signal<ProductVariant | null>(null);

  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly collections = this._collections.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedCategorySlug = this._selectedCategorySlug.asReadonly();
  readonly selectedThematic = this._selectedThematic.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  // Categorías Principales (Padres, sin parent_id)
  readonly parentCategories = computed(() => {
    return this._categories().filter((c) => !c.parent_id);
  });

  // Todas las subcategorías (tienen parent_id)
  readonly allSubcategories = computed(() => {
    return this._categories().filter((c) => !!c.parent_id);
  });

  // Categoría Padre actualmente activa
  readonly activeParentCategory = computed(() => {
    const slug = this._selectedCategorySlug();
    if (!slug) return null;

    const all = this._categories();
    const current = all.find((c) => c.slug === slug);
    if (!current) return null;

    if (!current.parent_id) {
      // Es una categoría padre
      return current;
    } else {
      // Es una subcategoría: encontrar su padre
      return all.find((c) => c.id === current.parent_id) || null;
    }
  });

  // Subcategorías de la categoría padre activa (si tiene)
  readonly activeSubcategories = computed(() => {
    const parent = this.activeParentCategory();
    if (!parent) return [];
    return this._categories().filter((c) => c.parent_id === parent.id);
  });

  // Filtro de productos en memoria para búsqueda en tiempo real y colecciones temáticas
  readonly filteredProducts = computed(() => {
    let list = this._products();
    const query = this._searchQuery().toLowerCase().trim();
    const thematic = this._selectedThematic();

    // Filtro temático de colecciones estilo Instagram Stories
    if (thematic) {
      // Buscar colección en el estado por slug
      const matchedColl = this._collections().find((c) => c.slug === thematic);
      if (matchedColl) {
        // Filtrar por pertenencia real a la colección en la base de datos
        list = list.filter((p) => p.collection_ids && p.collection_ids.includes(matchedColl.id));
      } else {
        // Respaldo por palabras clave si aún no cargan colecciones
        const thematicKeywords: Record<string, string[]> = {
          anime: ['anime', 'dragon', 'naruto', 'goku', 'demon', 'one piece', 'hunter', 'otaku', 'sailor', 'manga', 'vegeta'],
          marvel: ['marvel', 'deadpool', 'spider', 'avengers', 'iron man', 'superhéroe', 'comic', 'batman', 'dc', 'capitán'],
          sanrio: ['sanrio', 'hello kitty', 'kuromi', 'my melody', 'cinna', 'kawaii', 'cinnamoroll', 'pochacco', 'melody', 'kitty'],
          gaming: ['game', 'gamer', 'gaming', 'videojuego', 'playstation', 'nintendo', 'pokemon', 'zelda', 'mario', 'xbox', 'consola'],
          movies: ['película', 'cine', 'harry potter', 'star wars', 'disney', 'serie', 'animada', 'pixar', 'jurassic'],
          peliculas: ['película', 'cine', 'harry potter', 'star wars', 'disney', 'serie', 'animada', 'pixar', 'jurassic'],
          animals: ['animal', 'capibara', 'gato', 'perro', 'michi', 'mascota', 'oso', 'panda', 'cat', 'dog', 'felino'],
          animales: ['animal', 'capibara', 'gato', 'perro', 'michi', 'mascota', 'oso', 'panda', 'cat', 'dog', 'felino'],
        };

        const keywords = thematicKeywords[thematic] || [thematic];
        list = list.filter((p) => {
          const text = `${p.name} ${p.description || ''} ${p.short_description || ''} ${p.category_name || ''}`.toLowerCase();
          const hasTextMatch = keywords.some((k) => text.includes(k));
          const hasVariantMatch = p.variants.some((v) =>
            keywords.some((k) => v.variant_name.toLowerCase().includes(k) || v.sku.toLowerCase().includes(k))
          );
          return hasTextMatch || hasVariantMatch;
        });
      }
    }

    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.variants.some((v) => v.variant_name.toLowerCase().includes(query) || v.sku.toLowerCase().includes(query))
      );
    }

    return list;
  });

  loadCollections(): void {
    this.api.getCollections(true).subscribe({
      next: (res) => {
        if (res.success) {
          this._collections.set(res.data);
        }
      },
      error: (err) => {
        console.error('Error cargando colecciones', err);
      },
    });
  }

  loadCategories(): void {
    this.api.getCategories(true).subscribe({
      next: (res) => {
        if (res.success) {
          this._categories.set(res.data);
        }
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
      },
    });
  }

  loadProducts(categorySlug?: string): void {
    this._loading.set(true);
    this._error.set(null);
    this._selectedCategorySlug.set(categorySlug || null);

    this.api
      .getProducts({
        category: categorySlug,
        active: true,
        limit: 100,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this._products.set(res.data);
          }
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.error?.error || 'Error al cargar el catálogo de productos');
          this._loading.set(false);
        },
      });
  }

  setCategory(slug: string | null): void {
    this._selectedCategorySlug.set(slug);
    this.loadProducts(slug || undefined);
  }

  setThematic(thematic: string | null): void {
    // Si ya está seleccionada la misma, desmarcar para ver todo
    if (this._selectedThematic() === thematic) {
      this._selectedThematic.set(null);
    } else {
      this._selectedThematic.set(thematic);
    }
  }

  setSearch(query: string): void {
    this._searchQuery.set(query);
  }

  getProductBySlug(slug: string): Observable<any> {
    return this.api.getProductBySlug(slug);
  }
}
