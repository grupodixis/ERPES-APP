import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  FieldMapping,
  TransformPreset,
  FieldMappingSuggestion,
  CreateFieldMappingDto,
  UpdateFieldMappingDto,
  ValidationResult,
  TipoTransformacion
} from '../../../domain/documentos.types';
import { ExtractedField } from './pdf-viewer.service';

export interface ERPField {
  path: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  description?: string;
  required?: boolean;
  validation?: any;
}

export interface CreateTransformPresetDto {
  nombre: string;
  descripcion: string;
  transformacion: TipoTransformacion;
  parametros?: any;
  empresaId: number;
}

export interface BulkMappingDto {
  templateFieldId: number;
  campoERP: string;
  transformacionId?: number;
  valorPorDefecto?: string;
  validaciones?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MappingService {
  private readonly baseUrl = `${environment.apiUrl}/mappings`;
  private readonly presetsUrl = `${environment.apiUrl}/transform-presets`;
  private readonly erpFieldsUrl = `${environment.apiUrl}/erp-fields`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los mapeos de campos para una plantilla
   */
  getFieldMappings(templateId: number): Observable<FieldMapping[]> {
    return this.http.get<FieldMapping[]>(`${this.baseUrl}/template/${templateId}`);
  }

  /**
   * Crea un nuevo mapeo de campo
   */
  createFieldMapping(createDto: CreateFieldMappingDto): Observable<FieldMapping> {
    return this.http.post<FieldMapping>(this.baseUrl, createDto);
  }

  /**
   * Actualiza un mapeo de campo existente
   */
  updateFieldMapping(mappingId: number, updateDto: UpdateFieldMappingDto): Observable<FieldMapping> {
    return this.http.put<FieldMapping>(`${this.baseUrl}/${mappingId}`, updateDto);
  }

  /**
   * Elimina un mapeo de campo
   */
  deleteFieldMapping(mappingId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${mappingId}`);
  }

  /**
   * Obtiene los presets de transformación disponibles
   */
  getTransformPresets(empresaId?: number): Observable<TransformPreset[]> {
    let params = new HttpParams();
    if (empresaId) {
      params = params.set('empresaId', empresaId.toString());
    }
    
    return this.http.get<TransformPreset[]>(this.presetsUrl, { params });
  }

  /**
   * Crea un nuevo preset de transformación
   */
  createTransformPreset(createDto: CreateTransformPresetDto): Observable<TransformPreset> {
    return this.http.post<TransformPreset>(this.presetsUrl, createDto);
  }

  /**
   * Obtiene sugerencias de mapeo automático
   */
  getSuggestions(templateId: number, extractedFields: ExtractedField[]): Observable<FieldMappingSuggestion[]> {
    const body = {
      templateId,
      extractedFields
    };
    
    return this.http.post<FieldMappingSuggestion[]>(`${this.baseUrl}/suggestions`, body);
  }

  /**
   * Valida un mapeo de campo individual
   */
  validateMapping(mapping: FieldMapping): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(`${this.baseUrl}/validate`, mapping);
  }

  /**
   * Valida todos los mapeos de una plantilla
   */
  validateAllMappings(templateId: number): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(`${this.baseUrl}/template/${templateId}/validate`, {});
  }

  /**
   * Aplica una transformación a un valor
   */
  applyTransformation(
    value: string, 
    transformation: TipoTransformacion, 
    parameters?: any
  ): string {
    try {
      let result = value;

      switch (transformation) {
        case 'UPPERCASE':
          result = value.toUpperCase();
          if (parameters?.trim) {
            result = result.trim();
          }
          break;

        case 'LOWERCASE':
          result = value.toLowerCase();
          if (parameters?.trim) {
            result = result.trim();
          }
          break;

        case 'CAPITALIZE':
          result = value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          break;

        case 'TRIM':
          result = value.trim();
          if (parameters?.removeExtraSpaces) {
            result = result.replace(/\s+/g, ' ');
          }
          break;

        case 'DATE':
          result = this.formatDate(value, parameters?.format || 'DD/MM/YYYY');
          break;

        case 'NUMBER':
          result = this.formatNumber(value, parameters);
          break;

        case 'REGEX':
          if (parameters?.pattern) {
            const regex = new RegExp(parameters.pattern, parameters.flags || '');
            result = value.replace(regex, parameters.replacement || '');
          }
          break;

        case 'CUSTOM':
          if (parameters?.code) {
            // Ejecutar código personalizado de forma segura
            result = this.executeCustomTransformation(value, parameters.code);
          }
          break;

        case 'CONCATENATE':
          if (parameters?.values && Array.isArray(parameters.values)) {
            result = parameters.values.join(parameters.separator || ' ');
          }
          break;

        case 'EXTRACT':
          if (parameters?.pattern) {
            const match = value.match(new RegExp(parameters.pattern));
            result = match ? match[parameters.group || 0] : value;
          }
          break;

        case 'REPLACE':
          if (parameters?.search && parameters?.replace !== undefined) {
            result = value.replace(new RegExp(parameters.search, 'g'), parameters.replace);
          }
          break;

        case 'CONDITIONAL':
          if (parameters?.condition && parameters?.trueValue && parameters?.falseValue) {
            result = this.evaluateCondition(value, parameters.condition) 
              ? parameters.trueValue 
              : parameters.falseValue;
          }
          break;

        default:
          // Transformación no reconocida, devolver valor original
          break;
      }

      return result;
    } catch (error) {
      console.error('Error applying transformation:', error);
      return value; // Devolver valor original en caso de error
    }
  }

  /**
   * Previsualiza el resultado de una transformación
   */
  previewTransformation(
    sampleValue: string, 
    transformation: TipoTransformacion, 
    parameters?: any
  ): string {
    return this.applyTransformation(sampleValue, transformation, parameters);
  }

  /**
   * Obtiene los campos ERP disponibles para mapeo
   */
  getAvailableERPFields(module?: string): Observable<ERPField[]> {
    let params = new HttpParams();
    if (module) {
      params = params.set('module', module);
    }
    
    return this.http.get<ERPField[]>(this.erpFieldsUrl, { params });
  }

  /**
   * Crea múltiples mapeos de forma masiva
   */
  bulkCreateMappings(mappings: BulkMappingDto[]): Observable<FieldMapping[]> {
    return this.http.post<FieldMapping[]>(`${this.baseUrl}/bulk`, { mappings });
  }

  /**
   * Formatea una fecha según el patrón especificado
   */
  private formatDate(dateString: string, format: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();

      return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('YY', year.slice(-2));
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Formatea un número según los parámetros especificados
   */
  private formatNumber(numberString: string, parameters?: any): string {
    try {
      const number = parseFloat(numberString);
      if (isNaN(number)) {
        return numberString;
      }

      let result = number.toFixed(parameters?.decimals || 0);
      
      if (parameters?.thousandsSeparator) {
        const parts = result.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, parameters.thousandsSeparator);
        result = parts.join('.');
      }

      return result;
    } catch (error) {
      return numberString;
    }
  }

  /**
   * Ejecuta código de transformación personalizado de forma segura
   */
  private executeCustomTransformation(value: string, code: string): string {
    try {
      // Crear función con contexto limitado
      const func = new Function('value', code);
      const result = func(value);
      return typeof result === 'string' ? result : String(result);
    } catch (error) {
      console.error('Error executing custom transformation:', error);
      return value;
    }
  }

  /**
   * Evalúa una condición simple
   */
  private evaluateCondition(value: string, condition: string): boolean {
    try {
      // Condiciones simples soportadas
      if (condition.includes('==')) {
        const [left, right] = condition.split('==').map(s => s.trim());
        return value === right.replace(/["']/g, '');
      }
      
      if (condition.includes('!=')) {
        const [left, right] = condition.split('!=').map(s => s.trim());
        return value !== right.replace(/["']/g, '');
      }
      
      if (condition.includes('contains')) {
        const searchTerm = condition.replace('contains', '').trim().replace(/["']/g, '');
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      if (condition === 'empty') {
        return !value || value.trim() === '';
      }
      
      if (condition === 'not_empty') {
        return Boolean(value && value.trim() !== '');
      }

      return false;
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de mapeo para una plantilla
   */
  getMappingStats(templateId: number): Observable<{
    totalCampos: number;
    camposMapeados: number;
    porcentajeCompletitud: number;
    camposSinMapear: string[];
  }> {
    return this.http.get<{
      totalCampos: number;
      camposMapeados: number;
      porcentajeCompletitud: number;
      camposSinMapear: string[];
    }>(`${this.baseUrl}/template/${templateId}/stats`);
  }

  /**
   * Exporta la configuración de mapeos de una plantilla
   */
  exportMappings(templateId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/template/${templateId}/export`, {
      responseType: 'blob'
    });
  }

  /**
   * Importa configuración de mapeos desde un archivo
   */
  importMappings(templateId: number, file: File): Observable<FieldMapping[]> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('templateId', templateId.toString());
    
    return this.http.post<FieldMapping[]>(`${this.baseUrl}/import`, formData);
  }

  /**
   * Clona los mapeos de una plantilla a otra
   */
  cloneMappings(sourceTemplateId: number, targetTemplateId: number): Observable<FieldMapping[]> {
    return this.http.post<FieldMapping[]>(`${this.baseUrl}/clone`, {
      sourceTemplateId,
      targetTemplateId
    });
  }

  /**
   * Obtiene el historial de cambios de mapeos
   */
  getMappingHistory(templateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/template/${templateId}/history`);
  }

  /**
   * Prueba un mapeo con datos de ejemplo
   */
  testMapping(mapping: FieldMapping, sampleData: any): Observable<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    return this.http.post<{
      success: boolean;
      result?: any;
      error?: string;
    }>(`${this.baseUrl}/test`, {
      mapping,
      sampleData
    });
  }
}