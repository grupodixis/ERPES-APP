// Tipos de dominio para el módulo de Recursos Humanos

export interface Operario {
  idOperario: number;
  idEmpresa: number;
  idPersona: number;
  idCategoriaOperario?: number;
  fechaAlta: string;
  nss?: string;
  fechaNacimiento?: string;
  grupoCotizacion?: string;
  centroTrabajo?: string;
  ibanNomina?: string;
  emailCorporativo?: string;
  telefonoEmpresa?: string;
  costeHoraBase: number;
  activo: boolean;
}

export interface CategoriaOperario {
  idCategoriaOperario: number;
  idEmpresa: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  costeHoraBase: number;
  salarioBase?: number;
  activa: boolean;
  fechaCreacion?: Date;
}

export interface ContratoLaboral {
  idContratoLaboral: number;
  idEmpresa: number;
  idOperario: number;
  fechaInicio: string;
  fechaFin?: string;
  tipoContrato?: string;
  categoriaProfesional?: string;
  grupoCotizacion?: string;
  salarioBase?: number;
  tipoJornadaHorasSemanal?: number;
  centroCosteId?: number;
  jornada?: string;
  estado?: string;
  observaciones?: string;
}

export interface CursoFormacion {
  idCurso: number;
  idEmpresa: number;
  nombre: string;
  descripcion?: string;
  organizador?: string;
  fechaInicio: string;
  fechaFin?: string;
  duracion?: number;
  duracionHoras?: number;
  modalidad?: string;
  instructor?: string;
  estado?: string;
  capacidadMaxima?: number;
  costo?: number;
  activo?: boolean;
  certificado?: boolean;
  certificacionObtenida?: string;
  observaciones?: string;
}

export interface FormacionOperario {
  idFormacionOperario: number;
  idOperario: number;
  idCurso: number;
  fechaRealizacion?: string;
  fechaInscripcion?: string;
  calificacion?: number;
  observaciones?: string;
  estado?: string;
}

export type TipoBaja = 'ACCIDENTE_TRABAJO' | 'ENFERMEDAD_PROFESIONAL' | 'ENFERMEDAD_COMUN' | 'ACCIDENTE_NO_LABORAL';
export type EstadoBaja = 'ACTIVA' | 'FINALIZADA' | 'SUSPENDIDA';

export interface BajaMedica {
  idBaja: number;
  idOperario: number;
  fechaInicio: string;
  fechaFin?: string;
  tipoBaja: TipoBaja;
  motivo?: string;
  observaciones?: string;
  estado: EstadoBaja;
  // Campos adicionales para el componente
  diagnostico?: string;
  medicoTratante?: string;
  centroMedico?: string;
  numeroParte?: string;
  codigoCie10?: string;
  tratamiento?: string;
  requiereRehabilitacion?: boolean;
  esRecaida?: boolean;
  fechaRegistro?: string;
}

export interface BajaMedicaCreateDto {
  idOperario: number;
  fechaInicio: string;
  tipoBaja: TipoBaja;
  diagnostico: string;
  medicoTratante?: string;
  centroMedico?: string;
  numeroParte?: string;
  codigoCie10?: string;
  observaciones?: string;
  tratamiento?: string;
  requiereRehabilitacion?: boolean;
  esRecaida?: boolean;
}

export interface BajaMedicaUpdateDto extends Partial<BajaMedicaCreateDto> {
  idBaja: number;
  fechaFin?: string;
  estado?: EstadoBaja;
}

export interface SolicitudVacaciones {
  idSolicitud: number;
  idOperario: number;
  fechaInicio: string;
  fechaFin: string;
  fechaSolicitud: string;
  tipoSolicitud?: string;
  estado?: string;
  observaciones?: string;
}

export interface TipoDiaCalendario {
  idTipoDia: number;
  nombre: string;
  descripcion?: string;
}

export interface CalendarioLaboral {
  idCalendario: number;
  idOperario: number;
  fecha: string;
  idTipoDia: number;
  idHorario?: number;
}

export interface Horario {
  idHorario: number;
  idEmpresa: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  descripcion?: string;
}

export interface HorarioOperario {
  idHorarioOperario: number;
  idHorario: number;
  idOperario: number;
}

export interface ConfiguracionEvaluacion {
  idConfiguracionEvaluacion: number;
  idEmpresa: number;
  nombre: string;
  descripcion?: string;
}

export interface ConfiguracionEvaluacionOperario {
  idConfigEvalOperario: number;
  idOperario: number;
  idConfiguracionEvaluacion: number;
  importeBase: number;
}

export interface EvaluacionParteOperario {
  idEvaluacionParte: number;
  idParte: number;
  idConfigEvalOperario: number;
  calificacion?: number;
  valorIncentivo: number;
}

export interface MarcaReloj {
  idMarca: number;
  idOperario: number;
  fecha: string;
  hora: string;
  tipoMarca?: string;
  metodo?: string;
  lat?: number;
  lon?: number;
  dispositivoId?: string;
  origen?: string;
  valida: boolean;
  observaciones?: string;
}

