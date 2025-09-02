// Tipos del dominio para Terceros

// Persona
export interface Persona {
  id: number;
  codigo: string; // Código único por empresa
  nombre: string;
  apellidos: string;
  nif: string; // NIF/CIF único por empresa
  email?: string;
  telefono?: string;
  tipo: 'cliente' | 'proveedor' | 'empleado' | 'otro';
  activa: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Personas
export interface CreatePersonaDto {
  codigo: string;
  nombre: string;
  apellidos: string;
  nif: string;
  email?: string;
  telefono?: string;
  tipo: 'cliente' | 'proveedor' | 'empleado' | 'otro';
}

export interface UpdatePersonaDto {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  tipo?: 'cliente' | 'proveedor' | 'empleado' | 'otro';
  activa?: boolean;
}

// Filtros para Personas
export interface PersonaFilters {
  texto?: string;
  tipo?: string;
  activa?: boolean;
  empresaId?: number;
}

// Dirección
export interface Direccion {
  id: number;
  personaId: number;
  tipo: 'fiscal' | 'envio' | 'otro';
  calle: string;
  numero?: string;
  piso?: string;
  puerta?: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  pais: string;
  esPrincipal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Direcciones
export interface CreateDireccionDto {
  personaId: number;
  tipo: 'fiscal' | 'envio' | 'otro';
  calle: string;
  numero?: string;
  piso?: string;
  puerta?: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  pais: string;
  esPrincipal: boolean;
}

export interface UpdateDireccionDto {
  tipo?: 'fiscal' | 'envio' | 'otro';
  calle?: string;
  numero?: string;
  piso?: string;
  puerta?: string;
  codigoPostal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  esPrincipal?: boolean;
}

// Cuenta Bancaria
export interface CuentaBancaria {
  id: number;
  personaId: number;
  banco: string;
  sucursal?: string;
  dc: string;
  cuenta: string;
  iban: string;
  swift?: string;
  esPrincipal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Cuentas Bancarias
export interface CreateCuentaBancariaDto {
  personaId: number;
  banco: string;
  sucursal?: string;
  dc: string;
  cuenta: string;
  iban: string;
  swift?: string;
  esPrincipal: boolean;
}

export interface UpdateCuentaBancariaDto {
  banco?: string;
  sucursal?: string;
  dc?: string;
  cuenta?: string;
  iban?: string;
  swift?: string;
  esPrincipal?: boolean;
}

// Detección de duplicados
export interface DuplicadoDetectado {
  persona: Persona;
  similitud: number; // 0-100
  camposCoincidentes: string[];
}

// Persona con datos expandidos
export interface PersonaDetalle extends Persona {
  direcciones: Direccion[];
  cuentasBancarias: CuentaBancaria[];
  duplicados?: DuplicadoDetectado[];
}
