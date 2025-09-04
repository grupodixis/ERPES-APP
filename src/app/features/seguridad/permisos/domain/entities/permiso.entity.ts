export interface Permiso {
  id: number;
  recurso: string;
  metodo: string;
  descripcion: string;
  modulo: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaModificacion?: Date;
  creadoPor: string;
  modificadoPor?: string;
}

export interface CreatePermisoDto {
  recurso: string;
  metodo: string;
  descripcion: string;
  modulo: string;
  activo?: boolean;
}

export interface UpdatePermisoDto {
  recurso?: string;
  metodo?: string;
  descripcion?: string;
  modulo?: string;
  activo?: boolean;
}

export interface PermisoQueryDto {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  recurso?: string;
  metodo?: string;
  modulo?: string;
  activo?: boolean;
}

export interface PermisoResponse {
  data: Permiso[];
  total: number;
  page: number;
  pageSize: number;
}