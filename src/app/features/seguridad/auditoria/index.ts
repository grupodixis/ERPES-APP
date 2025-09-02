// Componentes
export { AuditoriaComponent } from './auditoria.component';

// Servicios
export { 
  AuditoriaService,
  EventoAuditoria,
  FiltrosAuditoria,
  EstadisticasAuditoria,
  TimelineEvento,
  ConfiguracionAuditoria,
  ExportacionAuditoria,
  AnalisisPatrones,
  ReporteSeguridad,
  ReporteActividad,
  ReporteCompleto,
  OpcionFiltro,
  Usuario
} from './auditoria.service';

// Rutas
export { AUDITORIA_ROUTES } from './auditoria.routes';

// Re-exportar tipos relevantes de seguridad
export { LogSeguridad } from '../seguridad.types';