// ===== TIPOS DE DOMINIO PARA MÓDULO DOCUMENTOS =====

// ===== ENUMS Y TIPOS =====
export type EstadoTemplate = 'Borrador' | 'Activa' | 'Inactiva' | 'Archivada';
export type TipoTemplate = 'AcroForm' | 'XFA' | 'Plano';
export type EstadoFillJob = 'Pendiente' | 'Procesando' | 'Completado' | 'Error';
export type TipoCampo = 'TEXTO' | 'NUMERO' | 'EMAIL' | 'FECHA' | 'TELEFONO' | 'CHECKBOX' | 'LISTA' | 'FIRMA' | 'IMAGEN';
export type TipoTransformacion = 'UPPERCASE' | 'LOWERCASE' | 'CAPITALIZE' | 'TRIM' | 'DATE' | 'NUMBER' | 'REGEX' | 'CUSTOM' | 'CONCATENATE' | 'EXTRACT' | 'REPLACE' | 'CONDITIONAL';

// ===== INTERFACES PRINCIPALES =====

/**
 * Plantilla PDF principal
 */
export interface Template {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: TipoTemplate;
  estado: EstadoTemplate;
  archivoOriginalUrl: string;
  archivoOriginalNombre: string;
  archivoOriginalTamaño: number;
  versionActual: number;
  totalCampos: number;
  camposMapeados: number;
  porcentajeCompletitud: number;
  creadoPorId: number;
  creadoPor: string;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Versión de una plantilla
 */
export interface TemplateVersion {
  id: number;
  templateId: number;
  version: number;
  descripcionCambios?: string;
  archivoUrl: string;
  metadatos: {
    totalPaginas: number;
    tipoFormulario: string;
    camposDetectados: number;
    [key: string]: any;
  };
  esActiva: boolean;
  creadoPorId: number;
  creadoPor: string;
  createdAt: Date;
}

/**
 * Campo detectado en una plantilla PDF
 */
export interface TemplateField {
  id: number;
  templateVersionId: number;
  nombreCampo: string;
  etiqueta: string;
  tipo: TipoCampo;
  requerido: boolean;
  coordenadas: {
    x: number;
    y: number;
    width: number;
    height: number;
    pagina: number;
  };
  propiedades: {
    [key: string]: any;
  };
  confianzaDeteccion: number;
  validadoPorHumano: boolean;
  orden: number;
  createdAt: Date;
}

/**
 * Mapeo de campo PDF a campo ERP
 */
export interface FieldMapping {
  id: number;
  templateFieldId: number;
  campoERP: string;
  erpField?: string;
  transformacionId?: number;
  transformacion?: string;
  valorPorDefecto?: string;
  validaciones: {
    [key: string]: any;
  };
  confianzaMapeo: number;
  validadoPorHumano: boolean;
  creadoPorId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Preset de transformación de datos
 */
export interface TransformPreset {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: TipoTransformacion;
  configuracion: {
    [key: string]: any;
  };
  esGlobal: boolean;
  empresaId?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Embedding para mapeo semántico
 */
export interface Embedding {
  id: number;
  texto: string;
  vector: number[];
  tipo: 'campo_pdf' | 'campo_erp';
  metadatos: {
    [key: string]: any;
  };
  createdAt: Date;
}

/**
 * Trabajo de rellenado de PDF
 */
export interface FillJob {
  id: number;
  templateId: number;
  template: string;
  datosOrigen: {
    tipo: string;
    id: number;
    nombre?: string;
    [key: string]: any;
  };
  estado: EstadoFillJob;
  archivoGeneradoUrl?: string;
  archivoGeneradoNombre?: string;
  archivoGeneradoTamaño?: number;
  tiempoGeneracion?: number;
  errores: string[];
  metadatos: {
    camposRellenados?: number;
    camposVacios?: number;
    fechaGeneracion?: Date;
    [key: string]: any;
  };
  creadoPorId: number;
  creadoPor: string;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Log de auditoría
 */
export interface AuditLog {
  id: number;
  entidad: string;
  entidadId: number;
  accion: string;
  datosAnteriores?: any;
  datosNuevos?: any;
  usuarioId: number;
  usuario: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

// ===== DTOs PARA CREACIÓN =====

/**
 * DTO para crear una nueva plantilla
 */
export interface CreateTemplateDto {
  nombre: string;
  descripcion?: string;
  archivo: File;
  empresaId: number;
  metadatos?: {
    [key: string]: any;
  };
}

/**
 * DTO para actualizar una plantilla
 */
export interface UpdateTemplateDto {
  nombre?: string;
  descripcion?: string;
  estado?: EstadoTemplate;
}

/**
 * DTO para crear un mapeo de campo
 */
export interface CreateFieldMappingDto {
  templateFieldId: number;
  campoERP: string;
  transformacionId?: number;
  valorPorDefecto?: string;
  validaciones?: { [key: string]: any };
}

/**
 * DTO para actualizar un mapeo de campo
 */
export interface UpdateFieldMappingDto {
  campoERP?: string;
  transformacionId?: number;
  valorPorDefecto?: string;
  validaciones?: { [key: string]: any };
  validadoPorHumano?: boolean;
}

/**
 * DTO para solicitar rellenado de PDF
 */
export interface FillRequestDto {
  templateId: number;
  datosOrigen: {
    tipo: string;
    id: number;
    [key: string]: any;
  };
  configuracion?: {
    aplanar?: boolean;
    optimizar?: boolean;
    marca_agua?: boolean;
    [key: string]: any;
  };
}

/**
 * DTO para crear un trabajo de rellenado
 */
export interface CreateFillJobDto {
  templateId: number;
  datosOrigen: {
    tipo: string;
    id: number;
    nombre?: string;
    [key: string]: any;
  };
  configuracion?: {
    aplanar?: boolean;
    optimizar?: boolean;
    marca_agua?: boolean;
    [key: string]: any;
  };
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  fieldErrors?: {
    [fieldName: string]: string[];
  };
}

// ===== FILTROS =====

/**
 * Filtros para búsqueda de plantillas
 */
export interface TemplateFilters {
  tipo?: TipoTemplate;
  estado?: EstadoTemplate;
  creadoPorId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
  empresaId?: number;
}

/**
 * Filtros para búsqueda de trabajos de rellenado
 */
export interface FillJobFilters {
  templateId?: number;
  estado?: EstadoFillJob;
  tipoOrigen?: string;
  creadoPorId?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  empresaId?: number;
}

/**
 * Filtros para campos de plantilla
 */
export interface TemplateFieldFilters {
  templateVersionId?: number;
  tipo?: TipoCampo;
  requerido?: boolean;
  validadoPorHumano?: boolean;
  confianzaMinima?: number;
}

// ===== RESPUESTAS DE API =====

/**
 * Respuesta de análisis de PDF
 */
export interface PdfAnalysisResponse {
  templateVersionId: number;
  totalCampos: number;
  camposDetectados: TemplateField[];
  metadatos: {
    totalPaginas: number;
    tipoFormulario: string;
    tiempoAnalisis: number;
    [key: string]: any;
  };
  sugerenciasMapeo: FieldMappingSuggestion[];
}

/**
 * Sugerencia de mapeo de campo
 */
export interface FieldMappingSuggestion {
  templateFieldId: number;
  campoERP: string;
  confianza: number;
  razon: string;
  transformacionSugerida?: string;
}

/**
 * Respuesta de rellenado de PDF
 */
export interface FillResponse {
  jobId: number;
  estado: EstadoFillJob;
  archivoUrl?: string;
  tiempoGeneracion?: number;
  errores: string[];
  metadatos: {
    camposRellenados: number;
    camposVacios: number;
    [key: string]: any;
  };
}

/**
 * Estadísticas de plantillas
 */
export interface TemplateStats {
  totalPlantillas: number;
  plantillasActivas: number;
  plantillasBorrador: number;
  totalRellenados: number;
  promedioCompletitud: number;
  tiempoPromedioGeneracion: number;
}

// ===== CONFIGURACIÓN =====

/**
 * Configuración del módulo de documentos
 */
export interface DocumentosConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  ocrEnabled: boolean;
  aiMappingEnabled: boolean;
  defaultTransformPresets: TransformPreset[];
  pdfGenerationConfig: {
    compression: boolean;
    watermark: boolean;
    flatten: boolean;
  };
}

// ===== UTILIDADES =====

/**
 * Resultado paginado genérico
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Respuesta estándar de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}