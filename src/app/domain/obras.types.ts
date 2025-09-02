// ===== TIPOS DE DOMINIO PARA OBRAS =====

// Estados de obra
export type EstadoObra = 'Planificacion' | 'EnCurso' | 'Suspendida' | 'Finalizada' | 'Cancelada';

// Estados de capítulo
export type EstadoCapitulo = 'Pendiente' | 'EnCurso' | 'Finalizado' | 'Suspendido';

// Estados de partida
export type EstadoPartida = 'Pendiente' | 'EnCurso' | 'Finalizada' | 'Suspendida';

// Estados de orden de trabajo
export type EstadoOrdenTrabajo = 'Creada' | 'Planificada' | 'EnCurso' | 'Finalizada' | 'Cancelada';

// Tipos de vínculo con obra
export type TipoVinculo = 'Arquitecto' | 'Ingeniero' | 'Contratista' | 'Subcontratista' | 'Supervisor' | 'Cliente';

// ===== OBRA =====

export interface Obra {
  id: number;
  codigo: string;
  nombre: string;
  estado: EstadoObra;
  clienteId: number;
  cliente?: string; // Para mostrar en UI
  direccionObraId?: number;
  direccionObra?: string; // Para mostrar en UI
  responsableId?: number;
  responsable?: string; // Para mostrar en UI
  fechaInicioPrevista?: Date;
  fechaFinPrevista?: Date;
  fechaInicioReal?: Date;
  fechaFinReal?: Date;
  presupuestoObjetivo?: number;
  centroCosteId?: number;
  centroCoste?: string; // Para mostrar en UI
  esProvisional: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Obra
export interface CreateObraDto {
  codigo: string;
  nombre: string;
  clienteId: number;
  direccionObraId?: number;
  responsableId?: number;
  fechaInicioPrevista?: Date;
  fechaFinPrevista?: Date;
  presupuestoObjetivo?: number;
  centroCosteId?: number;
  empresaId: number;
}

export interface UpdateObraDto {
  nombre?: string;
  estado?: EstadoObra;
  direccionObraId?: number;
  responsableId?: number;
  fechaInicioPrevista?: Date;
  fechaFinPrevista?: Date;
  fechaInicioReal?: Date;
  fechaFinReal?: Date;
  presupuestoObjetivo?: number;
  centroCosteId?: number;
  esProvisional?: boolean;
}

// Filtros para Obras
export interface ObraFilters {
  clienteId?: number;
  estado?: EstadoObra;
  responsableId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
  empresaId?: number;
}

// ===== CAPÍTULO DE OBRA =====

export interface CapituloObra {
  id: number;
  codigo: string;
  nombre: string;
  estado: EstadoCapitulo;
  obraId: number;
  capituloPadreId?: number;
  nivel: number;
  orden: number;
  ruta: string; // Ruta completa separada por '/'
  observaciones?: string;
  esProvisional: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Capítulo de Obra
export interface CreateCapituloObraDto {
  codigo: string;
  nombre: string;
  obraId: number;
  capituloPadreId?: number;
  orden?: number;
  observaciones?: string;
  empresaId: number;
}

export interface UpdateCapituloObraDto {
  nombre?: string;
  estado?: EstadoCapitulo;
  capituloPadreId?: number;
  orden?: number;
  observaciones?: string;
  esProvisional?: boolean;
}

// Árbol de Capítulos de Obra
export interface CapituloObraArbol {
  id: number;
  codigo: string;
  nombre: string;
  estado: EstadoCapitulo;
  nivel: number;
  orden: number;
  hijos: CapituloObraArbol[];
  partidas: PartidaObra[];
}

// ===== PARTIDA DE OBRA =====

export interface PartidaObra {
  id: number;
  codigo: string;
  nombre: string;
  estado: EstadoPartida;
  capituloId: number;
  productoId?: number;
  producto?: string; // Para mostrar en UI
  unidadMedidaId?: number;
  unidadMedida?: string; // Para mostrar en UI
  alto: number;
  ancho: number;
  largo: number;
  formula?: string;
  cantidad: number;
  precioUnitario: number;
  tipoIvaId?: number;
  tipoIva?: string; // Para mostrar en UI
  costePrevisto?: number;
  margenPct?: number;
  mermaPct?: number;
  centroCosteId?: number;
  centroCoste?: string; // Para mostrar en UI
  orden: number;
  esProvisional: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Partida de Obra
export interface CreatePartidaObraDto {
  codigo: string;
  nombre: string;
  capituloId: number;
  productoId?: number;
  unidadMedidaId?: number;
  alto?: number;
  ancho?: number;
  largo?: number;
  formula?: string;
  cantidad: number;
  precioUnitario: number;
  tipoIvaId?: number;
  costePrevisto?: number;
  margenPct?: number;
  mermaPct?: number;
  centroCosteId?: number;
  orden?: number;
  empresaId: number;
}

export interface UpdatePartidaObraDto {
  nombre?: string;
  estado?: EstadoPartida;
  productoId?: number;
  unidadMedidaId?: number;
  alto?: number;
  ancho?: number;
  largo?: number;
  formula?: string;
  cantidad?: number;
  precioUnitario?: number;
  tipoIvaId?: number;
  costePrevisto?: number;
  margenPct?: number;
  mermaPct?: number;
  centroCosteId?: number;
  orden?: number;
  esProvisional?: boolean;
}

// ===== ORDEN DE TRABAJO =====

export interface OrdenTrabajo {
  id: number;
  codigo: string;
  descripcion?: string;
  obraId?: number;
  obra?: string; // Para mostrar en UI
  partidaId: number;
  partida?: string; // Para mostrar en UI
  fechaPrevista?: Date;
  fechaInicioPrevista?: Date;
  fechaFinPrevista?: Date;
  prioridad?: number;
  estado: EstadoOrdenTrabajo;
  aprobadoPorId?: number;
  aprobadoPor?: string; // Para mostrar en UI
  fechaAprobacion?: Date;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Orden de Trabajo
export interface CreateOrdenTrabajoDto {
  codigo: string;
  descripcion?: string;
  obraId?: number;
  partidaId: number;
  fechaPrevista?: Date;
  fechaInicioPrevista?: Date;
  fechaFinPrevista?: Date;
  prioridad?: number;
  empresaId: number;
}

export interface UpdateOrdenTrabajoDto {
  descripcion?: string;
  obraId?: number;
  fechaPrevista?: Date;
  fechaInicioPrevista?: Date;
  fechaFinPrevista?: Date;
  prioridad?: number;
  estado?: EstadoOrdenTrabajo;
  aprobadoPorId?: number;
  fechaAprobacion?: Date;
}

// ===== VÍNCULO CON OBRA =====

export interface VinculoObra {
  id: number;
  obraId: number;
  personaId: number;
  persona?: string; // Para mostrar en UI
  codigoVinculo: string;
  tipoVinculo: TipoVinculo;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Vínculo con Obra
export interface CreateVinculoObraDto {
  obraId: number;
  personaId: number;
  codigoVinculo: string;
  tipoVinculo: TipoVinculo;
  empresaId: number;
}

export interface UpdateVinculoObraDto {
  tipoVinculo?: TipoVinculo;
}

// ===== FILTROS =====

export interface CapituloObraFilters {
  obraId?: number;
  capituloPadreId?: number;
  estado?: EstadoCapitulo;
  search?: string;
  empresaId?: number;
}

export interface PartidaObraFilters {
  capituloId?: number;
  productoId?: number;
  estado?: EstadoPartida;
  search?: string;
  empresaId?: number;
}

export interface OrdenTrabajoFilters {
  obraId?: number;
  partidaId?: number;
  estado?: EstadoOrdenTrabajo;
  fechaDesde?: Date;
  fechaHasta?: Date;
  prioridad?: number;
  search?: string;
  empresaId?: number;
}

export interface VinculoObraFilters {
  obraId?: number;
  personaId?: number;
  tipoVinculo?: TipoVinculo;
  search?: string;
  empresaId?: number;
}

// ===== RESÚMENES Y ESTADÍSTICAS =====

export interface ResumenObra {
  totalCapitulos: number;
  totalPartidas: number;
  totalOrdenesTrabajo: number;
  presupuestoTotal: number;
  avanceGeneral: number; // Porcentaje de avance
  fechaInicioReal?: Date;
  fechaFinEstimada?: Date;
}

export interface EstadisticasObra {
  ordenesCreadas: number;
  ordenesPlanificadas: number;
  ordenesEnCurso: number;
  ordenesFinalizadas: number;
  ordenesCanceladas: number;
  porcentajeAvance: number;
}

// ===== NODOS PARA ÁRBOL JERÁRQUICO =====

export interface NodoObraArbol {
  id: number;
  tipo: 'obra' | 'capitulo' | 'partida' | 'orden';
  codigo: string;
  nombre: string;
  estado: EstadoObra | EstadoCapitulo | EstadoPartida | EstadoOrdenTrabajo;
  nivel: number;
  expandido: boolean;
  seleccionado: boolean;
  hijos: NodoObraArbol[];
  // Datos específicos según el tipo
  fechaInicio?: Date;
  fechaFin?: Date;
  presupuesto?: number;
  avance?: number;
}

// ===== CONFIGURACIÓN DE VISTA =====

export interface ConfiguracionVistaObra {
  mostrarCapitulos: boolean;
  mostrarPartidas: boolean;
  mostrarOrdenes: boolean;
  mostrarEstados: boolean;
  mostrarFechas: boolean;
  mostrarPresupuestos: boolean;
  agruparPor: 'estado' | 'responsable' | 'fecha' | 'ninguno';
}

// ===== VALIDACIONES =====

export interface ErrorValidacionObra {
  campo: string;
  mensaje: string;
  tipo: 'error' | 'warning' | 'info';
}

export interface ResultadoValidacionObra {
  valido: boolean;
  errores: ErrorValidacionObra[];
}

// ===== IMPORTACIÓN/EXPORTACIÓN =====

export interface DatosImportacionObra {
  filas: any[];
  errores: string[];
  procesadas: number;
  exitosas: number;
}

export interface ConfiguracionExportacionObra {
  incluirCapitulos: boolean;
  incluirPartidas: boolean;
  incluirOrdenes: boolean;
  incluirVinculos: boolean;
  formato: 'excel' | 'pdf' | 'csv';
  fechaDesde?: Date;
  fechaHasta?: Date;
}