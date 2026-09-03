import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

/**
 * AuthCallbackComponent — /auth/callback
 *
 * Destino del redirect de Google OAuth.
 * Lee ?token= o ?error= de la URL, procesa y redirige.
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        @if (status === 'loading') {
          <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-600 font-medium">Iniciando sesión con Google...</p>
          </div>
        }
        @if (status === 'error') {
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p class="text-gray-700 font-medium">Error al iniciar sesión</p>
            <p class="text-gray-500 text-sm">Serás redirigido al inicio...</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  status: 'loading' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    const result = await this.auth.handleOAuthCallback({ token, error });

    if (result === 'success') {
      const user = this.auth.user();
      // Si es admin, ir al dashboard; si no, ir al catálogo
      const redirect = user?.is_admin ? '/admin/dashboard' : '/';
      this.router.navigate([redirect]);
    } else {
      this.status = 'error';
      setTimeout(() => this.router.navigate(['/']), 2000);
    }
  }
}
