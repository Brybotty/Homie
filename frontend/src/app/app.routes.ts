import { Routes } from '@angular/router';
import { StoreLayoutComponent } from './layouts/store-layout/store-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ─── Callback de Google OAuth (fuera de layouts) ───────────────────────
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/auth-callback.component').then((m) => m.AuthCallbackComponent),
  },

  // ─── Tienda pública ─────────────────────────────────────────────────────
  {
    path: '',
    component: StoreLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/catalog/catalog.component').then((m) => m.CatalogComponent),
      },
      {
        path: 'producto/:slug',
        loadComponent: () =>
          import('./features/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent
          ),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],  // ← Requiere autenticación
        loadComponent: () =>
          import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
      },
    ],
  },

  // ─── Panel de administrador ─────────────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],  // ← Solo admins
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/product-manager/product-manager.component').then(
            (m) => m.ProductManagerComponent
          ),
      },
      {
        path: 'colecciones',
        loadComponent: () =>
          import('./features/admin/collection-manager/collection-manager.component').then(
            (m) => m.CollectionManagerComponent
          ),
      },
      {
        path: 'ordenes',
        loadComponent: () =>
          import('./features/admin/order-manager/order-manager.component').then(
            (m) => m.OrderManagerComponent
          ),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
