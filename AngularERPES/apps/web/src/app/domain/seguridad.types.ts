// ============================================================================
// TIPOS DE DOMINIO - MÓDULO SEGURIDAD
// ============================================================================
// Interfaces TypeScript para el módulo de seguridad del ERP
// Incluye: Permisos, Roles, Usuarios-Roles, Roles-Permisos
// ============================================================================

// ============================================================================
// PERMISOS
// ============================================================================

export interface Permiso {
  id: number;
  nombre: string; // Ej: "read_usuarios", "write_obras", "admin_sistema"
  recurso: string; // Ej: "usuarios", "obras", "sistema"
  accion: string; // Ej: "read", "write", "delete", "admin"
  descripcion: string;
  modulo: string; // Ej: "seguridad", "obras", "comercial"
  jerarquia?: string; // Ruta jerárquica: "seguridad/usuarios/read"
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePermisoDto {
  nombre: string;
  recurso: string;
  accion: string;
  descripcion: string;
  modulo: string;
  jerarquia?: string;
}

export interface UpdatePermisoDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface PermisoFilters {
  modulo?: string;
  recurso?: string;
  accion?: string;
  activo?: boolean;
  search?: string; // Busca en nombre, recurso, acción y descripción
}

// Estructura jerárquica para mostrar permisos en árbol
export interface PermisoArbol {
  id?: string;
  nombre: string;
  descripcion?: string;
  tipo: 'modulo' | 'recurso' | 'permiso';
  hijos: PermisoArbol[];
  permiso?: Permiso;
  expandido?: boolean;
  seleccionado?: boolean;
}

// ============================================================================
// ROLES
// ============================================================================

export interface Rol {
  id: number;
  nombre: string; // Ej: "Administrador", "Usuario", "Supervisor Obras"
  descripcion?: string;
  activo: boolean;
  esAdmin: boolean; // Si tiene permisos de administrador total
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
  // Relaciones
  permisos?: Permiso[];
  usuarios?: Usuario[];
}

export interface CreateRolDto {
  nombre: string;
  descripcion?: string;
  esAdmin?: boolean;
  empresaId: number;
}

export interface UpdateRolDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  esAdmin?: boolean;
}

export interface RolFilters {
  activo?: boolean;
  esAdmin?: boolean;
  empresaId?: number;
  search?: string; // Busca en nombre y descripción
}

// ============================================================================
// USUARIOS (Referencia para relaciones)
// ============================================================================

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
  empresaId: number;
  // Relaciones
  roles?: Rol[];
}

// ============================================================================
// ROLES-PERMISOS (Relación Many-to-Many)
// ============================================================================

export interface RolPermiso {
  id: number;
  rolId: number;
  permisoId: number;
  asignadoPor: number;
  fechaAsignacion: Date;
  activo: boolean;
  // Datos desnormalizados para performance
  rolNombre?: string;
  permisoNombre?: string;
  permisoDescripcion?: string;
}

export interface CreateRolPermisoDto {
  rolId: number;
  permisoId: number;
}

export interface UpdateRolPermisoDto {
  activo?: boolean;
}

export interface RolPermisoFilters {
  rolId?: number;
  permisoId?: number;
  modulo?: string;
  activo?: boolean;
}

export interface AsignacionMasivaDto {
  rolId: number;
  permisoIds: number[];
}

// Matriz de permisos para UI
export interface MatrizRolPermiso {
  roles: Rol[];
  permisos: Permiso[];
  matriz: { [rolId: number]: { [permisoId: number]: boolean } };
  estadisticas: {
    totalRoles: number;
    totalPermisos: number;
    totalAsignaciones: number;
    totalPosibles: number;
    porcentajeCobertura: number;
  };
}

// ============================================================================
// USUARIOS-ROLES (Relación Many-to-Many)
// ============================================================================

export interface UsuarioRol {
  usuarioId: number;
  rolId: number;
  asignado: boolean;
  fechaAsignacion: Date;
  // Datos desnormalizados para performance
  usuarioNombre?: string;
  usuarioEmail?: string;
  rolNombre?: string;
  rolDescripcion?: string;
}

export interface AsignarRolUsuarioDto {
  usuarioId: number;
  rolId: number;
}

