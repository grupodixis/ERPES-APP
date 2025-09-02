import { Injectable, inject, signal, computed } from '@angular/core';
import { API_CLIENT } from '../../ports/api-client.token';
import { 
  SerieDocumental, 
  CreateSerieDocumentalDto, 
  UpdateSerieDocumentalDto, 
  SerieDocumentalFilters,
  FormatoPreview 
} from '../../domain/configuracion.types';
import { DataSourceService } from '../../shared/services/data-source.service';

@Injectable({
  providedIn: 'root'
})
export class SeriesDocumentalesService extends DataSourceService<SerieDocumental> {
  private apiClient = inject(API_CLIENT);

  // Signals específicos para Series Documentales
  private _series = signal<SerieDocumental[]>([]);
  private _tipos = signal<string[]>(['factura', 'albaran', 'pedido', 'presupuesto', 'ot']);

  // Signals públicos
  series = this._series.asReadonly();
  tipos = this._tipos.asReadonly();

  constructor() {
    super();
    this.cargarSeriesDocumentales();
  }

  async cargarSeriesDocumentales(): Promise<void> {
    this.setLoading(true);
    try {
      const series = await this.apiClient.get<SerieDocumental[]>('/series-documentales');
      this._series.set(series);
      this.setItems(series);
      this.setError(null);
    } catch (error: any) {
      this.setError(error.message || 'Error al cargar series documentales');
      console.error('Error cargando series documentales:', error);
    } finally {
      this.setLoading(false);
    }
  }

  async crearSerieDocumental(dto: CreateSerieDocumentalDto): Promise<SerieDocumental> {
    this.setLoading(true);
    try {
      const nuevaSerie = await this.apiClient.post<SerieDocumental>('/series-documentales', dto);
      await this.cargarSeriesDocumentales();
      return nuevaSerie;
    } catch (error: any) {
      this.setError(error.message || 'Error al crear serie documental');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async actualizarSerieDocumental(id: number, dto: UpdateSerieDocumentalDto): Promise<SerieDocumental> {
    this.setLoading(true);
    try {
      const serieActualizada = await this.apiClient.patch<SerieDocumental>(`/series-documentales/${id}`, dto);
      await this.cargarSeriesDocumentales();
      return serieActualizada;
    } catch (error: any) {
      this.setError(error.message || 'Error al actualizar serie documental');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async eliminarSerieDocumental(id: number): Promise<void> {
    this.setLoading(true);
    try {
      await this.apiClient.delete(`/series-documentales/${id}`);
      await this.cargarSeriesDocumentales();
    } catch (error: any) {
      this.setError(error.message || 'Error al eliminar serie documental');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async toggleActiva(id: number, activa: boolean): Promise<void> {
    try {
      await this.actualizarSerieDocumental(id, { activa });
    } catch (error: any) {
      this.setError(error.message || 'Error al cambiar estado de la serie');
      throw error;
    }
  }

  // Método para generar preview del formato
  generarPreviewFormato(formato: string): FormatoPreview {
    try {
      // Extraer variables del formato (ej: {SERIE}, {AÑO}, {NUMERO})
      const variables = formato.match(/\{([^}]+)\}/g)?.map(v => v.slice(1, -1)) || [];
      
      // Generar ejemplo
      let ejemplo = formato;
      const valoresEjemplo: { [key: string]: string } = {
        'SERIE': 'FAC',
        'AÑO': new Date().getFullYear().toString(),
        'NUMERO': '0001',
        'CODIGO': 'FAC',
        'FECHA': new Date().toLocaleDateString('es-ES'),
        'SECUENCIAL': '001',
        'MES': (new Date().getMonth() + 1).toString().padStart(2, '0'),
        'DIA': new Date().getDate().toString().padStart(2, '0')
      };

      variables.forEach(variable => {
        const valor = valoresEjemplo[variable] || `{${variable}}`;
        ejemplo = ejemplo.replace(new RegExp(`\\{${variable}\\}`, 'g'), valor);
      });

      return {
        ejemplo,
        variables,
        valido: true
      };
    } catch (error) {
      return {
        ejemplo: formato,
        variables: [],
        valido: false,
        error: 'Formato inválido'
      };
    }
  }

  // Filtrar series por criterios
  filtrarSeries(filtros: SerieDocumentalFilters): SerieDocumental[] {
    let series = this._series();

    if (filtros.tipo) {
      series = series.filter(s => s.tipo === filtros.tipo);
    }

    if (filtros.activa !== undefined) {
      series = series.filter(s => s.activa === filtros.activa);
    }

    if (filtros.search) {
      const search = filtros.search.toLowerCase();
      series = series.filter(s => 
        s.codigo.toLowerCase().includes(search) ||
        s.nombre.toLowerCase().includes(search) ||
        s.descripcion?.toLowerCase().includes(search)
      );
    }

    return series;
  }

  // Obtener siguiente número para una serie
  obtenerSiguienteNumero(serieId: number): number {
    const serie = this._series().find(s => s.id === serieId);
    return serie ? serie.ultimoNumero + 1 : 1;
  }

  // Generar número de documento según formato
  generarNumeroDocumento(serieId: number): string {
    const serie = this._series().find(s => s.id === serieId);
    if (!serie) return '';

    const preview = this.generarPreviewFormato(serie.formato);
    return preview.ejemplo;
  }
}
