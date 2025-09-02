// ===== TIPOS DE DOMINIO PARA PRESUPUESTOS =====

// Estados de presupuesto
export type EstadoPresupuesto = 'Borrador' | 'Enviado' | 'Aceptado' | 'Rechazado' | 'Cancelado';

// Tipos de recurso para desglose
export type TipoRecurso = 'Articulo' | 'Operario' | 'Maquinaria';

// ===== PRESUPUESTO =====

export interface Presupuesto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  clienteId: number;
  cliente?: string; // Para mostrar en UI
  estado: EstadoPresupuesto;
  fechaCreacion: Date;
  fechaModificacion: Date;
  fechaValidez?: Date;
  observaciones?: string;
  totalSinIva: number;
  totalIva: number;
  totalConIva: number;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Presupuesto
export interface CreatePresupuestoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  clienteId: number;
  fechaValidez?: Date;
  observaciones?: string;
  empresaId: number;
}

export interface UpdatePresupuestoDto {
  nombre?: string;
  descripcion?: string;
  clienteId?: number;
  estado?: EstadoPresupuesto;
  fechaValidez?: Date;
  observaciones?: string;
}

// Filtros para Presupuestos
export interface PresupuestoFilters {
  clienteId?: number;
  estado?: EstadoPresupuesto;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
  empresaId?: number;
}

// ===== CAPÍTULO =====

export interface Capitulo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  presupuestoId: number;
  capituloPadreId?: number;
  nivel: number;
  orden: number;
  ruta: string; // Ruta completa separada por '/'
  totalSinIva: number;
  totalIva: number;
  totalConIva: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Capítulo
export interface CreateCapituloDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  presupuestoId: number;
  capituloPadreId?: number;
  orden?: number;
}

export interface UpdateCapituloDto {
  nombre?: string;
  descripcion?: string;
  capituloPadreId?: number;
  orden?: number;
}

// Árbol de Capítulos
export interface CapituloArbol {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivel: number;
  orden: number;
  totalSinIva: number;
  totalConIva: number;
  hijos: CapituloArbol[];
  partidas: Partida[];
}

// ===== PARTIDA =====

export interface Partida {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  presupuestoId: number;
  capituloId: number;
  productoId?: number; // Categoría de producto
  producto?: string; // Para mostrar en UI
  unidadMedidaId: number;
  unidadMedida?: string; // Para mostrar en UI
  cantidad: number;
  precio: number;
  // Propiedades adicionales para la grilla
  unidades?: number; // Alias para cantidad
  precioUnitario?: number; // Alias para precio
  // Dimensiones opcionales
  largo?: number;
  ancho?: number;
  alto?: number;
  // Totales calculados
  totalSinIva: number;
  totalIva: number;
  totalConIva: number;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Partida
export interface CreatePartidaDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  presupuestoId: number;
  capituloId: number;
  productoId?: number;
  unidadMedidaId: number;
  cantidad: number;
  precio: number;
  largo?: number;
  ancho?: number;
  alto?: number;
  orden?: number;
}

export interface UpdatePartidaDto {
  nombre?: string;
  descripcion?: string;
  capituloId?: number;
  productoId?: number;
  unidadMedidaId?: number;
  cantidad?: number;
  precio?: number;
  largo?: number;
  ancho?: number;
  alto?: number;
  orden?: number;
}

// ===== DESGLOSE PARTIDA =====

export interface DesglosePartida {
  id: number;
  partidaId: number;
  tipoRecurso: TipoRecurso;
  recursoId: number;
  recursoNombre?: string; // Para mostrar en UI
  recursoUnidad?: string; // Para mostrar en UI
  cantidad: number;
  precio: number;
  total: number;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Desglose
export interface CreateDesglosePartidaDto {
  partidaId: number;
  tipoRecurso: TipoRecurso;
  recursoId: number;
  cantidad: number;
  precio: number;
  observaciones?: string;
}

export interface UpdateDesglosePartidaDto {
  tipoRecurso?: TipoRecurso;
  recursoId?: number;
  cantidad?: number;
  precio?: number;
  observaciones?: string;
}

// ===== RECURSOS PARA DESGLOSE =====

// Artículo (simplificado para desglose)
export interface ArticuloDesglose {
  id: number;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  precio: number;
  activo: boolean;
}

// Operario (simplificado para desglose)
export interface OperarioDesglose {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  costeHora: number;
  activo: boolean;
}

// Maquinaria (simplificado para desglose)
export interface MaquinariaDesglose {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  costeHora: number;
  activo: boolean;
}

// Unión de tipos para recursos
export type RecursoDesglose = ArticuloDesglose | OperarioDesglose | MaquinariaDesglose;

// ===== FILTROS Y BÚSQUEDAS =====

export interface CapituloFilters {
  presupuestoId?: number;
  capituloPadreId?: number;
  search?: string;
}

export interface PartidaFilters {
  presupuestoId?: number;
  capituloId?: number;
  productoId?: number;
  search?: string;
}

export interface DesgloseFilters {
  partidaId?: number;
  tipoRecurso?: TipoRecurso;
  search?: string;
}

export interface RecursoFilters {
  tipo: TipoRecurso;
  search?: string;
  activo?: boolean;
}

// ===== RESPUESTAS Y CÁLCULOS =====

// Resumen de totales
export interface ResumenTotales {
  totalSinIva: number;
  totalIva: number;
  totalConIva: number;
  numeroPartidas: number;
  numeroCapitulos: number;
}

// Cálculo de dimensiones
export interface CalculoDimensiones {
  largo: number;
  ancho: number;
  alto: number;
  superficie: number;
  volumen: number;
  cantidad: number;
}

// ===== NAVEGACIÓN Y UI =====

// Nodo del árbol para UI
export interface NodoArbol {
  id: number;
  tipo: 'capitulo' | 'partida';
  codigo: string;
  nombre: string;
  nivel: number;
  expandido: boolean;
  seleccionado: boolean;
  totalConIva: number;
  hijos: NodoArbol[];
}

// Estado del editor
export interface EstadoEditor {
  presupuestoId: number;
  capituloSeleccionado?: number;
  partidaSeleccionada?: number;
  modoEdicion: 'presupuesto' | 'partida' | 'desglose';
  cambiosPendientes: boolean;
}

// Configuración de columnas para desglose
export interface ConfiguracionColumna {
  campo: string;
  titulo: string;
  tipo: 'texto' | 'numero' | 'selector' | 'autocomplete';
  editable: boolean;
  ancho?: string;
  requerido?: boolean;
}

// ===== VALIDACIONES =====

export interface ErrorValidacion {
  campo: string;
  mensaje: string;
  tipo: 'error' | 'warning' | 'info';
}

export interface ResultadoValidacion {
  valido: boolean;
  errores: ErrorValidacion[];
}

// ===== IMPORTACIÓN/EXPORTACIÓN =====

export interface DatosImportacion {
  filas: any[];
  errores: string[];
  procesadas: number;
  exitosas: number;
}

export interface ConfiguracionExportacion {
  incluirCapitulos: boolean;
  incluirPartidas: boolean;
  incluirDesglose: boolean;
  formato: 'excel' | 'pdf' | 'csv';
}