import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  effect,
} from '@angular/core';
import { AuthStore } from '../stores/auth.store';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() appHasPermission!: string | string[];
  @Input() appHasPermissionResource?: string;
  @Input() appHasPermissionAction?: string;

  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authStore: AuthStore
  ) {
    // Efecto para reaccionar a cambios en los permisos del usuario
    effect(() => {
      this.updateView();
    });
  }

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermission(): boolean {
    // Si se proporciona un array de permisos, verificar si tiene alguno
    if (Array.isArray(this.appHasPermission)) {
      return this.authStore.hasAnyPermission(this.appHasPermission);
    }

    // Si se proporciona un string, puede ser un permiso completo o solo recurso
    if (typeof this.appHasPermission === 'string') {
      // Si contiene ':', es un permiso completo (recurso:accion)
      if (this.appHasPermission.includes(':')) {
        return this.authStore.hasPermission(
          this.appHasPermission.split(':')[0],
          this.appHasPermission.split(':')[1]
        );
      } else {
        // Si no contiene ':', es solo el recurso, verificar cualquier acción
        return this.authStore.hasAnyPermission([
          `${this.appHasPermission}:read`,
          `${this.appHasPermission}:create`,
          `${this.appHasPermission}:update`,
          `${this.appHasPermission}:delete`,
        ]);
      }
    }

    // Si se proporcionan resource y action por separado
    if (this.appHasPermissionResource && this.appHasPermissionAction) {
      return this.authStore.hasPermission(
        this.appHasPermissionResource,
        this.appHasPermissionAction
      );
    }

    return false;
  }
}
