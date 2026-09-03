import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { CartSidebarComponent } from '../../shared/components/cart-sidebar/cart-sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { LoginModalComponent } from '../../features/auth/login-modal.component';
import { WhatsAppWidgetComponent } from '../../shared/components/whatsapp-widget/whatsapp-widget.component';
import { ProductStateService } from '../../core/services/product-state.service';

@Component({
  selector: 'app-store-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    CartSidebarComponent,
    LoginModalComponent,
    WhatsAppWidgetComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">

      <!-- ─── NAVBAR HÍBRIDO (MOBILE & DESKTOP) ───────────────────────── -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          <!-- ── ZONA IZQUIERDA: Hamburguesa (Móvil) / Logo (Escritorio) ── -->
          <div class="flex items-center gap-3">
            <!-- Botón Hamburguesa Móvil (< md) -->
            <button
              (click)="openDrawer()"
              class="md:hidden p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <!-- Logo Escritorio (>= md) -->
            <a routerLink="/" (click)="navigateHome()" class="hidden md:flex items-center gap-2.5 group">
              <img
                src="/HomieIcon.png"
                alt="Homie Logo"
                class="w-8 h-8 rounded-lg object-contain transition-transform group-hover:scale-105"
              />
              <span class="text-xl font-black text-slate-900 tracking-tight">Homie</span>
            </a>
          </div>

          <!-- ── ZONA CENTRO: Logo centrado en Móvil / Navegación en Escritorio ── -->
          <!-- Logo Centrado Móvil (< md) -->
          <div class="md:hidden flex items-center justify-center flex-1">
            <a routerLink="/" (click)="navigateHome()" class="flex items-center gap-2 group">
              <img
                src="/HomieIcon.png"
                alt="Homie Logo"
                class="w-7 h-7 rounded-lg object-contain transition-transform group-hover:scale-105"
              />
              <span class="text-lg font-black text-slate-900 tracking-tight">Homie</span>
            </a>
          </div>

          <!-- Navegación Horizontal Escritorio (>= md) -->
          <nav class="hidden md:flex items-center gap-1 lg:gap-2">
            <a
              routerLink="/"
              (click)="navigateHome()"
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60 transition-colors"
            >
              Inicio
            </a>
            <button
              (click)="selectCategoryBySlug('mugs')"
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60 transition-colors cursor-pointer"
            >
              Mugs
            </button>
            <button
              (click)="selectCategoryBySlug('termos-botellas')"
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60 transition-colors cursor-pointer"
            >
              Termos
            </button>
            <button
              (click)="scrollToCollections()"
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60 transition-colors cursor-pointer"
            >
              Colecciones
            </button>
            <button
              (click)="showAboutModal.set(true)"
              class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60 transition-colors cursor-pointer"
            >
              Nosotros
            </button>

            <!-- Instagram Link Escritorio -->
            <a
              href="https://www.instagram.com/homie_shop.co?igsi=NnpmM2w1M3Bkc3hm"
              target="_blank"
              rel="noopener noreferrer"
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50/60 transition-colors flex items-center gap-1.5"
              title="Síguenos en Instagram @homie_shop.co"
            >
              <svg class="w-3.5 h-3.5 fill-current text-rose-500" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>
          </nav>

          <!-- ── ZONA DERECHA: Perfil & Carrito ── -->
          <div class="flex items-center gap-2 sm:gap-3">

            <!-- Admin Link (solo si es admin) -->
            @if (auth.isAdmin()) {
              <a
                routerLink="/admin/dashboard"
                class="hidden sm:flex items-center gap-1 text-xs font-bold text-indigo-700
                       hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5
                       rounded-full transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Admin
              </a>
            }

            <!-- Usuario autenticado -->
            @if (auth.isAuthenticated()) {
              <div class="flex items-center gap-2">
                @if (auth.user()?.avatar_url) {
                  <img
                    [src]="auth.user()!.avatar_url!"
                    [alt]="auth.user()!.full_name || 'Usuario'"
                    class="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-xs"
                  />
                } @else {
                  <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                    <span class="text-emerald-800 font-black text-xs">
                      {{ (auth.user()?.full_name || auth.user()?.email || 'U').charAt(0).toUpperCase() }}
                    </span>
                  </div>
                }
                <button
                  (click)="auth.logout()"
                  class="text-xs text-slate-400 hover:text-rose-600 transition-colors hidden sm:block font-medium"
                >
                  Salir
                </button>
              </div>
            } @else {
              <!-- Botón Entrar / Login -->
              <button
                (click)="showLoginModal.set(true)"
                class="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700
                       hover:text-emerald-600 p-2 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span class="hidden sm:inline">Entrar</span>
              </button>
            }

            <!-- Botón Carrito con badge reactivo CartService.totalItems() -->
            <button
              (click)="cartService.toggleCart()"
              class="relative p-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Carrito de compras"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              @if (cartService.totalItems() > 0) {
                <span class="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px]
                             font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-up">
                  {{ cartService.totalItems() > 9 ? '9+' : cartService.totalItems() }}
                </span>
              }
            </button>
          </div>
        </div>
      </header>

      <!-- ─── MENÚ DRAWER LATERAL MÓVIL (< md) ────────────────────────── -->
      @if (isDrawerOpen()) {
        <div class="fixed inset-0 z-50 md:hidden flex">
          <!-- Backdrop desenfocado -->
          <div
            (click)="closeDrawer()"
            class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          ></div>

          <!-- Panel Lateral Animado -->
          <div
            class="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-out"
          >
            <!-- Header del Drawer -->
            <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div class="flex items-center gap-2.5">
                <img src="/HomieIcon.png" alt="Homie Logo" class="w-7 h-7 rounded-lg object-contain" />
                <span class="text-lg font-black text-slate-900">Homie</span>
              </div>
              <button
                (click)="closeDrawer()"
                class="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <!-- Lista de Navegación del Drawer -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              
              <!-- Enlace Catálogo Completo -->
              <button
                (click)="navigateCatalogAll()"
                class="w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base">🛍️</span>
                  <span>Catálogo Completo</span>
                </div>
                <span class="text-xs text-slate-400">Ver todo</span>
              </button>

              <!-- Acordeón Categorías (Mugs & Termos) -->
              <div class="space-y-1 border-t border-slate-100 pt-3">
                <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider block px-3 mb-1">
                  Categorías
                </span>

                <!-- Mugs Acordeón -->
                <div>
                  <button
                    (click)="toggleAccordion('mugs')"
                    class="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-base">☕</span>
                      <span>Mugs & Pocillos</span>
                    </div>
                    <svg
                      class="w-4 h-4 text-slate-400 transition-transform"
                      [ngClass]="openAccordion() === 'mugs' ? 'rotate-180' : ''"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  @if (openAccordion() === 'mugs') {
                    <div class="pl-8 pr-2 py-1 space-y-1 text-xs font-semibold text-slate-600 animate-fade-in">
                      <button (click)="selectCategoryBySlug('mugs')" class="block w-full text-left py-1.5 hover:text-emerald-600 cursor-pointer">
                        • Todos los Mugs
                      </button>
                      <button (click)="selectThematic('anime')" class="block w-full text-left py-1.5 hover:text-emerald-600 cursor-pointer">
                        • Mugs de Anime & Gaming
                      </button>
                      <button (click)="selectThematic('sanrio')" class="block w-full text-left py-1.5 hover:text-emerald-600 cursor-pointer">
                        • Mugs Sanrio & Kawaii
                      </button>
                    </div>
                  }
                </div>

                <!-- Termos & Botellas Acordeón -->
                <div>
                  <button
                    (click)="toggleAccordion('termos')"
                    class="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-base">🧊</span>
                      <span>Termos y Botellas</span>
                    </div>
                    <svg
                      class="w-4 h-4 text-slate-400 transition-transform"
                      [ngClass]="openAccordion() === 'termos' ? 'rotate-180' : ''"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  @if (openAccordion() === 'termos') {
                    <div class="pl-8 pr-2 py-1 space-y-1 text-xs font-semibold text-slate-600 animate-fade-in">
                      <button (click)="selectCategoryBySlug('termos-botellas')" class="block w-full text-left py-1.5 hover:text-emerald-600 cursor-pointer">
                        • Todos los Termos
                      </button>
                      <button (click)="selectCategoryBySlug('termos-tumblers-oficina')" class="block w-full text-left py-1.5 hover:text-emerald-600 cursor-pointer">
                        • Tumblers & Oficina
                      </button>
                      <button (click)="selectCategoryBySlug('termos-deportivos-fitness')" class="block w-full text-left py-1.5 hover:text-emerald-600 cursor-pointer">
                        • Deportivos & Gym
                      </button>
                      <button (click)="selectCategoryBySlug('termos-personajes-animacion')" class="block w-full text-left py-1.5 hover:text-emerald-600 cursor-pointer">
                        • Personajes & Kawaii
                      </button>
                    </div>
                  }
                </div>
              </div>

              <!-- Colecciones Populares -->
              <div class="space-y-1 border-t border-slate-100 pt-3">
                <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider block px-3 mb-1">
                  Colecciones Populares
                </span>
                <div class="grid grid-cols-2 gap-1.5 px-1">
                  <button (click)="selectThematic('anime')" class="p-2 bg-slate-100 hover:bg-emerald-50 rounded-xl text-xs font-bold text-slate-700 text-left flex items-center gap-1.5 cursor-pointer">
                    <span>⚡</span> <span>Anime</span>
                  </button>
                  <button (click)="selectThematic('marvel')" class="p-2 bg-slate-100 hover:bg-emerald-50 rounded-xl text-xs font-bold text-slate-700 text-left flex items-center gap-1.5 cursor-pointer">
                    <span>🔥</span> <span>Marvel</span>
                  </button>
                  <button (click)="selectThematic('sanrio')" class="p-2 bg-slate-100 hover:bg-emerald-50 rounded-xl text-xs font-bold text-slate-700 text-left flex items-center gap-1.5 cursor-pointer">
                    <span>🌸</span> <span>Sanrio</span>
                  </button>
                  <button (click)="selectThematic('gaming')" class="p-2 bg-slate-100 hover:bg-emerald-50 rounded-xl text-xs font-bold text-slate-700 text-left flex items-center gap-1.5 cursor-pointer">
                    <span>🎮</span> <span>Gaming</span>
                  </button>
                </div>
              </div>

              <!-- Enlace Sobre Nosotros -->
              <div class="border-t border-slate-100 pt-3">
                <button
                  (click)="showAboutModal.set(true); closeDrawer()"
                  class="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span class="text-base">✨</span>
                  <span>Sobre Nosotros</span>
                </button>
              </div>
            </div>

            <!-- Footer del Drawer -->
            <div class="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <div class="flex items-center justify-center gap-4">
                <!-- WhatsApp Link -->
                <a
                  href="https://wa.link/tkwoty"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>WhatsApp Homie</span>
                </a>
                <span class="text-slate-300">•</span>
                <!-- Instagram Link -->
                <a
                  href="https://www.instagram.com/homie_shop.co?igsi=NnpmM2w1M3Bkc3hm"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
                >
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>&#64;homie_shop.co</span>
                </a>
              </div>
              <p class="text-[10px] text-center text-slate-400">© 2026 Homie • Envíos a toda Colombia</p>
            </div>
          </div>
        </div>
      }

      <!-- ─── CONTENIDO PRINCIPAL ────────────────────────────────────── -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- ─── FOOTER ─────────────────────────────────────────────────── -->
      <footer class="bg-slate-900 text-slate-400 py-10 mt-auto border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center space-y-4">
          <div class="flex items-center gap-2">
            <img src="/HomieIcon.png" alt="Homie Logo" class="w-7 h-7 rounded-lg object-contain" />
            <span class="text-lg font-black text-white tracking-tight">Homie</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-400 max-w-md">
            Mugs temáticos 3D, termos inteligentes y menaje exclusivo con envíos seguros y garantizados a toda Colombia.
          </p>
          <div class="flex items-center gap-3 sm:gap-5 text-xs font-bold flex-wrap justify-center">
            <a href="https://wa.link/tkwoty" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline flex items-center gap-1.5">
              <span>Atención por WhatsApp</span>
            </a>
            <span class="text-slate-700">•</span>
            <a
              href="https://www.instagram.com/homie_shop.co?igsi=NnpmM2w1M3Bkc3hm"
              target="_blank"
              rel="noopener noreferrer"
              class="text-rose-400 hover:underline flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram &#64;homie_shop.co</span>
            </a>
            <span class="text-slate-700">•</span>
            <button (click)="showAboutModal.set(true)" class="text-emerald-400 hover:underline cursor-pointer">
              Sobre Nosotros
            </button>
          </div>
          <p class="text-xs text-slate-600">© 2026 Homie. Todos los derechos reservados.</p>
        </div>
      </footer>

      <!-- ─── ASISTENTE VIRTUAL & WIDGET WHATSAPP FLOTANTE ───────────── -->
      <app-whatsapp-widget></app-whatsapp-widget>

      <!-- ─── SIDEBAR DEL CARRITO ────────────────────────────────────── -->
      <app-cart-sidebar></app-cart-sidebar>

      <!-- ─── MODAL DE LOGIN ─────────────────────────────────────────── -->
      <app-login-modal
        [isOpen]="showLoginModal()"
        [message]="loginMessage()"
        (closed)="showLoginModal.set(false)"
      ></app-login-modal>

      <!-- ─── MODAL SOBRE NOSOTROS ───────────────────────────────────── -->
      @if (showAboutModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div (click)="showAboutModal.set(false)" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div class="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10 space-y-4 animate-scale-up">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <img src="/HomieIcon.png" alt="Homie" class="w-7 h-7 rounded-lg object-contain" />
                <h3 class="text-lg font-black text-slate-900">Sobre Homie</h3>
              </div>
              <button (click)="showAboutModal.set(false)" class="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer">✕</button>
            </div>
            <div class="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                En <strong>Homie</strong> transformamos la rutina diaria del café y la hidratación en una experiencia coleccionable y divertida.
              </p>
              <p>
                Diseñamos y distribuimos mugs 3D de alta definición, tazas mágicas y termos térmicos inteligentes de acero inoxidable con acabados prémium.
              </p>
              <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 text-xs font-semibold">
                <p>🚚 <strong>Cobertura:</strong> Envíos a toda Colombia vía Envía, Coordinadora e Interrapidísimo con pago contraentrega.</p>
              </div>

              <!-- Instagram Card -->
              <div class="p-3.5 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <div class="text-xs font-black text-slate-900">Síguenos en Instagram</div>
                    <div class="text-[11px] text-rose-600 font-bold">&#64;homie_shop.co</div>
                  </div>
                </div>
                <a
                  href="https://www.instagram.com/homie_shop.co?igsi=NnpmM2w1M3Bkc3hm"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105"
                >
                  Seguir →
                </a>
              </div>
            </div>
            <div class="pt-2 flex justify-end">
              <button
                (click)="showAboutModal.set(false)"
                class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class StoreLayoutComponent {
  cartService = inject(CartService);
  auth = inject(AuthService);
  productState = inject(ProductStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  showLoginModal = signal(false);
  loginMessage = signal('Para realizar una compra necesitas iniciar sesión con Google.');
  isDrawerOpen = signal(false);
  openAccordion = signal<'mugs' | 'termos' | null>('mugs');
  showAboutModal = signal(false);

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['loginRequired'] === '1') {
        this.loginMessage.set('Para realizar una compra necesitas iniciar sesión con Google.');
        this.showLoginModal.set(true);
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
      if (params['forbidden'] === '1') {
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleAccordion(section: 'mugs' | 'termos'): void {
    this.openAccordion.update((curr) => (curr === section ? null : section));
  }

  navigateHome(): void {
    this.productState.setCategory(null);
    this.productState.setThematic(null);
  }

  navigateCatalogAll(): void {
    this.navigateHome();
    this.closeDrawer();
    this.router.navigate(['/']);
  }

  selectCategoryBySlug(slug: string): void {
    let target = slug;
    if (slug === 'termos' || slug === 'termos-y-botellas') {
      target = 'termos-botellas';
    }
    this.productState.setCategory(target);
    this.productState.setThematic(null);
    this.closeDrawer();
    this.router.navigate(['/']);
  }

  selectThematic(thematic: string): void {
    this.productState.setThematic(thematic);
    this.closeDrawer();
    this.router.navigate(['/']);
  }

  scrollToCollections(): void {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    });
  }
}
