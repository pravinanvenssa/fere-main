import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, User, AuthState } from '../models/user.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });
  
  public authState$ = this.authStateSubject.asObservable();
  
  constructor() {
    this.initializeAuth();
    
    // Listen for storage changes (tokens updated by interceptor)
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token' || event.key === 'refresh_token') {
        this.handleTokenChange();
      }
    });
  }
  
  private handleTokenChange(): void {
    const token = this.tokenService.getToken();
    if (token && !this.tokenService.isTokenExpired(token)) {
      // Token was updated externally (likely by interceptor), reload user profile
      this.loadUserProfile();
    } else if (!token) {
      // Token was removed, update auth state
      this.setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }

  private initializeAuth(): void {
    const token = this.tokenService.getToken();
    if (token && !this.tokenService.isTokenExpired(token)) {
      // Try to load user profile first
      this.loadUserProfile();
    } else {
      // If token is expired, try to refresh it
      const refreshToken = this.tokenService.getRefreshToken();
      if (refreshToken) {
        this.refreshToken().subscribe({
          error: () => {
            // If refresh fails, clear tokens and redirect to login
            this.tokenService.clearTokens();
          }
        });
      } else {
        this.tokenService.clearTokens();
      }
    }
  }  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    this.setError(null);
    
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.tokenService.setTokens(response.accessToken, response.refreshToken);
          this.setAuthState({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }),
        catchError(error => {
          this.setError(error.error?.message || 'Login failed');
          this.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, {
      refreshToken
    }).pipe(
      tap(response => {
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
        this.setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }
  
  private loadUserProfile(): void {
    this.setLoading(true);
    this.http.get<User>(`${environment.apiUrl}/auth/profile`)
      .pipe(
        tap(user => {
          this.setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }),
        catchError(error => {
          console.error('Failed to load user profile:', error);
          // If profile loading fails, try to refresh token
          const refreshToken = this.tokenService.getRefreshToken();
          if (refreshToken && error.status === 401) {
            return this.refreshToken();
          } else {
            this.logout();
            return throwError(() => error);
          }
        })
      )
      .subscribe();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }  private setAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }
  
  private setLoading(loading: boolean): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      isLoading: loading
    });
  }
  
  private setError(error: string | null): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      error
    });
  }
  
  // RBAC Helper methods
  hasRole(roleName: string): boolean {
    const user = this.authStateSubject.value.user;
    return user?.roles.some(role => role.name === roleName) || false;
  }
  
  hasPermission(resource: string, action: string): boolean {
    const user = this.authStateSubject.value.user;
    if (!user) return false;
    
    return user.roles.some(role =>
      role.permissions.some(permission =>
        permission.resource === resource && permission.action === action
      )
    );
  }
  
  hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some(roleName => this.hasRole(roleName));
  }
}
