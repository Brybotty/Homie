import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      <!-- Sidebar Desktop -->
      <aside class="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <!-- Admin Brand -->
          <div class="p-6 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img
                src="/HomieIcon.png"
                alt="Homie Admin Logo"
                class="w-9 h-9 rounded-xl object-contain shadow-md shadow-emerald-500/20 bg-slate-900 p-0.5 border border-slate-700"
              />
              <div>
                <h1 class="text-lg font-black tracking-tight text-white">Homie Admin</h1>
                <span class="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Control Panel</span>
              </div>
            </div>
          </div>

          <!-- Usuario Admin -->
          @if (auth.user(); as user) {
            <div class="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
              @if (user.avatar_url) {
                <img [src]="user.avatar_url" [alt]="user.full_name || 'Admin'"
                     class="w-8 h-8 rounded-full border border-emerald-500/40 object-cover" />
              } @else {
                <div class="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center">
                  <span class="text-emerald-400 font-bold text-sm">
                    {{ (user.full_name || user.email).charAt(0).toUpperCase() }}
                  </span>
                </div>
              }
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ user.full_name || 'Admin' }}</p>
                <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
              </div>
            </div>
          }

          <!-- Navigation -->
          <nav class="p-4 space-y-1.5 text-sm font-semibold">
            <a
              routerLink="/admin/dashboard"
              routerLinkActive="bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard & Margen</span>
            </a>

            <a
              routerLink="/admin/productos"
              routerLinkActive="bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Gestor de Productos</span>
            </a>

            <a
              routerLink="/admin/colecciones"
              routerLinkActive="bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Gestor de Colecciones</span>
            </a>

            <a
              routerLink="/admin/ordenes"
              routerLinkActive="bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Gestor de Pedidos</span>
            </a>
          </nav>
        </div>

        <!-- Footer Sidebar -->
        <div class="p-4 border-t border-slate-800 space-y-2">
          <a
            routerLink="/"
            class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a la Tienda</span>
          </a>
          <button
            (click)="auth.logout()"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-900/30
                   hover:bg-red-900/50 text-xs font-semibold text-red-400 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Admin Area -->
      <main class="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-900/50">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  constructor(public auth: AuthService) {}
}
