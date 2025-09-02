import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
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
export class PermissionGuard implements CanActivate, CanActivateChild {
  constructor(
    private authStore: AuthStore,
    private router: Router,
    private toastService: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkPermission(route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkPermission(childRoute);
  }

  private checkPermission(route: ActivatedRouteSnapshot): Observable<boolean> {
    return new Observable(observer => {
      // Obtener permisos requeridos de la ruta
      const requiredPermissions = route.data['permissions'] as string | string[];
      const requiredResource = route.data['resource'] as string;
      const requiredAction = route.data['action'] as string;

      if (!requiredPermissions && !requiredResource) {
        // Si no hay permisos requeridos, permitir acceso
        observer.next(true);
        observer.complete();
        return;
      }

      let hasPermission = false;

      // Verificar permisos específicos
      if (requiredPermissions) {
        if (Array.isArray(requiredPermissions)) {
          hasPermission = this.authStore.hasAnyPermission(requiredPermissions);
        } else {
          hasPermission = this.authStore.hasPermission(
            requiredPermissions.split(':')[0],
            requiredPermissions.split(':')[1]
          );
        }
      }

      // Verificar recurso y acción específicos
      if (requiredResource && requiredAction) {
        hasPermission = this.authStore.hasPermission(requiredResource, requiredAction);
      }

      if (hasPermission) {
        observer.next(true);
      } else {
        this.toastService.showError('No tiene permisos para acceder a esta página');
        this.router.navigate(['/']);
        observer.next(false);
      }
      
      observer.complete();
    });
  }
}
