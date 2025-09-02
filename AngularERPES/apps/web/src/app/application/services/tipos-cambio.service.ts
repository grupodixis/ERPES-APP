import { Injectable, inject, signal, computed } from '@angular/core';
import { API_CLIENT } from '../../ports/api-client.token';
import { ApiClient } from '../../ports/api-client.interface';
import { TipoCambio, CreateTipoCambioDto, UpdateTipoCambioDto, TipoCambioFilters, TipoCambioCsvRow } from '../../domain/configuracion.types';

@Injectable({ providedIn: 'root' })
export class TiposCambioService {
  private apiClient: ApiClient;
  
  private _tiposCambio = signal<TipoCambio[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly tiposCambio = this._tiposCambio.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly tiposCambioActivos = computed(() => 
    this._tiposCambio().filter(tc => tc.activo)
  );

  constructor() {
    this.apiClient = inject(API_CLIENT);
  }

  async cargarTiposCambio(filters?: TipoCambioFilters): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      let url = '/tipos-cambio';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.monedaOrigenId) params.append('monedaOrigenId', filters.monedaOrigenId.toString());
        if (filters.monedaDestinoId) params.append('monedaDestinoId', filters.monedaDestinoId.toString());
        if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde.toISOString());
        if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta.toISOString());
        if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const tiposCambio = await this.apiClient.get<TipoCambio[]>(url);
      this._tiposCambio.set(tiposCambio);
    } catch (error: any) {
      this._error.set(error.message || 'Error al cargar tipos de cambio');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async crearTipoCambio(dto: CreateTipoCambioDto): Promise<TipoCambio> {
    this._loading.set(true);
    try {
      const nuevoTipoCambio = await this.apiClient.post<TipoCambio>('/tipos-cambio', dto);
      this._tiposCambio.update(tiposCambio => [...tiposCambio, nuevoTipoCambio]);
      return nuevoTipoCambio;
    } catch (error: any) {
      this._error.set(error.message || 'Error al crear tipo de cambio');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async actualizarTipoCambio(id: number, updates: UpdateTipoCambioDto): Promise<TipoCambio> {
    this._loading.set(true);
    try {
      const tipoCambioActualizado = await this.apiClient.patch<TipoCambio>(`/tipos-cambio/${id}`, updates);
      this._tiposCambio.update(tiposCambio => 
        tiposCambio.map(tc => tc.id === id ? tipoCambioActualizado : tc)
      );
      return tipoCambioActualizado;
    } catch (error: any) {
      this._error.set(error.message || 'Error al actualizar tipo de cambio');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async eliminarTipoCambio(id: number): Promise<void> {
    this._loading.set(true);
    try {
      await this.apiClient.delete(`/tipos-cambio/${id}`);
      this._tiposCambio.update(tiposCambio => tiposCambio.filter(tc => tc.id !== id));
    } catch (error: any) {
      this._error.set(error.message || 'Error al eliminar tipo de cambio');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async importarCsv(csvRows: TipoCambioCsvRow[]): Promise<{ success: number; errors: string[] }> {
    this._loading.set(true);
    try {
      const result = await this.apiClient.post<{ success: number; errors: string[] }>('/tipos-cambio/import', { csvRows });
      // Recargar datos después de importar
      await this.cargarTiposCambio();
      return result;
    } catch (error: any) {
      this._error.set(error.message || 'Error al importar CSV');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  obtenerTipoCambioPorId(id: number): TipoCambio | undefined {
    return this._tiposCambio().find(tc => tc.id === id);
  }

  obtenerTipoCambio(monedaOrigenId: number, monedaDestinoId: number, fecha: Date): TipoCambio | undefined {
    const fechaStr = fecha.toISOString().split('T')[0];
    return this._tiposCambio().find(tc => 
      tc.monedaOrigenId === monedaOrigenId &&
      tc.monedaDestinoId === monedaDestinoId &&
      tc.fecha.toISOString().split('T')[0] === fechaStr &&
      tc.activo
    );
  }

  filtrarTiposCambio(filters: TipoCambioFilters): TipoCambio[] {
    let tiposCambio = this._tiposCambio();

    if (filters.monedaOrigenId) {
      tiposCambio = tiposCambio.filter(tc => tc.monedaOrigenId === filters.monedaOrigenId);
    }

    if (filters.monedaDestinoId) {
      tiposCambio = tiposCambio.filter(tc => tc.monedaDestinoId === filters.monedaDestinoId);
    }

    if (filters.fechaDesde) {
      tiposCambio = tiposCambio.filter(tc => tc.fecha >= filters.fechaDesde!);
    }

    if (filters.fechaHasta) {
      tiposCambio = tiposCambio.filter(tc => tc.fecha <= filters.fechaHasta!);
    }

    if (filters.activo !== undefined) {
      tiposCambio = tiposCambio.filter(tc => tc.activo === filters.activo);
    }

    return tiposCambio.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  reset(): void {
    this._tiposCambio.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}