// DTOs para formularios
export interface OperarioCreateDto {
  idPersona: number;
  idCategoriaOperario?: number;
  fechaAlta: string;
  nss?: string;
  fechaNacimiento?: string;
  grupoCotizacion?: string;
  centroTrabajo?: string;
  ibanNomina?: string;
  emailCorporativo?: string;
  telefonoEmpresa?: string;
  costeHoraBase: number;
}

export interface OperarioUpdateDto extends Partial<OperarioCreateDto> {
  idOperario: number;
  activo?: boolean;
}

export interface ContratoLaboralCreateDto {
  idOperario: number;
  fechaInicio: string;
  fechaFin?: string;
  tipoContrato?: string;
  categoriaProfesional?: string;
  grupoCotizacion?: string;
  salarioBase?: number;
  tipoJornadaHorasSemanal?: number;
  centroCosteId?: number;
  jornada?: string;
  observaciones?: string;
}

export interface ContratoLaboralUpdateDto extends Partial<ContratoLaboralCreateDto> {
  idContrato: number;
}

export interface ContratoLaboral {
  idContrato: number;
  idOperario: number;
  fechaInicio: string;
  fechaFin?: string;
  tipoContrato?: string;
  categoriaProfesional?: string;
  grupoCotizacion?: string;
  salarioBase?: number;
  tipoJornadaHorasSemanal?: number;
  estado?: string;
  observaciones?: string;
}

export interface SolicitudVacacionesCreateDto {
  idOperario: number;
  fechaInicio: string;
  fechaFin: string;
  tipoSolicitud?: string;
  observaciones?: string;
}

export interface SolicitudVacacionesUpdateDto extends Partial<SolicitudVacacionesCreateDto> {
  idSolicitud: number;
  estado?: string;
}

export interface MarcaRelojCreateDto {
  idOperario: number;
  fecha: string;
  hora: string;
  tipoMarca?: string;
  metodo?: string;
  lat?: number;
  lon?: number;
  dispositivoId?: string;
  origen?: string;
  observaciones?: string;
}

export interface MarcaRelojUpdateDto extends Partial<MarcaRelojCreateDto> {
  idMarca: number;
  valida?: boolean;
}

export interface BajaMedicaCreateDto {
  idOperario: number;
  fechaInicio: string;
  fechaFin?: string;
  motivo?: string;
  observaciones?: string;
}



export interface CursoFormacionCreateDto {
  nombre: string;
  descripcion?: string;
  organizador?: string;
  fechaInicio?: string;
  fechaFin?: string;
  certificacionObtenida?: string;
}

export interface CategoriaOperarioCreateDto {
  codigo?: string;
  nombre: string;
  costeHoraBase: number;
}

// Enums
export enum EstadoContrato {
  ACTIVO = 'Activo',
  FINALIZADO = 'Finalizado',
  SUSPENDIDO = 'Suspendido'
}

export enum EstadoSolicitudVacaciones {
  PENDIENTE = 'Pendiente',
  APROBADA = 'Aprobada',
  RECHAZADA = 'Rechazada',
  CANCELADA = 'Cancelada'
}

// Alias para compatibilidad
export type EstadoSolicitud = EstadoSolicitudVacaciones;
export const EstadoSolicitud = EstadoSolicitudVacaciones;

export enum TipoSolicitud {
  VACACIONES = 'VACACIONES',
  PERMISO = 'PERMISO',
  AUSENCIA = 'AUSENCIA',
  COMPENSATORIO = 'COMPENSATORIO'
}

export enum TipoMarca {
  ENTRADA = 'Entrada',
  SALIDA = 'Salida',
  PAUSA_INICIO = 'Pausa Inicio',
  PAUSA_FIN = 'Pausa Fin'
}

export enum MetodoMarca {
  APP = 'App',
  TERMINAL = 'Terminal',
  NFC = 'NFC',
  MANUAL = 'Manual'
}

export enum EstadoBajaMedica {
  ACTIVA = 'Activa',
  FINALIZADA = 'Finalizada',
  CANCELADA = 'Cancelada'
}

export enum EstadoCurso {
  PROGRAMADO = 'Programado',
  EN_CURSO = 'En Curso',
  FINALIZADO = 'Finalizado',
  CANCELADO = 'Cancelado'
}

export enum TipoContrato {
  INDEFINIDO = 'Indefinido',
  TEMPORAL = 'Temporal',
  PRACTICAS = 'Prácticas',
  FORMACION = 'Formación',
  OBRA_SERVICIO = 'Obra o Servicio'
}

export enum TipoJornada {
  COMPLETA = 'Completa',
  PARCIAL = 'Parcial',
  REDUCIDA = 'Reducida'
}

// Filtros para listas
export interface OperarioFilter {
  nombre?: string;
  categoria?: number;
  activo?: boolean;
  fechaAltaDesde?: string;
  fechaAltaHasta?: string;
}

export interface ContratoFilter {
  operario?: number;
  tipoContrato?: string;
  estado?: string;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
}

export interface VacacionesFilter {
  operario?: number;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  año?: number;
}

export interface MarcasFilter {
  operario?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoMarca?: string;
  valida?: boolean;
}

export interface BajasFilter {
  operario?: number;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  motivo?: string;
}

export interface CursosFilter {
  nombre?: string;
  organizador?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
}

export interface CategoriasFilter {
  nombre?: string;
  activa?: boolean;
  costeDesde?: number;
  costeHasta?: number;
}