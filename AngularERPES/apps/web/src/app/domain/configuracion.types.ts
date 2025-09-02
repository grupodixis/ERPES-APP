export interface Moneda {
  id: number;
  codigo: string; // ISO 4217 (EUR, USD, etc.)
  nombre: string;
  simbolo: string;
  activa: boolean;
  esBase: boolean; // Moneda base del sistema
  precision: number; // Decimales (2 para EUR, 0 para JPY)
  createdAt: Date;
  updatedAt: Date;
}

export interface TipoCambio {
  id: number;
  monedaOrigenId: number;
  monedaDestinoId: number;
  fecha: Date;
  cambio: number; // Tipo de cambio (1 EUR = X USD)
  fuente: string; // 'manual', 'banco_central', 'api'
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para API
export interface CreateMonedaDto {
  codigo: string;
  nombre: string;
  simbolo: string;
  precision?: number;
}

export interface UpdateMonedaDto {
  nombre?: string;
  simbolo?: string;
  activa?: boolean;
  esBase?: boolean;
  precision?: number;
}

export interface CreateTipoCambioDto {
  monedaOrigenId: number;
  monedaDestinoId: number;
  fecha: Date;
  cambio: number;
  fuente?: string;
}

export interface UpdateTipoCambioDto {
  cambio?: number;
  activo?: boolean;
  fuente?: string;
}

// Filtros
export interface MonedaFilters {
  activa?: boolean;
  esBase?: boolean;
  search?: string;
}

export interface TipoCambioFilters {
  monedaOrigenId?: number;
  monedaDestinoId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  activo?: boolean;
}

// CSV Import
export interface TipoCambioCsvRow {
  monedaOrigen: string;
  monedaDestino: string;
  fecha: string;
  cambio: string;
  fuente?: string;
}

// Series Documentales
export interface SerieDocumental {
  id: number;
  codigo: string; // Ej: "FAC", "ALB", "PED"
  nombre: string;
  descripcion?: string;
  tipo: 'factura' | 'albaran' | 'pedido' | 'presupuesto' | 'ot';
  formato: string; // Ej: "{SERIE}-{AÑO}-{NUMERO}", "{CODIGO}-{FECHA}-{SECUENCIAL}"
  activa: boolean;
  ultimoNumero: number;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Series Documentales
export interface CreateSerieDocumentalDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'factura' | 'albaran' | 'pedido' | 'presupuesto' | 'ot';
  formato: string;
}

export interface UpdateSerieDocumentalDto {
  nombre?: string;
  descripcion?: string;
  formato?: string;
  activa?: boolean;
}

// Filtros para Series Documentales
export interface SerieDocumentalFilters {
  tipo?: string;
  activa?: boolean;
  search?: string;
}

// Preview de formato
export interface FormatoPreview {
  ejemplo: string;
  variables: string[];
  valido: boolean;
  error?: string;
}

// Centros de Coste
export interface CentroCoste {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  centroPadreId?: number;
  empresaId: number;
  nivel: number; // Nivel en la jerarquía (0 = raíz)
  ruta: string; // Ruta completa separada por '/'
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Centros de Coste
export interface CreateCentroCosteDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  centroPadreId?: number;
  empresaId: number;
}

export interface UpdateCentroCosteDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  centroPadreId?: number;
}

// Filtros para Centros de Coste
export interface CentroCosteFilters {
  activo?: boolean;
  centroPadreId?: number;
  empresaId?: number;
  nivel?: number;
  search?: string;
}

// Árbol de Centros de Coste
export interface CentroCosteArbol {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  nivel: number;
  hijos: CentroCosteArbol[];
}

// ===== CONDICIONES DE PAGO =====

export interface CondicionPago {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'contado' | 'credito' | 'mixto';
  diasVencimiento: number; // Días para el vencimiento
  diaFijo?: number; // Día fijo del mes (1-31)
  finMes: boolean; // Si el vencimiento es a fin de mes
  descuentoProntoPago?: number; // % de descuento por pronto pago
  diasDescuento?: number; // Días para aplicar descuento
  activa: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Condiciones de Pago
export interface CreateCondicionPagoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'contado' | 'credito' | 'mixto';
  diasVencimiento: number;
  diaFijo?: number;
  finMes?: boolean;
  descuentoProntoPago?: number;
  diasDescuento?: number;
  empresaId: number;
}