export interface AsignacionRolesMasivaDto {
  usuarioId: number;
  rolIds: number[];
}

// ============================================================================
// PERMISOS EFECTIVOS
// ============================================================================

// Permisos calculados para un usuario (combinando todos sus roles)
export interface PermisosEfectivos {
  usuarioId: number;
  permisos: Permiso[];
  permisosPorModulo: {
    [modulo: string]: Permiso[]
  };
  esAdmin: boolean; // Si tiene algún rol de admin
  fechaCalculado: Date;
}

// ============================================================================
// TEMPLATES Y CONFIGURACIÓN
// ============================================================================

// Templates predefinidos de roles
export interface TemplateRol {
  nombre: string;
  descripcion: string;
  permisos: string[]; // Array de nombres de permisos
  esAdmin: boolean;
}

// Comparación entre roles
export interface ComparacionRoles {
  rol1: Rol;
  rol2: Rol;
  permisosComunes: number[];
  permisosSoloRol1: number[];
  permisosSoloRol2: number[];
  porcentajeSimilitud: number; // Porcentaje de similitud (0-100)
}

// ============================================================================
// CONFIGURACIÓN DE MÓDULOS
// ============================================================================

// Configuración de permisos por módulo
export interface ConfiguracionModulo {
  nombre: string;
  descripcion: string;
  recursos: {
    nombre: string;
    acciones: string[];
  }[];
  permisosRequeridos?: string[]; // Permisos mínimos para acceder al módulo
}

// ============================================================================
// AUDITORÍA Y LOGS
// ============================================================================

export interface LogSeguridad {
  id: number;
  usuarioId: number;
  accion: 'login' | 'logout' | 'acceso_denegado' | 'cambio_permisos' | 'cambio_roles';
  recurso?: string;
  detalles?: string;
  ip?: string;
  userAgent?: string;
  fecha: Date;
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

// Para validar permisos en el frontend
export interface ValidacionPermiso {
  recurso: string;
  accion: string;
  requerido: boolean;
}

// Estado de carga para componentes
export interface EstadoSeguridad {
  cargando: boolean;
  error?: string;
  permisos: Permiso[];
  roles: Rol[];
  permisosEfectivos?: PermisosEfectivos;
}

// ============================================================================
// CONSTANTES Y ENUMS
// ============================================================================

export const ACCIONES_PERMISO = {
  READ: 'read',
  write: 'write', 
  delete: 'delete',
  admin: 'admin'
} as const;

export const MODULOS_SISTEMA = {
  seguridad: 'seguridad',
  configuracion: 'configuracion',
  terceros: 'terceros',
  obras: 'obras',
  comercial: 'comercial',
  inventario: 'inventario',
  contabilidad: 'contabilidad',
  rrhh: 'rrhh',
  dms: 'dms',
  auditoria: 'auditoria'
} as const;

export type AccionPermiso = typeof ACCIONES_PERMISO[keyof typeof ACCIONES_PERMISO];
export type ModuloSistema = typeof MODULOS_SISTEMA[keyof typeof MODULOS_SISTEMA];

// ============================================================================
// TEMPLATES PREDEFINIDOS
// ============================================================================

export const TEMPLATES_ROLES: TemplateRol[] = [
  {
    nombre: 'Administrador Sistema',
    descripcion: 'Acceso completo a todo el sistema',
    permisos: ['admin_sistema'],
    esAdmin: true
  },
  {
    nombre: 'Usuario Básico',
    descripcion: 'Permisos básicos de lectura',
    permisos: [
      'read_usuarios', 'read_empresas', 'read_configuracion',
      'read_terceros', 'read_obras', 'read_comercial'
    ],
    esAdmin: false
  },
  {
    nombre: 'Supervisor Obras',
    descripcion: 'Gestión completa de obras y construcción',
    permisos: [
      'read_usuarios', 'read_empresas', 'read_configuracion',
      'admin_obras', 'write_terceros', 'read_comercial'
    ],
    esAdmin: false
  },
  {
    nombre: 'Comercial',
    descripcion: 'Gestión de ventas, compras y facturación',
    permisos: [
      'read_usuarios', 'read_empresas', 'read_configuracion',
      'read_obras', 'admin_comercial', 'write_terceros'
    ],
    esAdmin: false
  }
];