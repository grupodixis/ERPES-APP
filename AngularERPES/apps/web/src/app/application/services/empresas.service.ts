import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { API_CLIENT } from '../../ports/api-client.token';
import { ApiClient } from '../../ports/api-client.interface';
import { Empresa } from '../../domain/auth.types';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private apiClient: ApiClient;
  
  // Signals
  private _empresas = signal<Empresa[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Computed properties
  readonly empresas = this._empresas.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly empresasActivas = computed(() => 
    this._empresas().filter(empresa => empresa.activa)
  );

  constructor() {
    this.apiClient = inject(API_CLIENT);
  }

  async cargarEmpresas(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const empresas = await this.apiClient.get<Empresa[]>('/empresas');
      this._empresas.set(empresas);
    } catch (error: any) {
      this._error.set(error.message || 'Error al cargar empresas');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async obtenerEmpresa(id: number): Promise<Empresa | null> {
    try {
      return await this.apiClient.get<Empresa>(`/empresas/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener empresa');
    }
  }

  async actualizarEmpresa(id: number, updates: Partial<Empresa>): Promise<Empresa | null> {
    try {
      const updated = await this.apiClient.patch<Empresa>(`/empresas/${id}`, updates);
      // Actualizar caché local
      const empresas = this._empresas();
      const index = empresas.findIndex(e => e.id === id);
      if (index !== -1) {
        empresas[index] = updated;
        this._empresas.set([...empresas]);
      }
      return updated;
    } catch (error: any) {
      throw new Error(error.message || 'Error al actualizar empresa');
    }
  }

  obtenerEmpresaPorId(id: number): Empresa | undefined {
    return this._empresas().find(empresa => empresa.id === id);
  }

  reset(): void {
    this._empresas.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}
