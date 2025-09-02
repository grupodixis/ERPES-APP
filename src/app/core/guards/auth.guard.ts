import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanDeactivate,
  CanMatch,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthStore } from '../stores/auth.store';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanDeactivate<any>, CanMatch {
  constructor(
    private authStore: AuthStore,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(state.url);
  }

  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Observable<boolean> {
    // Por ahora permitimos la navegación
    // Aquí se podría implementar lógica para guardar cambios pendientes
    return new Observable(observer => observer.next(true));
  }

  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean> {
    return this.checkAuth(segments.map(s => s.path).join('/'));
  }

  private checkAuth(url: string): Observable<boolean> {
    console.log('🛡️ AuthGuard.checkAuth() - Verificando autenticación para URL:', url);
    return new Observable(observer => {
      // Usar setTimeout para evitar problemas de detección de cambios
      setTimeout(() => {
        const isLoggedIn = this.authStore.isLoggedIn();
        console.log('🛡️ AuthGuard.checkAuth() - isLoggedIn:', isLoggedIn);
        
        if (isLoggedIn) {
          console.log('🛡️ AuthGuard.checkAuth() - Usuario autenticado, permitiendo acceso');
          observer.next(true);
        } else {
          console.log('🛡️ AuthGuard.checkAuth() - Usuario no autenticado, redirigiendo a login');
          this.toastService.showError('Debe iniciar sesión para acceder a esta página');
          this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
          observer.next(false);
        }
        observer.complete();
      }, 0);
    });
  }
}
