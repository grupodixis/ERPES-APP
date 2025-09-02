// Componentes
export { UsuariosRolesComponent } from './usuarios-roles.component';
export { AsignacionMasivaDialogComponent } from './asignacion-masiva-dialog/asignacion-masiva-dialog.component';
export { PermisosEfectivosDialogComponent } from './permisos-efectivos-dialog/permisos-efectivos-dialog.component';

// Servicios
export { UsuariosRolesService } from './usuarios-roles.service';

// Rutas
export { USUARIOS_ROLES_ROUTES } from './usuarios-roles.routes';

// Tipos (re-exportados desde seguridad.types.ts)
export type {
  Usuario,
  Rol,
  UsuarioRol,
  PermisoEfectivo,
  CrearUsuarioRolDto,
  ActualizarUsuarioRolDto,
  AsignacionMasivaDto,
  FiltrosUsuariosRoles,
  EstadisticasUsuariosRoles
} from '../../../shared/types/seguridad.types';