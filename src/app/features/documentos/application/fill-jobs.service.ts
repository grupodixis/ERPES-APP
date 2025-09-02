import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  FillJob,
  CreateFillJobDto,
  FillJobFilters,
  PaginatedResult,
  EstadoFillJob
} from '../../../domain/documentos.types';

export interface FillJobProgress {
  jobId: number;
  estado: EstadoFillJob;
  progreso: number; // 0-100
  etapaActual: string;
  tiempoTranscurrido: number; // milliseconds
  tiempoEstimado: number; // milliseconds
}

export interface FillJobStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  pendingJobs: number;
  averageProcessingTime: number;
  successRate: number;
  jobsByTemplate: {
    templateId: number;
    templateNombre: string;
    count: number;
  }[];
  jobsByDay: {
    date: string;
    count: number;
  }[];
}

export interface BulkOperationResult {
  deleted?: number;
  retried?: number;
  failed: number;
  errors: string[];
}

export interface InputValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
  extraFields: string[];
}

export interface PreviewResult {
  previewUrl: string;
  expiresAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FillJobsService {
  private readonly baseUrl = `${environment.apiUrl}/fill-jobs`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una lista paginada de trabajos de llenado con filtros opcionales
   */
  getFillJobs(filters?: Partial<FillJobFilters & { page: number; limit: number }>): Observable<PaginatedResult<FillJob>> {
    let params = new HttpParams()
      .set('page', (filters?.page || 1).toString())
      .set('limit', (filters?.limit || 10).toString());

    // Agregar filtros solo si tienen valor
    if (filters?.templateId) {
      params = params.set('templateId', filters.templateId.toString());
    }
    
    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }
    
    if (filters?.fechaDesde) {
      params = params.set('fechaDesde', filters.fechaDesde.toISOString());
    }
    
    if (filters?.fechaHasta) {
      params = params.set('fechaHasta', filters.fechaHasta.toISOString());
    }
    
    if (filters?.creadoPorId) {
      params = params.set('creadoPorId', filters.creadoPorId.toString());
    }
    
    if (filters?.empresaId) {
      params = params.set('empresaId', filters.empresaId.toString());
    }

    return this.http.get<PaginatedResult<FillJob>>(this.baseUrl, { params });
  }

