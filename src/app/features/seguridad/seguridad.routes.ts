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
  //   path: 'permisos',
  //   component: PermisosComponent
  // },
  // {
  //   path: 'auditoria',
  //   component: AuditoriaComponent
  // }
];
