import { Injectable, signal, computed } from '@angular/core';
import { Empresa } from '../../domain/auth.types';
import { AuthStore } from '../stores/auth.store';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  // Estado privado
  private readonly _empresas = signal<Empresa[]>([]);
  private readonly _empresaActiva = signal<Empresa | null>(null);

  // Signals públicos
  readonly empresas = computed(() => this._empresas());
  readonly empresaActiva = computed(() => this._empresaActiva());
  readonly empresaActivaId = computed(() => this._empresaActiva()?.id || null);

  constructor(
    private authStore: AuthStore,
    private toastService: ToastService
  ) {
    this.loadMockEmpresas();
  }

  // Métodos para modificar el estado
  setEmpresas(empresas: Empresa[]): void {
    this._empresas.set(empresas);
  }

  setEmpresaActiva(empresa: Empresa | null): void {
    this._empresaActiva.set(empresa);
    
    if (empresa) {
      this.authStore.setEmpresaId(empresa.id);
      this.toastService.showSuccess(`Empresa activa: ${empresa.nombre}`);
    } else {
      this.authStore.setEmpresaId(null);
    }
  }

  // Métodos de negocio
  async cambiarEmpresa(empresaId: number): Promise<boolean> {
    const empresa = this._empresas().find(e => e.id === empresaId);
    
    if (!empresa) {
      this.toastService.showError('Empresa no encontrada');
      return false;
    }

    if (!empresa.activa) {
      this.toastService.showError('La empresa seleccionada no está activa');
      return false;
    }

    this.setEmpresaActiva(empresa);
    return true;
  }

  async obtenerEmpresas(): Promise<Empresa[]> {
    // En una implementación real, esto haría una llamada HTTP
    // Por ahora retornamos las empresas mock
    return this._empresas();
  }

  // Métodos privados
  private loadMockEmpresas(): void {
    const mockEmpresas: Empresa[] = [
      {
        id: 1,
        nombre: 'Empresa Demo S.L.',
        nif: 'B12345678',
        activa: true,
      },
      {
        id: 2,
        nombre: 'Constructora Ejemplo S.A.',
        nif: 'A87654321',
        activa: true,
      },
      {
        id: 3,
        nombre: 'Empresa Inactiva S.L.',
        nif: 'C11111111',
        activa: false,
      },
    ];

    this.setEmpresas(mockEmpresas);
    
    // Establecer la primera empresa activa como predeterminada
    const empresaActiva = mockEmpresas.find(e => e.activa);
    if (empresaActiva) {
      this.setEmpresaActiva(empresaActiva);
    }
  }
}
