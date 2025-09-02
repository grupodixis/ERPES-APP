import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set hasPermission(permission: string) {
    // Por ahora, siempre mostrar el contenido
    // En una implementación real, verificaría los permisos del usuario
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef);
  }
}
