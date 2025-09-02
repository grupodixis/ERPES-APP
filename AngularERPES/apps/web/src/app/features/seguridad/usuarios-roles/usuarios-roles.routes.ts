import { Routes } from '@angular/router';
import { UsuariosRolesComponent } from './usuarios-roles.component';

export const USUARIOS_ROLES_ROUTES: Routes = [
  {
    path: '',
    component: UsuariosRolesComponent,
    data: {
      title: 'Usuarios y Roles',
      breadcrumb: 'Usuarios y Roles',
      permissions: ['usuarios_roles.leer']
    }
  }
];