import { Injectable, inject, signal, computed } from '@angular/core';
import { API_CLIENT } from '../../ports/api-client.token';
import { ApiClient } from '../../ports/api-client.interface';
import { Moneda, CreateMonedaDto, UpdateMonedaDto, MonedaFilters } from '../../domain/configuracion.types';

@Injectable({ providedIn: 'root' })
export class MonedasService {
  private apiClient: ApiClient;
  
  private _monedas = signal<Moneda[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly monedas = this._monedas.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly monedasActivas = computed(() => 
    this._monedas().filter(moneda => moneda.activa)
  );

  readonly monedaBase = computed(() => 
    this._monedas().find(moneda => moneda.esBase)
  );

  constructor() {
    this.apiClient = inject(API_CLIENT);
  }

  async cargarMonedas(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const monedas = await this.apiClient.get<Moneda[]>('/monedas');
      this._monedas.set(monedas);
    } catch (error: any) {
      this._error.set(error.message || 'Error al cargar monedas');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async crearMoneda(dto: CreateMonedaDto): Promise<Moneda> {
    this._loading.set(true);
    try {
      const nuevaMoneda = await this.apiClient.post<Moneda>('/monedas', dto);
      this._monedas.update(monedas => [...monedas, nuevaMoneda]);
      return nuevaMoneda;
    } catch (error: any) {
      this._error.set(error.message || 'Error al crear moneda');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async actualizarMoneda(id: number, updates: UpdateMonedaDto): Promise<Moneda> {
    this._loading.set(true);
    try {
      const monedaActualizada = await this.apiClient.patch<Moneda>(`/monedas/${id}`, updates);
      this._monedas.update(monedas => 
        monedas.map(m => m.id === id ? monedaActualizada : m)
      );
      return monedaActualizada;
    } catch (error: any) {
      this._error.set(error.message || 'Error al actualizar moneda');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async eliminarMoneda(id: number): Promise<void> {
    this._loading.set(true);
    try {
      await this.apiClient.delete(`/monedas/${id}`);
      this._monedas.update(monedas => monedas.filter(m => m.id !== id));
    } catch (error: any) {
      this._error.set(error.message || 'Error al eliminar moneda');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  obtenerMonedaPorId(id: number): Moneda | undefined {
    return this._monedas().find(moneda => moneda.id === id);
  }

  obtenerMonedaPorCodigo(codigo: string): Moneda | undefined {
    return this._monedas().find(moneda => moneda.codigo === codigo);
  }

  filtrarMonedas(filters: MonedaFilters): Moneda[] {
    let monedas = this._monedas();

    if (filters.activa !== undefined) {
      monedas = monedas.filter(m => m.activa === filters.activa);
    }

    if (filters.esBase !== undefined) {
      monedas = monedas.filter(m => m.esBase === filters.esBase);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      monedas = monedas.filter(m => 
        m.codigo.toLowerCase().includes(search) ||
        m.nombre.toLowerCase().includes(search) ||
        m.simbolo.toLowerCase().includes(search)
      );
    }

    return monedas;
  }

  reset(): void {
    this._monedas.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}
