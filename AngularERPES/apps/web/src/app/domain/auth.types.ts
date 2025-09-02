export interface User {
  id: number;
  username?: string;
  email: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
  empresaId: number;
  roles: Role[];
  permisos?: Permission[];
  password?: string;
  ultimoAcceso?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: Permission[];
  activo?: boolean;
}

export interface Permission {
  id: number;
  nombre: string;
  descripcion: string;
  recurso: string;
  accion: string;
  activo?: boolean;
}

export interface LoginRequest {
  username: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Empresa {
  id: number;
  nombre: string;
  nif: string;
  cif?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activa: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  empresaId: number | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}
