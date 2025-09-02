export interface Usuario {
  id: number;
  nombre: string;
  apellidos?: string;
  email: string;
  activo: boolean;
  fechaCreacion?: Date;
  fechaUltimaActividad?: Date;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  esSistema?: boolean;
  permisos?: any[];
}

export interface AsignacionMasivaRequest {
  tipo: 'usuario-a-roles' | 'rol-a-usuarios';
  accion: 'asignar' | 'revocar';
  usuariosIds: number[];
  rolesIds: number[];
  rolUnicoId?: number;
  configuracion: {
    notificarUsuarios: boolean;
    aplicarInmediatamente: boolean;
    crearAuditoria: boolean;
  };
}

export interface PermisosEfectivos {
  usuarioId: number;
  permisos: any[];
  permisosPorModulo: any;
  esAdmin: boolean;
  fechaCalculado: Date;
}

export interface AsignacionMasivaResponse {
  exitoso: boolean;
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  errores: string[];
  asignaciones: UsuarioRolAsignacion[];
}

export interface UsuarioRolAsignacion {
  usuarioId: number;
  rolId: number;
  accion: 'asignar' | 'revocar';
  exitoso: boolean;
  error?: string;
}