import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, ApiResponse } from '../models';

const TOKEN_KEY = 'homie_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  // Signals reactivos
  private _user = signal<AuthUser | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.is_admin === true);

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Redirige al usuario a Google OAuth2 a través del backend.
   * El backend manejará el dance OAuth y redirigirá de vuelta con un ?token=...
   */
  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  /**
   * Procesa el callback de Google OAuth.
   * Extrae el token de la URL, lo guarda y carga el perfil del usuario.
   * Retorna 'success' | 'error'
   */
  async handleOAuthCallback(params: { token?: string | null; error?: string | null }): Promise<'success' | 'error'> {
    if (params.error || !params.token) return 'error';

    localStorage.setItem(TOKEN_KEY, params.token);
    try {
      await this.loadCurrentUser();
      return 'success';
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return 'error';
    }
  }

  /**
   * Carga el perfil del usuario actual desde el backend usando el JWT guardado.
   * Llamar en AppComponent.ngOnInit() para restaurar sesión al recargar la página.
   */
  async loadCurrentUser(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      this._user.set(null);
      return;
    }
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<AuthUser>>(`${this.apiUrl}/auth/me`)
      );
      this._user.set(res.data);
    } catch {
      // Token inválido o expirado
      localStorage.removeItem(TOKEN_KEY);
      this._user.set(null);
    }
  }

  /** Cierra sesión — elimina token local y limpia el estado. */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.router.navigate(['/']);
  }

  /** Obtiene el token JWT del localStorage. */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
