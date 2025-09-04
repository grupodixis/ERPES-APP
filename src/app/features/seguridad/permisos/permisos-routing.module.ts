import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/components/permisos.component').then(c => c.PermisosComponent),
    data: {
      title: 'Gestión de Permisos',
      breadcrumb: 'Permisos',
      description: 'Sistema de Control de Acceso Basado en Roles (RBAC)',
      permissions: ['permisos:GET']
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermisosRoutingModule { }