// Tipos y interfaces para el módulo de Contabilidad

// Ejercicio Contable
export interface EjercicioContable {
  id: number;
  codigo: string;
  nombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoEjercicio;
  activo: boolean;
  cerrado: boolean;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EstadoEjercicio {
  ABIERTO = 'ABIERTO',
  CERRADO = 'CERRADO',
  PROVISIONAL = 'PROVISIONAL'
}

// Cuenta Contable
export interface CuentaContable {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoCuenta: TipoCuenta;
  naturaleza: NaturalezaCuenta;
  nivel: number;
  cuentaPadreId?: number;
  cuentaPadre?: CuentaContable;
  subcuentas?: CuentaContable[];
  activa: boolean;
  auxiliar: boolean;
  imputable: boolean;
  saldoDeudor: number;
  saldoAcreedor: number;
  saldoActual: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum TipoCuenta {
  ACTIVO = 'ACTIVO',
  PASIVO = 'PASIVO',
  PATRIMONIO = 'PATRIMONIO',
  INGRESOS = 'INGRESOS',
  GASTOS = 'GASTOS'
}

export enum NaturalezaCuenta {
  DEUDORA = 'DEUDORA',
  ACREEDORA = 'ACREEDORA'
}

// Asiento Contable
export interface AsientoContable {
  id: number;
  numero: string;
  fecha: Date;
  concepto: string;
  descripcion?: string;
  ejercicioId: number;
  ejercicio?: EjercicioContable;
  tipoAsiento: TipoAsiento;
  estado: EstadoAsiento;
  totalDebe: number;
  totalHaber: number;
  diferencia: number;
  cuadrado: boolean;
  apuntes: ApunteContable[];
  documentoReferencia?: string;
  usuarioCreacion: string;
  fechaCreacion: Date;
  usuarioModificacion?: string;
  fechaModificacion?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TipoAsiento {
  APERTURA = 'APERTURA',
  ORDINARIO = 'ORDINARIO',
  REGULARIZACION = 'REGULARIZACION',
  CIERRE = 'CIERRE'
}

export enum EstadoAsiento {
  BORRADOR = 'BORRADOR',
  CONFIRMADO = 'CONFIRMADO',
  ANULADO = 'ANULADO'
}

// Apunte Contable
export interface ApunteContable {
  id: number;
  asientoId: number;
  asiento?: AsientoContable;
  cuentaId: number;
  cuenta?: CuentaContable;
  concepto: string;
  debe: number;
  haber: number;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

// Balance
export interface Balance {
  ejercicioId: number;
  ejercicio?: EjercicioContable;
  fechaGeneracion: Date;
  activo: BalanceSeccion;
  pasivo: BalanceSeccion;
  patrimonio: BalanceSeccion;
  totalActivo: number;
  totalPasivo: number;
  totalPatrimonio: number;
  cuadrado: boolean;
}

export interface BalanceSeccion {
  nombre: string;
  cuentas: BalanceCuenta[];
  total: number;
}

export interface BalanceCuenta {
  cuenta: CuentaContable;
  saldo: number;
  subcuentas?: BalanceCuenta[];
}

// Pérdidas y Ganancias
export interface PerdidasyGanancias {
  ejercicioId: number;
  ejercicio?: EjercicioContable;
  fechaGeneracion: Date;
  ingresos: PyGSeccion;
  gastos: PyGSeccion;
  totalIngresos: number;
  totalGastos: number;
  resultado: number;
  tipoResultado: 'BENEFICIO' | 'PERDIDA';
}

export interface PyGSeccion {
  nombre: string;
  cuentas: PyGCuenta[];
  total: number;
}

export interface PyGCuenta {
  cuenta: CuentaContable;
  importe: number;
  subcuentas?: PyGCuenta[];
}

// Filtros y consultas
export interface FiltrosContabilidad {
  ejercicioId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  cuentaId?: number;
  tipoAsiento?: TipoAsiento;
  estado?: EstadoAsiento;
  concepto?: string;
  numeroAsiento?: string;
}

export interface EstadisticasContabilidad {
  totalAsientos: number;
  totalApuntes: number;
  totalDebe: number;
  totalHaber: number;
  asientosPorMes: { mes: string; cantidad: number }[];
  cuentasMasUsadas: { cuenta: string; usos: number }[];
  diferenciasDetectadas: number;
}

// Configuración del módulo
export interface ConfiguracionContabilidad {
  ejercicioActivo?: number;
  digitosCuenta: number;
  separadorCuenta: string;
  formatoAsiento: string;
  validacionAutomatica: boolean;
  copiaSeguridad: boolean;
}

// Respuestas de API
export interface ContabilidadResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ContabilidadListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  message?: string;
  success: boolean;
}

// Parámetros de consulta
export interface ContabilidadQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Exportación de datos
export interface ExportacionContable {
  formato: 'PDF' | 'EXCEL' | 'CSV';
  tipo: 'BALANCE' | 'PERDIDAS_GANANCIAS' | 'MAYOR' | 'DIARIO';
  ejercicioId: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  incluirSubcuentas: boolean;
  incluirSaldosCero: boolean;
}

// Validaciones
export interface ValidacionAsiento {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  diferencia: number;
}

// Auditoría contable
export interface AuditoriaContable {
  id: number;
  accion: AccionAuditoria;
  tabla: string;
  registroId: number;
  datosAnteriores?: any;
  datosNuevos?: any;
  usuario: string;
  fecha: Date;
  ip?: string;
  observaciones?: string;
}

export enum AccionAuditoria {
  CREAR = 'CREAR',
  MODIFICAR = 'MODIFICAR',
  ELIMINAR = 'ELIMINAR',
  CONSULTAR = 'CONSULTAR'
}

// Enums para informes
export enum TipoInforme {
  BALANCE = 'BALANCE',
  PERDIDAS_GANANCIAS = 'PERDIDAS_GANANCIAS',
  LIBRO_DIARIO = 'LIBRO_DIARIO',
  LIBRO_MAYOR = 'LIBRO_MAYOR',
  BALANCE_COMPROBACION = 'BALANCE_COMPROBACION'
}

export enum FormatoInforme {
  RESUMIDO = 'RESUMIDO',
  DETALLADO = 'DETALLADO',
  COMPARATIVO = 'COMPARATIVO'
}

export enum PeriodoInforme {
  EJERCICIO_COMPLETO = 'EJERCICIO_COMPLETO',
  PRIMER_TRIMESTRE = 'PRIMER_TRIMESTRE',
  SEGUNDO_TRIMESTRE = 'SEGUNDO_TRIMESTRE',
  TERCER_TRIMESTRE = 'TERCER_TRIMESTRE',
  CUARTO_TRIMESTRE = 'CUARTO_TRIMESTRE',
  HASTA_HOY = 'HASTA_HOY',
  PERSONALIZADO = 'PERSONALIZADO'
}

// Tipos de utilidad
export type ContabilidadEntity = EjercicioContable | CuentaContable | AsientoContable | ApunteContable;
export type ContabilidadFormMode = 'create' | 'edit' | 'view';
export type ContabilidadStatus = 'loading' | 'success' | 'error' | 'idle';