  /**
   * Obtiene un trabajo de llenado específico por ID
   */
  getFillJob(id: number): Observable<FillJob> {
    return this.http.get<FillJob>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo trabajo de llenado
   */
  createFillJob(createDto: CreateFillJobDto): Observable<FillJob> {
    return this.http.post<FillJob>(this.baseUrl, createDto);
  }

  /**
   * Reintenta un trabajo de llenado fallido
   */
  retryFillJob(id: number): Observable<FillJob> {
    return this.http.post<FillJob>(`${this.baseUrl}/${id}/retry`, {});
  }

  /**
   * Cancela un trabajo de llenado en progreso
   */
  cancelFillJob(id: number): Observable<FillJob> {
    return this.http.post<FillJob>(`${this.baseUrl}/${id}/cancel`, {});
  }

  /**
   * Elimina un trabajo de llenado
   */
  deleteFillJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Descarga el resultado de un trabajo de llenado
   */
  downloadResult(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Obtiene una URL de previsualización del resultado
   */
  previewResult(id: number): Observable<PreviewResult> {
    return this.http.get<PreviewResult>(`${this.baseUrl}/${id}/preview`);
  }

  /**
   * Obtiene estadísticas de trabajos de llenado
   */
  getFillJobStats(fechaDesde?: Date, fechaHasta?: Date): Observable<FillJobStats> {
    let params = new HttpParams();
    
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde.toISOString());
    }
    
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta.toISOString());
    }

    return this.http.get<FillJobStats>(`${this.baseUrl}/stats`, { params });
  }

  /**
   * Elimina múltiples trabajos de llenado
   */
  bulkDelete(jobIds: number[]): Observable<BulkOperationResult> {
    return this.http.post<BulkOperationResult>(`${this.baseUrl}/bulk-delete`, { jobIds });
  }

  /**
   * Reintenta múltiples trabajos de llenado fallidos
   */
  bulkRetry(jobIds: number[]): Observable<BulkOperationResult> {
    return this.http.post<BulkOperationResult>(`${this.baseUrl}/bulk-retry`, { jobIds });
  }

  /**
   * Obtiene el progreso en tiempo real de un trabajo de llenado
   */
  getJobProgress(id: number): Observable<FillJobProgress> {
    return this.http.get<FillJobProgress>(`${this.baseUrl}/${id}/progress`);
  }

  /**
   * Valida los datos de entrada contra una plantilla
   */
  validateInputData(templateId: number, inputData: any): Observable<InputValidationResult> {
    return this.http.post<InputValidationResult>(`${this.baseUrl}/validate-input`, {
      templateId,
      inputData
    });
  }

  /**
   * Obtiene trabajos de llenado por plantilla
   */
  getFillJobsByTemplate(templateId: number, limit?: number): Observable<FillJob[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<FillJob[]>(`${this.baseUrl}/by-template/${templateId}`, { params });
  }

  /**
   * Obtiene trabajos de llenado recientes del usuario
   */
  getRecentFillJobs(limit: number = 10): Observable<FillJob[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<FillJob[]>(`${this.baseUrl}/recent`, { params });
  }

  /**
   * Obtiene trabajos de llenado fallidos para revisión
   */
  getFailedFillJobs(limit?: number): Observable<FillJob[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<FillJob[]>(`${this.baseUrl}/failed`, { params });
  }

  /**
   * Marca un trabajo como revisado por un humano
   */
  markAsReviewed(id: number, notes?: string): Observable<FillJob> {
    const body = notes ? { notes } : {};
    return this.http.patch<FillJob>(`${this.baseUrl}/${id}/reviewed`, body);
  }

  /**
   * Obtiene el log detallado de un trabajo de llenado
   */
  getFillJobLog(id: number): Observable<{
    jobId: number;
    logs: {
      timestamp: Date;
      level: 'info' | 'warning' | 'error';
      message: string;
      details?: any;
    }[];
  }> {
    return this.http.get<{
      jobId: number;
      logs: {
        timestamp: Date;
        level: 'info' | 'warning' | 'error';
        message: string;
        details?: any;
      }[];
    }>(`${this.baseUrl}/${id}/log`);
  }

  /**
   * Compara dos trabajos de llenado
   */
  compareFillJobs(jobId1: number, jobId2: number): Observable<{
    job1: FillJob;
    job2: FillJob;
    differences: {
      field: string;
      value1: any;
      value2: any;
      type: 'added' | 'removed' | 'modified';
    }[];
  }> {
    return this.http.get<{
      job1: FillJob;
      job2: FillJob;
      differences: {
        field: string;
        value1: any;
        value2: any;
        type: 'added' | 'removed' | 'modified';
      }[];
    }>(`${this.baseUrl}/compare/${jobId1}/${jobId2}`);
  }

  /**
   * Exporta trabajos de llenado a diferentes formatos
   */
  exportFillJobs(
    filters?: Partial<FillJobFilters>, 
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters?.templateId) {
      params = params.set('templateId', filters.templateId.toString());
    }
    
    if (filters?.estado) {
      params = params.set('estado', filters.estado);
    }
    
    if (filters?.fechaDesde) {
      params = params.set('fechaDesde', filters.fechaDesde.toISOString());
    }
    
    if (filters?.fechaHasta) {
      params = params.set('fechaHasta', filters.fechaHasta.toISOString());
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Programa un trabajo de llenado para ejecutarse más tarde
   */
  scheduleFillJob(createDto: CreateFillJobDto, scheduledAt: Date): Observable<FillJob> {
    const body = {
      ...createDto,
      scheduledAt: scheduledAt.toISOString()
    };
    
    return this.http.post<FillJob>(`${this.baseUrl}/schedule`, body);
  }

  /**
   * Obtiene trabajos programados
   */
  getScheduledFillJobs(): Observable<FillJob[]> {
    return this.http.get<FillJob[]>(`${this.baseUrl}/scheduled`);
  }

  /**
   * Cancela un trabajo programado
   */
  cancelScheduledJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/scheduled/${id}`);
  }

  /**
   * Obtiene métricas de rendimiento de trabajos de llenado
   */
  getPerformanceMetrics(period: 'day' | 'week' | 'month' = 'week'): Observable<{
    period: string;
    totalJobs: number;
    averageProcessingTime: number;
    successRate: number;
    errorRate: number;
    throughput: number; // jobs per hour
    peakHours: { hour: number; count: number }[];
    slowestTemplates: { templateId: number; templateNombre: string; avgTime: number }[];
  }> {
    const params = new HttpParams().set('period', period);
    return this.http.get<{
      period: string;
      totalJobs: number;
      averageProcessingTime: number;
      successRate: number;
      errorRate: number;
      throughput: number;
      peakHours: { hour: number; count: number }[];
      slowestTemplates: { templateId: number; templateNombre: string; avgTime: number }[];
    }>(`${this.baseUrl}/metrics`, { params });
  }

  /**
   * Obtiene alertas relacionadas con trabajos de llenado
   */
  getFillJobAlerts(): Observable<{
    id: number;
    type: 'high_failure_rate' | 'slow_processing' | 'queue_backlog' | 'resource_usage';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details: any;
    createdAt: Date;
    acknowledged: boolean;
  }[]> {
    return this.http.get<{
      id: number;
      type: 'high_failure_rate' | 'slow_processing' | 'queue_backlog' | 'resource_usage';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      details: any;
      createdAt: Date;
      acknowledged: boolean;
    }[]>(`${this.baseUrl}/alerts`);
  }

  /**
   * Reconoce una alerta
   */
  acknowledgeAlert(alertId: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {});
  }
}