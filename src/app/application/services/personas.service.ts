import { Injectable, inject, signal, computed } from '@angular/core';
import { API_CLIENT } from '../../ports/api-client.token';
import { 
  Persona, CreatePersonaDto, UpdatePersonaDto, PersonaFilters, 
  Direccion, CreateDireccionDto, UpdateDireccionDto,
  CuentaBancaria, CreateCuentaBancariaDto, UpdateCuentaBancariaDto,
  DuplicadoDetectado, PersonaDetalle 
} from '../../domain/terceros.types';
import { DataSourceService } from '../../shared/services/data-source.service';

@Injectable({ providedIn: 'root' })
export class PersonasService extends DataSourceService<Persona> {
  private apiClient = inject(API_CLIENT);
  private _personas = signal<Persona[]>([]);
  private _tipos = signal<string[]>(['cliente', 'proveedor', 'empleado', 'otro']);
  private _duplicados = signal<Map<number, DuplicadoDetectado[]>>(new Map());

  personas = this._personas.asReadonly();
  tipos = this._tipos.asReadonly();
  duplicados = this._duplicados.asReadonly();

  constructor() { 
    super(); 
    this.cargarPersonas(); 
  }

  async cargarPersonas(): Promise<void> {
    this.setLoading(true);
    try {
      const response = await this.apiClient.get<Persona[]>('/personas');
      this._personas.set(response);
      this.setItems(response);
      this.detectarDuplicados();
    } catch (error: any) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async crearPersona(dto: CreatePersonaDto): Promise<Persona> {
    this.setLoading(true);
    try {
      const nuevaPersona = await this.apiClient.post<Persona>('/personas', dto);
      this._personas.update(personas => [...personas, nuevaPersona]);
      this.setItems(this._personas());
      this.detectarDuplicados();
      return nuevaPersona;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async actualizarPersona(id: number, dto: UpdatePersonaDto): Promise<Persona> {
    this.setLoading(true);
    try {
      const personaActualizada = await this.apiClient.patch<Persona>(`/personas/${id}`, dto);
      this._personas.update(personas => 
        personas.map(p => p.id === id ? personaActualizada : p)
      );
      this.setItems(this._personas());
      this.detectarDuplicados();
      return personaActualizada;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async eliminarPersona(id: number): Promise<void> {
    this.setLoading(true);
    try {
      await this.apiClient.delete(`/personas/${id}`);
      this._personas.update(personas => personas.filter(p => p.id !== id));
      this.setItems(this._personas());
      this.detectarDuplicados();
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async toggleActiva(id: number, activa: boolean): Promise<void> {
    try {
      await this.actualizarPersona(id, { activa });
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async obtenerPersonaDetalle(id: number): Promise<PersonaDetalle> {
    try {
      const persona = await this.apiClient.get<PersonaDetalle>(`/personas/${id}/detalle`);
      return persona;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // Gestión de direcciones
  async crearDireccion(dto: CreateDireccionDto): Promise<Direccion> {
    try {
      return await this.apiClient.post<Direccion>('/direcciones', dto);
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async actualizarDireccion(id: number, dto: UpdateDireccionDto): Promise<Direccion> {
    try {
      return await this.apiClient.patch<Direccion>(`/direcciones/${id}`, dto);
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async eliminarDireccion(id: number): Promise<void> {
    try {
      await this.apiClient.delete(`/direcciones/${id}`);
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // Gestión de cuentas bancarias
  async crearCuentaBancaria(dto: CreateCuentaBancariaDto): Promise<CuentaBancaria> {
    try {
      return await this.apiClient.post<CuentaBancaria>('/cuentas-bancarias', dto);
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async actualizarCuentaBancaria(id: number, dto: UpdateCuentaBancariaDto): Promise<CuentaBancaria> {
    try {
      return await this.apiClient.patch<CuentaBancaria>(`/cuentas-bancarias/${id}`, dto);
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async eliminarCuentaBancaria(id: number): Promise<void> {
    try {
      await this.apiClient.delete(`/cuentas-bancarias/${id}`);
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // Filtrado y búsqueda
  filtrarPersonas(filtros: PersonaFilters): Persona[] {
    return this._personas().filter(persona => {
      if (filtros.empresaId && persona.empresaId !== filtros.empresaId) return false;
      if (filtros.activa !== undefined && persona.activa !== filtros.activa) return false;
      if (filtros.tipo && persona.tipo !== filtros.tipo) return false;
      
      if (filtros.texto) {
        const texto = filtros.texto.toLowerCase();
        const match = 
          persona.nombre.toLowerCase().includes(texto) ||
          persona.apellidos.toLowerCase().includes(texto) ||
          persona.nif.toLowerCase().includes(texto) ||
          persona.codigo.toLowerCase().includes(texto) ||
          (persona.email && persona.email.toLowerCase().includes(texto));
        if (!match) return false;
      }
      
      return true;
    });
  }

  // Detección de duplicados
  private detectarDuplicados(): void {
    const duplicados = new Map<number, DuplicadoDetectado[]>();
    
    this._personas().forEach(persona => {
      const duplicadosPersona = this._personas()
        .filter(p => p.id !== persona.id)
        .map(p => this.calcularSimilitud(persona, p))
        .filter(d => d.similitud > 70) // Umbral de similitud
        .sort((a, b) => b.similitud - a.similitud);
      
      if (duplicadosPersona.length > 0) {
        duplicados.set(persona.id, duplicadosPersona);
      }
    });
    
    this._duplicados.set(duplicados);
  }

  private calcularSimilitud(persona1: Persona, persona2: Persona): DuplicadoDetectado {
    const camposCoincidentes: string[] = [];
    let similitud = 0;
    let totalCampos = 0;

    // Comparar NIF
    if (persona1.nif && persona2.nif && persona1.nif === persona2.nif) {
      camposCoincidentes.push('NIF');
      similitud += 40;
    }
    totalCampos += 40;

    // Comparar email
    if (persona1.email && persona2.email && persona1.email === persona2.email) {
      camposCoincidentes.push('Email');
      similitud += 30;
    }
    totalCampos += 30;

    // Comparar nombre + apellidos
    const nombre1 = `${persona1.nombre} ${persona1.apellidos}`.toLowerCase();
    const nombre2 = `${persona2.nombre} ${persona2.apellidos}`.toLowerCase();
    if (nombre1 === nombre2) {
      camposCoincidentes.push('Nombre completo');
      similitud += 20;
    } else if (this.calcularSimilitudTexto(nombre1, nombre2) > 0.8) {
      camposCoincidentes.push('Nombre similar');
      similitud += 15;
    }
    totalCampos += 20;

    // Comparar teléfono
    if (persona1.telefono && persona2.telefono && persona1.telefono === persona2.telefono) {
      camposCoincidentes.push('Teléfono');
      similitud += 10;
    }
    totalCampos += 10;

    return {
      persona: persona2,
      similitud: Math.round((similitud / totalCampos) * 100),
      camposCoincidentes
    };
  }

  private calcularSimilitudTexto(texto1: string, texto2: string): number {
    const palabras1 = texto1.split(/\s+/);
    const palabras2 = texto2.split(/\s+/);
    const palabrasComunes = palabras1.filter(p => palabras2.includes(p));
    return palabrasComunes.length / Math.max(palabras1.length, palabras2.length);
  }

  obtenerDuplicados(personaId: number): DuplicadoDetectado[] {
    return this._duplicados().get(personaId) || [];
  }

  tieneDuplicados(personaId: number): boolean {
    return this._duplicados().has(personaId);
  }

  // Utilidades
  generarCodigoSiguiente(): string {
    const ultimoCodigo = Math.max(...this._personas().map(p => {
      const match = p.codigo.match(/^P(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    }));
    return `P${String(ultimoCodigo + 1).padStart(4, '0')}`;
  }

  validarNifUnico(nif: string, excludeId?: number): boolean {
    return !this._personas().some(p => 
      p.nif === nif && (!excludeId || p.id !== excludeId)
    );
  }
}
