import { Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios/usuarios.component';

export const SEGURIDAD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full'
  },
  {
    path: 'usuarios',
    component: UsuariosComponent
  },
  {
    path: 'permisos',
    loadChildren: () => import('./permisos/permisos.module').then(m => m.PermisosModule),
    data: {
      breadcrumb: 'Permisos',
      title: 'Gestión de Permisos',
      description: 'Sistema de Control de Acceso Basado en Roles (RBAC)'
    }
  },
  {
    path: 'roles-permisos',
    loadChildren: () => import('./roles-permisos/roles-permisos.routes').then(m => m.ROLES_PERMISOS_ROUTES),
    data: {
      breadcrumb: 'Roles y Permisos'
    }
  }
  // TODO: Add more security routes
  // {
  //   path: 'roles',
  //   component: RolesComponent
  // },
  // {
  //   path: 'auditoria',
  //   component: AuditoriaComponent
  // }
];
