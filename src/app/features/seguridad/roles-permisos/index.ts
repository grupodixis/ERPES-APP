// ============================================================================
// ROLES-PERMISOS MODULE EXPORTS
// ============================================================================
// Archivo de índice para exportar todos los componentes y servicios del módulo
// ============================================================================

// Componentes principales
export { RolesPermisosComponent } from './roles-permisos.component';
export { AsignacionMasivaDialogComponent } from './asignacion-masiva-dialog.component';
export { ComparacionRolesDialogComponent } from './comparacion-roles-dialog.component';

// Servicios
export { RolesPermisosService } from './roles-permisos.service';

// Rutas
export { ROLES_PERMISOS_ROUTES } from './roles-permisos.routes';

// Re-exportar tipos relacionados desde domain
export type {
  RolPermiso,
  MatrizRolPermiso,
  CreateRolPermisoDto,
  UpdateRolPermisoDto,
  RolPermisoFilters,
  ComparacionRoles,
  TemplateRol
} from '../../../domain/seguridad.types';