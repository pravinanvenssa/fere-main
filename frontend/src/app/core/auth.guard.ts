import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.authState$.pipe(
    filter(authState => !authState.isLoading), // Wait until loading is complete
    take(1), // Take only the first non-loading state
    map(authState => {
      if (authState.isAuthenticated) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    return authService.authState$.pipe(
      filter(authState => !authState.isLoading), // Wait until loading is complete
      take(1), // Take only the first non-loading state
      map(authState => {
        if (!authState.isAuthenticated) {
          router.navigate(['/login']);
          return false;
        }
        
        const hasRequiredRole = authService.hasAnyRole(allowedRoles);
        if (!hasRequiredRole) {
          router.navigate(['/unauthorized']);
          return false;
        }
        
        return true;
      })
    );
  };
};

export const permissionGuard = (resource: string, action: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    return authService.authState$.pipe(
      filter(authState => !authState.isLoading), // Wait until loading is complete
      take(1), // Take only the first non-loading state
      map(authState => {
        if (!authState.isAuthenticated) {
          router.navigate(['/login']);
          return false;
        }
        
        const hasPermission = authService.hasPermission(resource, action);
        if (!hasPermission) {
          router.navigate(['/unauthorized']);
          return false;
        }
        
        return true;
      })
    );
  };
};
