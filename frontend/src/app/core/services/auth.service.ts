import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, ApiResponse } from '../models';

const TOKEN_KEY = 'homie_auth_token';
const USER_KEY = 'homie_auth_user';

interface JwtPayload {
  userId?: number;
  email?: string;
  is_admin?: boolean;
  exp?: number;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  // Margen de 10 segundos para prevenir desfasaje
  return Date.now() >= payload.exp * 1000 - 10000;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  // Signals reactivos — pre-hidratados síncronamente desde localStorage
  private _user = signal<AuthUser | null>(this.getInitialUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.is_admin === true);

  // Evitar múltiples llamadas simultáneas a loadCurrentUser()
  private inFlightLoad: Promise<void> | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Obtiene el usuario almacenado en localStorage al iniciar la app.
   * Si el token expiró, limpia el storage para evitar estados inconsistentes.
   */
  private getInitialUser(): AuthUser | null {
    const token = this.getToken();
    if (!token) return null;

    if (isTokenExpired(token)) {
      this.clearStorage();
      return null;
    }

    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        return JSON.parse(raw) as AuthUser;
      }
    } catch {
      // Si falla el parseo, intentar obtener datos mínimos del JWT
    }

    const payload = parseJwt(token);
    if (payload && payload.userId && payload.email) {
      return {
        id: payload.userId,
        email: payload.email,
        full_name: null,
        avatar_url: null,
        is_admin: !!payload.is_admin,
      };
    }

    return null;
  }

  /**
   * Redirige al usuario a Google OAuth2 a través del backend.
   */
  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  /**
   * Procesa el callback de Google OAuth.
   * Guarda token, consulta perfil y persiste sesión.
   */
  async handleOAuthCallback(params: { token?: string | null; error?: string | null }): Promise<'success' | 'error'> {
    if (params.error || !params.token) return 'error';

    try {
      localStorage.setItem(TOKEN_KEY, params.token);
    } catch {
      return 'error';
    }

    try {
      await this.loadCurrentUser();
      return this.isAuthenticated() ? 'success' : 'error';
    } catch {
      this.clearSession();
      return 'error';
    }
  }

  /**
   * Carga o refresca el perfil del usuario actual desde el backend usando el JWT guardado.
   * Si el token es inválido/expirado (401/403), limpia la sesión.
   * Si hay un error temporal de red, mantiene la sesión local sin desloguear al usuario.
   */
  async loadCurrentUser(): Promise<void> {
    if (this.inFlightLoad) {
      return this.inFlightLoad;
    }

    this.inFlightLoad = this._performLoadCurrentUser();
    try {
      await this.inFlightLoad;
    } finally {
      this.inFlightLoad = null;
    }
  }

  private async _performLoadCurrentUser(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      this.clearSession();
      return;
    }

    if (isTokenExpired(token)) {
      this.clearSession();
      return;
    }

    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<AuthUser>>(`${this.apiUrl}/auth/me`)
      );
      if (res && res.data) {
        this.setUser(res.data);
      }
    } catch (err: any) {
      // Solo si el backend rechaza el token con 401 o 403 lo consideramos cerrado/inválido
      if (err?.status === 401 || err?.status === 403) {
        this.clearSession();
      } else {
        console.warn('[Homie Auth] No se pudo verificar sesión con backend; conservando sesión local:', err?.message || err);
      }
    }
  }

  /** Asigna el usuario en memoria y en localStorage */
  private setUser(user: AuthUser | null): void {
    this._user.set(user);
    if (user) {
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('Error guardando usuario en localStorage:', e);
      }
    } else {
      try {
        localStorage.removeItem(USER_KEY);
      } catch {}
    }
  }

  /** Cierra sesión — elimina token y usuario local y redirige al inicio. */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }

  /** Limpia el estado de autenticación tanto en memoria como en localStorage. */
  private clearSession(): void {
    this.clearStorage();
    this._user.set(null);
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error limpiando almacenamiento de auth:', e);
    }
  }

  /** Obtiene el token JWT del localStorage. */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
}
