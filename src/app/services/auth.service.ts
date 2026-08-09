import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/user.model';

const ACCESS_TOKEN_KEY = 'maison-access-token';
const REFRESH_TOKEN_KEY = 'maison-refresh-token';
const USER_KEY = 'maison-user';

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);
  private refreshTokenValue: string | null = localStorage.getItem(REFRESH_TOKEN_KEY);

  private readonly _currentUser = signal<User | null>(readStoredUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  login(email: string, password: string, rememberMe = false): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password, rememberMe })
      .pipe(tap((res) => this.persistSession(res)));
  }

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { email, password, name })
      .pipe(tap((res) => this.persistSession(res)));
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/verify`, { params: { token } });
  }

  logout(): void {
    const refreshToken = this.refreshTokenValue;
    this.clearSession();
    if (refreshToken) {
      this.http.post(`${this.baseUrl}/logout`, { refreshToken }).subscribe({ error: () => undefined });
    }
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.refreshTokenValue;
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap((res) => this.persistSession(res)),
      map((res) => res.accessToken),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      }),
    );
  }

  /**
   * Gate an action behind login. Returns true if the user is already signed
   * in; otherwise redirects to /login (remembering the current URL) and
   * returns false so the caller can bail out without performing the action.
   */
  requireAuth(): boolean {
    if (this.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
    return false;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshTokenValue;
  }

  private persistSession(res: AuthResponse): void {
    this.accessToken = res.accessToken;
    this.refreshTokenValue = res.refreshToken;
    this._currentUser.set(res.user);
    localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }

  private clearSession(): void {
    this.accessToken = null;
    this.refreshTokenValue = null;
    this._currentUser.set(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