export interface UpdateCondicionPagoDto {
  nombre?: string;
  descripcion?: string;
  tipo?: 'contado' | 'credito' | 'mixto';
  diasVencimiento?: number;
  diaFijo?: number;
  finMes?: boolean;
  descuentoProntoPago?: number;
  diasDescuento?: number;
  activa?: boolean;
}

// Filtros para Condiciones de Pago
export interface CondicionPagoFilters {
  tipo?: string;
  activa?: boolean;
  empresaId?: number;
  search?: string;
}

// Simulación de vencimientos
export interface SimulacionVencimiento {
  fechaVencimiento: Date;
  importe: number;
  importeConDescuento?: number;
  diasHastaVencimiento: number;
  aplicaDescuento: boolean;
}

export interface SimularVencimientoDto {
  importe: number;
  fechaFactura: Date;
}

// ===== FORMAS DE PAGO =====

// Entidad principal
export interface FormaPago {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'pagare' | 'confirming' | 'otro';
  requiereCuenta: boolean; // Si requiere cuenta bancaria
  diasVencimiento?: number; // Días adicionales para el vencimiento
  activa: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para operaciones CRUD
export interface CreateFormaPagoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'pagare' | 'confirming' | 'otro';
  requiereCuenta?: boolean;
  diasVencimiento?: number;
  empresaId: number;
}

export interface UpdateFormaPagoDto {
  nombre?: string;
  descripcion?: string;
  tipo?: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'pagare' | 'confirming' | 'otro';
  requiereCuenta?: boolean;
  diasVencimiento?: number;
  activa?: boolean;
}

// Filtros para Formas de Pago
export interface FormaPagoFilters {
  tipo?: string;
  requiereCuenta?: boolean;
  activa?: boolean;
  empresaId?: number;
  search?: string;
}

// ===== UNIDADES DE MEDIDA =====

// Entidad principal UnidadMedida
export interface UnidadMedida {
  id: number;
  codigo: string; // Ej: "KG", "M", "L", "UNI"
  nombre: string; // Ej: "Kilogramo", "Metro", "Litro", "Unidad"
  simbolo: string; // Ej: "kg", "m", "l", "ud"
  magnitud: string; // Ej: "peso", "longitud", "volumen", "cantidad"
  esBase: boolean; // Si es la unidad base de la magnitud
  factorConversion: number; // Factor para convertir a la unidad base
  descripcion?: string;
  activa: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para crear UnidadMedida
export interface CreateUnidadMedidaDto {
  codigo: string;
  nombre: string;
  simbolo: string;
  magnitud: string;
  esBase?: boolean;
  factorConversion?: number;
  descripcion?: string;
  empresaId: number;
}

// DTO para actualizar UnidadMedida
export interface UpdateUnidadMedidaDto {
  nombre?: string;
  simbolo?: string;
  magnitud?: string;
  esBase?: boolean;
  factorConversion?: number;
  descripcion?: string;
  activa?: boolean;
}

// Filtros para UnidadesMedida
export interface UnidadMedidaFilters {
  magnitud?: string;
  esBase?: boolean;
  activa?: boolean;
  empresaId?: number;
  search?: string;
}

// DTO para conversión entre unidades
export interface ConvertirUnidadDto {
  cantidad: number;
  unidadOrigenId: number;
  unidadDestinoId: number;
}

// Resultado de conversión
export interface ResultadoConversion {
  cantidadOriginal: number;
  cantidadConvertida: number;
  unidadOrigen: string;
  unidadDestino: string;
  factorConversion: number;
}

// ===== TIPOS IVA =====

/**
 * Interfaz para los tipos de IVA
 */
export interface TipoIva {
  id: number;
  codigo: string; // Ej: "IVA21", "IVA10", "IVA4", "EXENTO"
  nombre: string; // Ej: "IVA General", "IVA Reducido", "IVA Superreducido", "Exento"
  porcentaje: number; // 0-100 (21, 10, 4, 0)
  descripcion?: string;
  activo: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para crear un tipo de IVA
 */
export interface CreateTipoIvaDto {
  codigo: string;
  nombre: string;
  porcentaje: number;
  descripcion?: string;
  empresaId: number;
}

/**
 * DTO para actualizar un tipo de IVA
 */
export interface UpdateTipoIvaDto {
  nombre?: string;
  porcentaje?: number;
  descripcion?: string;
  activo?: boolean;
}

/**
 * Filtros para búsqueda de tipos de IVA
 */
export interface TipoIvaFilters {
  activo?: boolean;
  empresaId?: number;
  porcentajeMin?: number;
  porcentajeMax?: number;
  search?: string; // Busca en código, nombre y descripción
}
