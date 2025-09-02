import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Template,
  TemplateVersion,
  TemplateField,
  FieldMapping,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateFilters,
  PaginatedResult,
  PdfAnalysisResponse
} from '../../../domain/documentos.types';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  private readonly baseUrl = `${environment.apiUrl}/templates`;

  constructor(private http: HttpClient) {}

  // Datos mock para cuando falla la conexión al backend
  private getMockTemplates(): PaginatedResult<Template> {
    const mockTemplates: Template[] = [
      {
        id: 1,
        nombre: 'Contrato de Obra - Mock',
        descripcion: 'Plantilla de ejemplo para contratos de construcción',
        tipo: 'AcroForm',
        estado: 'Activa',
        archivoOriginalUrl: '/mock/templates/contrato-obra.pdf',
        archivoOriginalNombre: 'contrato-obra-mock.pdf',
        archivoOriginalTamaño: 2048576,
        versionActual: 1,
        totalCampos: 15,
        camposMapeados: 12,
        porcentajeCompletitud: 80,
        creadoPorId: 1,
        creadoPor: 'Usuario Demo',
        empresaId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        nombre: 'Factura Comercial - Mock',
        descripcion: 'Plantilla de ejemplo para facturas comerciales',
        tipo: 'AcroForm',
        estado: 'Activa',
        archivoOriginalUrl: '/mock/templates/factura.pdf',
        archivoOriginalNombre: 'factura-mock.pdf',
        archivoOriginalTamaño: 1024000,
        versionActual: 2,
        totalCampos: 20,
        camposMapeados: 18,
        porcentajeCompletitud: 90,
        creadoPorId: 1,
        creadoPor: 'Usuario Demo',
        empresaId: 1,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: 3,
        nombre: 'Orden de Compra - Mock',
        descripcion: 'Plantilla de ejemplo para órdenes de compra',
        tipo: 'AcroForm',
        estado: 'Inactiva',
        archivoOriginalUrl: '/mock/templates/orden-compra.pdf',
        archivoOriginalNombre: 'orden-compra-mock.pdf',
        archivoOriginalTamaño: 1536000,
        versionActual: 1,
        totalCampos: 12,
        camposMapeados: 8,
        porcentajeCompletitud: 67,
        creadoPorId: 1,
        creadoPor: 'Usuario Demo',
        empresaId: 1,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-05')
      }
    ];

    return {
      data: mockTemplates,
      total: mockTemplates.length,
      page: 1,
      limit: 10,
      totalPages: 1
    };
  }

  /**
   * Obtiene una lista paginada de plantillas con filtros opcionales
   */
  getTemplates(filters?: Partial<TemplateFilters & { page: number; limit: number }>): Observable<PaginatedResult<Template>> {
    let params = new HttpParams()
      .set('page', (filters?.page || 1).toString())
      .set('limit', (filters?.limit || 10).toString());

    // Agregar filtros solo si tienen valor
    if (filters?.search && filters.search.trim()) {
      params = params.set('search', filters.search.trim());
    }
    
    if (filters?.tipo) {
      params = params.set('tipo', filters.tipo);
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

    return this.http.get<PaginatedResult<Template>>(this.baseUrl, { params })
      .pipe(
        catchError((error) => {
          console.warn('Error loading templates from backend, using mock data:', error);
          return of(this.getMockTemplates());
        })
      );
  }

  /**
   * Obtiene una plantilla específica por ID
   */
  getTemplate(id: number): Observable<Template> {
    return this.http.get<Template>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva plantilla
   */
  createTemplate(createDto: CreateTemplateDto): Observable<Template> {
    const formData = new FormData();
    
    formData.append('nombre', createDto.nombre);
    formData.append('descripcion', createDto.descripcion || '');
    formData.append('empresaId', createDto.empresaId.toString());
    formData.append('archivo', createDto.archivo);
    
    if (createDto.metadatos) {
      formData.append('metadatos', JSON.stringify(createDto.metadatos));
    }

    return this.http.post<Template>(this.baseUrl, formData);
  }

  /**
   * Actualiza una plantilla existente
   */
  updateTemplate(id: number, updateDto: UpdateTemplateDto): Observable<Template> {
    return this.http.put<Template>(`${this.baseUrl}/${id}`, updateDto);
  }

  /**
   * Elimina una plantilla
   */
  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Duplica una plantilla existente
   */
  duplicateTemplate(id: number): Observable<Template> {
    return this.http.post<Template>(`${this.baseUrl}/${id}/duplicate`, {});
  }

  /**
   * Analiza una plantilla para detectar campos automáticamente
   */
  analyzeTemplate(id: number): Observable<PdfAnalysisResponse> {
    return this.http.post<PdfAnalysisResponse>(`${this.baseUrl}/${id}/analyze`, {});
  }

  /**
   * Obtiene todas las versiones de una plantilla
   */
  getTemplateVersions(templateId: number): Observable<TemplateVersion[]> {
    return this.http.get<TemplateVersion[]>(`${this.baseUrl}/${templateId}/versions`);
  }

  /**
   * Obtiene los campos de una versión específica de plantilla
   */
  getTemplateFields(templateId: number, versionId?: number): Observable<TemplateField[]> {
    const url = versionId 
      ? `${this.baseUrl}/${templateId}/versions/${versionId}/fields`
      : `${this.baseUrl}/${templateId}/fields`;
    
    return this.http.get<TemplateField[]>(url);
  }

  /**
   * Obtiene los mapeos de campos de una plantilla
   */
  getFieldMappings(templateId: number): Observable<FieldMapping[]> {
    return this.http.get<FieldMapping[]>(`${this.baseUrl}/${templateId}/mappings`);
  }

  /**
   * Crea o actualiza un mapeo de campo
   */
  saveFieldMapping(templateId: number, mapping: Partial<FieldMapping>): Observable<FieldMapping> {
    if (mapping.id) {
      return this.http.put<FieldMapping>(`${this.baseUrl}/${templateId}/mappings/${mapping.id}`, mapping);
    } else {
      return this.http.post<FieldMapping>(`${this.baseUrl}/${templateId}/mappings`, mapping);
    }
  }

  /**
   * Elimina un mapeo de campo
   */
  deleteFieldMapping(templateId: number, mappingId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${templateId}/mappings/${mappingId}`);
  }

  /**
   * Obtiene sugerencias de mapeo automático para una plantilla
   */
  getMappingSuggestions(templateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${templateId}/mapping-suggestions`);
  }

  /**
   * Valida los mapeos de una plantilla
   */
  validateMappings(templateId: number): Observable<{ valid: boolean; errors: string[] }> {
    return this.http.post<{ valid: boolean; errors: string[] }>(`${this.baseUrl}/${templateId}/validate-mappings`, {});
  }

  /**
   * Cambia el estado de una plantilla (Activa/Inactiva)
   */
  toggleTemplateStatus(id: number): Observable<Template> {
    return this.http.patch<Template>(`${this.baseUrl}/${id}/toggle-status`, {});
  }

  /**
   * Obtiene estadísticas de uso de una plantilla
   */
  getTemplateStats(id: number): Observable<{
    totalUsos: number;
    ultimoUso: Date;
    promedioTiempoLlenado: number;
    tasaExito: number;
  }> {
    return this.http.get<{
      totalUsos: number;
      ultimoUso: Date;
      promedioTiempoLlenado: number;
      tasaExito: number;
    }>(`${this.baseUrl}/${id}/stats`);
  }

  /**
   * Exporta una plantilla con sus configuraciones
   */
  exportTemplate(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/export`, {
      responseType: 'blob'
    });
  }

  /**
   * Importa una plantilla desde un archivo de configuración
   */
  importTemplate(file: File, empresaId: number): Observable<Template> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('empresaId', empresaId.toString());
    
    return this.http.post<Template>(`${this.baseUrl}/import`, formData);
  }

  /**
   * Obtiene el historial de cambios de una plantilla
   */
  getTemplateHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${id}/history`);
  }

  /**
   * Previsualiza una plantilla con datos de ejemplo
   */
  previewTemplate(id: number, sampleData?: any): Observable<Blob> {
    const body = sampleData ? { sampleData } : {};
    
    return this.http.post(`${this.baseUrl}/${id}/preview`, body, {
      responseType: 'blob'
    });
  }
}