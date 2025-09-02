// ============================================================================
// ROLES-PERMISOS ROUTES
// ============================================================================
// Configuración de rutas para el módulo de gestión de roles y permisos
// ============================================================================

import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PermissionGuard } from '../../../core/guards/permission.guard';

export const ROLES_PERMISOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, PermissionGuard],
    data: { 
      requiredPermissions: ['seguridad.roles-permisos.leer'],
      breadcrumb: 'Roles y Permisos'
    },
    children: [
      {
        path: '',
        loadComponent: () => 
          import('./roles-permisos.component').then(m => m.RolesPermisosComponent),
        data: {
          title: 'Gestión de Roles y Permisos',
          description: 'Administra la matriz de permisos por rol del sistema'
        }
      }
    ]
  }
];