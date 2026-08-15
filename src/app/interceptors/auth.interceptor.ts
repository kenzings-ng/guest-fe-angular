import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const token = auth.getAccessToken();

  const baseHeaders: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
  };
  if (isApiRequest && token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }
  const authorizedReq = req.clone({ setHeaders: baseHeaders });

  return next(authorizedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => req.url.includes(path));
      if (error.status === 401 && isApiRequest && !isAuthEndpoint && auth.getRefreshToken()) {
        return auth.refreshAccessToken().pipe(
          switchMap((newToken) =>
            next(
              req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                  'ngrok-skip-browser-warning': 'true',
                },
              }),
            ),
          ),
          catchError((refreshError) => {
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};