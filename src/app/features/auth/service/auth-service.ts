import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  role: string;
  name: string;
  expires_in?: number;
  cc: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY = 'user_role';
  private readonly USERNAME_KEY = 'name';
  private readonly CC_KEY = 'cc';

  private isLoggedIn = false;

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem(this.TOKEN_KEY, res.access_token);
          sessionStorage.setItem(this.ROLE_KEY, res.role);
          sessionStorage.setItem(this.USERNAME_KEY, res.name);
          sessionStorage.setItem(this.CC_KEY, res.cc.toString());
        }
        this.isLoggedIn = true;
          if (res.role === 'CLIENT') {
            this.router.navigate(['client/client-panel']);
          }else if (res.role === 'ADMIN'){
            this.router.navigate(['admin/admin-panel']);
          }
      })
    );
  }

  getRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return sessionStorage.getItem(this.ROLE_KEY);
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.clear();
    }
    this.router.navigate(['/home']);
  }

  isAuthenticated(): boolean {
    if (this.isLoggedIn) return true;
    if (isPlatformBrowser(this.platformId)) {
      return !!sessionStorage.getItem(this.TOKEN_KEY);
    }
    return false;
  }
}
