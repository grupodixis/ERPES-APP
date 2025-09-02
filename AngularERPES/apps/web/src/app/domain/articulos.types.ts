// Tipos base para Artículos & Inventario

export interface TipoArticulo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  umStock: string; // Unidad de medida base para stock
  umVentaDefault: string; // Unidad de medida por defecto para ventas
  factorCompraAVenta: number; // Factor de conversión compra → venta
  stockMinimo: number;
  stockMaximo?: number;
  activo: boolean;
  requiereLote: boolean;
  requiereSerie: boolean;
  caduca: boolean;
  diasCaducidad?: number;
  ivaId: number;
  precioVenta?: number;
  precioCompra?: number;
  categoriaId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lote {
  id: number;
  articuloId: number;
  codigo: string;
  numeroLote: string;
  fechaFabricacion: Date;
  fechaCaducidad?: Date;
  estado: 'activo' | 'bloqueado' | 'agotado';
  cantidadInicial: number;
  cantidadDisponible: number;
  ubicacionId: number;
  depositoId: number;
  proveedorId?: number;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Serie {
  id: number;
  articuloId: number;
  codigo: string;
  numeroSerie: string;
  estado: 'activo' | 'bloqueado' | 'vendido';
  ubicacionId: number;
  depositoId: number;
  proveedorId?: number;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entrada {
  id: number;
  numero: string;
  fecha: Date;
  proveedorId: number;
  depositoId: number;
  estado: 'borrador' | 'confirmada' | 'anulada';
  observaciones?: string;
  lineas: EntradaLinea[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EntradaLinea {
  id: number;
  entradaId: number;
  articuloId: number;
  umCompra: string;
  cantidadCompra: number;
  factorCompraAVenta: number;
  cantidadStock: number; // cantidadCompra * factorCompraAVenta
  precioCompra: number;
  loteId?: number;
  serieId?: number;
  ubicacionId: number;
  observaciones?: string;
}

export interface MovimientoStock {
  id: number;
  fecha: Date;
  tipo: 'entrada' | 'salida' | 'traspaso' | 'ajuste';
  articuloId: number;
  cantidad: number;
  umStock: string;
  depositoOrigenId?: number;
  ubicacionOrigenId?: number;
  depositoDestinoId?: number;
  ubicacionDestinoId?: number;
  loteId?: number;
  serieId?: number;
  documentoOrigenId?: number;
  documentoOrigenTipo?: string;
  costeUnitario?: number;
  costeTotal?: number;
  motivo?: string;
  usuarioId: number;
  createdAt: Date;
}

export interface Disponibilidad {
  articuloId: number;
  articuloCodigo: string;
  articuloNombre: string;
  depositoId: number;
  depositoNombre: string;
  ubicacionId: number;
  ubicacionNombre: string;
  loteId?: number;
  numeroLote?: string;
  serieId?: number;
  numeroSerie?: string;
  cantidadDisponible: number;
  umStock: string;
  fechaCaducidad?: Date;
  estado: 'activo' | 'bloqueado' | 'agotado';
}

export interface SugerenciaConsumo {
  loteId?: number;
  serieId?: number;
  numeroLote?: string;
  numeroSerie?: string;
  cantidadDisponible: number;
  cantidadSugerida: number;
  umStock: string;
  fechaCaducidad?: Date;
  ubicacionId: number;
  ubicacionNombre: string;
  depositoId: number;
  depositoNombre: string;
  prioridad: number; // Para ordenar por FEFO/FIFO
}

export interface ReservaConsumo {
  albaranLineaId: number;
  loteId?: number;
  serieId?: number;
  cantidadReservada: number;
  umStock: string;
  ubicacionId: number;
  depositoId: number;
  fechaReserva: Date;
  estado: 'reservado' | 'consumido' | 'liberado';
}

export interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  url: string;
  tamanio: number;
  contentType: string;
  loteId?: number;
  serieId?: number;
  articuloId?: number;
  usuarioId: number;
  createdAt: Date;
}

// DTOs para operaciones
export interface CreateTipoArticuloDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  umStock: string;
  umVentaDefault: string;
  factorCompraAVenta: number;
  stockMinimo: number;
  stockMaximo?: number;
  requiereLote: boolean;
  requiereSerie: boolean;
  caduca: boolean;
  diasCaducidad?: number;
  ivaId: number;
  precioVenta?: number;
  precioCompra?: number;
  categoriaId?: number;
}

export interface UpdateTipoArticuloDto extends Partial<CreateTipoArticuloDto> {
  activo?: boolean;
}

export interface CreateEntradaDto {
  proveedorId: number;
  depositoId: number;
  observaciones?: string;
  lineas: CreateEntradaLineaDto[];
}

export interface CreateEntradaLineaDto {
  articuloId: number;
  umCompra: string;
  cantidadCompra: number;
  factorCompraAVenta: number;
  precioCompra: number;
  ubicacionId: number;
  numeroLote?: string;
  numeroSerie?: string;
  fechaCaducidad?: Date;
  observaciones?: string;
}

export interface TraspasoDto {
  articuloId: number;
  desdeDepositoId: number;
  desdeUbicacionId: number;
  haciaDepositoId: number;
  haciaUbicacionId: number;
  cantidad: number;
  loteId?: number;
  serieId?: number;
  motivo: string;
}

export interface AjusteDto {
  articuloId: number;
  depositoId: number;
  ubicacionId: number;
  cantidadDelta: number; // Positivo = incremento, Negativo = decremento
  motivo: string;
  loteId?: number;
  serieId?: number;
}

// Filtros y queries
export interface TipoArticuloFilters {
  q?: string;
  activo?: boolean;
  requiereLote?: boolean;
  requiereSerie?: boolean;
  caduca?: boolean;
  categoriaId?: number;
}

export interface LoteFilters {
  articuloId?: number;
  depositoId?: number;
  estado?: string;
  caducaAntesDe?: Date;
}

export interface SerieFilters {
  articuloId?: number;
  estado?: string;
}

export interface EntradaFilters {
  fechaDesde?: Date;
  fechaHasta?: Date;
  proveedorId?: number;
  estado?: string;
  depositoId?: number;
}

export interface DisponibilidadFilters {
  articuloId?: number;
  depositoId?: number;
  ubicacionId?: number;
  loteId?: number;
  serieId?: number;
}

export interface MovimientoFilters {
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipo?: string;
  articuloId?: number;
  depositoId?: number;
  ubicacionId?: number;
  loteId?: number;
  serieId?: number;
}

// View Models para UI
export interface TipoArticuloVM {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  umStock: string;
  umVentaDefault: string;
  factorCompraAVenta: number;
  stockMinimo: number;
  stockMaximo?: number;
  activo: boolean;
  requiereLote: boolean;
  requiereSerie: boolean;
  caduca: boolean;
  diasCaducidad?: number;
  ivaId: number;
  precioVenta?: number;
  precioCompra?: number;
  categoriaId?: number;
  stockActual?: number;
  stockBajo?: boolean;
}

export interface LoteVM {
  id: number;
  articuloId: number;
  articuloCodigo: string;
  articuloNombre: string;
  codigo: string;
  numeroLote: string;
  fechaFabricacion: Date;
  fechaCaducidad?: Date;
  estado: 'activo' | 'bloqueado' | 'agotado';
  cantidadInicial: number;
  cantidadDisponible: number;
  ubicacionId: number;
  ubicacionNombre: string;
  depositoId: number;
  depositoNombre: string;
  proveedorId?: number;
  proveedorNombre?: string;
  observaciones?: string;
  diasParaCaducar?: number;
  caducado?: boolean;
}

export interface DisponibilidadVM {
  articuloId: number;
  articuloCodigo: string;
  articuloNombre: string;
  depositoId: number;
  depositoNombre: string;
  ubicacionId: number;
  ubicacionNombre: string;
  loteId?: number;
  numeroLote?: string;
  serieId?: number;
  numeroSerie?: string;
  cantidadDisponible: number;
  umStock: string;
  fechaCaducidad?: Date;
  estado: 'activo' | 'bloqueado' | 'agotado';
  diasParaCaducar?: number;
  caducado?: boolean;
}

// Respuestas paginadas
export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Enums
export enum EstadoLote {
  ACTIVO = 'activo',
  BLOQUEADO = 'bloqueado',
  AGOTADO = 'agotado'
}

export enum EstadoSerie {
  ACTIVO = 'activo',
  BLOQUEADO = 'bloqueado',
  VENDIDO = 'vendido'
}

export enum TipoMovimiento {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  TRASPASO = 'traspaso',
  AJUSTE = 'ajuste'
}

export enum EstrategiaConsumo {
  FEFO = 'FEFO', // First Expired, First Out
  FIFO = 'FIFO', // First In, First Out
  MANUAL = 'MANUAL'
}
